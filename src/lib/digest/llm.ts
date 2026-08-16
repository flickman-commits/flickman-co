import Anthropic from "@anthropic-ai/sdk";

/**
 * The one place the digest talks to a language model.
 *
 * Curation is a small, well-shaped task — pick indices from a numbered list and
 * write a sentence for each — so it should stay cheap and should not be welded
 * to one vendor. Everything expensive (fetching, keyword gating, dedupe, source
 * diversification, the candidate cap) is deterministic code; the model only does
 * the judgment part. That's why an issue costs about a penny, and it's also why
 * a small local model is a plausible substitute.
 *
 * Providers:
 *   anthropic          (default) Claude via the official SDK
 *   openai-compatible  any /v1/chat/completions endpoint — Ollama, LM Studio,
 *                      llama.cpp, vLLM, OpenAI itself
 *
 * Env:
 *   DIGEST_LLM_PROVIDER  "anthropic" | "openai-compatible"   default anthropic
 *   DIGEST_LLM_MODEL     model id                            default per provider
 *   DIGEST_LLM_BASE_URL  openai-compatible only, e.g. http://localhost:11434/v1
 *   DIGEST_LLM_API_KEY   openai-compatible only; local servers usually ignore it
 *   ANTHROPIC_API_KEY    anthropic only
 */

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

export const ZERO_USAGE: TokenUsage = { inputTokens: 0, outputTokens: 0 };

export function addUsage(a: TokenUsage, b: TokenUsage): TokenUsage {
  return {
    inputTokens: a.inputTokens + b.inputTokens,
    outputTokens: a.outputTokens + b.outputTokens,
  };
}

export interface CompletionRequest {
  system: string;
  prompt: string;
  /** JSON Schema the response must conform to. */
  schema: Record<string, unknown>;
  schemaName: string;
  maxTokens: number;
}

export interface CompletionResult {
  /** Raw JSON text; the caller parses and validates. */
  text: string;
  usage: TokenUsage;
}

export interface LlmProvider {
  /** Model id, shown in the email footer. */
  readonly model: string;
  complete(req: CompletionRequest): Promise<CompletionResult>;
  /** USD for this usage. Local models are free, so this is 0 for them. */
  costUsd(usage: TokenUsage): number;
}

/* ──────────────────────────────────────────────────────────────── */
/* Anthropic                                                         */
/* ──────────────────────────────────────────────────────────────── */

/** USD per million tokens, by model. Keep in step with the model list. */
const ANTHROPIC_PRICING: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5": { input: 1, output: 5 },
  "claude-sonnet-5": { input: 3, output: 15 },
  "claude-opus-5": { input: 5, output: 25 },
};

/**
 * Pasting a key from a doc can bring along wrapping quotes and, worse,
 * typographic ones. The SDK puts the key straight into the `x-api-key` header,
 * and headers are Latin-1, so a curly quote throws a ByteString error naming a
 * string index and nothing else. Trim the usual artifacts, and name the problem
 * when one survives.
 */
function readAnthropicKey(): { ok: true; key: string } | { ok: false; reason: string } {
  const raw = process.env.ANTHROPIC_API_KEY;
  if (!raw || !raw.trim()) return { ok: false, reason: "ANTHROPIC_API_KEY not set" };

  const key = raw.trim().replace(/^["'“”‘’]+|["'“”‘’]+$/g, "");
  if (!key) return { ok: false, reason: "ANTHROPIC_API_KEY is only quote characters" };

  const chars = [...key];
  const at = chars.findIndex((c) => c.charCodeAt(0) < 0x21 || c.charCodeAt(0) > 0x7e);
  if (at !== -1) {
    const code = chars[at].charCodeAt(0);
    const name =
      code === 0x20
        ? "a space"
        : code === 0x0a || code === 0x0d
          ? "a line break"
          : code === 0x201c || code === 0x201d
            ? "a curly quote"
            : `U+${code.toString(16).toUpperCase().padStart(4, "0")}`;
    return {
      ok: false,
      reason:
        `ANTHROPIC_API_KEY doesn't look like a bare key: ${chars.length} characters, ` +
        `with ${name} at index ${at}${
          key.startsWith("sk-ant-") ? "" : ", and it doesn't start with 'sk-ant-'"
        }. A key is a single unbroken token of about 108 characters. ` +
        "Re-add just the key, with no surrounding text or line breaks.",
    };
  }
  return { ok: true, key };
}

class AnthropicProvider implements LlmProvider {
  constructor(
    readonly model: string,
    private readonly apiKey: string
  ) {}

  async complete(req: CompletionRequest): Promise<CompletionResult> {
    const client = new Anthropic({ apiKey: this.apiKey });
    const response = await client.messages.create({
      model: this.model,
      max_tokens: req.maxTokens,
      output_config: { format: { type: "json_schema", schema: req.schema } },
      system: req.system,
      messages: [{ role: "user", content: req.prompt }],
    });

    const text = response.content.find((b) => b.type === "text")?.text;
    if (!text) throw new Error("no text block in response");

    return {
      text,
      usage: {
        // Cache fields are zero (nothing sets cache_control) but are counted so
        // the figure can't silently undercount if that changes.
        inputTokens:
          response.usage.input_tokens +
          (response.usage.cache_read_input_tokens ?? 0) +
          (response.usage.cache_creation_input_tokens ?? 0),
        outputTokens: response.usage.output_tokens,
      },
    };
  }

  costUsd(usage: TokenUsage): number {
    const p = ANTHROPIC_PRICING[this.model];
    if (!p) return 0;
    return (usage.inputTokens / 1e6) * p.input + (usage.outputTokens / 1e6) * p.output;
  }
}

/* ──────────────────────────────────────────────────────────────── */
/* OpenAI-compatible (Ollama, LM Studio, llama.cpp, vLLM, OpenAI)    */
/* ──────────────────────────────────────────────────────────────── */

class OpenAICompatibleProvider implements LlmProvider {
  constructor(
    readonly model: string,
    private readonly baseUrl: string,
    private readonly apiKey: string
  ) {}

  async complete(req: CompletionRequest): Promise<CompletionResult> {
    const res = await fetch(`${this.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: req.maxTokens,
        messages: [
          { role: "system", content: req.system },
          { role: "user", content: req.prompt },
        ],
        // Servers that don't implement this ignore it; the caller parses
        // defensively and falls back, so a sloppy small model degrades rather
        // than breaks.
        response_format: {
          type: "json_schema",
          json_schema: { name: req.schemaName, schema: req.schema, strict: true },
        },
      }),
      signal: AbortSignal.timeout(45_000),
    });

    if (!res.ok) {
      throw new Error(`LLM ${res.status}: ${(await res.text()).slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    const text = json.choices?.[0]?.message?.content;
    if (!text) throw new Error("no content in response");

    return {
      text,
      usage: {
        inputTokens: json.usage?.prompt_tokens ?? 0,
        outputTokens: json.usage?.completion_tokens ?? 0,
      },
    };
  }

  /** Self-hosted models have no per-token price; a hosted one can be priced here. */
  costUsd(): number {
    return 0;
  }
}

/* ──────────────────────────────────────────────────────────────── */

export type ProviderResult =
  | { ok: true; provider: LlmProvider }
  | { ok: false; reason: string };

export function getProvider(): ProviderResult {
  const kind = (process.env.DIGEST_LLM_PROVIDER ?? "anthropic").toLowerCase();

  if (kind === "openai-compatible") {
    const baseUrl = process.env.DIGEST_LLM_BASE_URL;
    if (!baseUrl) {
      return { ok: false, reason: "DIGEST_LLM_BASE_URL not set for openai-compatible" };
    }
    const model = process.env.DIGEST_LLM_MODEL;
    if (!model) {
      return { ok: false, reason: "DIGEST_LLM_MODEL not set for openai-compatible" };
    }
    return {
      ok: true,
      provider: new OpenAICompatibleProvider(
        model,
        baseUrl,
        process.env.DIGEST_LLM_API_KEY ?? ""
      ),
    };
  }

  if (kind !== "anthropic") {
    return { ok: false, reason: `unknown DIGEST_LLM_PROVIDER "${kind}"` };
  }

  const key = readAnthropicKey();
  if (!key.ok) return { ok: false, reason: key.reason };

  return {
    ok: true,
    provider: new AnthropicProvider(
      process.env.DIGEST_LLM_MODEL ?? "claude-haiku-4-5",
      key.key
    ),
  };
}

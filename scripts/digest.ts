/**
 * Run the daily report from the command line.
 *
 * This exists to keep the orchestrator honest: if `lib/digest` ever grows a
 * dependency on Next.js, Vercel, or an HTTP request, this script stops working
 * and you find out immediately rather than the day you try to move it.
 *
 *   npm run digest                 build and print the HTML to stdout
 *   npm run digest -- --send       build and actually email it
 *   npm run digest -- --hours 48   widen the lookback window
 *
 * Reads the same env vars as the deployed route; locally those come from
 * .env.local. To run it against a local model instead of the API:
 *
 *   DIGEST_LLM_PROVIDER=openai-compatible \
 *   DIGEST_LLM_BASE_URL=http://localhost:11434/v1 \
 *   DIGEST_LLM_MODEL=llama3.1:8b \
 *   npm run digest
 */
import { config } from "dotenv";
import { buildDigest, runAndSend } from "../src/lib/digest/run";

// quiet: dotenv's banner would otherwise land in the piped HTML.
config({ path: ".env.local", quiet: true });

async function main() {
  const argv = process.argv.slice(2);
  const send = argv.includes("--send");
  const hoursFlag = argv.indexOf("--hours");
  const hours = hoursFlag !== -1 ? Number(argv[hoursFlag + 1]) : undefined;

  const result = send ? await runAndSend({ hours }) : await buildDigest({ hours });

  // Diagnostics to stderr so `npm run digest > report.html` stays clean.
  console.error(
    [
      `stories      ${result.storyCount} of ${result.scanned} scanned`,
      `curation     ${result.curation.degraded ? "FALLBACK" : "ai"} via ${result.curation.model}`,
      `cost         $${result.curation.costUsd.toFixed(6)} (${result.curation.inputTokens} in / ${result.curation.outputTokens} out)`,
      `location     ${result.location.place} (${result.location.source}, ${result.location.eventsSeen} events)`,
      `financials   ${result.financialsLoaded ? "loaded" : "absent"}`,
      `feeds failed ${result.failedFeeds.length ? result.failedFeeds.join(", ") : "none"}`,
      send ? `sent         ${"sent" in result && result.sent ? "yes" : "no (nothing to send)"}` : "",
    ]
      .filter(Boolean)
      .join("\n")
  );

  if (!send) process.stdout.write(result.html);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

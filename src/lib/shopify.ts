/**
 * Shopify Admin API — Trackstar revenue.
 *
 * Required env vars (set on Vercel):
 *   SHOPIFY_STORE           e.g. "flickman-3247.myshopify.com"
 *   SHOPIFY_CLIENT_ID       Custom app client ID
 *   SHOPIFY_CLIENT_SECRET   Custom app client secret
 *
 * Auth: OAuth `client_credentials` grant against the shop's
 * /admin/oauth/access_token endpoint. The returned `shpat_…` access token
 * is sent on Admin API requests as `X-Shopify-Access-Token`. Tokens live
 * 24h; we cache them in-memory for the lifetime of the serverless function
 * instance. Page-level `revalidate` (1h) provides the outer cache.
 */

const API_VERSION = "2025-01";

type GraphQLOrdersResponse = {
  data?: {
    orders: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      edges: Array<{
        node: {
          id: string;
          currentTotalPriceSet: {
            shopMoney: { amount: string; currencyCode: string };
          };
        };
      }>;
    };
  };
  errors?: Array<{ message: string }>;
};

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  const store = process.env.SHOPIFY_STORE?.trim();
  const clientId = process.env.SHOPIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET?.trim();

  if (!store || !clientId || !clientSecret) {
    throw new Error("Shopify env vars missing");
  }

  if (cachedToken && cachedToken.expiresAt - Date.now() > 5 * 60 * 1000) {
    return cachedToken.value;
  }

  const res = await fetch(`https://${store}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Shopify auth ${res.status}: ${body.slice(0, 200)}`);
  }

  const json = (await res.json()) as { access_token: string; expires_in?: number };
  const ttlMs = (json.expires_in ?? 86400) * 1000;
  cachedToken = { value: json.access_token, expiresAt: Date.now() + ttlMs };
  return json.access_token;
}

/**
 * Total paid-order revenue (after refunds) for the current calendar year, YTD.
 * Returns the number in the shop's currency. Returns `null` if env vars are
 * missing or the API call fails — caller falls back to placeholder display.
 */
export async function getTrackstarYTDRevenue(): Promise<number | null> {
  const store = process.env.SHOPIFY_STORE?.trim();
  if (!store || !process.env.SHOPIFY_CLIENT_ID || !process.env.SHOPIFY_CLIENT_SECRET) {
    return null;
  }

  try {
    const token = await getAccessToken();
    const year = new Date().getUTCFullYear();
    const start = `${year}-01-01`;
    const end = `${year + 1}-01-01`;

    let cursor: string | null = null;
    let total = 0;
    let pages = 0;
    const MAX_PAGES = 80; // safety cap → up to 20k orders

    while (pages < MAX_PAGES) {
      const query = `
        query OrdersPage($filter: String!, $first: Int!, $after: String) {
          orders(
            query: $filter
            first: $first
            sortKey: CREATED_AT
            after: $after
          ) {
            pageInfo { hasNextPage endCursor }
            edges {
              node {
                id
                currentTotalPriceSet { shopMoney { amount currencyCode } }
              }
            }
          }
        }
      `;

      const variables = {
        filter: `created_at:>=${start} created_at:<${end} financial_status:paid`,
        first: 250,
        after: cursor,
      };

      const res = await fetch(
        `https://${store}/admin/api/${API_VERSION}/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": token,
          },
          body: JSON.stringify({ query, variables }),
          next: { revalidate: 3600 },
        }
      );

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Shopify GraphQL ${res.status}: ${body.slice(0, 200)}`);
      }

      const json = (await res.json()) as GraphQLOrdersResponse;
      if (json.errors?.length) {
        throw new Error(
          `Shopify GraphQL errors: ${json.errors.map((e) => e.message).join("; ")}`
        );
      }
      if (!json.data) throw new Error("Shopify GraphQL: missing data");

      for (const edge of json.data.orders.edges) {
        const amount = parseFloat(edge.node.currentTotalPriceSet.shopMoney.amount);
        if (!Number.isNaN(amount)) total += amount;
      }

      if (!json.data.orders.pageInfo.hasNextPage) break;
      cursor = json.data.orders.pageInfo.endCursor;
      pages++;
    }

    return total;
  } catch (err) {
    console.error("[shopify] failed to fetch YTD revenue:", err);
    return null;
  }
}

export function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1000)}k`;
  return `$${Math.round(n)}`;
}

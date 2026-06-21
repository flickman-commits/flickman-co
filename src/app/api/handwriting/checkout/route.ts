import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { rateLimit } from "../../../../lib/rate-limit";

const ALLOWED_ORIGINS = new Set(
  (process.env.ALLOWED_ORIGINS ?? "https://flickman.co,https://www.flickman.co")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
);

function trustedOrigin(req: NextRequest): string {
  const candidate = req.headers.get("origin");
  if (candidate && ALLOWED_ORIGINS.has(candidate)) return candidate;
  return new URL(req.url).origin;
}

export async function POST(req: NextRequest) {
  const blocked = rateLimit(req, {
    windowMs: 60 * 1000,
    max: 5,
    prefix: "checkout",
  });
  if (blocked) return blocked;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json(
      {
        error:
          "Payment isn't set up yet. Use the 'Download preview' button on the preview screen for now.",
      },
      { status: 503 }
    );
  }

  const stripe = new Stripe(key);
  const origin = trustedOrigin(req);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: process.env.STRIPE_PRICE_HANDWRITING
        ? [{ price: process.env.STRIPE_PRICE_HANDWRITING, quantity: 1 }]
        : [
            {
              quantity: 1,
              price_data: {
                currency: "usd",
                unit_amount: 1500,
                product_data: {
                  name: "My Handwriting Font",
                  description: "A custom .otf font built from your handwriting.",
                },
              },
            },
          ],
      success_url: `${origin}/apps/handwriting/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/apps/handwriting`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[handwriting] checkout failed:", err);
    return NextResponse.json(
      { error: "Something went wrong creating your checkout session." },
      { status: 500 }
    );
  }
}

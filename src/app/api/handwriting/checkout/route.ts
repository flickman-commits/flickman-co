import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";

/**
 * Create a Stripe Checkout session for the $15 handwriting font.
 *
 * Required env vars (Vercel):
 *   STRIPE_SECRET_KEY    sk_live_... or sk_test_...
 *
 * Optional:
 *   STRIPE_PRICE_HANDWRITING   pre-configured Price ID (e.g. price_xxx).
 *                              If omitted, we create a $15 line item on the fly.
 */
export async function POST(req: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json(
      {
        error:
          "Payment isn't set up yet — STRIPE_SECRET_KEY missing on the server. Use the 'Download preview' button on the preview screen for now.",
      },
      { status: 503 }
    );
  }

  const stripe = new Stripe(key);
  const origin = req.headers.get("origin") ?? new URL(req.url).origin;

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
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

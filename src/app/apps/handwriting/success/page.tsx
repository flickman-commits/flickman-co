import { redirect } from "next/navigation";
import Stripe from "stripe";
import SuccessDownload from "./SuccessDownload";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  if (!session_id) redirect("/apps/handwriting");

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    if (process.env.NODE_ENV === "production") {
      redirect("/apps/handwriting");
    }
    return <SuccessDownload />;
  }

  try {
    const stripe = new Stripe(stripeKey);
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== "paid") {
      redirect("/apps/handwriting");
    }
  } catch (err) {
    console.error("[handwriting] failed to verify session:", err);
    redirect("/apps/handwriting");
  }

  return <SuccessDownload />;
}

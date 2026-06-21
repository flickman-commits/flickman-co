import { type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { verifyBookingToken } from "../lib/token";
import { buildBookingIcs } from "../lib/ics";
import {
  sendApprovalToGuest,
  sendDenialToGuest,
} from "../lib/emails";

/**
 * GET /api/crepes/decision?action=approve|deny&token=...
 *
 * Matt clicks this from the approval email. We verify the signed token,
 * fire the guest-facing email (with .ics on approve), and return a tiny
 * HTML confirmation page so the browser tab shows something useful.
 */
export const dynamic = "force-dynamic";

function htmlPage(opts: {
  title: string;
  heading: string;
  body: string;
  accent?: string;
}): Response {
  const accent = opts.accent ?? "#B23A2A";
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>${opts.title}</title>
</head>
<body style="margin:0; padding:48px 20px; background:#FEFFFA; color:#2A1A14; font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 460px; margin: 0 auto; background:#FFFCF6; border:2px solid #2A1A14; border-radius:6px; padding:28px 24px 22px; box-shadow: 0 6px 0 #2A1A14; text-align:center;">
    <div style="font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: ${accent}; margin-bottom: 10px;">Crepe Sundays</div>
    <h1 style="font-family: ui-serif, Georgia, serif; font-size: 28px; margin: 0 0 12px;">${opts.heading}</h1>
    <p style="margin: 0; color:#4B3A2F; font-size:15px; line-height:1.55;">${opts.body}</p>
    <p style="margin: 24px 0 0;"><a href="/crepes" style="font-size:13px; color:#7C6A5D;">← back to the page</a></p>
  </div>
</body>
</html>`;
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = (searchParams.get("action") ?? "").toLowerCase();
  const token = searchParams.get("token") ?? "";

  if (action !== "approve" && action !== "deny") {
    return htmlPage({
      title: "Crepe Sundays",
      heading: "Invalid link",
      body:
        "That link doesn't look right. Try clicking Approve or Decline again from the original email.",
    });
  }

  const payload = verifyBookingToken(token);
  if (!payload) {
    return htmlPage({
      title: "Crepe Sundays",
      heading: "Link expired",
      body:
        "This approval link is no longer valid (it may have expired, or it has already been used). The guest can request the date again at flickman.co/crepes.",
    });
  }

  try {
    if (action === "approve") {
      const ics = buildBookingIcs({
        uid: `${randomUUID()}@flickman.co`,
        dateISO: payload.dateISO,
        guestName: payload.name,
        guestEmail: payload.email,
        party: payload.party,
      });
      await sendApprovalToGuest({
        name: payload.name,
        email: payload.email,
        dateISO: payload.dateISO,
        party: payload.party,
        icsContent: ics,
      });
      return htmlPage({
        title: "Crepe Sundays — Approved",
        heading: "Done. They're confirmed.",
        body: `${payload.name} just got a confirmation with a calendar invite. Don't forget to add them to the Past Guests list on the site after the visit.`,
        accent: "#1a8a3c",
      });
    } else {
      await sendDenialToGuest({
        name: payload.name,
        email: payload.email,
        dateISO: payload.dateISO,
      });
      return htmlPage({
        title: "Crepe Sundays — Declined",
        heading: "Sent the polite no.",
        body: `${payload.name} got a friendly note letting them know that Sunday isn't open, and a nudge to pick another date.`,
      });
    }
  } catch (err) {
    console.error("[crepes/decision] failed:", err);
    return htmlPage({
      title: "Crepe Sundays — Error",
      heading: "Something went wrong",
      body: `We couldn't send the email. The booking wasn't updated. (${
        err instanceof Error ? err.message : "Unknown error"
      })`,
    });
  }
}

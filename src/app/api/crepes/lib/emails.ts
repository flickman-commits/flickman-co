/**
 * Resend wrappers for the Crepe Sundays booking flow.
 *
 * Three emails:
 *   1. Matt gets the request with [Approve] and [Deny] signed links.
 *   2. Guest gets a confirmation + .ics attachment on Approve.
 *   3. Guest gets a polite "not this Sunday" note on Deny.
 *
 * Required env vars (set on Vercel):
 *   RESEND_API_KEY
 *   BOOKING_NOTIFY_EMAIL    where the [Approve] / [Deny] email goes
 *
 * Optional:
 *   CREPES_FROM_EMAIL       default "Crepe Sundays <onboarding@resend.dev>"
 *                           (use a verified domain to drop the resend.dev tag)
 */

const FROM =
  process.env.CREPES_FROM_EMAIL ?? "Crepe Sundays <onboarding@resend.dev>";
const NOTIFY = process.env.BOOKING_NOTIFY_EMAIL ?? "matt@flickmanmedia.com";

type ResendResponse = { id?: string; error?: { message: string } };

async function sendViaResend(payload: {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: { filename: string; content: string }[];
}): Promise<ResendResponse> {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not set");

  const body: Record<string, unknown> = {
    from: payload.from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  };
  if (payload.replyTo) body.reply_to = payload.replyTo;
  if (payload.attachments) body.attachments = payload.attachments;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as ResendResponse;
  if (!res.ok) {
    throw new Error(
      `Resend ${res.status}: ${json?.error?.message ?? JSON.stringify(json)}`
    );
  }
  return json;
}

function fmtSundayLong(dateISO: string): string {
  const [y, m, d] = dateISO.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ──────────────────────────────────────────────────────────────── */
/* 1. Matt gets the booking request                                  */
/* ──────────────────────────────────────────────────────────────── */

export async function sendBookingRequestToMatt(opts: {
  name: string;
  email: string;
  dateISO: string;
  party: 1 | 2;
  message?: string;
  approveUrl: string;
  denyUrl: string;
}) {
  const longDate = fmtSundayLong(opts.dateISO);
  const subject = `Crepe Sundays: ${opts.name} wants ${longDate.replace(/, \d{4}$/, "")}`;

  const messageBlock = opts.message
    ? `<p style="margin: 16px 0 0; padding: 12px 14px; background: #F8EFDD; border-left: 3px solid #B23A2A; color: #4B3A2F; font-style: italic; white-space: pre-wrap;">${escapeHtml(
        opts.message
      )}</p>`
    : "";

  const html = `<!doctype html>
<html><body style="margin:0; padding:32px 16px; background:#FBF4E2; font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 520px; margin: 0 auto; background: #FFFCF6; border:2px solid #2A1A14; border-radius:6px; padding:24px 24px 20px; box-shadow: 0 6px 0 #2A1A14;">
    <div style="font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #B23A2A; margin-bottom: 8px;">Crepe Sundays</div>
    <h1 style="font-family: ui-serif, Georgia, serif; font-size: 24px; margin: 0 0 4px; color: #2A1A14;">
      ${escapeHtml(opts.name)} wants in.
    </h1>
    <p style="margin: 0 0 16px; color: #4B3A2F; font-size: 15px;">
      <strong>${escapeHtml(longDate)}</strong> at 11 AM. Party of ${opts.party}.
    </p>
    <p style="margin: 0 0 8px; color: #7C6A5D; font-size: 13px;">
      <a href="mailto:${escapeHtml(opts.email)}" style="color: #7C6A5D; text-decoration: underline;">${escapeHtml(opts.email)}</a>
    </p>
    ${messageBlock}
    <div style="display:flex; gap:10px; margin-top:24px;">
      <a href="${opts.approveUrl}" style="display:inline-block; background:#B23A2A; color:#FFFCF6; padding:12px 22px; border-radius:4px; font-weight:700; text-decoration:none; border:2px solid #8A2A1E; box-shadow:0 4px 0 #8A2A1E;">Approve →</a>
      <a href="${opts.denyUrl}" style="display:inline-block; background:#FFFCF6; color:#2A1A14; padding:12px 22px; border-radius:4px; font-weight:700; text-decoration:none; border:2px solid #2A1A14; box-shadow:0 4px 0 #2A1A14;">Decline</a>
    </div>
    <p style="margin: 20px 0 0; color: #7C6A5D; font-size: 12px; font-style: italic;">
      Approving sends them a calendar invite. Declining sends a polite no. Links expire in 7 days.
    </p>
  </div>
</body></html>`;

  const text =
    `Crepe Sundays — booking request\n\n` +
    `${opts.name} (${opts.email}) wants ${longDate} at 11 AM. Party of ${opts.party}.\n` +
    (opts.message ? `\nMessage: ${opts.message}\n` : "") +
    `\nApprove: ${opts.approveUrl}\nDecline: ${opts.denyUrl}\n\n` +
    `Approving sends them a calendar invite. Declining sends a polite no. Links expire in 7 days.`;

  return sendViaResend({
    from: FROM,
    to: [NOTIFY],
    replyTo: opts.email,
    subject,
    html,
    text,
  });
}

/* ──────────────────────────────────────────────────────────────── */
/* 2. Guest gets approval                                            */
/* ──────────────────────────────────────────────────────────────── */

export async function sendApprovalToGuest(opts: {
  name: string;
  email: string;
  dateISO: string;
  party: 1 | 2;
  icsContent: string;
}) {
  const longDate = fmtSundayLong(opts.dateISO);
  const subject = `You're in. Crepe Sundays on ${longDate.replace(/, \d{4}$/, "")}.`;

  const html = `<!doctype html>
<html><body style="margin:0; padding:32px 16px; background:#FBF4E2; font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 520px; margin: 0 auto; background: #FFFCF6; border:2px solid #2A1A14; border-radius:6px; padding:28px 24px 22px; box-shadow: 0 6px 0 #2A1A14;">
    <div style="font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #B23A2A; margin-bottom: 10px;">Crepe Sundays</div>
    <h1 style="font-family: ui-serif, Georgia, serif; font-size: 28px; margin: 0 0 8px; color: #2A1A14;">
      You&rsquo;re in, ${escapeHtml(opts.name.split(" ")[0])}.
    </h1>
    <p style="margin: 0 0 16px; color: #4B3A2F; font-size: 16px; line-height: 1.5;">
      <strong>${escapeHtml(longDate)}</strong> at 11 AM. Table for ${opts.party}.
    </p>
    <p style="margin: 0 0 14px; color: #4B3A2F; font-size: 15px; line-height: 1.55;">
      Calendar invite is attached. Nat will text you the address closer to the date.
    </p>
    <p style="margin: 0; color: #4B3A2F; font-size: 15px; line-height: 1.55;">
      Come hungry.
    </p>
    <p style="margin: 24px 0 0; color: #7C6A5D; font-size: 13px; font-style: italic;">
      Matt &amp; Nat
    </p>
  </div>
</body></html>`;

  const text =
    `You're in, ${opts.name.split(" ")[0]}.\n\n` +
    `${longDate} at 11 AM. Table for ${opts.party}.\n\n` +
    `Calendar invite is attached. Nat will text you the address closer to the date.\n\n` +
    `Come hungry.\nMatt & Nat`;

  return sendViaResend({
    from: FROM,
    to: [opts.email],
    replyTo: NOTIFY,
    subject,
    html,
    text,
    attachments: [
      {
        filename: "crepe-sundays.ics",
        content: Buffer.from(opts.icsContent, "utf8").toString("base64"),
      },
    ],
  });
}

/* ──────────────────────────────────────────────────────────────── */
/* 3. Guest gets a polite decline                                    */
/* ──────────────────────────────────────────────────────────────── */

export async function sendDenialToGuest(opts: {
  name: string;
  email: string;
  dateISO: string;
}) {
  const longDate = fmtSundayLong(opts.dateISO);
  const subject = `Crepe Sundays on ${longDate.replace(/, \d{4}$/, "")}`;

  const html = `<!doctype html>
<html><body style="margin:0; padding:32px 16px; background:#FBF4E2; font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 520px; margin: 0 auto; background: #FFFCF6; border:2px solid #2A1A14; border-radius:6px; padding:28px 24px 22px; box-shadow: 0 6px 0 #2A1A14;">
    <div style="font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #B23A2A; margin-bottom: 10px;">Crepe Sundays</div>
    <h1 style="font-family: ui-serif, Georgia, serif; font-size: 24px; margin: 0 0 12px; color: #2A1A14;">
      Hey ${escapeHtml(opts.name.split(" ")[0])},
    </h1>
    <p style="margin: 0 0 14px; color: #4B3A2F; font-size: 15px; line-height: 1.55;">
      So sorry, <strong>${escapeHtml(longDate)}</strong> isn&rsquo;t going to work for us.
    </p>
    <p style="margin: 0 0 14px; color: #4B3A2F; font-size: 15px; line-height: 1.55;">
      Try a different Sunday at <a href="https://flickman.co/crepes" style="color:#B23A2A;">flickman.co/crepes</a>? We&rsquo;d love to have you.
    </p>
    <p style="margin: 18px 0 0; color: #7C6A5D; font-size: 13px; font-style: italic;">
      Matt &amp; Nat
    </p>
  </div>
</body></html>`;

  const text =
    `Hey ${opts.name.split(" ")[0]},\n\n` +
    `So sorry, ${longDate} isn't going to work for us.\n\n` +
    `Try a different Sunday at flickman.co/crepes? We'd love to have you.\n\n` +
    `Matt & Nat`;

  return sendViaResend({
    from: FROM,
    to: [opts.email],
    replyTo: NOTIFY,
    subject,
    html,
    text,
  });
}

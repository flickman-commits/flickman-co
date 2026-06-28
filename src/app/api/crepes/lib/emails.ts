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
  cc?: string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: { filename: string; content: string }[];
  /** ISO 8601 timestamp (with offset or Z) for delayed send. */
  scheduledAt?: string;
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
  if (payload.cc && payload.cc.length > 0) body.cc = payload.cc;
  if (payload.replyTo) body.reply_to = payload.replyTo;
  if (payload.attachments) body.attachments = payload.attachments;
  if (payload.scheduledAt) body.scheduled_at = payload.scheduledAt;

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

/* ──────────────────────────────────────────────────────────────── */
/* Reminder scheduling helpers                                       */
/* ──────────────────────────────────────────────────────────────── */

/**
 * Build a JS Date that represents "the day before <dateISO> at 10:00 AM ET".
 * Returns null if that moment is already in the past (or less than 5 minutes
 * away, since Resend will reject scheduled_at in the past).
 *
 * Brute-forces the EDT/EST offset by checking which candidate UTC hour
 * formats back to 10 AM in America/New_York for that date.
 */
function reminderUtcDate(dateISO: string): Date | null {
  const [y, m, d] = dateISO.split("-").map(Number);

  // Day-before in calendar terms (ET). Compute it as a UTC midnight probe.
  const probe = new Date(Date.UTC(y, m - 1, d - 1, 0, 0, 0));
  const dayBefore = {
    y: probe.getUTCFullYear(),
    m: probe.getUTCMonth() + 1,
    d: probe.getUTCDate(),
  };

  // Try candidate UTC hours 13–16 — covers EDT (-4) and EST (-5).
  for (const utcHour of [13, 14, 15, 16]) {
    const candidate = new Date(
      Date.UTC(dayBefore.y, dayBefore.m - 1, dayBefore.d, utcHour, 0, 0)
    );
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(candidate);
    const map: Record<string, string> = {};
    parts.forEach((p) => {
      if (p.type !== "literal") map[p.type] = p.value;
    });
    if (parseInt(map.hour, 10) === 10 && parseInt(map.day, 10) === dayBefore.d) {
      return candidate;
    }
  }
  return null;
}

export function reminderScheduledAt(dateISO: string): string | null {
  const candidate = reminderUtcDate(dateISO);
  if (!candidate) return null;
  // Resend rejects past-or-imminent timestamps. Skip if less than 5 min away.
  if (candidate.getTime() < Date.now() + 5 * 60 * 1000) return null;
  return candidate.toISOString();
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
    <p style="margin: 0 0 4px; color: #7C6A5D; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">Where</p>
    <p style="margin: 0 0 16px; color: #2A1A14; font-size: 15px; line-height: 1.5;">
      ${escapeHtml(process.env.CREPES_LOCATION ?? "West Village, New York")}
    </p>
    <p style="margin: 0 0 10px; color: #4B3A2F; font-size: 15px; line-height: 1.55;">
      Calendar invite is attached so you can add it in one tap.
    </p>
    <p style="margin: 0; color: #4B3A2F; font-size: 15px; line-height: 1.55;">
      Come hungry.
    </p>
    <p style="margin: 24px 0 0; color: #7C6A5D; font-size: 13px; font-style: italic;">
      Matt &amp; Nat
    </p>
  </div>
</body></html>`;

  const location = process.env.CREPES_LOCATION ?? "West Village, New York";

  const text =
    `You're in, ${opts.name.split(" ")[0]}.\n\n` +
    `${longDate} at 11 AM. Table for ${opts.party}.\n\n` +
    `Where: ${location}\n\n` +
    `Calendar invite is attached so you can add it in one tap.\n\n` +
    `Come hungry.\nMatt & Nat`;

  const NAT = process.env.CREPES_NAT_EMAIL ?? "natalia.ohanesian@gmail.com";

  return sendViaResend({
    from: FROM,
    to: [opts.email],
    cc: [NOTIFY, NAT],
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
/* 3. Guest gets a 1-day-before reminder (scheduled via Resend)      */
/* ──────────────────────────────────────────────────────────────── */

export async function scheduleReminderToGuest(opts: {
  name: string;
  email: string;
  dateISO: string;
  party: 1 | 2;
}): Promise<{ scheduled: boolean; scheduledAt?: string }> {
  const scheduledAt = reminderScheduledAt(opts.dateISO);
  if (!scheduledAt) return { scheduled: false };

  const longDate = fmtSundayLong(opts.dateISO);
  const subject = `Reminder: Crepe Sundays tomorrow at 11`;

  const html = `<!doctype html>
<html><body style="margin:0; padding:32px 16px; background:#FBF4E2; font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 520px; margin: 0 auto; background: #FFFCF6; border:2px solid #2A1A14; border-radius:6px; padding:28px 24px 22px; box-shadow: 0 6px 0 #2A1A14;">
    <div style="font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #B23A2A; margin-bottom: 10px;">Crepe Sundays · Reminder</div>
    <h1 style="font-family: ui-serif, Georgia, serif; font-size: 26px; margin: 0 0 10px; color: #2A1A14;">
      See you tomorrow, ${escapeHtml(opts.name.split(" ")[0])}.
    </h1>
    <p style="margin: 0 0 14px; color: #4B3A2F; font-size: 16px; line-height: 1.55;">
      Quick reminder: you&rsquo;re booked for <strong>${escapeHtml(longDate)}</strong> at 11 AM. Table for ${opts.party}.
    </p>
    <p style="margin: 0 0 4px; color: #7C6A5D; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">Where</p>
    <p style="margin: 0 0 16px; color: #2A1A14; font-size: 15px; line-height: 1.5;">
      ${escapeHtml(process.env.CREPES_LOCATION ?? "West Village, New York")}
    </p>
    <p style="margin: 0 0 14px; color: #4B3A2F; font-size: 15px; line-height: 1.55;">
      If anything changed and you can&rsquo;t make it, just reply to this email so we can give the spot to someone else.
    </p>
    <p style="margin: 0; color: #4B3A2F; font-size: 15px; line-height: 1.55;">
      Otherwise, come hungry.
    </p>
    <p style="margin: 24px 0 0; color: #7C6A5D; font-size: 13px; font-style: italic;">
      Matt &amp; Nat
    </p>
  </div>
</body></html>`;

  const reminderLocation = process.env.CREPES_LOCATION ?? "West Village, New York";

  const text =
    `See you tomorrow, ${opts.name.split(" ")[0]}.\n\n` +
    `Quick reminder: you're booked for ${longDate} at 11 AM. Table for ${opts.party}.\n\n` +
    `Where: ${reminderLocation}\n\n` +
    `If anything changed and you can't make it, just reply to this email so we can give the spot to someone else.\n\n` +
    `Otherwise, come hungry.\nMatt & Nat`;

  await sendViaResend({
    from: FROM,
    to: [opts.email],
    cc: [NOTIFY],
    replyTo: NOTIFY,
    subject,
    html,
    text,
    scheduledAt,
  });

  return { scheduled: true, scheduledAt };
}

/* ──────────────────────────────────────────────────────────────── */
/* 4. Guest gets a follow-up asking for a review + photos            */
/* ──────────────────────────────────────────────────────────────── */

/**
 * Build a JS Date for Sunday at 3:00 PM ET (after the event ends at 12:30).
 * Returns null if that moment is already past or less than 5 minutes away.
 */
function followUpUtcDate(dateISO: string): Date | null {
  const [y, m, d] = dateISO.split("-").map(Number);

  for (const utcHour of [19, 20]) {
    const candidate = new Date(Date.UTC(y, m - 1, d, utcHour, 0, 0));
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(candidate);
    const map: Record<string, string> = {};
    parts.forEach((p) => { if (p.type !== "literal") map[p.type] = p.value; });
    if (parseInt(map.hour, 10) === 15 && parseInt(map.day, 10) === d) {
      return candidate;
    }
  }
  return null;
}

export function followUpScheduledAt(dateISO: string): string | null {
  const candidate = followUpUtcDate(dateISO);
  if (!candidate) return null;
  if (candidate.getTime() < Date.now() + 5 * 60 * 1000) return null;
  return candidate.toISOString();
}

export async function scheduleFollowUpToGuest(opts: {
  name: string;
  email: string;
  dateISO: string;
}): Promise<{ scheduled: boolean; scheduledAt?: string }> {
  const scheduledAt = followUpScheduledAt(opts.dateISO);
  if (!scheduledAt) return { scheduled: false };

  const firstName = opts.name.split(" ")[0];
  const phone = process.env.MATT_PHONE ?? "Matt";
  const subject = `Thanks for coming to Crepe Sundays`;

  const html = `<!doctype html>
<html><body style="margin:0; padding:32px 16px; background:#FBF4E2; font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 520px; margin: 0 auto; background: #FFFCF6; border:2px solid #2A1A14; border-radius:6px; padding:28px 24px 22px; box-shadow: 0 6px 0 #2A1A14;">
    <div style="font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #B23A2A; margin-bottom: 10px;">Crepe Sundays</div>
    <h1 style="font-family: ui-serif, Georgia, serif; font-size: 26px; margin: 0 0 12px; color: #2A1A14;">
      So glad you came, ${escapeHtml(firstName)}.
    </h1>
    <p style="margin: 0 0 14px; color: #4B3A2F; font-size: 15px; line-height: 1.55;">
      We had such a great time hosting you this morning. Hope the crepes lived up to the hype.
    </p>
    <p style="margin: 0 0 14px; color: #4B3A2F; font-size: 15px; line-height: 1.55;">
      Two small asks if you&rsquo;re feeling generous:
    </p>
    <ol style="margin: 0 0 16px; padding-left: 20px; color: #4B3A2F; font-size: 15px; line-height: 1.7;">
      <li><strong>Drop us a quick review</strong> by texting it to ${escapeHtml(phone)}. Doesn&rsquo;t have to be long. One honest sentence is perfect. We&rsquo;d love to put it on the site.</li>
      <li><strong>Text any photos</strong> you took this morning to that same number. We&rsquo;d love to add them to the page.</li>
    </ol>
    <p style="margin: 0; color: #4B3A2F; font-size: 15px; line-height: 1.55;">
      Thanks again. Come back soon.
    </p>
    <p style="margin: 24px 0 0; color: #7C6A5D; font-size: 13px; font-style: italic;">
      Matt &amp; Nat
    </p>
  </div>
</body></html>`;

  const text =
    `So glad you came, ${firstName}.\n\n` +
    `We had such a great time hosting you this morning. Hope the crepes lived up to the hype.\n\n` +
    `Two small asks if you're feeling generous:\n\n` +
    `1. Drop us a quick review by texting it to ${phone}. Doesn't have to be long. One honest sentence is perfect. We'd love to put it on the site.\n\n` +
    `2. Text any photos you took this morning to that same number. We'd love to add them to the page.\n\n` +
    `Thanks again. Come back soon.\nMatt & Nat`;

  await sendViaResend({
    from: FROM,
    to: [opts.email],
    replyTo: NOTIFY,
    subject,
    html,
    text,
    scheduledAt,
  });

  return { scheduled: true, scheduledAt };
}

/* ──────────────────────────────────────────────────────────────── */
/* 5. Guest gets a polite decline                                    */
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

# Meeting prep agent

The instructions for the scheduled task that writes meeting context into Notion,
which the Flickman Daily Report then reads and renders.

Kept in the repo rather than only inside the scheduler so it can be reviewed and
changed like any other part of the report.

## How it fits

The daily report already knows **what's on your day** — it reads the calendar
directly, every morning, and that half can't go stale. This agent supplies the
other half: **what you need to know walking in**, gathered from places the
report's server can't reach (Wispr Flow transcripts, Gmail, the web).

**Notion is the bridge, in both directions.** The agent runs in a cloud
environment whose egress can't reach `flickman.co`, so it can't ask the report
what to prepare. It can reach Notion, and so can the report — so at 5:00 AM ET a
cron hits `/api/digest/meetings/seed`, which writes one row per meeting with an
empty `Context`. The agent's whole job is to fill those rows in. It makes no HTTP
calls to this project at all.

That also fixes the join. The report writes the `Meeting` title itself, so it is
matching against a string it authored. The old failure — the agent inventing a
title that matched nothing, every meeting silently losing its context while the
section still rendered perfectly — can't happen if the agent never creates rows.

- Database: [Daily Report — Meeting Prep](https://app.notion.com/p/982704c6b1a3446eabdec95d7cf7e26a)
- Rows appear by **5:05 AM ET**. The report sends at **7:00 AM ET**.
- Schedule this for **6:00 AM ET, weekdays.**

---

## The task prompt

Everything from here down is what the scheduled task runs.

---

You are preparing Matt for today's meetings. Your output is rows in a Notion
database that get rendered into his morning report — he reads them at 7am, not
you, so write for someone walking into a meeting cold.

### 1. Find today's meetings

Query the **Daily Report — Meeting Prep** database in Notion for rows where
`Date` is today.

Those rows are already there. A scheduled job wrote one per meeting before you
started, with `Meeting` and `Attendees` filled in and `Context` empty. **Your job
is to fill in `Context` on the rows you find — not to decide what today's
meetings are.**

- **Do not create rows.** If a meeting seems missing, leave it. A row you invent
  won't match the calendar and will render as nothing.
- **Do not edit `Meeting`.** It is the join key. Rewording it, expanding an
  abbreviation, or fixing its capitalization silently detaches the row.
- **Do not read Google Calendar yourself.** Your connector reaches only one of
  Matt's two accounts, and the meetings that matter — the ones with real
  invitees — live on the other. You would confidently prep the wrong things.
- If there are no rows for today, stop. That means a clear day, or the seed job
  failed; either way, guessing at a schedule is worse than doing nothing.

### 2. Research each meeting

**Use the `Attendees` value when there is one** — those are real names off the
invite, and far better search keys than anything inferred.

When `Attendees` is empty, read the title for who and what. Matt's titles carry
what the invite doesn't: "ALISON / APEX SIZZLE + FOUNDER" gives you Alison, a
company (Apex), a deliverable (a sizzle reel), and that a founder is joining.
Extract those names first — they're what you search on.

Then spend effort proportional to how much you don't already know. Work through
these in order and stop when you have enough:

1. **Prior conversations** — Wispr Flow `search_meetings` for the names or topic.
   If there's a previous meeting, `get_meeting` it and read the transcript rather
   than only the summary; the summary drops specifics. What was decided, what was
   promised, what's still open.
2. **Your own notes** — `search_scratchpad_notes` for the person or company.
   Matt's own jottings are often the most useful thing available.
3. **Recent email** — search Gmail for the person or company over the last ~60
   days. What was the last exchange, and is anything unanswered?
4. **Who they are** — only if the above turned up nothing useful, search the web
   for the person and their company. You're after their role and what the company
   does. Don't try to fetch LinkedIn directly; it blocks automated access. A
   general search usually surfaces the same facts.

### 3. Write the context

2–4 sentences per meeting. Lead with the single most useful thing. Prefer
specifics over characterization: "you owed him revised pricing after the July
call" beats "ongoing pricing discussion."

Include, when you actually found it:
- Where things stand, and anything Matt owes them
- Open action items from last time
- Who the person is, if Matt likely doesn't know

**Never invent.** If you found nothing, write what you did check — "no prior
meetings or email; first contact as far as I can tell" is genuinely useful and
tells Matt to expect a cold start. A confident-sounding summary of nothing is the
worst possible output here, because he'll walk in trusting it.

### 4. Update the row

For each row you researched, update these two properties in place:

| Property | Value |
| --- | --- |
| **Context** | What you wrote in step 3 |
| **Sources** | Which sources you actually used, e.g. `Wispr Flow, Gmail` |

Leave `Meeting`, `Date` and `Attendees` exactly as you found them. `Attendees`
came off the real invite; anything you'd infer is a downgrade.

If a row already has `Context` from an earlier run today, replace it only if you
found something better. Running twice should not degrade a row.

### If something is unavailable

Wispr Flow's connector depends on the desktop app and may be unreachable when
this runs unattended, and it only covers meetings it recorded even when it is
reachable. Gmail may be rate-limited. **Continue with the sources you can reach**
and name the shortfall in `Sources`, e.g. `Gmail only — Wispr Flow unavailable`.
A row with thin context beats no row. Never fail the whole run because one source
is down.

---

## Verifying it worked

The seed job and the read are checked separately, because they fail differently.

**Did the rows get written?**

```bash
curl -sS "https://www.flickman.co/api/digest/meetings/seed?key=$CRON_SECRET"
```

Returns `created` / `existing` / `seedStatus`. Safe to re-run: it creates only
what's missing and never overwrites `Context`.

- `"seedStatus":"partial"` — some creates failed; the agent will find some rows
  but not all, which looks like success from the read side.
- `"seedStatus":"no-credential"` — `NOTION_TOKEN` isn't set on Vercel.
- `"meetings":0` — the calendar filter dropped everything. Check
  `diagnostics.calendars` for a `403`; a newly added account that was never
  shared with the service account contributes nothing silently.

**Did the context reach the report?**

```bash
curl -sSI "https://www.flickman.co/api/digest?preview=1&key=$CRON_SECRET" | grep -i x-digest-meetings
```

- `prep ok, 3 matched, 0 unmatched` — working.
- `prep ok, 0 matched, 3 unmatched` — rows exist whose titles don't match the
  calendar. Since the report now writes the titles, this means something edited
  `Meeting` after seeding.
- `prep ok, 0 matched, 0 unmatched` — no rows at all. Check the seed job.
- `prep no-credential` — `NOTION_TOKEN` isn't set on Vercel.
- `prep unavailable: Notion 404` — the integration isn't connected to the
  database (⋯ → Connections).

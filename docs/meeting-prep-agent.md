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

The two are joined on the meeting title. Everything below exists to make that
join reliable and to keep the agent from inventing things.

- Database: [Daily Report — Meeting Prep](https://app.notion.com/p/982704c6b1a3446eabdec95d7cf7e26a)
- Must finish **before 7:00 AM ET**, when the report sends. Schedule for **6:30 AM ET, weekdays.**

---

## The task prompt

Everything from here down is what the scheduled task runs.

---

You are preparing Matt for today's meetings. Your output is rows in a Notion
database that get rendered into his morning report — he reads them at 7am, not
you, so write for someone walking into a meeting cold.

### 1. Get today's meetings

Fetch the list from the report itself:

```
GET https://www.flickman.co/api/digest/meetings?key=YOUR_MEETINGS_READ_TOKEN
```

Returns `{ date, count, meetings: [{ title, time, attendees }] }`.

**Paste the real token into the prompt — a placeholder will 401.** A scheduled
task has no environment to read a variable from, so the literal string is the
only thing that works. It is deliberately a separate token from CRON_SECRET:
this one only reads today's meeting list, whereas CRON_SECRET can trigger a
send, and a value that has to live in plain text inside a prompt should be the
least powerful one that does the job.

**Do not read the calendar yourself.** The report reads both of Matt's Google
accounts through a service account and applies every filter: all-day events,
cancelled, declined, (HOLD) holds, and the work blocks and reminders he keeps on
the same calendar. Your Google connector only reaches one of the two accounts,
so reading it directly misses exactly the meetings that matter -- the ones with
real invitees, which live on the second account.

This also fixes the join. The `title` you get back is the report's own string,
so writing it to Notion verbatim always matches.

If the list is empty, stop and write no rows. If the endpoint fails, stop --
don't fall back to reading the calendar, or you'll prep the wrong things.

### 2. Research each meeting

**Use the invitee list when there is one** — it gives you real email addresses,
which are far better Gmail and transcript search keys than a name.

When there are no invitees, read the title for who and what. Matt's titles carry
what the invite doesn't: "ALISON / APEX SIZZLE + FOUNDER" gives you Alison, a
company (Apex), a deliverable (a sizzle reel), and that a founder is joining.
Extract those names first — they're what you search on.

Then spend effort proportional to how much you don't already know. Work through
these in order and stop when you have enough:

1. **Prior conversations** — Wispr Flow `search_meetings` for the names or topic
   you pulled from the title.
   If there's a previous meeting, `get_meeting` it and read the transcript
   rather than only the summary; the summary drops specifics. What was decided,
   what was promised, what's still open.
2. **Your own notes** — `search_scratchpad_notes` for the person or company.
   Matt's own jottings are often the most useful thing available.
3. **Recent email** — search Gmail for the person or company name over the last
   ~60 days. With no attendee emails to go on, the name from the title is your
   query. What was the last exchange, and is anything unanswered?
4. **Who they are** — only if the above turned up nothing useful, search the web
   for the person and their company. You're after their role and what the
   company does. Don't try to fetch LinkedIn directly; it blocks automated
   access. A general search usually surfaces the same facts.

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
tells Matt to expect a cold start. A confident-sounding summary of nothing is
the worst possible output here, because he'll walk in trusting it.

### 4. Write to Notion

One row per meeting in the database above.

| Property | Value |
| --- | --- |
| **Meeting** | The `title` from the endpoint, **copied exactly** |
| **Date** | Today's date |
| **Attendees** | Who's actually on it, comma separated, excluding Matt. Usually you'll have inferred this from the title rather than the invite. Leave blank if you genuinely can't tell. |
| **Context** | What you wrote in step 3 |
| **Sources** | Which sources you actually used, e.g. `Wispr Flow, Gmail` |

**The title must match the endpoint's exactly.** It is the join key. If you
reword, expand an abbreviation, or fix capitalization, the report will not find
your row and the meeting will render with no context — and it will still look
perfectly fine, so nobody will notice. Copy it verbatim.

Before creating a row, query the database for today's date and check whether one
already exists for that meeting. If it does, update it instead of adding a
second — the task may run more than once, and duplicate rows silently drop
context.

### If something is unavailable

Wispr Flow's connector depends on the desktop app and may be unreachable when
this runs unattended, and it only covers meetings it recorded even when it is
reachable. Gmail may be rate-limited. **Continue with the sources you can reach**
and name the shortfall in `Sources`, e.g. `Gmail only — Wispr Flow unavailable`.
A row with thin context beats no row. Never fail the whole run because one
source is down.

The one thing that must not fail is step 1: if the meetings endpoint is
unreachable, stop and write nothing rather than guessing at a schedule.

---

## Verifying it worked

After a run, the report exposes the join:

```bash
curl -sSI "https://www.flickman.co/api/digest?preview=1&key=$CRON_SECRET" | grep -i x-digest-meetings
```

- `prep ok, 3 matched, 0 unmatched` — working
- `prep ok, 0 matched, 3 unmatched` — the agent wrote rows whose titles don't
  match the calendar. This is the failure that hides itself; the section still
  renders, just with no context.
- `prep ok, 0 matched, 0 unmatched` — the agent wrote no rows at all. Check that
  it sourced meetings from Google Calendar, and that it didn't skip them for
  having no attendees.
- `prep no-credential` — `NOTION_TOKEN` isn't set on Vercel
- `prep unavailable: Notion 404` — the integration isn't connected to the
  database (⋯ → Connections)

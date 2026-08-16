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

Use Wispr Flow's `list_upcoming_meetings` with `window_hours: 24`. Keep only
events that start **today** in America/New_York.

Skip: all-day events, anything cancelled, and anything Matt has declined. Skip
solo blocks with no other attendees (focus time, reminders, "gym") — there's
nothing to prepare for. If nothing survives, stop; write no rows.

### 2. Research each meeting

For each meeting, spend effort proportional to how much you don't already know.
Work through these in order and stop when you have enough:

1. **Prior conversations** — `search_meetings` for the attendees or the topic.
   If there's a previous meeting, `get_meeting` it and read the transcript
   rather than only the summary; the summary drops specifics. What was decided,
   what was promised, what's still open.
2. **Your own notes** — `search_scratchpad_notes` for the person or company.
   Matt's own jottings are often the most useful thing available.
3. **Recent email** — search Gmail for threads with the attendees in the last
   ~60 days. What was the last exchange, and is anything unanswered?
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
| **Meeting** | The calendar event title, **copied exactly** |
| **Date** | Today's date |
| **Attendees** | Names, comma separated, excluding Matt |
| **Context** | What you wrote in step 3 |
| **Sources** | Which sources you actually used, e.g. `Wispr Flow, Gmail` |

**The title must match the calendar exactly.** It is the join key. If you
reword, expand an abbreviation, or fix capitalization, the report will not find
your row and the meeting will render with no context — and it will still look
perfectly fine, so nobody will notice. Copy it verbatim.

Before creating a row, query the database for today's date and check whether one
already exists for that meeting. If it does, update it instead of adding a
second — the task may run more than once, and duplicate rows silently drop
context.

### If something is unavailable

Wispr Flow's connector depends on the desktop app and may be unreachable when
this runs unattended. Gmail may be rate-limited. **Continue with the sources you
can reach** and name the shortfall in `Sources`, e.g. `Gmail only — Wispr Flow
unavailable`. A row with thin context beats no row. Never fail the whole run
because one source is down.

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
- `prep no-credential` — `NOTION_TOKEN` isn't set on Vercel
- `prep unavailable: Notion 404` — the integration isn't connected to the
  database (⋯ → Connections)

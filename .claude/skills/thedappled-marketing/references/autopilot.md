# Autopilot: the daily unattended run

The owner set up a scheduled cloud routine (weekdays, morning IST) that runs this marketer with nobody
watching. The owner has given standing permission for exactly these actions, and only these:

- write LinkedIn posts and images, commit **only** the image files to `public/social/linkedin/`, push
  them to `main` as VaibhavPawar212303, and set the Notion row to Ready once the image is live;
- create Notion draft pages for other channels;
- read PostHog, Notion, the repo and the live site;
- send **one** summary email per run to the owner's own Gmail.

Everything else (code changes, other files, other people's inboxes, posting anywhere else, editing or
deleting existing Notion rows, changing settings) is out of scope: note it in the summary as a
suggestion instead. When something is unclear, the safe move is to skip it and say so in the email.
A missed post costs nothing; a wrong public post costs trust.

## 1. Set up

```bash
git config user.name "VaibhavPawar212303"
git config user.email "<owner email from the routine prompt>"
git pull --rebase origin main
```
The card script needs a browser. If `node .claude/skills/thedappled-marketing/scripts/make-card.mjs`
reports that Chrome is missing, run `npx -y playwright@1.49.1 install --with-deps chromium` once.

## 2. Read the situation

- Today's date in IST (`TZ=Asia/Kolkata date +%F`), and the weekday.
- All LinkedIn Insta Drafts rows (see `linkedin.md`): dates taken, statuses, first-comment URLs.
  A page is **announced** if some row's First Comment links to it.
- Public pages: `app/sitemap.ts`. Recent work: `git log --since="14 days ago" --oneline`.
- Unannounced features = public stage/lesson pages (`/testing/*`, `/dsa/*`) with no row linking to them,
  newest first. Check each one's page source for the facts.
- PostHog: visitors yesterday and the last 7 days, by source and top pages (`analytics.md`).

## 3. Keep the LinkedIn queue full (at most ONE new post per run)

Target: every free valid slot in the next 14 days has a Ready post, following the schedule rules in
`linkedin.md` (weekdays, Tue–Thu preferred, a gap day, max 3–4 a week, holidays skipped).

If there is a free slot at least 2 days from today **and** something worth saying:
1. Pick the story, in this order: an unannounced feature → a new angle on a feature whose post did well
   in PostHog (a result, a common mistake, a how-to) → nothing. Never repeat an earlier post's angle,
   and never invent news, numbers or user stories to fill a slot. An empty slot is fine.
2. Write the post (text rules in `linkedin.md`). First Comment: call to action + URL with
   `?utm_source=linkedin&utm_medium=social&utm_campaign=<slug>`.
3. Make the image with `scripts/make-card.mjs` into `public/social/linkedin/<slug>.png`; read it back
   and check it visually (no overflow or overlap). Slug must be new (don't overwrite an existing PNG).
4. Create the Notion row as **Draft** with text, date, image URL and first comment.
5. Commit only that PNG (`git add public/social/linkedin/<slug>.png`), message
   `Add LinkedIn image: <topic>`, then `git pull --rebase origin main && git push origin main`.
   If the push is rejected, retry once after another pull; never force-push.
6. Poll the image URL (every 30 s, up to 15 min) until it returns `200 image/png`.
7. Only then set the row to **Ready**. If the image never goes live, leave it Draft and flag it.

## 4. Other channels (drafts only)

For each post scheduled this run, create a private Notion draft page
"Marketing drafts – <slug> – <date>" with:
- an X thread (`channels.md`),
- one community value post, naming the community and the rule to check,
- a short learner email (subject, preview, body, button link with `utm_source=email`).
Don't send, post or create Resend broadcasts; the owner does that.

## 5. Checks worth flagging (never fix by editing rows)

- Ready rows whose text or first comment no longer matches the site (renamed or renumbered steps,
  changed URLs), Ready rows with a date in the past, two rows on one date, a missing image URL.
- Live image URLs of upcoming Ready rows that don't return 200.
- On Mondays: a 7-day report (visitors, sources, top pages, which posts moved traffic, next actions).
- On Wednesdays: one SEO suggestion for the most-visited stage page (title/description/internal links),
  as before → after text for the owner to approve.

## 6. Email the owner (one per run)

Send with the Gmail connector to the owner's address only. Subject:
`Thedappled marketing · <Mon DD> · <n> scheduled` (or `· nothing new` if so). Body, plain and short:

1. **Done:** posts scheduled (date, topic, Notion link), images pushed (commit), drafts created (links).
2. **Numbers:** visitors yesterday and last 7 days vs the 7 days before, top 3 sources and pages
   (or the full report on Mondays).
3. **Needs you:** community posts and emails ready to send, any flags from step 5, failures.
4. **Next:** the one thing you'd do next.

If the run failed partway, still send the email and say exactly what did and didn't happen.

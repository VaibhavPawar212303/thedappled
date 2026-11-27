# LinkedIn: the automated channel

LinkedIn posts publish themselves: rows in the Notion database **LinkedIn Insta Drafts**
(data source `collection://ae8456cb-d458-45e4-8c9d-4804fef5d51c`) are posted by the Make scenario
**Notion to LinkedIn - Auto Post** at 7:00 PM IST, one row per run: the row with Status = Ready and
Publish On = today (IST). A missed day never posts later; it needs a new date. Full rules live on the
Notion page "LinkedIn Posting Rules" (https://app.notion.com/p/422a425ec07381659f9bce19566ccb9f).

## Row fields

| Field | What goes in it |
|---|---|
| Post Text (title) | The whole post, no links |
| Publish On | A date (no time) |
| Status | Draft while working; Ready only when everything below passes |
| Image URL | `https://thedappled.com/social/linkedin/<slug>.png` |
| First Comment | `<Call to action>: <full URL with UTM>` — Make posts it as the first comment |
| Comment Status, Post URL, Comments | Set by Make; don't write them |

## Schedule rules

- Weekdays only; never Sat/Sun.
- Two empty days between two posts: the next post is at least 3 days after the previous one, and if
  that lands on Sat/Sun it moves to Monday (a Monday/Thursday rhythm). No two Ready rows on one date.
- Query existing rows first and pick the next free date that fits. Avoid public holidays where
  reach is low (e.g. Dec 24–26, Dec 31, Jan 1) and say why you skipped them.

## Text rules

- 1,300–2,000 characters. Count them (`node -e "console.log(require('fs').readFileSync(f,'utf8').trim().length)"`).
- Hook in the first two lines (~200 characters): a sharp observation or problem, not "I'm excited to announce".
- Short paragraphs with blank lines. Arrow lists (→) work well for "what's inside".
- Say "The link is in the first comment." Never put a URL in the post text.
- End with exactly one question that invites experience ("Which annotation does your team use most?").
- 3–5 hashtags at the very end, relevant to the audience (#Playwright #TestAutomation #QA …).

## Image

Every post has one: 1080 × 1350 PNG under 5 MB, the dark Thedappled card style. Use
`scripts/make-card.mjs` with a small JSON spec (see the script's header). It renders with headless
Chrome to `public/social/linkedin/<slug>.png`. Read the PNG back and check it: no overflow, no
overlapping text, the link line at the bottom.

## Done means

1. Row created as Draft with text, date, image URL and first comment.
2. Image committed and pushed (only when the user asks), then verified live:
   `curl -s -o /dev/null -w "%{http_code} %{content_type}" <image URL>` → `200 image/png`.
3. Status set to Ready, and the user told the date and time it will post.

## Repurposing an existing row

The best LinkedIn posts (most comments, or most visits in PostHog with `utm_source=linkedin`) are
the raw material for other channels: keep the insight, rewrite the shape (see `channels.md`).
Don't re-post the same text on LinkedIn; a follow-up post needs a new angle (a result, a lesson
learned, a learner question answered).

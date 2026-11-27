# Measuring what works

## What's tracked

- **PostHog** (`instrumentation-client.ts`): pageviews on every route (`$pageview`, also on client-side
  navigation), with `$current_url`, `$pathname`, `$referring_domain` and UTM parameters
  (`utm_source`, `utm_medium`, `utm_campaign`, also as `$initial_utm_*` person properties).
  Person profiles are created only for identified users, and the app doesn't call `identify` today,
  so PostHog shows **visits, not sign-ups**.
- **Sign-ups and activity** live in the app: Clerk users, and Prisma `Assignment` rows (started /
  completed stages). Count them with a read-only query or ask the owner for the Clerk dashboard number.
  Don't read `.env` files; they're off limits in this repo.
- **LinkedIn**: the Notion row's Comments and Comment Status (set by Make), and the post itself.

If the owner wants sign-ups per channel, suggest (don't silently add) a small change: capture a
`signed_up` event with the stored UTM source after Clerk sign-up. It's a code change, so it follows the
normal flow (design not needed for a non-visual event; typecheck, lint, commit only when asked).

## How to query PostHog

The site's project is "Default project" (id 537868, timezone UTC). Through the PostHog `exec` tool:

1. Confirm the data first: `call read-data-schema {"query": {"kind": "events"}}`. As of Nov 2026 only
   `$pageview` and `$rageclick` arrive; `$identify` doesn't, which is why sign-ups need the app's data.
2. Prefer the web-analytics tools, which handle visitors and sessions the PostHog way:
   - `query-web-overview` — visitors, sessions, bounce rate, session duration for a date range (with comparison).
   - `query-web-stats` — breakdowns: top pages, UTM source / medium / campaign, referring domain, device, country.
   Run `info <tool>` and drill into hinted fields with `schema` before calling; don't guess the input shape.
3. Use `execute-sql` (HogQL, below) for things those tools can't express, like a per-day series for
   one campaign, or a join with another table.

Use the last 30 days unless asked otherwise; compare with the 30 days before for trend.

### SQL fallbacks (HogQL via `execute-sql`)

Visits by channel:
```sql
SELECT coalesce(nullIf(properties.utm_source, ''), properties.$referring_domain, '$direct') AS source,
       count() AS pageviews, count(DISTINCT distinct_id) AS visitors
FROM events
WHERE event = '$pageview' AND timestamp > now() - INTERVAL 30 DAY
GROUP BY source ORDER BY visitors DESC LIMIT 20
```

Top pages:
```sql
SELECT properties.$pathname AS path, count(DISTINCT distinct_id) AS visitors
FROM events
WHERE event = '$pageview' AND timestamp > now() - INTERVAL 30 DAY
GROUP BY path ORDER BY visitors DESC LIMIT 20
```

Per campaign (needs UTM links):
```sql
SELECT properties.utm_campaign AS campaign, properties.utm_source AS source, count(DISTINCT distinct_id) AS visitors
FROM events
WHERE event = '$pageview' AND properties.utm_campaign != '' AND timestamp > now() - INTERVAL 30 DAY
GROUP BY campaign, source ORDER BY visitors DESC
```

Did a LinkedIn post move traffic? Daily visitors from linkedin around its Publish On date:
```sql
SELECT toDate(timestamp) AS day, count(DISTINCT distinct_id) AS visitors
FROM events
WHERE event = '$pageview' AND (properties.utm_source = 'linkedin' OR properties.$referring_domain ILIKE '%linkedin%')
  AND timestamp > now() - INTERVAL 30 DAY
GROUP BY day ORDER BY day
```

If a query errors, read the tool's command help and adjust; property names are the source of truth.

## Report format

Keep it to one screen:

1. **Headline:** visitors this period vs last (± %), and new learners (sign-ups / assignments started).
2. **By channel:** a small table (source, visitors, change).
3. **What worked:** the 2–3 posts or pages that drove the most, and a guess at why (topic, hook, timing).
4. **What didn't:** honestly, with the likely reason.
5. **Next:** three concrete actions for the coming week (e.g. "repurpose the Dec 29 annotations post as
   an r/Playwright tutorial", "add UTM to the remaining first comments", "fix the title on /dsa").

Numbers are what the tools return. If data is missing (no UTM yet, PostHog key not set in production),
say so and recommend the fix instead of estimating.

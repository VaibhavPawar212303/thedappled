# Other channels

Each channel has its own shape. Adapt the *story*, never paste the LinkedIn text.

## X / Twitter threads

- 4–7 posts, each under 280 characters. Post 1 is the hook and must stand alone (it's what gets
  shown); no link in post 1 (links in the first post cut reach).
- One idea per post. Code fits as a short line in backticks or as an image you describe for the owner.
- Last post: the link with `utm_source=x&utm_medium=social`, plus a question.
- 0–2 hashtags in total. Tag tools only where natural (@playwrightweb, @Cypress_io) and never spam mentions.
- Best times for this audience: weekday mornings in the US or India work week; suggest one.

## Reddit and dev communities

These communities reward help and remove promotion. Write as a practitioner first.

| Community | Fits | Rules to respect |
|---|---|---|
| r/QualityAssurance | Manual testing, test design, careers into automation | Self-promotion limited; lead with the lesson content |
| r/softwaretesting | Same as above | Same |
| r/Playwright | Annotations, cross-browser, fixtures, CI | Must be about Playwright; share the technique, link as "I wrote this up here" |
| r/Cypress | Cypress track content | Same |
| r/learnprogramming, r/csMajors | DSA path, interview prep | Strict on promotion; answer questions, link only if asked or allowed by the weekly thread |
| dev.to / Hashnode | Full tutorials cross-posted from the site | Set the canonical URL to thedappled.com; tags: playwright, testing, javascript, beginners |
| Ministry of Testing Club, Playwright Discord | Q&A, show-and-tell | Use show-and-tell spaces only |

Two kinds of drafts:
1. **Value post** – a self-contained mini tutorial (e.g. "5 Playwright annotations most suites don't use,
   with examples"), with the Thedappled link once at the end as the place to practise it.
2. **Answers** – when the owner shares a question thread, draft a direct, correct answer; mention the
   relevant lesson only if it genuinely helps.

Always tell the owner: which community, the post title, the flair if needed, and the rule to double-check
(rules change; they should read the sidebar before posting). Never suggest vote manipulation,
multiple accounts, or posting the same thing to many subs on one day.

## SEO and site content

The site is Next.js; each page exports `metadata` (title, description, canonical) and `app/sitemap.ts`
lists public URLs. Work like this:

1. Pick the pages that convert (stage pages, the testing and DSA roadmaps) and the searches they could
   win ("playwright annotations tutorial", "test.fixme vs test.skip", "cypress page object model",
   "big o notation for beginners"). Use real search phrases; check the page actually answers them.
2. Audit: title ≤ 60 chars with the main phrase first; description 140–160 chars that promises the
   outcome; one H1; descriptive internal links between related stages and lessons; page in the sitemap;
   `robots` not blocking public pages.
3. Propose the changes as a list with before → after. Make code changes only with the owner's OK,
   then typecheck and lint the files touched. UI changes go to Penpot first (design-first rule).
4. Content ideas: an article that answers one search fully and links to the hands-on stage. Outline it;
   the owner decides whether it becomes a blog post on the site.

## Email to learners (Resend)

- Only to people who signed up and can unsubscribe; never buy or scrape lists.
- Subject ≤ 50 characters, specific ("Stage 6 is live: annotate whole groups"); preview text adds the why.
- Body: 3 short paragraphs or fewer, one button to the page (`utm_source=email&utm_medium=email`).
- Create it as a **draft broadcast** in Resend and show the owner the text. Sending is their call,
  every single time; don't send, schedule or add contacts without an explicit yes.
- Suggested cadence: one email per meaningful launch, at most every two weeks.

## Content pack checklist (launch)

For one shipped feature, a full pack is:
- [ ] LinkedIn row (Draft → Ready when the image is live) + image
- [ ] X thread
- [ ] One community value post (+ which community and why)
- [ ] SEO check of the new page (title, description, internal links from related pages, sitemap)
- [ ] Email draft (if it's a launch worth an email)
- [ ] UTM links for each, with the same `utm_campaign`

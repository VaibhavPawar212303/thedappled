# Dappled project rules

## Design first, then UI

Always add or update the design in Penpot before changing the UI code.

1. Open the **thedappled** project in Penpot (team "theDappled"). Each page has its own file, named `NN - Page Name` (for example `04 - Dashboard`).
   **Exception — Testing:** every design for the Testing section (`app/(marketing)/testing/**`: roadmap, each stage, assignments, demo/practice pages, leaderboard, verification) lives in ONE file, **`26 - Testing Learning Path`**, with one Penpot page per stage or area (e.g. `Roadmap`, `Stage 3 – Page objects`, `Leaderboard`). Never create a separate file for a testing page or assignment; add a page or board to file 26 instead.
2. For a new page, create a new file there (or, for Testing, a new page/board in file 26). For a changed page, update its existing file.
3. Only after the design is in Penpot, make the matching change in the UI code (`app/`, `components/`).
4. In your reply, say which Penpot file you changed, then the code change.

Skip the Penpot step only if the user says so for that change.

## Git identity and pushing

Always commit and push as the GitHub profile **VaibhavPawar212303**, using the email set in this repo's local git config (`git config user.email`). Do not use the global identity (`vaibhav212303`) or any other GitHub account.

Before pushing, check `git config user.name` / `git config user.email` and `gh auth status` (the active account must be `VaibhavPawar212303`). If the author on a new commit is wrong, fix it before pushing.

## LinkedIn posts

Posts are rows in the Notion database **LinkedIn Insta Drafts**. The Make scenario **Notion to LinkedIn - Auto Post** runs daily at 7:00 PM IST and posts only the row with Status = Ready and Publish On = today (IST); a row whose day was missed never posts later and needs a new date. Full rules: the Notion page [LinkedIn Posting Rules](https://app.notion.com/p/422a425ec07381659f9bce19566ccb9f). Follow these when scheduling, writing, or making images for a post:

1. **Schedule:** weekdays only (prefer Tue–Thu, never Sat/Sun). Leave at least one day with no post between two posts. 3–4 posts a week. No two Ready rows on the same date.
2. **Text:** 1,300–2,000 characters. Hook in the first two lines (about 200 characters). Short paragraphs with blank lines between them. End with one question.
3. **Hashtags:** 3–5, at the end of the post.
4. **Links:** never in the post text. Put one link in the row's **First Comment** field; the post says "The link is in the first comment." The Make scenario posts that comment right after the post (LinkedIn API call) and sets **Comment Status** to Posted or Failed.
5. **Image:** every post has one. 1080 × 1350 px portrait PNG, under 5 MB, in the Thedappled dark card style. Save it as `public/social/linkedin/<slug>.png` and push to `main` so it is live at `https://thedappled.com/social/linkedin/<slug>.png`.
6. **Ready only when done:** set Status = Ready only after the text is final, the date follows rule 1, and the image URL loads in a browser. A broken image link makes the post fail.

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

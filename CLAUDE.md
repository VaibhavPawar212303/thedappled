# Dappled project rules

## Design first, then UI

Always add or update the design in Penpot before changing the UI code.

1. Open the **thedappled** project in Penpot (team "theDappled"). Each page has its own file, named `NN - Page Name` (for example `04 - Dashboard`).
2. For a new page, create a new file there. For a changed page, update its existing file.
3. Only after the design is in Penpot, make the matching change in the UI code (`app/`, `components/`).
4. In your reply, say which Penpot file you changed, then the code change.

Skip the Penpot step only if the user says so for that change.

## Git identity and pushing

Always commit and push as the GitHub profile **VaibhavPawar212303**, using the email set in this repo's local git config (`git config user.email`). Do not use the global identity (`vaibhav212303`) or any other GitHub account.

Before pushing, check `git config user.name` / `git config user.email` and `gh auth status` (the active account must be `VaibhavPawar212303`). If the author on a new commit is wrong, fix it before pushing.

# Lead Book

A client planner for an inspection business, modeled on the Area Book Planner.

- **Dashboard** — what needs attention today (overdue follow-ups and tasks), tasks & reminders, the next 7 days, wins (yours and Claude's), weekly goals, and sticky notes.
- **Clients** — every client with a colored dot for where they are:
  yellow = initial connection · green = service scheduled · blue = service completed · light blue = recurring.
  A red dot means something is due. Tap a client to edit their info, move them along the 4-step progress bar, keep notes, and log texts, calls, visits, emails, quotes and services. Old clients live in the Archive and can be reactivated.
- **History** — the repo's commit log: every save from the app (with which device) and every change Claude makes. Tap an entry to see the details and files changed.
- **Settings** — theme (auto by time, light or dark), your name and business, the GitHub token, import/export, and a button to remove the example data.

## How saving works

Edits save to your device the moment you make them, and a yellow **Save changes** bar appears. Tap it to commit everything to `data/leadbook.json` in this repo in one go, with a summary of what changed. Until then, your edits stay on the device even if you close the app. If two devices change different things, both are kept; if they change the same thing, the newer edit wins.

Saving needs a GitHub token, pasted once per device (Settings → Saving to GitHub):
github.com/settings/personal-access-tokens/new → Only select repositories → **DataBase** → Contents: **Read and write**.

Viewing works without a token.

> This repo is public, so anything in `data/leadbook.json` is visible to anyone with the link.

## Setup

1. Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)`. The site will be at `https://jacobrichardwills.github.io/DataBase/`.
2. Open it, go to Settings, paste your token.
3. Android: open in Chrome → ⋮ → *Install app*.

## For Claude

Data lives in `data/leadbook.json` (`clients`, `tasks` with `kind: task|note`, `wins`, `goals`). When adding entries, set `by: "claude"` on wins and activities, give every item an `id` and ISO `updatedAt`, and write a commit message whose first line says what changed (bullets below it show as details in History).

## Icons

Logo options are in `logos/` (preview at `/logos/`). Current: C, the inspection tag. To switch: `node tools/build-icons.js <name>` (needs `sharp`), then commit `icons/`.

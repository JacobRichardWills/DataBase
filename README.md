# Lead Book

A contact planner for an inspection business, modeled on the Area Book Planner: people, statuses, follow-up dates, a history log for each contact, and weekly key indicators.

- **Today** — overdue and due follow-ups, people who still need a first contact, and the next 7 days.
- **People** — search, filter by status, and open anyone to call, text, email, log what happened, or change their status.
- **Week** — key indicators against your goals (new contacts, outreach, inspections booked, new clients) and the follow-up plan by day.
- **Settings** — light/dark (automatic by time of day, or fixed), weekly goals, GitHub sync, CSV/JSON import and export.

## Where the data lives

This repo is public, so it holds only the app. Contacts are saved to `contacts.json` in a **private** repo (default `JacobRichardWills/DataBase-data`) through the GitHub API, using a token you paste into Settings on each device. Each device also keeps a copy so it works offline and syncs when back online. Edits from different devices are merged per contact.

## Setup

1. **Turn on GitHub Pages** for this repo: Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)`. The site will be at `https://jacobrichardwills.github.io/DataBase/`.
2. **Create the private data repo**: github.com/new → name `DataBase-data` → Private → Create (empty is fine).
3. **Create a token**: github.com/settings/personal-access-tokens/new → Repository access: *Only select repositories* → `DataBase-data` → Permissions → Contents: *Read and write* → Generate. Pick an expiration you're comfortable renewing.
4. Open the site → Settings → Sync with GitHub → paste the token → **Save & sync**. Repeat step 4 on your phone.

## Install on Android

Open the site in Chrome → ⋮ → *Add to Home screen* / *Install app*.

## Changing the icon

Logo options are in `logos/` (preview at `/logos/`). To switch: `node tools/build-icons.js c-inspection-tag` (needs `sharp`), then commit the `icons/` folder.

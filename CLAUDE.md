@AGENTS.md
@README.md

# Working in this repo

The owner is still learning, so keep changes easy to follow:

- Explain what you changed and why in plain language, and point to the files.
- Match the existing layout: page files in `app/` only arrange sections; the UI lives in `components/<page>/`; logic and data live in `lib/`.
- Start every new file with a one-line comment saying what it does (after `'use client'` if the file has it).
- Use the brand colour classes from `tailwind.config.js` (`bg-brand-yellow`, `text-brand-green`, …), not hex codes.
- Follow the "Rules that keep things safe" in README.md: prices come only from `lib/menu-data.ts`, server-only `lib/` files are never imported into `'use client'` files, and staff API routes always check the session first.
- Run `npm run lint` after changes.

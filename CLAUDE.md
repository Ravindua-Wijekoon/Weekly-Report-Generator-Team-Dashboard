# Weekly Report Generator & Team Dashboard

Full-stack MERN app (React/Vite + Express + MongoDB/Mongoose). Team members submit weekly reports, managers review/approve or send back for correction, with a team dashboard for analytics. See the plan file for full architecture details if needed.

Stack: React (Vite, plain JS, no TypeScript), Tailwind CSS, Recharts, TanStack React Query, Express, Mongoose, hand-rolled JWT (httpOnly cookie) + bcrypt auth. AI chat assistant is deferred, not in scope for now.

## Workflow

This project is built incrementally, one task/feature at a time, not all at once. Work should be split into realistic, self-contained chunks (roughly matching the phases in the plan: scaffolding, auth, report CRUD, review workflow, dashboard, user management, seed data and tests).

Do not run `git commit` or `git push` unless the user explicitly asks for that specific commit. The user commits and pushes manually after reviewing each finished task. Finish a task, leave the working tree as-is, and tell the user it's ready to review/commit.

## Code style

Do not use the em dash character (-) anywhere in code, comments, commit messages, or written responses. Use a regular hyphen, a comma, or split into two sentences instead.

Do not use emojis or decorative icons in code (no emoji in console logs, comments, UI strings, commit messages). If a UI needs an icon, use a plain icon library component, not an emoji character.

## Styling

Keep styles centralized so the UI stays visually consistent as it grows:
- All Tailwind theme customization (colors, spacing, font sizes used across the app) lives in one place (`tailwind.config.js`), not redefined ad hoc in components.
- Shared visual primitives (buttons, status badges, cards, form fields, table styles) are built once as reusable components in `frontend/src/components/common/` and reused everywhere, rather than re-implementing similar-looking markup per page.
- Avoid one-off inline style overrides in individual pages; if a new style need comes up in more than one place, promote it to a shared component or a Tailwind theme token.

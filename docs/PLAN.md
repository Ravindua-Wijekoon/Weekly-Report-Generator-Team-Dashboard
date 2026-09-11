# Weekly Report Generator and Team Dashboard, Build Plan

## Context

This is a technical assignment: build a full-stack app where team members submit structured weekly reports and managers review/approve them, or send them back for correction, through a consolidated dashboard. Because the same solution will later be defended in a live coding round, every design choice below favors clarity and conventional patterns over cleverness, nothing "magic" that would be hard to explain or extend on the spot.

Locked in decisions:
- Stack: MERN, React (Vite, plain JS/JSX, no TypeScript) + Express + MongoDB/Mongoose, as two sibling folders (`/frontend`, `/backend`) in this one repo.
- Auth: hand rolled, bcrypt password hashing, JWT in an httpOnly cookie, Express middleware for RBAC. No third party auth library, so it is fully explainable.
- Styling: Tailwind CSS for fast, responsive, utility first styling, kept centralized (see project CLAUDE.md).
- Charts: Recharts.
- AI Chat Assistant: explicitly deferred, out of scope for this build entirely, revisit later if time allows.
- Deployment: local only is fine for this pass, not designed for now.

## Data Model (MongoDB / Mongoose)

Three collections: `User`, `Project`, `Report`.

- User: `name, email (unique), passwordHash (select:false), role: 'member'|'manager', isActive, projects[]`.
- Project: `name (unique), description, isActive` (soft delete only, reports reference it by id, never hard delete).
- Report, the core entity, one per `(owner, weekLabel)` (unique index):
  - Top level current fields for cheap dashboard queries: `owner, project, weekStart, weekEnd, weekLabel, content, currentVersionNumber, status ('draft'|'submitted'|'needs_correction'|'approved'), submittedAt, approvedAt, latestComment`.
  - `content` is the fixed shape shared by every user: `tasksCompleted[]` (name, priority, plannedPercent, actualPercent, status, timePlannedHours, timeSpentHours, output), `tasksPlannedNextWeek[]`, `blockers[]` (text plus `isKey` flag), `achievements[]` (text plus `isKey` flag), `hoursByType` (optional, by category), `notes` (optional).
  - Versioning: embed `versions: [{ versionNumber, content, savedAt, reviewedCommentIds }]` and `reviewComments: [{ action, comment, reviewer, targetVersionNumber, createdAt }]` directly on the `Report` document, not a separate collection. One report is naturally one lifecycle, version and comment counts are small and bounded, and this keeps the detail page a single `findById` with no joins. List and dashboard queries exclude `versions`/`reviewComments` via projection to stay light.
  - On resubmission after Needs Correction: snapshot the previously reviewed `content` into `versions` before overwriting it, increment `currentVersionNumber`. This is what makes the "past version list, viewable on demand, tagged to which comment reviewed it" requirement work.

## Backend (`/backend`)

Layered structure: `models/` then `services/` (business logic) then `controllers/` (thin, req/res only) then `routes/`, plus `middleware/` (`auth.js`, `rbac.js`, `validate.js`, `errorHandler.js`, `asyncHandler.js`) and `utils/isoWeek.js` for week range math.

Validation: Zod, via a `validate(schema)` middleware applied per route.

Key routes, all under `/api`:
- `auth`: register (role hardcoded to `member` server side, never client supplied), login, logout, me.
- `users` (manager only except `/me`): list, invite, deactivate, assign role, `GET /:id` and `/:id/stats` (also usable by the user themselves).
- `projects`: `GET` open to any authenticated user (needed for the report form dropdown), create/edit/delete manager only, delete is soft (`isActive:false`).
- `reports`, the RBAC sensitive core:
  - `GET /api/reports`, members forced server side to `owner=self` regardless of query params (never trust a client supplied `owner` override), managers see all. Supports `page/limit/sort` plus filters (`project, status, weekStart, weekEnd, owner`).
  - `GET /api/reports/:id`, 403 unless owner or manager.
  - `GET /api/reports/:id/versions`, past versions plus comments, each tagged with `targetVersionNumber`.
  - `POST /api/reports`, create draft (409 on duplicate owner and week).
  - `PATCH /api/reports/:id`, owner only, only while `draft`/`needs_correction`.
  - `POST /api/reports/:id/submit`, owner only, snapshots version per rules above.
  - `POST /api/reports/:id/review`, manager only, `{action: 'approve'|'request_changes', comment}`, route never reads a `content` field from the body at all, so a manager cannot rewrite report content even if they tried.
- `dashboard` (manager only, separate router since it is cross report aggregation, not single report CRUD): `summary`, `trend`, `status-by-member` (must include synthetic `not_started` for members with no report that week), `workload-by-project`, `hours-by-type`, `activity` (recent review actions feed), `section` (bonus: one section, e.g. blockers, across all members for a week).

Pagination convention, every list endpoint: `{ data: [...], meta: { page, limit, total, totalPages } }`.

## Frontend (`/frontend`, Vite plus React plus Tailwind)

State: `AuthContext` (small, global, infrequent changes: current user, role, login, logout) plus TanStack React Query for all server data (reports, projects, users, dashboard), giving caching, invalidation on mutation, loading and error states for free, no Redux needed. Form local state stays local (`useState`) per form.

Folder structure: `api/` (axios client plus per resource API modules), `context/AuthContext.jsx`, `hooks/`, `components/{layout,common,report,dashboard,project,user}/`, `pages/`, `routes/router.jsx`.

Pages, all 8 from the spec, to comfortably clear the "at least 7" bar:
1. `LoginPage` / `RegisterPage` (public)
2. `MyReportPage` (`/reports/me?week=`), create/edit current week's report, shows manager's comment banner when `needs_correction`
3. `ReportHistoryPage` (`/reports/history`), own reports by week, status filter, paginated
4. `ReportDetailPage` (`/reports/:id`), read only content plus status timeline plus `VersionHistoryPanel` plus `ReviewCommentThread`, plus a conditionally rendered `ReviewActionPanel` (manager, only when status is `submitted`), this same page serves as the "Manager Review page" requirement, avoiding a duplicate component while still being a distinct real feature
5. `TeamMemberProfilePage` (`/team/:userId`, manager), that member's full history and stats
6. `ProjectManagementPage` (`/projects`, manager), full page, list plus CRUD, not a modal
7. `UserManagementPage` (`/users`, manager), invite, deactivate, assign roles
8. `TeamDashboardPage` (`/dashboard`, manager), filters (week, member, project, status) plus summary cards plus Recharts (trend, status by member, workload by project, hours by type) plus activity feed plus bonus cross team section view

Route guarding: `ProtectedRoute` for manager only routes, `/reports/:id` access is enforced by the API (403 shown inline) since it depends on ownership, not just role.

## Seed Data (`backend/seed/seed.js`)

1 manager plus 5 members, 4 projects (soft deletable), last 6 weeks of reports per member with a deliberately weighted status mix: some `not_started`, `draft`, `submitted` concentrated in the current week for a live demo, `needs_correction` with at least 2 reports carried through two correction cycles so version history has real depth, and `approved` reports, some of which passed through a `request_changes` first, to show comment history is not always first try. Script drops and reseeds idempotently, gated to non production, and prints demo credentials to the console.

## Build Order (phased, each independently demoable)

0. Scaffolding, both apps init, health check, Vite dev proxy to `/api` so cookies work in dev.
1. Auth and RBAC skeleton, User model, register/login/logout/me, `requireAuth`/`requireRole` middleware, AuthContext plus Login/Register pages plus ProtectedRoute.
2. Projects plus Report CRUD (draft only), Project CRUD end to end, Report model, draft create/edit, MyReportPage plus ReportHistoryPage.
3. Review workflow plus version history, submit/approve/request changes plus version snapshotting, ReportDetailPage with review panel, version and comment history UI. Verify the full cycle: submit, request changes, edit and resubmit, approve, with version history correctly showing 2 versions.
4. Team Dashboard plus charts, all dashboard aggregation endpoints plus TeamDashboardPage plus TeamMemberProfilePage.
5. User management plus RBAC hardening, UserManagementPage, re audit every route for owner or role override attempts, confirm pagination everywhere.
6. Seed data plus tests plus polish, run seed.js, write RBAC tests, responsive/empty/error state pass, README.

Each phase should end with a manual click through in the browser confirming its slice works against the real API, and each finished task is left for the user to review and commit to git manually before the next one begins.

## RBAC Automated Tests (Jest plus Supertest, `backend/tests/`)

Using `mongodb-memory-server` for a hermetic run. `rbac.reports.test.js` is the primary file, covering, as concrete assertions, not just middleware unit tests: unauthenticated gets 401; owner can read own report; a different member gets 403 on someone else's report (read and write); a member hitting the manager only `/review` endpoint on their own report still gets 403; a member cannot widen `GET /api/reports?owner=<other>` to see another member's data (server ignores the override); a manager sees all reports; manager `request_changes`/`approve` transitions work and are rejected on invalid current status; a manager's attempt to smuggle a `content` field into the `/review` body is proven to have no effect; full resubmit cycle correctly produces a 2 entry version array tagged to the right comment. Lighter `rbac.projects.test.js` and `rbac.users.test.js` cover member forbidden CRUD on those resources.

## Verification

- Each phase ends with a manual click through in the browser confirming its slice works against the real API, not just unit tests.
- After phase 6: run `npm run seed`, log in as the manager, confirm the dashboard shows meaningful non empty charts and the "not yet started" status appears; log in as a member with a `needs_correction` report, confirm the comment is visible, edit, resubmit, and as manager approve it, then confirm `GET /api/reports/:id/versions` (via the UI's version panel) shows both versions.
- Run `npm test` in `/backend` and confirm all RBAC scenarios pass.

## Critical files to create first

- `backend/src/models/Report.js` (the schema everything else depends on)
- `backend/src/services/report.service.js` (versioning and status transition logic)
- `backend/src/middleware/rbac.js`
- `backend/src/routes/report.routes.js`
- `backend/seed/seed.js`
- `frontend/src/pages/ReportDetailPage.jsx`
- `backend/tests/rbac.reports.test.js`

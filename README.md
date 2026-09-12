# Weekly Report Generator and Team Dashboard

A full-stack MERN app where team members submit structured weekly reports through a review and correction workflow, and managers get a team-wide dashboard with analytics.

See [docs/PLAN.md](docs/PLAN.md) for the full architecture writeup (data model, API design, page structure, phased build order).

## Tech stack

- Frontend: React (Vite), Tailwind CSS, TanStack React Query, React Router, Recharts
- Backend: Node.js, Express, Mongoose
- Database: MongoDB
- Auth: hand rolled, bcrypt password hashing plus a JWT stored in an httpOnly cookie
- Testing: Jest, Supertest, mongodb-memory-server

## Prerequisites

- Node.js 18 or later (tested on Node 22) and npm
- MongoDB running locally, or a connection string to a remote instance (e.g. MongoDB Atlas)

## 1. Installing dependencies

From the project root:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## 2. Running the database

If you already have MongoDB running locally on the default port (27017), skip to the next step.

To install and run it locally on macOS with Homebrew:

```bash
brew install mongodb/brew/mongodb-community
brew services start mongodb-community
```

This starts MongoDB as a background service at `mongodb://127.0.0.1:27017`. No manual database or collection creation is needed, they are created automatically the first time the app writes to them.

## 3. Running the backend

Copy the example environment file and fill in a JWT secret:

```bash
cd backend
cp .env.example .env
```

Open `.env` and set `JWT_SECRET` to any long random string, for example:

```bash
openssl rand -hex 32
```

Then start the backend in dev mode (auto-restarts on file changes):

```bash
npm run dev
```

It listens on `http://localhost:4000` by default (configurable via `PORT` in `.env`). Verify it is up:

```bash
curl http://localhost:4000/api/health
```

### Seeding demo data

To populate the database with a full demo dataset (1 manager, 5 team members, 4 projects, and 6 weeks of reports covering every status, including multi-round correction cycles), run:

```bash
npm run seed
```

This deletes all existing users, projects, and reports first, so only run it against a database you are comfortable resetting. It prints all the login credentials it creates when it finishes. Passwords are `password123` for every seeded account.

### Running the automated tests

```bash
npm test
```

This runs the role-based access control test suite (Jest and Supertest) against an in-memory MongoDB instance, it does not touch your local database.

## 4. Running the frontend

In a separate terminal:

```bash
cd frontend
npm run dev
```

It starts on `http://localhost:5173` and proxies any request to `/api/*` through to the backend on port 4000, so no CORS configuration is needed in development.

Open `http://localhost:5173` in your browser, register a new account (always created as a team member), or log in with a seeded account if you ran the seed script.

## Project structure

```
backend/
  src/
    config/       environment loading and database connection
    models/       Mongoose schemas (User, Project, Report)
    validators/   Zod request validation schemas
    services/     business logic, no Express types
    controllers/  thin request/response handlers
    routes/       Express routers
    middleware/   auth, RBAC, validation, error handling
    utils/        week calculation helpers
  seed/           demo data seed script
  tests/          RBAC test suite

frontend/
  src/
    api/          axios wrappers per resource
    hooks/        React Query hooks per resource
    context/      auth context
    components/   shared and feature-specific components
    pages/        routed pages
    routes/       router configuration

docs/
  PLAN.md                 architecture and build plan
  postman/                Postman collection and environment for manual API testing
```

## Postman collection

A ready-to-import Postman collection and environment covering every endpoint (auth, projects, reports, dashboard, users) is available at `docs/postman/`.

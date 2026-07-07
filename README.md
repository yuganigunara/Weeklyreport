# Weekly Report Generator & Team Dashboard

A full-stack assignment project for structured weekly reporting, role-based team dashboards, project/category management, visual insights, and an optional AI-style assistant.

## Tech Stack

- React + Vite
- Express REST API
- MongoDB + Mongoose
- JWT auth in secure HTTP-only cookies
- Zod request validation
- Recharts for visual insights

## Setup

```bash
npm install
copy .env.example .env
npm run seed
npm run dev
```

The frontend runs on `http://localhost:5173` and the API on `http://localhost:5000`.

## Demo Accounts

After `npm run seed`:

- Manager: `manager@example.com` / `Password123!`
- Member: `maya@example.com` / `Password123!`
- Member: `liam@example.com` / `Password123!`

## Implemented Requirements

- Registration, login, logout, password hashing, session cookie auth
- Roles: `member`, `manager`, `admin`
- Member report page with fixed report fields
- Create, edit, submit, and view own report history
- Manager dashboard with week, member, project, and date filters
- Submission status tracking: submitted, pending, late
- Project/category CRUD, with optional member assignments
- Dashboard metrics and charts
- AI assistant panel using local report summaries by default

## AI Assistant Approach

The assistant endpoint is `POST /api/assistant/chat`. It gathers report context according to the user's role:

- Managers/admins can query team-wide report data.
- Members can query only their own reports.

By default, the assistant returns a deterministic summary from stored reports so the app works without an external LLM. If you add an LLM provider later, keep the same privacy boundary: retrieve only reports the authenticated user may access, redact sensitive notes if needed, and send the minimum context required for the requested summary.

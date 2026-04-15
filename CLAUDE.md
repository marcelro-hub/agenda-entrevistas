# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Agenda de Entrevistas** — A job interview scheduling application for FONPLATA. Interviewers define available slots; candidates book them. Prevents double-booking via DB constraints.

## Commands

```bash
npm run dev    # Development with nodemon hot reload
npm start      # Production server
```

Environment: copy `.env.example` to `.env` and set `DATABASE_URL` (PostgreSQL connection string).

Database setup: run `database/schema.sql` then optionally `database/seed.sql`.

## Architecture

**Backend** (`server/index.js`): Express server on port 3000 (or `$PORT`). Two REST resource groups:
- `/api/interviewers` — CRUD for interviewer profiles and their availability slots
- `/api/bookings` — Candidate reservations; race condition safety via `UNIQUE(slot_id)` DB constraint

Health check at `/api/health` (used by Railway deployment).

**Database** (`database/schema.sql`): Three tables — `interviewers`, `slots` (date + time per interviewer), `bookings` (one booking per slot, enforced by unique constraint). PostgreSQL hosted on Railway.

**Frontend** (`index.html`): Standalone React 18 app loaded via Babel in-browser transpiler. No build step — edit HTML directly. Features:
- Calendar view of interviewer availability
- ICS file generation for candidates' calendar apps
- Microsoft Teams meeting link storage

**Deployment**: Railway via nixpacks. Config in `railway.toml`. CORS allows GitHub Pages origin + localhost.

## Key Conventions

- Interview duration is hardcoded as `DURATION_MIN = 60` in the frontend.
- Slot booking conflicts surface as a unique constraint violation from PostgreSQL — handle the `23505` error code on the backend to return a user-friendly conflict response.
- Frontend state is managed with React hooks only (no Redux/context); all data fetched directly from the API.

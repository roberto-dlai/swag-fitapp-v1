# FitCheck — Current State Reference

## Overview

FitCheck is a fitness workout logging application used as a teaching vehicle for a 5-module course on building software with AI coding assistants. Users manually log workouts (type, date, duration, location), view recent workout history, check current weather, and post community reviews.

---

## Architecture

- **Frontend**: Vanilla HTML/CSS/JavaScript (no framework, no build tools)
- **Backend**: Node.js + Express
- **Databases**: PostgreSQL (users, workouts) + MongoDB via native driver (reviews)
- **Auth**: JWT (24h expiry) + bcrypt password hashing
- **Weather**: OpenWeatherMap API (display only, not used for recommendations)
- **Testing**: Node.js built-in test runner (`node:test` + `node:assert`)
- **Deployment**: Docker + docker-compose + GitHub Actions CI/CD

---

## Project Structure

```
SWAG/
├── package.json, .gitignore, .env.example, .dockerignore
├── Dockerfile, docker-compose.yml, README.md
├── .github/workflows/ci-cd.yml
├── scripts/migrate.js, seed.js
├── src/
│   ├── server.js, app.js
│   ├── config/  (index.js, db.js, mongo.js)
│   ├── middleware/  (auth, authorize, userPreferences, rateLimiter, errorHandler)
│   ├── routes/  (auth, user, workout, weather, review)
│   ├── controllers/  (auth, user, workout, weather, review)
│   ├── services/  (auth, weather)
│   ├── models/  (user, workout, review)
│   ├── migrations/  (001–009 .sql files)
│   └── utils/  (constants, validators)
├── public/
│   ├── index.html (login/signup), dashboard.html
│   ├── css/styles.css
│   └── js/  (api, app, auth, dashboard, notifications, reviewSection, utils, weatherWidget, workoutCards)
└── tests/
    ├── helpers/  (setup.js, http.js)
    ├── unit/  (weather.service.test.js)
    └── integration/  (auth, workout.routes, middleware, review.routes)
```

---

## Database Schema

### PostgreSQL

**users** (7 columns)
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| email | VARCHAR(255) UNIQUE NOT NULL | |
| password_hash | VARCHAR(255) NOT NULL | bcrypt |
| name | VARCHAR(100) NOT NULL | |
| location | VARCHAR(100) | default 'New York' |
| unit_pref | VARCHAR(10) | 'imperial' or 'metric' |
| created_at | TIMESTAMP | |

**workouts** (7 columns)
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| user_id | INT FK → users(id) | |
| date | DATE NOT NULL | future dates rejected |
| type | VARCHAR(50) | cardio, strength, or endurance |
| duration_min | INT | 30, 60, 90, 120, or 150 |
| location | VARCHAR(100) | city name |
| created_at | TIMESTAMP | |

Indexes: `idx_workouts_user_id`, `idx_workouts_date`, `idx_workouts_user_date` (composite)

**schema_migrations** — tracks which .sql files have been applied

### MongoDB

**reviews** collection — documents with: `userId`, `userName`, `rating` (1–5), `title`, `body`, `createdAt`. Index on `userId`.

---

## API Endpoints (12 routes)

| Method | Path | Auth | Description |
|---|---|:---:|---|
| POST | /api/auth/signup | No | Create account (rate limited) |
| POST | /api/auth/login | No | Login, returns JWT (rate limited) |
| GET | /api/users/me | Yes | Current user profile |
| PATCH | /api/users/me | Yes | Update location or unit_pref |
| GET | /api/workouts/history | Yes | User's workout history |
| POST | /api/workouts | Yes | Log a workout (upsert by date) |
| PATCH | /api/workouts/:id | Yes | Update workout (authorized) |
| DELETE | /api/workouts/:id | Yes | Delete workout (authorized) |
| GET | /api/weather | Yes | Current weather for user's city |
| GET | /api/reviews | Yes | Community reviews (paginated) |
| POST | /api/reviews | Yes | Post a review |
| GET | /api/health | No | Health check |

---

## Middleware Pipeline (order in app.js)

1. `morgan('dev')` — request logging
2. `express.json({ limit: '1mb' })` — body parsing
3. `express.static('public')` — serve frontend
4. `cors({ origin })` — configured CORS
5. `/api/health` — health check (no auth)
6. `/api/auth/*` — auth routes (rate limited, no auth)
7. `auth` — JWT verification for all routes below
8. `userPreferences` — loads user prefs onto `req.userPrefs`
9. Route handlers (users, weather, workouts, reviews)
10. `errorHandler` — global catch-all

---

## Frontend

**Login page** (`index.html`): Login/signup forms, JWT stored in localStorage

**Dashboard** (`dashboard.html`): 6 cards in a 3-column grid
1. **New Workout** — Type (cardio/strength/endurance), Date (max=today), Duration (0.5–2.5 hrs), Location (6 cities), Add Workout button
2. **Weather** — Current temperature, condition, humidity from OpenWeatherMap
3. **Total Workouts** — Count of all workouts for the user
4. **Recent Workouts** (full-width) — Last 7 workouts with day, date, name, type badge, duration, city, delete button
5. **Preferences** — Unit toggle (°F/°C), Save button
6. **Community Reviews** — Review cards with author, stars, date, title, body + write review form

---

## Running the App

```bash
# Start all services
docker compose up -d --build

# Run migrations (with tracking — only unapplied migrations run)
docker compose exec app node scripts/migrate.js

# Seed sample data (destructive — clears existing data first)
docker compose exec app node scripts/seed.js

# Open in browser
open http://localhost:8080

# Sample accounts: alice@example.com / password123, bob@example.com / password123
```

---

## Running Tests (32 total: 4 unit + 28 integration)

```bash
# In Docker
docker compose exec app sh -c 'node --test tests/unit'
docker compose exec app sh -c 'node --test --test-concurrency=1 tests/integration'

# Or via npm (requires local node_modules)
npm test
```

Coverage: 90% line, 78% branch, 94% function.

---

## Bug Branches (Phase 8 — not yet implemented)

| Branch | Module | Status |
|---|---|---|
| module-1/buggy | Environment/Git | Ready to implement |
| module-2/buggy | Frontend | Needs redesign (references changed UI) |
| module-3/buggy | Backend/APIs | Needs redesign (deleted services) |
| module-4/buggy | Database/Security | Partially feasible |
| module-5/buggy | Testing/Deployment | Partially feasible |

Bug scenarios must be redesigned to match the current simplified app before creating branches. See course-syllabus.md for updated bug descriptions.

# FitCheck Application Build Plan

## Context

The course syllabus describes **FitCheck** -- a fitness planning app used as a teaching vehicle across 5 modules. Each module introduces theory then gives students a **buggy version** to debug with AI assistants. We need to build the fully working app, then create buggy branches for each module.

---

## Architecture Overview

- **Frontend**: Vanilla HTML/CSS/JavaScript (no framework, no build tools -- students see exact files in DevTools)
- **Backend**: Node.js + Express (MVC pattern)
- **Databases**: PostgreSQL (users, workouts, exercises) + MongoDB via native driver (reviews)
- **Auth**: JWT (with expiry) + bcrypt, stored in localStorage (acceptable for teaching context)
- **Weather**: OpenWeatherMap API integration
- **Testing**: Node.js built-in test runner (`node:test` + `node:assert`), services use dependency injection for testability
- **No ORMs**: Both PG (`pg` pool) and MongoDB (`mongodb` native driver) use parameterized queries -- no Mongoose, no Sequelize
- **Deployment**: Docker + docker-compose + GitHub Actions CI/CD

---

## Project Structure

```
SWAG/
├── package.json, .gitignore, .env.example, .dockerignore
├── Dockerfile, docker-compose.yml
├── README.md
├── .github/workflows/ci-cd.yml
├── scripts/seed.js
├── src/
│   ├── server.js                    # Entry: listens on PORT
│   ├── app.js                       # Express setup, middleware pipeline
│   ├── config/  (index.js, db.js, mongo.js)
│   ├── middleware/  (auth, authorize, userPreferences, rateLimiter, errorHandler)
│   ├── routes/  (auth, user, workout, weather, review)
│   ├── controllers/  (auth, user, workout, weather, review)
│   ├── services/  (auth, workout, weather, calorie)
│   ├── models/  (user, workout, exercise -- PG; review -- native MongoDB)
│   ├── migrations/  (001-005 .sql files)
│   └── utils/  (unitConversion, constants, validators)
│── tests/
│   ├── helpers/  (setup.js -- test DB connection, teardown, seed)
│   ├── unit/  (calorie, unitConversion, workout, weather)
│   └── integration/  (auth, workout routes, middleware)
├── public/
│   ├── index.html (login/signup), dashboard.html
│   ├── css/styles.css
│   └── js/  (app, api, auth, dashboard, weatherWidget, workoutCards, reviewSection, notifications)
```

---

## Database Schemas

### PostgreSQL
- **users**: id, email, password_hash, name, location, unit_pref, fitness_goal, fitness_level, equipment[], weekly_frequency, account_tier, created_at
- **exercises**: id, name, category, muscle_group, location (indoor/outdoor/both), difficulty, equipment, calories_per_min, description
- **workouts**: id, user_id (FK, indexed), date (indexed), type, status (planned/in_progress/completed/skipped), duration_min, calories_burned (migration 005), notes, weather_temp, weather_cond, created_at
- **workout_exercises**: id, workout_id (FK, indexed), exercise_id (FK), sets, reps, duration_min, order_index

### MongoDB
- **reviews**: userId (indexed), userName, workoutId (indexed), rating (1-5), title, body, tags[], tips[], createdAt

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| POST | /api/auth/signup | No | Create account (rate limited) |
| POST | /api/auth/login | No | Login, returns JWT with expiry (rate limited) |
| GET | /api/users/me | Yes | Current user profile |
| PATCH | /api/users/me | Yes | Update preferences (validated) |
| GET | /api/workouts/today | Yes | Today's recommended workout (includes hydration reminders) |
| GET | /api/workouts/plan | Yes | 7-day plan |
| PATCH | /api/workouts/today | Yes | Customize/swap today's workout |
| GET | /api/workouts/history | Yes | User's workout history (authorized: own data only) |
| POST | /api/workouts | Yes | Log/save a workout (enforces tier limits, validated) |
| PATCH | /api/workouts/:id | Yes | Update workout (authorized: own data only) |
| DELETE | /api/workouts/:id | Yes | Delete workout (authorized: own data only) |
| GET | /api/weather | Yes | Current weather |
| GET | /api/weather/forecast | Yes | 7-day forecast |
| GET | /api/reviews | Yes | Community reviews |
| POST | /api/reviews | Yes | Create review (validated: rating 1-5, body required) |
| GET | /api/health | No | Health check |

---

## Middleware Pipeline (order in app.js)

1. `morgan` -- request logging
2. `express.json({ limit: '1mb' })` -- parse bodies (size-limited to prevent payload DoS)
3. `express.static('public')` -- serve frontend
4. `cors({ origin: config.CORS_ORIGIN })` -- configured CORS (not wildcard)
5. `rateLimiter` -- on /api/auth routes (express-rate-limit)
6. `auth` -- JWT verification (skip /api/auth, /api/health)
7. `userPreferences` -- load user prefs from DB, attach to req
8. Route handlers (with `authorize` on resource-specific routes)
9. `errorHandler` -- global catch-all (last)

---

## Implementation Checklist

### Phase 1: Foundation
- [x] 1. package.json with dependencies (express, pg, mongodb, bcrypt, jsonwebtoken, axios, dotenv, cors, morgan, winston, express-rate-limit) + `"test": "node --test 'tests/**/*.test.js'"`
- [x] 2. .gitignore, .env.example (DATABASE_URL, MONGODB_URI, JWT_SECRET, WEATHER_API_KEY, CORS_ORIGIN, PORT), .dockerignore
- [x] 3. src/config/index.js (env loading with validation -- JWT_SECRET must be >= 32 chars), src/config/db.js (PG pool), src/config/mongo.js (MongoDB client)
- [x] 4. src/server.js (entry point, listens on PORT)
- [x] 5. src/app.js (Express setup, middleware pipeline skeleton with errorHandler stub)
- [x] 6. SQL migrations 001-005 (with indexes on user_id, date, workout_id); all queries use parameterized statements ($1, $2) to prevent SQL injection
- [x] 7. scripts/seed.js (seed both PG exercises catalog + sample users, and MongoDB sample reviews)
- [x] 8. src/utils/unitConversion.js (F<->C, lbs<->kg)
- [x] 9. src/utils/constants.js (tier limits: free=3 saved plans, temperature threshold: 95F, etc.)
- [x] 10. src/utils/validators.js (input validation helpers: email format, password length, rating range, positive numbers)

### Phase 2: Auth & Users
- [x] 11. src/services/auth.service.js (bcrypt hashing, JWT creation with 24h expiry, JWT verification)
- [x] 12. src/middleware/auth.js (JWT verification middleware)
- [x] 13. src/middleware/rateLimiter.js (express-rate-limit on auth routes)
- [x] 14. src/models/user.model.js (PG parameterized queries for users table)
- [x] 15. src/controllers/auth.controller.js + src/routes/auth.routes.js (with input validation)
- [x] 16. src/controllers/user.controller.js + src/routes/user.routes.js (with input validation)

### Phase 3: Core Business Logic
- [x] 17. src/services/weather.service.js (OpenWeatherMap API call via injected HTTP client + graceful fallback on failure, returns default weather)
- [x] 18. src/services/calorie.service.js (calorie calculation with kg/lbs unit handling, guards against NaN/negative/zero)
- [x] 19. src/services/workout.service.js (workout generation: uses weather, user prefs, fitness level, equipment; indoor threshold at 95F; hydration reminders when >85F; enforces tier limits on saved plans)
- [x] 20. src/middleware/userPreferences.js (load user prefs from DB, attach to req.userPrefs)
- [x] 21. src/middleware/authorize.js (resource ownership check -- applied to /history, PATCH/:id, DELETE/:id)
- [x] 22. src/middleware/errorHandler.js (global error handler: user-friendly messages + detailed winston logs)
- [x] 23. src/models/exercise.model.js (PG parameterized queries for exercises table)
- [x] 24. src/models/workout.model.js (PG parameterized queries for workouts + workout_exercises tables)
- [x] 25. src/controllers/weather.controller.js + src/routes/weather.routes.js
- [x] 26. src/controllers/workout.controller.js + src/routes/workout.routes.js (includes customize/swap, authorize on resource endpoints)
- [x] 27. Wire all middleware and routes into src/app.js in correct order

### Phase 4: Reviews (MongoDB)
- [x] 28. src/models/review.model.js (native MongoDB driver -- thin wrapper around collection queries, with indexes on userId/workoutId; sanitize query inputs to prevent MongoDB operator injection -- only accept primitive values, reject objects with $ operators)
- [x] 29. src/controllers/review.controller.js + src/routes/review.routes.js (with input validation: rating 1-5, body required)

### Phase 5: Frontend
- [x] 30. public/index.html (login/signup page, semantic HTML, proper form elements, aria-labels)
- [x] 31. public/js/auth.js (login/signup form handling, JWT storage, validation feedback)
- [x] 32. public/css/styles.css (full responsive stylesheet: @media at 768px cards 2-col, 480px 1-col stack; focus indicators for keyboard nav; sufficient color contrast)
- [x] 33. public/dashboard.html (dashboard shell: semantic HTML, `<button>` for Start Workout, proper heading hierarchy, aria-labels on interactive elements; sections for: weather widget, today's workout with Start button, 7-day plan cards, profile/preferences edit form, community reviews, streak badge display)
- [x] 34. public/js/app.js (client-side routing, auth state, logout button handler)
- [x] 35. public/js/api.js (fetch wrapper with JWT header, 401 redirect, returns structured errors; all DOM rendering uses textContent/createElement, never innerHTML with user data -- prevents XSS)
- [x] 36. public/js/notifications.js (toast system: positioned top-right, auto-dismiss after 4s, types: success/error/info; used for workout saved, review posted, preference updated, errors)
- [x] 37. public/js/dashboard.js (orchestrates dashboard: fetches profile + today's workout + plan; shows loading/error/empty states for each section; workout customize flow; Start Workout button: PATCH /api/workouts/:id with status='in_progress', then shows timer/completion UI; profile editing form that PATCHes /api/users/me; streak badge display based on consecutive completed workout days)
- [x] 38. public/js/weatherWidget.js (fetches /api/weather, displays temp/condition + hydration reminder tip when >85F; handles loading, error, and fallback states)
- [x] 39. public/js/workoutCards.js (fetches /api/workouts/plan, renders 7-day cards in responsive CSS Grid; each card shows day/type/duration/indoor-outdoor badge; loading + empty states)
- [x] 40. public/js/reviewSection.js (fetches /api/reviews, renders review cards with star ratings + write review form; loading + empty states; all user-generated content rendered via textContent, never innerHTML)

### Phase 6: Testing (node:test + node:assert)
- [x] 41. tests/helpers/setup.js (test DB connection using TEST_DATABASE_URL env var, migration runner, seed data, teardown -- each test file wraps in transaction that rolls back for isolation; before/after hooks per describe block)
- [x] 42. tests/unit/calorie.service.test.js (normal lbs case, kg input, zero weight, negative duration, undefined inputs -> NaN guard, boundary at exactly 0)
- [x] 43. tests/unit/unitConversion.test.js (F<->C: 32F=0C, 212F=100C, boundary 95F=35C; lbs<->kg: 0, negative, typical values)
- [x] 44. tests/unit/workout.service.test.js (indoor when >95F, outdoor when 72F, exactly 95F boundary, hydration when >85F, beginner vs advanced plans, equipment filtering, tier limit enforcement; uses dependency injection for weather service mock)
- [x] 45. tests/unit/weather.service.test.js (success response parsing, API failure returns fallback default, unit conversion in response; uses injected HTTP client mock)
- [x] 46. tests/integration/auth.test.js (signup returns 201 + JWT, login returns 200 + JWT, wrong password returns 401, expired JWT returns 401 on protected route, duplicate email returns 409)
- [x] 47. tests/integration/workout.routes.test.js (GET /history returns own data only, GET /history?userId=other returns 403, PATCH/:id on other user's workout returns 403, POST respects tier limit -- 4th plan on free tier returns 403, preference-based generation returns matching exercises)
- [x] 48. tests/integration/middleware.test.js (request to /api/workouts/today has req.userPrefs populated -- verified by checking response uses user's unit_pref; request to nonexistent route returns 404 JSON not HTML; thrown error in controller returns 500 with user-friendly message not stack trace)

### Phase 7: Docker & CI/CD
- [x] 49. Dockerfile (Node 20 alpine, NODE_ENV=production, HEALTHCHECK instruction)
- [x] 50. docker-compose.yml (app + postgres + mongo, port mapping 8080:3000, depends_on with healthchecks, proper env vars)
- [x] 51. .github/workflows/ci-cd.yml (test job with PG+Mongo services; env: TEST_DATABASE_URL=postgresql://fitcheck:fitcheck@localhost:5432/fitcheck_test, MONGODB_URI=mongodb://localhost:27017/fitcheck_test, JWT_SECRET=test-secret-minimum-32-characters-long, WEATHER_API_KEY=test-key; run migrations before tests; build-and-deploy job)
- [x] 52. README.md (setup instructions, env vars, running locally, running with Docker)

### Phase 8: Bug Branches
- [ ] 53. module-1/buggy: Remove node_modules from .gitignore; branch behind main on dashboard title; student config change task
- [ ] 54. module-2/buggy: Remove responsive @media (cards overlap); never-resolving weatherWidget fetch; swap `<button>` for styled `<div>` (a11y failure)
- [ ] 55. module-3/buggy: Hardcode units=imperial in weather controller; swap middleware order in app.js; remove try/catch on temp threshold; remove weather API catch block
- [ ] 56. module-4/buggy: Skip migration 005; wrong column name in workout model; remove authorize from /history; plain text passwords; hardcoded API key
- [ ] 57. module-5/buggy: Missing kg conversion in calorie service; threshold 35C vs F mismatch; localhost DATABASE_URL; comment out test step in CI; port 8080:8080 mismatch. **Note**: Remove test files from this branch so students write tests themselves as part of the exercise

---

## Bug Branch Details

Build everything on `main` first. Then branch off for each module's bugs:

### module-1/buggy (Environment/Git)
- Remove `node_modules` from `.gitignore`
- Branch is 1 commit behind main on dashboard title change
- Student updates APP_NAME in config, stages, commits

### module-2/buggy (Frontend)
- **styles.css**: Remove responsive @media query for workout cards (cards overlap on resize)
- **weatherWidget.js**: Replace fetch with never-resolving promise (stuck "Loading...")
- **dashboard.html**: Change `<button id="start-workout">` to `<div>` with button styling (looks clickable, isn't -- also an a11y failure: no keyboard access, no role)

### module-3/buggy (Backend/APIs)
- **weather.controller.js**: Hardcode `units=imperial` instead of reading user prefs
- **app.js**: Move userPreferences middleware AFTER workout routes
- **workout.service.js**: Remove try/catch on temperature threshold check (crash >95F)
- **weather.service.js**: Remove catch block on API call (no graceful fallback)

### module-4/buggy (Database/Security)
- **migrations/**: Skip migration 005 (calories_burned column missing, shows 0)
- **workout.model.js**: Reference `workout_notes` column when actual column is `notes`
- **workout.routes.js**: Remove authorize middleware from /history AND PATCH/:id AND DELETE/:id, accept ?userId= without ownership check
- **auth.service.js**: Store password as plain text (skip bcrypt.hash)
- **weather.service.js**: Replace `process.env.WEATHER_API_KEY` with literal string

### module-5/buggy (Testing/Deployment)
- **calorie.service.js**: Missing kg-to-lbs conversion (NaN for metric users)
- **workout.service.js**: Change threshold from 95 (F) to 35 (C) but API still returns F
- **.env**: DATABASE_URL points to localhost
- **ci-cd.yml**: Comment out `npm test` step
- **docker-compose.yml**: Map 8080:8080 instead of 8080:3000 (port mismatch)
- **Remove test files** so students write tests as part of the exercise

---

## Key Design Decisions

- **Dependency injection in services**: Services accept their dependencies (DB pool, HTTP client) as constructor/function parameters. This makes unit testing trivial -- inject mocks without module-level patching. Avoids `node:test` limitations with module mocking.
- **Parameterized SQL queries everywhere**: All PG queries use `$1, $2` placeholders, never string concatenation. Prevents SQL injection (OWASP Top 10) and teaches secure-by-default patterns.
- **CORS configured, not wildcard**: `cors({ origin: config.CORS_ORIGIN })` in the working version. Teaches proper CORS. Students can see the difference vs. the permissive default.
- **Rate limiting on auth routes**: Prevents brute-force attacks on login/signup. Simple `express-rate-limit` middleware.
- **authorize middleware on all resource-specific routes**: Not just /history -- also PATCH/:id and DELETE/:id. The Module 4 bug removes it from all three.
- **Test helper with DB lifecycle**: `tests/helpers/setup.js` handles creating test DB, running migrations, seeding, and teardown. Integration tests wrap each test in a transaction that rolls back for isolation. Unit tests use injected mocks only.
- **XSS prevention in frontend**: All user-generated content rendered via `textContent` or `createElement`, never `innerHTML` with untrusted data. This prevents stored XSS from review content.
- **MongoDB query sanitization**: Review model rejects query inputs that are objects (prevents `$gt`/`$ne` operator injection). Only primitive values accepted for query parameters.
- **Streak badges computed, not stored**: Workout streak count is derived from consecutive completed workout dates in the workouts table, not stored as a separate field. Calculated on dashboard load via a SQL query.

---

## Verification Plan

- [ ] 1. **Local dev**: `npm install && npm start` -- app runs on localhost:3000, login/signup works, dashboard loads
- [ ] 2. **Database**: Seed data appears; CRUD operations work; migrations apply cleanly with indexes
- [ ] 3. **Auth flow**: Sign up -> login -> JWT in localStorage -> protected routes work -> logout clears token -> JWT expires after 24h
- [ ] 4. **Security**: Rate limiting blocks rapid login attempts; CORS rejects unknown origins; authorize prevents accessing other users' data; passwords are hashed in DB
- [ ] 5. **Weather**: Widget displays real data from OpenWeatherMap; falls back gracefully if API is down
- [ ] 6. **Workouts**: Generated plans respect user preferences (fitness level, indoor/outdoor based on weather, equipment); hydration reminders appear when hot; account tier limits enforced
- [ ] 7. **Workout customization**: User can swap today's workout type via PATCH /api/workouts/today
- [ ] 8. **Reviews**: Create/read reviews in MongoDB; appear in community section
- [ ] 9. **Responsive**: Dashboard layout adapts at 768px (2-col cards) and 480px (1-col stacked)
- [ ] 10. **Accessibility**: All interactive elements keyboard-accessible, proper semantic HTML, focus indicators visible
- [ ] 11. **Tests**: `npm test` -- all unit + integration tests pass; tests cover edge cases (NaN, boundary at 95F, zero weight)
- [ ] 12. **Docker**: `docker-compose up` -- all 3 services start, app accessible at localhost:8080
- [ ] 13. **Bug branches**: Check out each module branch, verify bugs are present and reproducible

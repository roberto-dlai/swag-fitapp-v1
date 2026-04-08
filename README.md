# FitCheck

A fitness planning application that helps users build personalized workout routines based on weather conditions, fitness goals, and personal preferences.

## Features

- Personalized workout generation based on fitness level, goals, and equipment
- Weather-aware recommendations (indoor workouts during extreme heat/rain, hydration reminders)
- 7-day workout plans with rest day scheduling
- User authentication with JWT
- Community workout reviews and ratings
- Account tiers (free: 3 saved plans, premium: unlimited)
- Workout streak tracking
- Responsive dashboard UI

## Tech Stack

- **Backend:** Node.js, Express
- **Databases:** PostgreSQL (users, workouts, exercises), MongoDB (reviews)
- **Auth:** JWT + bcrypt
- **Weather:** OpenWeatherMap API
- **Testing:** Node.js built-in test runner (`node:test`)
- **Deployment:** Docker, docker-compose, GitHub Actions CI/CD

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose
- (Optional) [Node.js 20+](https://nodejs.org/) for local development without Docker

### Run with Docker (recommended)

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd SWAG
   ```

2. (Optional) Set your OpenWeatherMap API key:
   ```bash
   export WEATHER_API_KEY=your-key-here
   ```
   Without this, weather data will use sensible defaults.

3. Start all services:
   ```bash
   docker compose up -d --build
   ```

4. Run database migrations:
   ```bash
   docker compose exec app node scripts/migrate.js
   ```

5. Seed sample data:
   ```bash
   docker compose exec app node scripts/seed.js
   ```

6. Open the app at **http://localhost:8080**

   Sample accounts (seeded):
   - `alice@example.com` / `password123` (beginner, free tier)
   - `bob@example.com` / `password123` (advanced, premium tier)

### Run Locally (without Docker)

1. Install PostgreSQL and MongoDB, and ensure they are running.

2. Copy the environment file and edit it:
   ```bash
   cp .env.example .env
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run migrations and seed:
   ```bash
   npm run migrate
   npm run seed
   ```

5. Start the server:
   ```bash
   npm start
   ```

6. Open the app at **http://localhost:3000**

## Running Tests

### In Docker
```bash
# Unit tests
docker compose exec app sh -c "node --test tests/unit/unitConversion.test.js tests/unit/calorie.service.test.js tests/unit/workout.service.test.js tests/unit/weather.service.test.js"

# Integration tests
docker compose exec app sh -c "node --test tests/integration/auth.test.js tests/integration/workout.routes.test.js tests/integration/middleware.test.js"
```

### Locally
```bash
npm test
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| POST | /api/auth/signup | No | Create account |
| POST | /api/auth/login | No | Login, returns JWT |
| GET | /api/users/me | Yes | Current user profile |
| PATCH | /api/users/me | Yes | Update preferences |
| GET | /api/workouts/today | Yes | Today's recommended workout |
| GET | /api/workouts/plan | Yes | 7-day workout plan |
| PATCH | /api/workouts/today | Yes | Customize today's workout |
| GET | /api/workouts/history | Yes | Workout history |
| POST | /api/workouts | Yes | Log/save a workout |
| PATCH | /api/workouts/:id | Yes | Update a workout |
| DELETE | /api/workouts/:id | Yes | Delete a workout |
| GET | /api/weather | Yes | Current weather |
| GET | /api/weather/forecast | Yes | 7-day forecast |
| GET | /api/reviews | Yes | Community reviews |
| POST | /api/reviews | Yes | Post a review |
| GET | /api/health | No | Health check |

## Project Structure

```
src/
  config/       - Environment, database connections
  middleware/   - Auth, authorization, rate limiting, error handling
  routes/       - Express route definitions
  controllers/  - Request handlers
  services/     - Business logic (workout generation, weather, calories)
  models/       - Database queries (PG + MongoDB)
  migrations/   - SQL migration files
  utils/        - Unit conversion, constants, validators
public/         - Frontend (HTML, CSS, vanilla JS)
tests/          - Unit and integration tests
scripts/        - Migration runner, seed data
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|:--------:|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret for signing JWTs (min 32 chars) | Yes |
| `WEATHER_API_KEY` | OpenWeatherMap API key | Yes |
| `CORS_ORIGIN` | Allowed CORS origin | No |
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment (development/production) | No |

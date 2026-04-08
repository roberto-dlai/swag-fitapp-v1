const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const config = require('./config');
const auth = require('./middleware/auth');
const userPreferences = require('./middleware/userPreferences');
const { errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const weatherRoutes = require('./routes/weather.routes');
const workoutRoutes = require('./routes/workout.routes');
const reviewRoutes = require('./routes/review.routes');

const app = express();

// 1. Request logging
app.use(morgan('dev'));

// 2. Parse JSON bodies (size-limited)
app.use(express.json({ limit: '1mb' }));

// 3. Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// 4. CORS (configured origin, not wildcard)
app.use(cors({ origin: config.corsOrigin }));

// 5. Health check (no auth required)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 5. Auth routes (rate-limited, no auth required)
app.use('/api/auth', authRoutes);

// 6. Auth middleware (all /api/* routes below require JWT)
app.use('/api', auth);

// 7. User preferences middleware (loads prefs for authenticated routes)
app.use('/api', userPreferences);

// 8. Route handlers
app.use('/api/users', userRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/reviews', reviewRoutes);

// 9. Global error handler (catch-all, must be last)
app.use(errorHandler);

module.exports = app;

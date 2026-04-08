const app = require('./app');
const config = require('./config');
const pool = require('./config/db');
const { connectMongo } = require('./config/mongo');

async function start() {
  try {
    // Verify PostgreSQL connection
    const pgResult = await pool.query('SELECT NOW()');
    console.log('Connected to PostgreSQL at', pgResult.rows[0].now);

    // Connect to MongoDB
    await connectMongo();

    // Start HTTP server
    app.listen(config.port, () => {
      console.log(`FitCheck server running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

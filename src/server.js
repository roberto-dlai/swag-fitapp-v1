const app = require('./app');
const config = require('./config');
const pool = require('./config/db');
const { connectMongo, closeMongo } = require('./config/mongo');

let server;

async function start() {
  try {
    // Verify PostgreSQL connection
    const pgResult = await pool.query('SELECT NOW()');
    console.log('Connected to PostgreSQL at', pgResult.rows[0].now);

    // Connect to MongoDB
    await connectMongo();

    // Start HTTP server
    server = app.listen(config.port, () => {
      console.log(`FitCheck server running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`Received ${signal}, shutting down gracefully...`);
  if (server) {
    await new Promise(resolve => server.close(resolve));
  }
  try {
    await pool.end();
    await closeMongo();
  } catch (err) {
    console.error('Error during shutdown:', err);
  }
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();

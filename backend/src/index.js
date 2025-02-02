const startServer = require('./server');
const db = require('./db');

(async () => {
  // Connect to DBs
  try {
    await db.connect();
    console.log('[MONGO] Connected');
  } catch (err) {
    console.log(`[MONGO] Error: ${err}`);
    process.exit(1);
  }

  const app = await startServer();
  console.log('[SERVER] Running on', app.address());
})();

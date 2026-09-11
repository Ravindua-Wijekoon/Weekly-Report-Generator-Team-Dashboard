const env = require('./config/env');
const { connectDB } = require('./config/db');
const app = require('./app');

async function start() {
  await connectDB(env.mongoUri);
  app.listen(env.port, () => {
    console.log(`Server listening on port ${env.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});

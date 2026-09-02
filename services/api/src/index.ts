/**
 * CommonScene API Service — production entry point.
 *
 * Reads config from environment variables (see .env.example) and starts
 * the Fastify server. The server instance is built by buildServer() so it
 * can be tested independently with inject().
 */
import 'dotenv/config';
import { buildServer } from './server.js';

const PORT = parseInt(process.env['API_PORT'] ?? '3001', 10);
const HOST = process.env['API_HOST'] ?? '0.0.0.0';

async function start() {
  const app = await buildServer();

  try {
    const address = await app.listen({ port: PORT, host: HOST });
    app.log.info(`CommonScene API listening at ${address}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

void start();

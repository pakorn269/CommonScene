import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from './server.js';

describe('GET /health', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildServer();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns 200 with status ok', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
  });

  it('returns JSON with status "ok"', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    const body = response.json<{ status: string; version: string; timestamp: string }>();
    expect(body.status).toBe('ok');
  });

  it('returns the current API version', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    const body = response.json<{ status: string; version: string; timestamp: string }>();
    expect(body.version).toBe('0.1.0');
  });

  it('includes a UTC ISO 8601 timestamp', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    const body = response.json<{ status: string; version: string; timestamp: string }>();
    // Must be a valid ISO 8601 date string
    expect(() => new Date(body.timestamp)).not.toThrow();
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
  });

  it('returns correct Content-Type header', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.headers['content-type']).toMatch(/application\/json/);
  });
});

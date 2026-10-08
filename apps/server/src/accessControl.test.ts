import { afterEach, describe, expect, it } from 'vitest';
import Fastify from 'fastify';
import { loadAccessControlConfig, registerAccessControl } from './accessControl.js';

const config = {
  admin: { username: 'owner', password: 'owner-secret' },
  publicOrigin: 'https://eval.ajubyte.store',
};
const basic = (username: string, password: string) => `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

describe('server access roles', () => {
  const apps: ReturnType<typeof Fastify>[] = [];
  afterEach(async () => { await Promise.all(apps.splice(0).map(app => app.close())); });

  it('requires credentials and an HTTPS origin in production', () => {
    expect(() => loadAccessControlConfig({ NODE_ENV: 'production' } as NodeJS.ProcessEnv)).toThrow(/ADMIN/);
    expect(() => loadAccessControlConfig({ NODE_ENV: 'production', ZXBENCH_ADMIN_USER: 'owner',
      ZXBENCH_ADMIN_PASSWORD: 'owner-secret' } as NodeJS.ProcessEnv)).toThrow(/HTTPS/);
  });

  it('allows anonymous reads and requires an admin for writes', async () => {
    const app = Fastify(); apps.push(app);
    registerAccessControl(app, config);
    app.get('/api/runs', async request => ({ role: request.zxbenchRole }));
    app.post('/api/runs', async () => ({ success: true }));
    await app.ready();

    const read = await app.inject({ method: 'GET', url: '/api/runs' });
    expect(read.statusCode).toBe(200);
    expect(read.json()).toEqual({ role: 'viewer' });
    const write = await app.inject({ method: 'POST', url: '/api/runs' });
    expect(write.statusCode).toBe(401);
  });

  it('keeps model, scenario, calibration and live-progress APIs behind admin login', async () => {
    const app = Fastify(); apps.push(app);
    registerAccessControl(app, config);
    for (const path of ['/api/models', '/api/scenarios', '/api/calibration', '/api/runs/123/progress', '/ws']) {
      app.get(path, async () => ({ success: true }));
    }
    await app.ready();
    for (const url of ['/api/models', '/api/scenarios', '/api/calibration', '/api/runs/123/progress']) {
      expect((await app.inject({ method: 'GET', url })).statusCode, url).toBe(401);
    }
  });

  it('allows admin writes only from the configured origin', async () => {
    const app = Fastify(); apps.push(app);
    registerAccessControl(app, config);
    app.post('/api/runs', async request => ({ role: request.zxbenchRole }));
    await app.ready();
    const authorization = basic('owner', 'owner-secret');
    expect((await app.inject({ method: 'POST', url: '/api/runs', headers: { authorization } })).statusCode).toBe(403);
    const write = await app.inject({ method: 'POST', url: '/api/runs', headers: {
      authorization, origin: config.publicOrigin,
    } });
    expect(write.statusCode).toBe(200);
    expect(write.json()).toEqual({ role: 'admin' });
  });

  it('provides a same-origin browser challenge route for administrators', async () => {
    const app = Fastify(); apps.push(app);
    registerAccessControl(app, config);
    await app.ready();
    const login = await app.inject({ method: 'GET', url: '/admin-login' });
    expect(login.statusCode).toBe(401);
    expect(login.headers).toHaveProperty('www-authenticate');
    const authenticated = await app.inject({ method: 'GET', url: '/admin-login', headers: {
      authorization: basic('owner', 'owner-secret'),
    } });
    expect(authenticated.statusCode).toBe(302);
  });
});

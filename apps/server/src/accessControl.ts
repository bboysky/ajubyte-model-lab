import { timingSafeEqual } from 'node:crypto';
import type { FastifyInstance, FastifyRequest } from 'fastify';

export type AccessRole = 'viewer' | 'admin';

type Credential = { username: string; password: string };

export type AccessControlConfig = {
  admin: Credential;
  publicOrigin?: string;
};

declare module 'fastify' {
  interface FastifyRequest {
    zxbenchRole?: AccessRole | null;
  }
}

function credential(env: NodeJS.ProcessEnv, role: 'VIEWER' | 'ADMIN'): Credential | undefined {
  const username = env[`ZXBENCH_${role}_USER`];
  const password = env[`ZXBENCH_${role}_PASSWORD`];
  if (!username && !password) return undefined;
  if (!username || !password) throw new Error(`ZXBENCH_${role}_USER and ZXBENCH_${role}_PASSWORD must be set together`);
  return { username, password };
}

export function loadAccessControlConfig(env: NodeJS.ProcessEnv = process.env): AccessControlConfig | undefined {
  const admin = credential(env, 'ADMIN');
  const publicOrigin = env.ZXBENCH_PUBLIC_ORIGIN;

  if (env.NODE_ENV === 'production') {
    if (!admin) throw new Error('Production requires ZXBENCH_ADMIN_USER and ZXBENCH_ADMIN_PASSWORD');
    if (!publicOrigin || new URL(publicOrigin).protocol !== 'https:') {
      throw new Error('Production requires an HTTPS ZXBENCH_PUBLIC_ORIGIN');
    }
  }
  if (!admin) return undefined;
  return { admin, publicOrigin };
}

function equalText(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function isAdmin(header: string | undefined, config: AccessControlConfig): boolean {
  const match = header?.match(/^Basic\s+([A-Za-z0-9+/]+={0,2})$/i);
  if (!match) return false;
  let decoded: string;
  try {
    decoded = Buffer.from(match[1], 'base64').toString('utf8');
  } catch {
    return false;
  }
  const separator = decoded.indexOf(':');
  if (separator < 0) return false;
  const username = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);
  return equalText(username, config.admin.username) && equalText(password, config.admin.password);
}

const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const PUBLIC_READ_API = [
  /^\/api\/(health|version|runs|leaderboard|stats)$/,
  /^\/api\/runs\/[^/]+$/,
  /^\/api\/runs\/[^/]+\/(group-results|export|report)$/,
  /^\/api\/runs\/[^/]+\/report\/download$/,
];

function publicReadPath(path: string): boolean {
  return PUBLIC_READ_API.some(pattern => pattern.test(path));
}

export function registerAccessControl(app: FastifyInstance, config: AccessControlConfig | undefined): void {
  if (!config) return;
  app.decorateRequest('zxbenchRole', null);
  app.addHook('onRequest', async (request: FastifyRequest, reply) => {
    if (request.method === 'OPTIONS') return;
    const path = request.url.split('?')[0];
    const isAdminLogin = request.method === 'GET' && path === '/admin-login';
    const isPublicPage = !path.startsWith('/api/');
    const isWebSocket = path === '/ws';
    if (READ_METHODS.has(request.method) && !isAdminLogin && !isWebSocket && (isPublicPage || publicReadPath(path))) {
      request.zxbenchRole = 'viewer';
      return;
    }
    if (!isAdmin(request.headers.authorization, config)) {
      reply.header('WWW-Authenticate', 'Basic realm="aubyte-model-lab", charset="UTF-8"');
      return reply.code(401).send({ success: false, error: 'Authentication required' });
    }
    request.zxbenchRole = 'admin';
    if (!READ_METHODS.has(request.method) && config.publicOrigin && request.headers.origin !== config.publicOrigin) {
      return reply.code(403).send({ success: false, error: 'Write requests must come from the configured site origin' });
    }
  });
  app.get('/admin-login', async (_request, reply) => reply.redirect('/'));
}

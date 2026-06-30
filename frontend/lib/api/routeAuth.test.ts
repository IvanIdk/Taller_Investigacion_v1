import { describe, expect, it, vi } from 'vitest';
import { requireApiRole } from './routeAuth';

vi.mock('@/lib/auth', () => ({
  authorizeRole: vi.fn(),
}));

import { authorizeRole } from '@/lib/auth';

function req(headers: Record<string, string> = {}): Request {
  return new Request('http://localhost/api/test', { headers });
}

describe('requireApiRole', () => {
  it('AUT-01: demo header admin válido en desarrollo', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const result = await requireApiRole(
      req({ 'x-demo-role': 'admin', 'x-demo-user-id': 'u1' }),
      ['admin']
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.role).toBe('admin');
      expect(result.userId).toBe('u1');
    }
    vi.unstubAllEnvs();
  });

  it('AUT-02: demo header rol no permitido', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.mocked(authorizeRole).mockResolvedValue({
      authorized: false,
      error: 'Unauthorized role access',
    });
    const result = await requireApiRole(
      req({ 'x-demo-role': 'estudiante' }),
      ['admin']
    );
    expect(result.ok).toBe(false);
    vi.unstubAllEnvs();
  });

  it('AUT-03: sin headers demo ni Bearer', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.mocked(authorizeRole).mockResolvedValue({
      authorized: false,
      error: 'No token provided',
    });
    const result = await requireApiRole(req(), ['admin']);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(401);
    }
    vi.unstubAllEnvs();
  });

  it('AUT-04: demo header bloqueado en producción', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.mocked(authorizeRole).mockResolvedValue({
      authorized: false,
      error: 'No token provided',
    });
    const result = await requireApiRole(
      req({ 'x-demo-role': 'admin' }),
      ['admin']
    );
    expect(result.ok).toBe(false);
    vi.unstubAllEnvs();
  });

  it('AUT-05: psicologo permitido en ruta psicólogo', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const result = await requireApiRole(
      req({ 'x-demo-role': 'psicologo' }),
      ['psicologo', 'admin']
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.role).toBe('psicologo');
    vi.unstubAllEnvs();
  });
});

import { describe, expect, it } from 'vitest';

import {
  badRequest,
  internalError,
  notFound,
  unauthorized,
} from '@/lib/api/errors';

describe('API error helpers', () => {
  it('ERR-01: badRequest retorna 400', async () => {
    const res = badRequest('Parámetros inválidos');
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Parámetros inválidos' });
  });

  it('ERR-02: unauthorized retorna 401', async () => {
    const res = unauthorized();
    expect(res.status).toBe(401);
  });

  it('ERR-03: notFound retorna 404', async () => {
    const res = notFound('No existe');
    expect(res.status).toBe(404);
  });

  it('ERR-04: internalError retorna 500', async () => {
    const res = internalError();
    expect(res.status).toBe(500);
  });
});

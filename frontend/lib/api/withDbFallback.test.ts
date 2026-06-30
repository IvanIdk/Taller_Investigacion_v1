import { describe, expect, it } from 'vitest';
import { withDbFallback } from './withDbFallback';

describe('withDbFallback', () => {
  it('DBF-01: query exitosa retorna data', async () => {
    const res = await withDbFallback(
      async () => ({ items: [1, 2] }),
      { items: [] }
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ items: [1, 2] });
  });

  it('DBF-02: query lanza error retorna fallback', async () => {
    const res = await withDbFallback(
      async () => {
        throw new Error('db down');
      },
      { items: ['mock'] }
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ items: ['mock'] });
  });

  it('DBF-03: respuesta es JSON con Content-Type', async () => {
    const res = await withDbFallback(async () => ({ ok: true }), { ok: false });
    expect(res.headers.get('content-type')).toContain('application/json');
  });
});

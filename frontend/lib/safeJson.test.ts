import { describe, expect, it } from 'vitest';
import { parseJsonSafe } from './safeJson';

describe('parseJsonSafe', () => {
  it('returns fallback for null', () => {
    expect(parseJsonSafe(null, { ok: false })).toEqual({ ok: false });
  });

  it('parses valid JSON', () => {
    expect(parseJsonSafe('{"a":1}', {})).toEqual({ a: 1 });
  });

  it('returns fallback on invalid JSON', () => {
    expect(parseJsonSafe('{bad', { x: 0 })).toEqual({ x: 0 });
  });
});

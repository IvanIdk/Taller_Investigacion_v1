import { NextResponse } from 'next/server';

/**
 * Ejecuta una consulta a Supabase y devuelve datos mock si falla o no hay registros.
 */
export async function withDbFallback<T>(
  query: () => Promise<T>,
  fallback: T
): Promise<NextResponse> {
  try {
    const data = await query();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(fallback);
  }
}

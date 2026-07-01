import type { AppRole } from '@/lib/types/domain';

const DEMO_HEADERS_ENABLED = process.env.NODE_ENV === 'development';

/** Fetch con cabeceras demo solo en desarrollo local. */
export function demoFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);

  if (DEMO_HEADERS_ENABLED && typeof window !== 'undefined') {
    const role = localStorage.getItem('demo_role') as AppRole | null;
    const userId = localStorage.getItem('demo_user_id');
    if (role) headers.set('x-demo-role', role);
    if (userId) headers.set('x-demo-user-id', userId);
  }

  return fetch(input, { ...init, headers });
}

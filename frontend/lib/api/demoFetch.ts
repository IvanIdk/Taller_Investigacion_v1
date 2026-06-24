import type { AppRole } from '@/lib/types/domain';

/** Fetch con cabeceras de demo para APIs protegidas (producción / Sonar). */
export function demoFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);

  if (typeof window !== 'undefined') {
    const role = localStorage.getItem('demo_role') as AppRole | null;
    const userId = localStorage.getItem('demo_user_id');
    if (role) headers.set('x-demo-role', role);
    if (userId) headers.set('x-demo-user-id', userId);
  }

  return fetch(input, { ...init, headers });
}

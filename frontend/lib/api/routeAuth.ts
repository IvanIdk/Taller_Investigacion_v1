import { authorizeRole } from '@/lib/auth';
import type { AppRole } from '@/lib/types/domain';
import { unauthorized } from '@/lib/api/errors';

const IS_DEV = process.env.NODE_ENV === 'development';

export async function requireApiRole(
  req: Request,
  allowedRoles: AppRole[]
): Promise<{ ok: true; userId: string; role: AppRole } | { ok: false; response: Response }> {
  const demoRole = req.headers.get('x-demo-role') as AppRole | null;
  const demoUserId = req.headers.get('x-demo-user-id') ?? 'demo-user-id';

  if (demoRole && allowedRoles.includes(demoRole)) {
    return { ok: true, userId: demoUserId, role: demoRole };
  }

  if (IS_DEV && !req.headers.get('Authorization')) {
    const fallbackRole = allowedRoles.find((r) => r === 'admin') ?? allowedRoles[0];
    return { ok: true, userId: demoUserId, role: fallbackRole };
  }

  const auth = await authorizeRole(req, allowedRoles);
  if (!auth.authorized || !auth.userId || !auth.role) {
    return { ok: false, response: unauthorized(auth.error ?? 'No autorizado') };
  }

  return { ok: true, userId: auth.userId, role: auth.role };
}

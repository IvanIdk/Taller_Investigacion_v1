// Auth and Role authorization helpers for Universidad Continental
import { supabase } from './supabase';
import type { AppRole, SupabaseRoleRow, UserProfile } from './types/domain';
import { isAppRole, roleFromSupabaseRow } from './types/domain';
import { parseJsonSafe } from './safeJson';

const DEMO_AUTH_ENABLED = process.env.NODE_ENV !== 'production';

export type { UserProfile };

export async function getUserRole(userId: string): Promise<AppRole | null> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('roles(nombre)')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      if (typeof window !== 'undefined') {
        const demoRole = localStorage.getItem('demo_role') as AppRole | null;
        if (demoRole && ['admin', 'psicologo', 'estudiante'].includes(demoRole)) {
          return demoRole;
        }
      }
      return null;
    }

    const roleData = (data as SupabaseRoleRow).roles;
    const nombre = roleFromSupabaseRow(roleData);
    if (nombre) {
      return nombre;
    }
    return null;
  } catch {
    if (typeof window !== 'undefined') {
      const demoRole = localStorage.getItem('demo_role') as AppRole | null;
      if (demoRole) return demoRole;
    }
    return null;
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      if (typeof window !== 'undefined') {
        const demoProfile = localStorage.getItem('demo_profile');
        if (demoProfile) {
          return parseJsonSafe<UserProfile | null>(demoProfile, null);
        }
      }
      return null;
    }

    const role = await getUserRole(userId);
    return {
      ...(profile as UserProfile),
      role: role ?? 'estudiante',
    };
  } catch {
    if (typeof window !== 'undefined') {
      const demoProfile = localStorage.getItem('demo_profile');
      if (demoProfile) return parseJsonSafe<UserProfile | null>(demoProfile, null);
    }
    return null;
  }
}

export async function authorizeRole(
  req: Request,
  allowedRoles: AppRole[]
): Promise<{ authorized: boolean; userId?: string; role?: AppRole; error?: string }> {
  try {
    const authHeader = req.headers.get('Authorization');

    if (DEMO_AUTH_ENABLED) {
      const demoOverrideHeader = req.headers.get('x-demo-role');
      const demoUserIdHeader = req.headers.get('x-demo-user-id');

      if (
        isAppRole(demoOverrideHeader) &&
        allowedRoles.includes(demoOverrideHeader)
      ) {
        return {
          authorized: true,
          userId: demoUserIdHeader ?? 'demo-user-id',
          role: demoOverrideHeader,
        };
      }
    }

    if (!authHeader) {
      return { authorized: false, error: 'No token provided' };
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { authorized: false, error: 'Invalid token' };
    }

    const role = await getUserRole(user.id);

    if (!role || !allowedRoles.includes(role)) {
      return { authorized: false, error: 'Unauthorized role access' };
    }

    return { authorized: true, userId: user.id, role };
  } catch {
    return { authorized: false, error: 'Internal Auth Error' };
  }
}

// Auth and Role authorization helpers for Universidad Continental
import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  facultad: string;
  carrera: string;
  edad: number;
  role?: string;
}

// Check the role of a user from Supabase
export async function getUserRole(userId: string): Promise<'admin' | 'psicologo' | 'estudiante' | null> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('roles(nombre)')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      // Check if there is a local session override for demo purposes
      if (typeof window !== 'undefined') {
        const demoRole = localStorage.getItem('demo_role');
        if (demoRole === 'admin' || demoRole === 'psicologo' || demoRole === 'estudiante') {
          return demoRole;
        }
      }
      return null;
    }

    const roleData = data.roles as any;
    if (roleData && roleData.nombre) {
      return roleData.nombre as 'admin' | 'psicologo' | 'estudiante';
    }
    return null;
  } catch (err) {
    console.error('Error fetching user role:', err);
    if (typeof window !== 'undefined') {
      const demoRole = localStorage.getItem('demo_role');
      if (demoRole) return demoRole as any;
    }
    return null;
  }
}

// Helper to determine role and return profile info
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
          return JSON.parse(demoProfile);
        }
      }
      return null;
    }

    const role = await getUserRole(userId);
    return {
      ...profile,
      role: role || 'estudiante'
    } as UserProfile;
  } catch (err) {
    console.error('Error fetching user profile:', err);
    if (typeof window !== 'undefined') {
      const demoProfile = localStorage.getItem('demo_profile');
      if (demoProfile) return JSON.parse(demoProfile);
    }
    return null;
  }
}

// Middleware simulation for API Routes: check if request is authorized for a role
export async function authorizeRole(req: Request, allowedRoles: ('admin' | 'psicologo' | 'estudiante')[]): Promise<{ authorized: boolean; userId?: string; role?: string; error?: string }> {
  try {
    // 1. Get Authorization Header or Cookies
    const authHeader = req.headers.get('Authorization');
    
    // For demo purposes, allow role overrides in headers or request query for extreme robustness
    const demoOverrideHeader = req.headers.get('x-demo-role');
    const demoUserIdHeader = req.headers.get('x-demo-user-id');
    
    if (demoOverrideHeader && allowedRoles.includes(demoOverrideHeader as any)) {
      return { 
        authorized: true, 
        userId: demoUserIdHeader || 'demo-user-id', 
        role: demoOverrideHeader 
      };
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
  } catch (err) {
    return { authorized: false, error: 'Internal Auth Error' };
  }
}

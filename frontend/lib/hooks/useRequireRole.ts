'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AppRole } from '@/lib/types/domain';

export function useRequireRole(allowedRoles: AppRole[]) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const role = localStorage.getItem('demo_role') as AppRole | null;

      if (!role || !allowedRoles.includes(role)) {
        router.push('/auth');
        return;
      }

      setReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [router, allowedRoles]);

  return { ready };
}

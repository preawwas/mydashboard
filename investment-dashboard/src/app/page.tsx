'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Loading } from '@/components/ui';

export default function HomePage() {
  const router = useRouter();
  const { token, user } = useAuthStore();

  useEffect(() => {
    // Check if user is logged in
    const storedAuth = localStorage.getItem('auth-storage');
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
        if (parsed.state?.token && parsed.state?.user) {
          router.push('/dashboard');
          return;
        }
      } catch {
        // Invalid storage, redirect to login
      }
    }
    router.push('/login');
  }, [router]);

  return <Loading fullScreen text="กำลังโหลด..." />;
}

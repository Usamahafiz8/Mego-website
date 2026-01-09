'use client';

import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useThemeStore } from '@/lib/store/themeStore';
import { useAuthStore } from '@/lib/store/authStore';

// Create a single QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const { setDarkMode } = useThemeStore();

  useEffect(() => {
    // Hydrate the store from localStorage after mount
    const hydrate = async () => {
      const { persist } = await import('zustand/middleware');
      const storage = (useThemeStore as any).persist?.getOptions?.()?.storage;
      if (storage) {
        try {
          const savedState = await storage.getItem('mego-theme');
          if (savedState) {
            const parsed = JSON.parse(savedState);
            if (parsed.state?.darkMode !== undefined) {
              // Store is already hydrated by zustand, just ensure DOM is in sync
              if (parsed.state.darkMode) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            }
          }
        } catch (e) {
          console.error('Failed to hydrate theme:', e);
        }
      }
    };

    hydrate();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}



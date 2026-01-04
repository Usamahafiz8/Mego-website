'use client';

import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useThemeStore } from '@/lib/store/themeStore';
import { useAuthStore } from '@/lib/store/authStore';

// Create a single QueryClient instance (singleton pattern for better performance)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { setDarkMode } = useThemeStore();
  const { user } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    
    // Initialize theme after mount
    if (typeof window !== 'undefined') {
      try {
        const savedTheme = localStorage.getItem('mego-theme');
        if (savedTheme) {
          const parsed = JSON.parse(savedTheme);
          if (parsed.state?.darkMode !== undefined) {
            setDarkMode(parsed.state.darkMode);
            return;
          }
        }
      } catch (error) {
        // Ignore parse errors
      }
      
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, [setDarkMode]);

  // Sync user's dark mode preference
  useEffect(() => {
    if (mounted && user?.darkMode !== undefined) {
      setDarkMode(user.darkMode);
    }
  }, [mounted, user, setDarkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}


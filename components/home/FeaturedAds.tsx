'use client';

import { useCallback } from 'react';
import { adsApi } from '@/lib/api';
import { useQuery } from 'react-query';
import { AdCard } from './AdCard';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Ad {
  id: number;
  title: string;
  price: number;
  location: string;
  imageUrl: string;
  category: string;
  createdAt: string;
  views?: number;
}

export function FeaturedAds() {
  // Use React Query for caching and better data management
  const { data: adsData, isLoading } = useQuery(
    'featured-ads',
    async () => {
      const response = await adsApi.getAll();
      return response.data.slice(0, 8);
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  const ads: Ad[] = adsData || [];
  const loading = isLoading;

  // Memoize formatters to prevent re-creation on each render
  const formatDate = useCallback((dateString: string) => {
    if (typeof window === 'undefined') return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-900 border-t-transparent"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-16 animate-fadeInUp">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-primary-900 dark:text-white mb-4">
              Featured Listings
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Discover the best deals in Pakistan
            </p>
          </div>
          <Link
            href="/search"
            className="hidden md:inline-flex items-center gap-2 text-primary-900 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold text-lg group transition-all"
          >
            <span>View All</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ads.map((ad: Ad, index: number) => (
            <div
              key={ad.id}
              className="animate-fadeInUp"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <AdCard
                id={ad.id}
                title={ad.title}
                price={ad.price}
                location={ad.location}
                timeAgo={formatDate(ad.createdAt)}
                image={ad.imageUrl}
              />
            </div>
          ))}
        </div>

        {ads.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No ads available at the moment.</p>
          </div>
        )}

        {/* Mobile View All Button */}
        <div className="text-center mt-12 md:hidden">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-primary-900 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold text-lg"
          >
            <span>View All</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

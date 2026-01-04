'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { adsApi, getImageUrl } from '@/lib/api';
import { Heart, MapPin, Eye } from 'lucide-react';
import Image from 'next/image';
import { useQuery } from 'react-query';

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
      return response.data.slice(0, 12);
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  const ads = adsData || [];
  const loading = isLoading;

  // Memoize formatters to prevent re-creation on each render
  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(price);
  }, []);

  const formatDate = useCallback((dateString: string) => {
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
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12 animate-fadeInUp">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Featured Listings
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Discover the best deals in Pakistan
            </p>
          </div>
          <Link
            href="/search"
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold text-lg flex items-center space-x-2 group/link transition-all hover:scale-105"
          >
            <span>View All</span>
            <span className="group-hover/link:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ads.map((ad, index) => (
            <Link
              key={ad.id}
              href={`/ads/${ad.id}`}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden card-hover group shadow-soft hover:shadow-large animate-fadeInUp"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative h-48 bg-gray-200 dark:bg-gray-800">
                {ad.imageUrl ? (
                  <Image
                    src={getImageUrl(ad.imageUrl)}
                    alt={ad.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    // Handle favorite
                  }}
                  className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-gray-900/90 rounded-full hover:bg-white transition-colors"
                >
                  <Heart className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
                {ad.views && (
                  <div className="absolute bottom-2 left-2 flex items-center space-x-1 px-2 py-1 bg-black/50 rounded text-white text-xs">
                    <Eye className="w-3 h-3" />
                    <span>{ad.views}</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {ad.title}
                </h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                    {formatPrice(ad.price)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(ad.createdAt)}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{ad.location}</span>
                </div>
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded text-gray-600 dark:text-gray-400">
                    {ad.category}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {ads.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No ads available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}





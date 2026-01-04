'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/lib/store/authStore';
import { recentlyViewedApi, getImageUrl } from '@/lib/api';
import { Clock, MapPin, Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface RecentlyViewed {
  id: string;
  ad: {
    id: number;
    title: string;
    price: number;
    location: string;
    imageUrl: string;
    views?: number;
  };
  viewedAt: string;
}

export default function RecentlyViewedPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [items, setItems] = useState<RecentlyViewed[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchItems = async () => {
      try {
        const response = await recentlyViewedApi.getAll();
        setItems(response.data || []);
      } catch (error) {
        toast.error('Failed to load recently viewed items');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [isAuthenticated, router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Recently Viewed
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {items.length} {items.length === 1 ? 'item' : 'items'} viewed
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">No recently viewed items</p>
            <Link
              href="/search"
              className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
            >
              <span>Browse Ads</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden card-hover group relative"
              >
                <Link href={`/ads/${item.ad.id}`}>
                  <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                    {item.ad.imageUrl ? (
                      <Image
                        src={getImageUrl(item.ad.imageUrl)}
                        alt={item.ad.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 flex items-center space-x-1 px-2 py-1 bg-black/50 rounded text-white text-xs">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(item.viewedAt)}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {item.ad.title}
                    </h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                        {formatPrice(item.ad.price)}
                      </span>
                      {item.ad.views !== undefined && (
                        <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                          <Eye className="w-4 h-4" />
                          <span>{item.ad.views}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{item.ad.location}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}





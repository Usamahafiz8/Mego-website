'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/lib/store/authStore';
import { adsApi, getImageUrl, loyaltyApi, notificationsApi } from '@/lib/api';
import { Search, Heart, Eye, MapPin, Filter, RefreshCw, Star, Gift, Zap, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface Ad {
  id: number;
  title: string;
  price: number;
  imageUrl: string;
  location: string;
  category?: string;
  createdAt: string;
  views?: number;
  description?: string;
  condition?: string;
  media?: Array<{ filePath: string; mediaUrl?: string }>;
}

const categories = [
  { id: 'all', name: 'All', icon: '📦' },
  { id: 'Vehicles', name: 'Vehicles', icon: '🚗' },
  { id: 'Property', name: 'Property', icon: '🏠' },
  { id: 'Mobiles', name: 'Mobiles', icon: '📱' },
  { id: 'Electronics', name: 'Electronics', icon: '💻' },
  { id: 'Fashion', name: 'Fashion', icon: '👕' },
  { id: 'Gaming', name: 'Gaming', icon: '🎮' },
  { id: 'Sports', name: 'Sports', icon: '⚽' },
  { id: 'Books', name: 'Books', icon: '📚' },
  { id: 'Furniture', name: 'Furniture', icon: '🛋️' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [ads, setAds] = useState<Ad[]>([]);
  const [featuredAds, setFeaturedAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);
  const [favoritesIds, setFavoritesIds] = useState<Set<number>>(new Set());
  const featuredScrollRef = useRef<HTMLDivElement>(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    // Removed authentication redirect - page accessible without login
    let interval: NodeJS.Timeout;

    const loadData = async () => {
      await fetchData();
      if (isAuthenticated) {
        giveDailyLoginReward();
      }

      // Auto-refresh every 30 seconds
      interval = setInterval(() => {
        fetchData();
      }, 30000);
    };

    loadData();

    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Featured ads carousel auto-scroll
  useEffect(() => {
    if (featuredAds.length === 0) return;
    const interval = setInterval(() => {
      const nextIndex = (featuredIndex + 1) % featuredAds.length;
      setFeaturedIndex(nextIndex);
      if (featuredScrollRef.current) {
        featuredScrollRef.current.scrollTo({
          left: nextIndex * (featuredScrollRef.current.clientWidth),
          behavior: 'smooth',
        });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredAds, featuredIndex]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [adsResponse, notificationsResponse] = await Promise.all([
        adsApi.getAll(),
        notificationsApi.getAll().catch(() => ({ data: [] })),
      ]);

      const allAds = adsResponse.data || [];
      setAds(allAds);

      // Set featured ads (ads with images, first 5)
      const featured = allAds.filter((ad: Ad) =>
        ad.imageUrl || (ad.media && ad.media.length > 0)
      ).slice(0, 5);
      setFeaturedAds(featured);

      setNotificationCount(
        notificationsResponse.data.filter((n: any) => !n.isRead).length
      );
    } catch (error) {
      toast.error('Failed to load ads');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    toast.success('Refreshed!');
  };

  const giveDailyLoginReward = async () => {
    try {
      await loyaltyApi.completeTask('dailyLogin', 10);
    } catch (error: any) {
      // Ignore if already completed today
    }
  };

  const getAdImage = (ad: Ad) => {
    if (ad.media && ad.media.length > 0) {
      return getImageUrl(ad.media[0].mediaUrl || ad.media[0].filePath);
    }
    if (ad.imageUrl) {
      return getImageUrl(ad.imageUrl);
    }
    return null;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Filter ads - memoized for performance
  const filteredAds = useMemo(() => {
    return ads.filter((ad) => {
      const matchesSearch =
        !searchQuery ||
        ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.category?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = activeCategory === 'all' || ad.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [ads, searchQuery, activeCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-transition">
        {/* Welcome Section */}
        <div className="mb-8 animate-fadeInUp">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary-900 via-primary-700 to-secondary-600 bg-clip-text text-transparent">
                Welcome back, {user?.name || 'User'}! 👋
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Discover amazing deals and connect with sellers
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Featured Ads Carousel */}
        {featuredAds.length > 0 && (
          <div className="mb-8 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-3">
              <Star className="w-7 h-7 text-yellow-500 animate-pulse-slow" />
              <span>Featured Ads</span>
            </h2>
            <div
              ref={featuredScrollRef}
              className="relative h-64 md:h-80 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-large"
            >
              <div className="flex h-full">
                {featuredAds.map((ad, index) => {
                  const imageUrl = getAdImage(ad);
                  return (
                    <Link
                      key={ad.id}
                      href={`/ads/${ad.id}`}
                      className="relative min-w-full h-full flex-shrink-0 group"
                    >
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={ad.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">{ad.title}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                          <h3 className="text-xl font-bold mb-2 line-clamp-2">{ad.title}</h3>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">{formatPrice(ad.price)}</span>
                            <div className="flex items-center space-x-2">
                              {ad.location && (
                                <div className="flex items-center space-x-1 text-sm">
                                  <MapPin className="w-4 h-4" />
                                  <span>{ad.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Carousel Indicators */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {featuredAds.map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 rounded-full transition-all ${i === featuredIndex ? 'w-8 bg-white' : 'w-2 bg-white/50'
                              }`}
                          />
                        ))}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 space-y-4 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ads by title, location, category..."
              className="w-full pl-12 pr-4 py-3.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all shadow-soft hover:shadow-medium"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all ${activeCategory === cat.id
                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-glow scale-105'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:scale-105 active:scale-95'
                  }`}
              >
                <span className="mr-2 text-lg">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Ads Grid */}
        <div className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              All Ads <span className="text-primary-600 dark:text-primary-400">({filteredAds.length})</span>
            </h2>
          </div>

          {filteredAds.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-soft">
              <p className="text-gray-600 dark:text-gray-400 text-lg">No ads found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAds.map((ad) => {
                const imageUrl = getAdImage(ad);
                return (
                  <Link
                    key={ad.id}
                    href={`/ads/${ad.id}`}
                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden card-hover group shadow-soft hover:shadow-large"
                  >
                    <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={ad.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                      {ad.views !== undefined && (
                        <div className="absolute top-2 right-2 flex items-center space-x-1 px-2 py-1 bg-black/50 rounded text-white text-xs">
                          <Eye className="w-3 h-3" />
                          <span>{ad.views}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {ad.title}
                      </h3>
                      <p className="text-xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                        {formatPrice(ad.price)}
                      </p>
                      <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{ad.location}</span>
                      </div>
                      {ad.category && (
                        <span className="inline-block mt-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded text-gray-600 dark:text-gray-400">
                          {ad.category}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

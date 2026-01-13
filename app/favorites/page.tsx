'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/lib/store/authStore';
import { favoritesApi, getImageUrl } from '@/lib/api';
import { Heart, MapPin, Eye, Trash2, Filter, RefreshCw, Search, Grid, List } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface Favorite {
  id: number;
  ad: {
    id: number;
    title: string;
    price: number;
    location: string;
    imageUrl: string;
    category?: string;
    views?: number;
    createdAt?: string;
  };
}

export default function FavoritesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'views'>('date');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = ['all', 'Vehicles', 'Property', 'Mobiles', 'Electronics', 'Fashion', 'Gaming', 'Sports'];

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await favoritesApi.getAll();
      // Backend returns array of ad objects, wrap them in favorite structure
      const ads = response.data || [];
      const favoritesList = ads.map((ad: any) => ({
        id: ad.id || Math.random(),
        ad: {
          id: ad.id,
          title: ad.title,
          price: ad.price,
          location: ad.location,
          imageUrl: ad.imageUrl,
          category: ad.category,
          views: ad.views,
          createdAt: ad.createdAt,
        },
      }));
      setFavorites(favoritesList);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load favorites');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Removed authentication redirect - page accessible without login
    // if (!isAuthenticated) {
    //   router.push('/login');
    //   return;
    // }

    if (isAuthenticated) {
      fetchFavorites();

      // Auto-refresh every 30 seconds
      const interval = setInterval(() => {
        fetchFavorites();
      }, 30000);

      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, fetchFavorites]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFavorites();
    toast.success('Favorites refreshed!');
  };

  const handleRemove = async (adId: number) => {
    try {
      await favoritesApi.toggle(adId);
      setFavorites(favorites.filter((f) => f.ad.id !== adId));
      toast.success('Removed from favorites');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove favorite');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  // Filter and sort
  let filteredFavorites = [...favorites];

  // Apply search
  if (searchQuery) {
    const queryLower = searchQuery.toLowerCase();
    filteredFavorites = filteredFavorites.filter((f) =>
      f.ad.title.toLowerCase().includes(queryLower) ||
      f.ad.location.toLowerCase().includes(queryLower) ||
      f.ad.category?.toLowerCase().includes(queryLower)
    );
  }

  // Apply category filter
  if (filterCategory !== 'all') {
    filteredFavorites = filteredFavorites.filter((f) => f.ad.category === filterCategory);
  }

  // Apply sort
  filteredFavorites.sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.ad.price - b.ad.price;
      case 'views':
        return (b.ad.views || 0) - (a.ad.views || 0);
      default:
        // Sort by date (newest first)
        if (a.ad.createdAt && b.ad.createdAt) {
          return new Date(b.ad.createdAt).getTime() - new Date(a.ad.createdAt).getTime();
        }
        return 0;
    }
  });

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 animate-fadeInUp">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-primary-900 dark:text-white mb-4">
                My Favorites ❤️
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {favorites.length} saved {favorites.length === 1 ? 'item' : 'items'}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Refresh Favorites"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Search and Filters */}
          {favorites.length > 0 && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search favorites..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {/* Category Filter */}
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'price' | 'views')}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="date">Sort by Date</option>
                  <option value="price">Sort by Price</option>
                  <option value="views">Sort by Views</option>
                </select>

                {/* View Mode */}
                <div className="flex items-center space-x-2 ml-auto">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {filteredFavorites.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900/50 rounded-2xl border-2 border-gray-100 dark:border-gray-800 shadow-soft">
            <Heart className={`w-16 h-16 mx-auto mb-4 ${favorites.length === 0 ? 'text-gray-400' : 'text-red-400'}`} />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {favorites.length === 0
                ? 'No favorites yet'
                : searchQuery || filterCategory !== 'all'
                  ? 'No favorites match your filters'
                  : 'No favorites found'}
            </p>
            {favorites.length === 0 ? (
              <Link
                href="/search"
                className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <span>Browse Ads</span>
              </Link>
            ) : (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterCategory('all');
                }}
                className="inline-flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFavorites.map((favorite) => (
              <div
                key={favorite.id}
                className="bg-white dark:bg-gray-900/50 rounded-2xl border-2 border-gray-100 dark:border-gray-800 overflow-hidden card-hover group relative shadow-soft"
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemove(favorite.ad.id);
                  }}
                  data-no-navigate
                  className="absolute top-2 right-2 z-20 p-2 bg-white/90 dark:bg-gray-900/90 rounded-full hover:bg-white transition-colors shadow-lg"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
                <Link
                  href={`/ads/${favorite.ad.id}`}
                  className="block"
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('button') || target.closest('[data-no-navigate]')) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                >
                  <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                    {favorite.ad.imageUrl ? (
                      <Image
                        src={getImageUrl(favorite.ad.imageUrl)}
                        alt={favorite.ad.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                    {favorite.ad.views !== undefined && (
                      <div className="absolute bottom-2 left-2 flex items-center space-x-1 px-2 py-1 bg-black/50 rounded text-white text-xs">
                        <Eye className="w-3 h-3" />
                        <span>{favorite.ad.views}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {favorite.ad.title}
                    </h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                        {formatPrice(favorite.ad.price)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{favorite.ad.location}</span>
                    </div>
                    {favorite.ad.category && (
                      <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded text-gray-600 dark:text-gray-400">
                        {favorite.ad.category}
                      </span>
                    )}
                    {favorite.ad.createdAt && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {formatDate(favorite.ad.createdAt)}
                      </p>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFavorites.map((favorite) => (
              <div
                key={favorite.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden card-hover group"
              >
                <div className="flex flex-col md:flex-row">
                  <Link
                    href={`/ads/${favorite.ad.id}`}
                    className="flex-shrink-0 md:w-48 h-48 relative bg-gray-200 dark:bg-gray-700"
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.closest('button') || target.closest('[data-no-navigate]')) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                  >
                    {favorite.ad.imageUrl ? (
                      <Image
                        src={getImageUrl(favorite.ad.imageUrl)}
                        alt={favorite.ad.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <Link
                          href={`/ads/${favorite.ad.id}`}
                          className="flex-1"
                          onClick={(e) => {
                            const target = e.target as HTMLElement;
                            if (target.closest('button') || target.closest('[data-no-navigate]')) {
                              e.preventDefault();
                              e.stopPropagation();
                            }
                          }}
                        >
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {favorite.ad.title}
                          </h3>
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemove(favorite.ad.id);
                          }}
                          data-no-navigate
                          className="ml-4 p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex items-center space-x-4 mb-2">
                        <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                          {formatPrice(favorite.ad.price)}
                        </span>
                        {favorite.ad.views !== undefined && (
                          <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                            <Eye className="w-4 h-4" />
                            <span>{favorite.ad.views} views</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{favorite.ad.location}</span>
                        </div>
                        {favorite.ad.category && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                            {favorite.ad.category}
                          </span>
                        )}
                        {favorite.ad.createdAt && (
                          <span className="text-gray-500 dark:text-gray-500">
                            {formatDate(favorite.ad.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AdCard } from '@/components/home/AdCard';
import { adsApi } from '@/lib/api';
import { Search, Filter, Grid, List, SlidersHorizontal } from 'lucide-react';

interface Ad {
  id: number;
  title: string;
  price: number;
  location: string;
  imageUrl: string;
  category: string;
  description?: string;
  condition?: string;
  adType?: string;
  contact?: string;
  createdAt: string;
  views?: number;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    location: '',
    condition: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await adsApi.getAll();
        let filteredAds = response.data;

        if (searchQuery) {
          const queryLower = searchQuery.toLowerCase().trim();
          filteredAds = filteredAds.filter((ad: Ad) => {
            return (
              ad.title?.toLowerCase().includes(queryLower) ||
              ad.description?.toLowerCase().includes(queryLower) ||
              ad.location?.toLowerCase().includes(queryLower) ||
              ad.category?.toLowerCase().includes(queryLower) ||
              ad.condition?.toLowerCase().includes(queryLower) ||
              ad.adType?.toLowerCase().includes(queryLower) ||
              ad.contact?.toLowerCase().includes(queryLower) ||
              ad.price?.toString().includes(queryLower)
            );
          });
        }

        if (filters.category) {
          filteredAds = filteredAds.filter((ad: Ad) => ad.category === filters.category);
        }
        if (filters.minPrice) {
          filteredAds = filteredAds.filter((ad: Ad) => ad.price >= parseFloat(filters.minPrice));
        }
        if (filters.maxPrice) {
          filteredAds = filteredAds.filter((ad: Ad) => ad.price <= parseFloat(filters.maxPrice));
        }
        if (filters.location) {
          filteredAds = filteredAds.filter((ad: Ad) =>
            ad.location.toLowerCase().includes(filters.location.toLowerCase())
          );
        }

        setAds(filteredAds);
      } catch (error) {
        console.error('Failed to fetch ads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [searchQuery, filters]);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) return `${diffInDays}d ago`;
    if (diffInHours > 0) return `${diffInHours}h ago`;
    return 'Just now';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar with Gradient Focus */}
        <div className="mb-8">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-900 w-6 h-6 transition-colors z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, location, category, description..."
              className="w-full pl-16 pr-40 py-5 border-2 border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-lg focus:outline-none focus:ring-4 focus:ring-primary-900/20 focus:border-primary-900 dark:focus:border-primary-700 transition-all shadow-soft hover:shadow-medium"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-semibold ${showFilters
                  ? 'bg-primary-900 text-white shadow-medium'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modern Filters Panel */}
        {showFilters && (
          <div className="mb-8 bg-white dark:bg-gray-900 rounded-3xl border-2 border-gray-100 dark:border-gray-800 p-6 md:p-8 shadow-medium animate-fadeInUp">
            <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-6 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Results
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900 transition-all"
                >
                  <option value="">All Categories</option>
                  <option value="Vehicles">Vehicles</option>
                  <option value="Property">Property</option>
                  <option value="Mobiles">Mobiles</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Sports">Sports</option>
                  <option value="Books">Books</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Watches">Watches</option>
                  <option value="Cameras">Cameras</option>
                  <option value="Audio">Audio</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Min Price (PKR)
                </label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  placeholder="0"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Max Price (PKR)
                </label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  placeholder="No limit"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  placeholder="City, Area"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900 transition-all"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setFilters({ category: '', minPrice: '', maxPrice: '', location: '', condition: '' })}
                className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:text-primary-900 dark:hover:text-primary-400 font-semibold transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-gray-600 dark:text-gray-400">
              Found <span className="font-bold text-primary-900 dark:text-white text-xl">{ads.length}</span>{' '}
              {ads.length === 1 ? 'result' : 'results'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid'
                ? 'bg-primary-900 text-white shadow-medium'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'list'
                ? 'bg-primary-900 text-white shadow-medium'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-900 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Searching...</p>
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-20">
            <div className="mb-6">
              <Search className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-700" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No results found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Try adjusting your filters or search terms to find what you&apos;re looking for
            </p>
            <a
              href="/post-ad"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-accent-400 to-accent-500 text-black rounded-xl hover:shadow-glow-yellow font-bold transition-all"
            >
              Post Your Ad
            </a>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'flex flex-col gap-4'}>
            {ads.map((ad) => (
              <AdCard
                key={ad.id}
                id={ad.id}
                title={ad.title}
                price={ad.price}
                location={ad.location}
                timeAgo={getTimeAgo(ad.createdAt)}
                image={ad.imageUrl}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-900 border-t-transparent"></div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { adsApi, getImageUrl, categoriesApi } from '@/lib/api';
import { Search, Filter, MapPin, Eye, Heart, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [ads, setAds] = useState<Ad[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesApi.getAll();
        setCategories(response.data || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await adsApi.getAll();
        let filteredAds = response.data;

        // Apply comprehensive search query - search across all fields
        if (searchQuery) {
          const queryLower = searchQuery.toLowerCase().trim();
          filteredAds = filteredAds.filter((ad: Ad) => {
            // Search in title
            const titleMatch = ad.title?.toLowerCase().includes(queryLower) || false;
            
            // Search in description
            const descMatch = ad.description?.toLowerCase().includes(queryLower) || false;
            
            // Search in location
            const locationMatch = ad.location?.toLowerCase().includes(queryLower) || false;
            
            // Search in category
            const categoryMatch = ad.category?.toLowerCase().includes(queryLower) || false;
            
            // Search in condition
            const conditionMatch = ad.condition?.toLowerCase().includes(queryLower) || false;
            
            // Search in ad type (sell, buy, swap, etc.)
            const adTypeMatch = ad.adType?.toLowerCase().includes(queryLower) || false;
            
            // Search in contact (if user searches for phone number)
            const contactMatch = ad.contact?.toLowerCase().includes(queryLower) || false;
            
            // Search in price (if user types numbers, check if it matches price range)
            const priceMatch = ad.price?.toString().includes(queryLower) || false;
            
            // Combine all search criteria
            return titleMatch || descMatch || locationMatch || categoryMatch || 
                   conditionMatch || adTypeMatch || contactMatch || priceMatch;
          });
        }

        // Apply category filter
        if (filters.category) {
          filteredAds = filteredAds.filter((ad: Ad) => ad.category === filters.category);
        }

        // Apply price filters
        if (filters.minPrice) {
          filteredAds = filteredAds.filter((ad: Ad) => ad.price >= parseFloat(filters.minPrice));
        }
        if (filters.maxPrice) {
          filteredAds = filteredAds.filter((ad: Ad) => ad.price <= parseFloat(filters.maxPrice));
        }

        // Apply location filter
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const params = new URLSearchParams();
                  if (searchQuery) params.set('q', searchQuery);
                  if (filters.category) params.set('category', filters.category);
                  router.push(`/search?${params.toString()}`);
                }
              }}
              placeholder="Search by title, location, category, description..."
              className="w-full pl-12 pr-32 py-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all shadow-soft hover:shadow-medium"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  const params = new URLSearchParams();
                  if (filters.category) params.set('category', filters.category);
                  router.push(`/search?${params.toString()}`);
                }}
                className="absolute right-24 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Min Price
                </label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Price
                </label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  placeholder="No limit"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  placeholder="City, Area"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-400">
            Found <span className="font-semibold text-gray-900 dark:text-white">{ads.length}</span> results
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No ads found</p>
            <Link
              href="/post-ad"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Post Your First Ad
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ads.map((ad) => (
              <Link
                key={ad.id}
                href={`/ads/${ad.id}`}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden card-hover group"
              >
                <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                  {ad.imageUrl ? (
                    <Image
                      src={getImageUrl(ad.imageUrl)}
                      alt={ad.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
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
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {ad.title}
                  </h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                      {formatPrice(ad.price)}
                    </span>
                    {ad.views !== undefined && (
                      <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                        <Eye className="w-4 h-4" />
                        <span>{ad.views}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{ad.location}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}



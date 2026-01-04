'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { neighborhoodApi, buyerRequestApi, getImageUrl } from '@/lib/api';
import { MapPin, Search, Plus, Package, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface Listing {
  id: number;
  title: string;
  price: number;
  location: string;
  imageUrl: string;
  createdAt: string;
}

interface BuyerRequest {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  createdAt: string;
  user: {
    name: string;
    profileImage?: string;
  };
}

export default function NeighborhoodPage() {
  const [location, setLocation] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [buyerRequests, setBuyerRequests] = useState<BuyerRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'listings' | 'requests'>('listings');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feedRes, requestsRes] = await Promise.all([
          neighborhoodApi.getFeed(location || undefined),
          buyerRequestApi.getAll(),
        ]);

        setListings(feedRes.data?.listings || []);
        setBuyerRequests(requestsRes.data || []);
      } catch (error) {
        toast.error('Failed to load neighborhood feed');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location]);

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Neighborhood Feed
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover listings and buyer requests near you
          </p>
        </div>

        {/* Location Search */}
        <div className="mb-6">
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter your location (e.g., Lahore, Gulberg)"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex space-x-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-4 px-4 font-semibold transition-colors ${
              activeTab === 'listings'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Package className="w-5 h-5 inline mr-2" />
            Listings ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-4 px-4 font-semibold transition-colors ${
              activeTab === 'requests'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-5 h-5 inline mr-2" />
            Buyer Requests ({buyerRequests.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : activeTab === 'listings' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">No listings in your area</p>
                <Link
                  href="/post-ad"
                  className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
                >
                  <Plus className="w-5 h-5" />
                  <span>Post Your First Ad</span>
                </Link>
              </div>
            ) : (
              listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/ads/${listing.id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden card-hover group"
                >
                  <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                    {listing.imageUrl ? (
                      <Image
                        src={getImageUrl(listing.imageUrl)}
                        alt={listing.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {listing.title}
                    </h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                        {formatPrice(listing.price)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{listing.location}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end mb-4">
              <Link
                href="/buyer-requests/new"
                className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
              >
                <Plus className="w-5 h-5" />
                <span>Post Buyer Request</span>
              </Link>
            </div>

            {buyerRequests.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">No buyer requests yet</p>
                <Link
                  href="/buyer-requests/new"
                  className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
                >
                  <Plus className="w-5 h-5" />
                  <span>Post Your First Request</span>
                </Link>
              </div>
            ) : (
              buyerRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 card-hover"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {request.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{request.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{request.location}</span>
                        </div>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                          {request.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {request.user.profileImage ? (
                        <Image
                          src={getImageUrl(request.user.profileImage)}
                          alt={request.user.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {request.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                      Respond with Ad
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}





'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/lib/store/authStore';
import { adsApi, getImageUrl } from '@/lib/api';
import { Package, Eye, CheckCircle2, Clock, XCircle, CheckCircle, Plus, RefreshCw, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface Ad {
  id: number;
  title: string;
  price: number;
  imageUrl: string;
  status: string;
  createdAt: string;
  views?: number;
  category?: string;
  location?: string;
}

export default function MyAdsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'Active' | 'Pending' | 'Rejected' | 'Sold' | 'All'>('Active');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchAds();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAds();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, router]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const response = await adsApi.getMyAds();
      setAds(response.data || []);
    } catch (error) {
      toast.error('Failed to load ads');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAds();
    toast.success('Ads refreshed!');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;

    try {
      await adsApi.delete(id);
      setAds(ads.filter((a) => a.id !== id));
      toast.success('Ad deleted successfully');
    } catch (error) {
      toast.error('Failed to delete ad');
    }
  };

  const handleMarkSold = async (id: number) => {
    if (!confirm('Mark this ad as sold?')) return;

    try {
      await adsApi.markAsSold(id);
      await fetchAds();
      toast.success('Ad marked as sold');
    } catch (error) {
      toast.error('Failed to mark as sold');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const filteredAds = ads.filter((ad) => {
    const status = ad.status?.toLowerCase();
    switch (activeTab) {
      case 'Active':
        return status === 'approved' || status === 'active';
      case 'Pending':
        return status === 'pending';
      case 'Rejected':
        return status === 'rejected';
      case 'Sold':
        return status === 'sold';
      default:
        return true;
    }
  });

  const stats = {
    Active: ads.filter((a) => {
      const s = a.status?.toLowerCase();
      return s === 'approved' || s === 'active';
    }).length,
    Pending: ads.filter((a) => a.status?.toLowerCase() === 'pending').length,
    Rejected: ads.filter((a) => a.status?.toLowerCase() === 'rejected').length,
    Sold: ads.filter((a) => a.status?.toLowerCase() === 'sold').length,
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Ads</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your listings</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href="/post-ad"
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Post New Ad</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Active</p>
                <p className="text-2xl font-bold">{stats.Active}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Pending</p>
                <p className="text-2xl font-bold">{stats.Pending}</p>
              </div>
              <Clock className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Rejected</p>
                <p className="text-2xl font-bold">{stats.Rejected}</p>
              </div>
              <XCircle className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Sold</p>
                <p className="text-2xl font-bold">{stats.Sold}</p>
              </div>
              <CheckCircle className="w-8 h-8 opacity-80" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {(['Active', 'Pending', 'Rejected', 'Sold', 'All'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {tab} {tab !== 'All' && `(${stats[tab]})`}
            </button>
          ))}
        </div>

        {/* Ads List */}
        {filteredAds.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {activeTab === 'All' ? "You haven't posted any ads yet" : `No ${activeTab.toLowerCase()} ads`}
            </p>
            <Link
              href="/post-ad"
              className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Post Your First Ad</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAds.map((ad) => (
              <div
                key={ad.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden card-hover group"
              >
                <Link href={`/ads/${ad.id}`}>
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
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          ad.status === 'approved' || ad.status === 'active'
                            ? 'bg-green-500 text-white'
                            : ad.status === 'pending'
                            ? 'bg-yellow-500 text-white'
                            : ad.status === 'rejected'
                            ? 'bg-red-500 text-white'
                            : 'bg-blue-500 text-white'
                        }`}
                      >
                        {ad.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {ad.title}
                    </h3>
                    <p className="text-xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                      {formatPrice(ad.price)}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>{new Date(ad.createdAt).toLocaleDateString()}</span>
                      {ad.views !== undefined && (
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{ad.views}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
                <div className="px-4 pb-4 flex space-x-2">
                  <Link
                    href={`/ads/${ad.id}/edit`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex items-center justify-center space-x-1 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm font-medium transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </Link>
                  {(ad.status === 'approved' || ad.status === 'active') && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMarkSold(ad.id);
                      }}
                      className="flex-1 flex items-center justify-center space-x-1 py-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded text-sm font-medium transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Sold</span>
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(ad.id);
                    }}
                    className="flex-1 flex items-center justify-center space-x-1 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded text-sm font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
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




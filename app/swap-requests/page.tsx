'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/lib/store/authStore';
import { swapRequestApi, getImageUrl } from '@/lib/api';
import { RefreshCw, Check, X, Package, ArrowLeftRight, MessageCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface SwapRequest {
  id: string;
  requesterAd: {
    id: number;
    title: string;
    price: number;
    imageUrl?: string;
    media?: Array<{ filePath: string; mediaUrl?: string }>;
    userId?: string;
  };
  targetAd: {
    id: number;
    title: string;
    price: number;
    imageUrl?: string;
    media?: Array<{ filePath: string; mediaUrl?: string }>;
    userId?: string;
  };
  requesterId?: string;
  status: string;
  createdAt: string;
  message?: string;
}

export default function SwapRequestsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [requests, setRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchRequests();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchRequests();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, router]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      // Use getForMyAds to get swap requests for user's ads (like mobile app)
      const response = await swapRequestApi.getForMyAds();
      setRequests(response.data || []);
    } catch (error: any) {
      console.error('Swap requests error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load swap requests';
      toast.error(errorMessage);
      // Try fallback to getAll if getForMyAds fails
      try {
        const fallbackResponse = await swapRequestApi.getAll();
        setRequests(fallbackResponse.data || []);
      } catch (fallbackError) {
        // If both fail, set empty array
        setRequests([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
    toast.success('Refreshed!');
  };

  const handleAccept = async (id: string) => {
    try {
      await swapRequestApi.accept(id);
      toast.success('Swap request accepted!');
      await fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to accept swap request');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await swapRequestApi.reject(id);
      toast.success('Swap request rejected');
      await fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject swap request');
    }
  };

  const getAdImage = (ad: SwapRequest['requesterAd'] | SwapRequest['targetAd']) => {
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
              <ArrowLeftRight className="w-8 h-8 mr-3" />
              Swap Requests
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {requests.length} request{requests.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowLeftRight className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No swap requests yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Swap requests for your ads will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => {
              // Determine if this is an incoming request (someone wants to swap with your ad)
              const isIncoming = request.targetAd?.userId === user?.id || 
                                (request.requesterId && request.requesterId !== user?.id);
              const requesterAd = isIncoming ? request.requesterAd : request.targetAd;
              const targetAd = isIncoming ? request.targetAd : request.requesterAd;

              const requesterImage = getAdImage(requesterAd);
              const targetImage = getAdImage(targetAd);

              return (
                <div
                  key={request.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 card-hover"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                        <ArrowLeftRight className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {isIncoming ? 'Incoming Swap Request' : 'Your Swap Request'}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(request.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        request.status === 'accepted'
                          ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                          : request.status === 'rejected'
                          ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                          : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
                      }`}
                    >
                      {request.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Swap Container */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Your Ad */}
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 mb-3">
                        <Package className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        <h4 className="text-sm font-semibold text-primary-600 dark:text-primary-400">Your Ad</h4>
                      </div>
                      <Link href={`/ads/${targetAd.id}`}>
                        <div className="relative h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3 overflow-hidden group">
                          {targetImage ? (
                            <Image
                              src={targetImage}
                              alt={targetAd.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </Link>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                        {targetAd.title}
                      </h4>
                      <p className="text-primary-600 dark:text-primary-400 font-bold">
                        {formatPrice(targetAd.price)}
                      </p>
                    </div>

                    {/* Swap Icon */}
                    <div className="flex items-center justify-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg">
                        <ArrowLeftRight className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Their Ad */}
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 mb-3">
                        <Package className="w-4 h-4 text-gray-500" />
                        <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Their Ad</h4>
                      </div>
                      <Link href={`/ads/${requesterAd.id}`}>
                        <div className="relative h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3 overflow-hidden group">
                          {requesterImage ? (
                            <Image
                              src={requesterImage}
                              alt={requesterAd.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </Link>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                        {requesterAd.title}
                      </h4>
                      <p className="text-primary-600 dark:text-primary-400 font-bold">
                        {formatPrice(requesterAd.price)}
                      </p>
                    </div>
                  </div>

                  {/* Message */}
                  {request.message && (
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-start space-x-3">
                      <MessageCircle className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                        <span className="font-semibold">Message: </span>
                        {request.message}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  {request.status === 'pending' && (
                    <div className="flex items-center justify-end space-x-3">
                      {isIncoming ? (
                        <>
                          <button
                            onClick={() => handleReject(request.id)}
                            className="px-6 py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center space-x-2 font-semibold"
                          >
                            <X className="w-5 h-5" />
                            <span>Reject</span>
                          </button>
                          <button
                            onClick={() => handleAccept(request.id)}
                            className="px-6 py-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex items-center space-x-2 font-semibold"
                          >
                            <Check className="w-5 h-5" />
                            <span>Accept</span>
                          </button>
                        </>
                      ) : (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Waiting for response...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

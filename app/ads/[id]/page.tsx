'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { adsApi, getImageUrl, favoritesApi, recentlyViewedApi, usersApi, adAnalyticsApi, swapRequestApi, reportsApi } from '@/lib/api';
import { MapPin, Eye, Heart, Share2, MessageCircle, Phone, Mail, Shield, Star, User, ArrowLeft, ArrowLeftRight, X } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/store/authStore';
import Link from 'next/link';

interface Ad {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  imageUrl: string;
  category: string;
  condition: string;
  negotiable: boolean;
  createdAt: string;
  userId?: string;
  userName?: string;
  contact?: string;
  user?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    profileImage?: string;
    verificationTier?: string;
  };
  views?: number;
  media?: Array<{ filePath: string; mediaUrl?: string }>;
}

interface Seller {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  profileImage?: string;
  verificationTier?: string;
  createdAt?: string;
}

export default function AdDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();
  const [ad, setAd] = useState<Ad | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [myAds, setMyAds] = useState<any[]>([]);
  const [selectedAdId, setSelectedAdId] = useState<number | null>(null);
  const [swapMessage, setSwapMessage] = useState('');
  const [loadingMyAds, setLoadingMyAds] = useState(false);
  const [submittingSwap, setSubmittingSwap] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const response = await adsApi.getById(Number(params.id));
        const adData = response.data;
        setAd(adData);
        
        // Track view
        if (isAuthenticated) {
          try {
            await Promise.all([
              adAnalyticsApi.trackView(Number(params.id)),
              recentlyViewedApi.add(Number(params.id)),
            ]);
          } catch (error) {
            // Silent fail
          }
        }

        // Fetch seller details
        const sellerId = adData.userId || adData.user?.id;
        if (sellerId) {
          try {
            const sellerResponse = await usersApi.getById(sellerId);
            setSeller(sellerResponse.data);
          } catch (error) {
            // Fallback to ad user data
            if (adData.user) {
              setSeller({
                id: adData.user.id,
                name: adData.user.name || adData.userName || 'Seller',
                phone: adData.user.phone || adData.contact,
                email: adData.user.email,
                profileImage: adData.user.profileImage,
                verificationTier: adData.user.verificationTier,
              });
            } else if (adData.userId) {
              setSeller({
                id: adData.userId,
                name: adData.userName || 'Seller',
                phone: adData.contact,
              });
            }
          }
        }

        // Check favorite status
        if (isAuthenticated) {
          try {
            const favResponse = await favoritesApi.getAll();
            const favorites = favResponse.data || [];
            // Backend returns array of ad objects directly
            const isFav = favorites.some((f: any) => {
              const favAdId = f.id || f.adId || f.ad?.id;
              return favAdId === adData.id;
            });
            setIsFavorite(isFav);
          } catch (error) {
            // Silent fail
          }
        }
      } catch (error) {
        toast.error('Failed to load ad');
        router.push('/search');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchAd();
    }
  }, [params.id, isAuthenticated, router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      // Save current page for redirect after login
      const currentUrl = `/ads/${params.id}`;
      localStorage.setItem('redirectAfterLogin', currentUrl);
      toast.error('Please login to add favorites');
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }

    try {
      await favoritesApi.toggle(ad!.id);
      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update favorite');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: ad?.title,
        text: ad?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const handleContact = () => {
    if (!isAuthenticated) {
      const currentUrl = `/ads/${params.id}`;
      localStorage.setItem('redirectAfterLogin', currentUrl);
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }
    
    if (seller?.id) {
      router.push(`/messages?user=${seller.id}`);
    } else {
      toast.error('Seller information not available');
    }
  };

  const handleCall = () => {
    const phone = seller?.phone || ad?.contact;
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      toast.error('Phone number not available');
    }
  };

  const handleSwapClick = async () => {
    if (!isAuthenticated) {
      const currentUrl = `/ads/${params.id}`;
      localStorage.setItem('redirectAfterLogin', currentUrl);
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }

    try {
      setLoadingMyAds(true);
      const response = await swapRequestApi.getMyAds();
      const activeAds = (response.data || []).filter((a: any) => 
        a.status === 'approved' || a.status === 'active'
      );
      setMyAds(activeAds);
      setShowSwapModal(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load your ads');
    } finally {
      setLoadingMyAds(false);
    }
  };

  const handleSubmitSwap = async () => {
    if (!selectedAdId) {
      toast.error('Please select an ad to swap');
      return;
    }

    try {
      setSubmittingSwap(true);
      await swapRequestApi.create({
        requesterAdId: selectedAdId,
        targetAdId: ad!.id,
        message: swapMessage || undefined,
      });
      toast.success('Swap request sent successfully!');
      setShowSwapModal(false);
      setSelectedAdId(null);
      setSwapMessage('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create swap request');
    } finally {
      setSubmittingSwap(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!reportReason.trim()) {
      toast.error('Please enter a reason for reporting this ad');
      return;
    }
    if (!ad?.id) {
      toast.error('Ad not found');
      return;
    }
    setSubmittingReport(true);
    try {
      await reportsApi.reportAd({
        adId: ad.id,
        reason: reportReason.trim(),
        userId: user?.id,
      });
      toast.success('Report submitted successfully!');
      setShowReportModal(false);
      setReportReason('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmittingReport(false);
    }
  };

  const images = ad?.imageUrl 
    ? [ad.imageUrl, ...(ad.media?.map(m => m.filePath || m.mediaUrl) || [])].filter(Boolean)
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!ad) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="relative h-96 bg-gray-200 dark:bg-gray-700">
                {images.length > 0 ? (
                  <>
                    <Image
                      src={getImageUrl(images[currentImageIndex])}
                      alt={ad.title}
                      fill
                      className="object-cover"
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                        >
                          ←
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                        >
                          →
                        </button>
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                          {images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-2 h-2 rounded-full ${
                                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Description</h2>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                {ad.description || ad.title}
              </p>
            </div>

            {/* Seller Info */}
            {(seller || ad.user) && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Seller Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    {(seller?.profileImage || ad.user?.profileImage) ? (
                      <Image
                        src={getImageUrl(seller?.profileImage || ad.user?.profileImage || '')}
                        alt={seller?.name || ad.user?.name || 'Seller'}
                        width={80}
                        height={80}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                        <span className="text-white text-2xl font-medium">
                          {(seller?.name || ad.user?.name || 'S').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {seller?.name || ad.user?.name || ad.userName || 'Seller'}
                        </h3>
                        {(seller?.verificationTier || ad.user?.verificationTier) && (
                          <Shield className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      {(seller?.verificationTier || ad.user?.verificationTier) && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {seller?.verificationTier || ad.user?.verificationTier} Verified
                        </p>
                      )}
                      {seller?.phone || ad?.contact ? (
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <Phone className="w-4 h-4" />
                          <span>{seller?.phone || ad.contact}</span>
                        </div>
                      ) : null}
                      {seller?.email && (
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <Mail className="w-4 h-4" />
                          <span>{seller.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleContact}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>Message</span>
                    </button>
                    {(seller?.phone || ad?.contact) && (
                      <button
                        onClick={handleCall}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Phone className="w-5 h-5" />
                        <span>Call</span>
                      </button>
                    )}
                    <Link
                      href={`/seller/${seller?.id || ad.userId || ad.user?.id}`}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <User className="w-5 h-5" />
                      <span>Profile</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{ad.title}</h1>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                  {formatPrice(ad.price)}
                </p>
                {ad.negotiable && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">Price is negotiable</span>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <MapPin className="w-5 h-5" />
                  <span>{ad.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <span className="text-sm">Category:</span>
                  <span className="font-medium">{ad.category}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <span className="text-sm">Condition:</span>
                  <span className="font-medium">{ad.condition}</span>
                </div>
                {ad.views !== undefined && (
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <Eye className="w-5 h-5" />
                    <span>{ad.views} views</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2 mb-4">
                <button
                  onClick={handleFavorite}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border transition-colors ${
                    isFavorite
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  <span>{isFavorite ? 'Saved' : 'Save'}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
              </div>

              <button
                onClick={handleContact}
                className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
              >
                Contact Seller
              </button>
            </div>

            {/* Swap Request Button */}
            {isAuthenticated && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <button
                  onClick={handleSwapClick}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <ArrowLeftRight className="w-5 h-5" />
                  <span>Request Swap</span>
                </button>
              </div>
            )}

            {/* Report Ad */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    const currentUrl = `/ads/${params.id}`;
                    localStorage.setItem('redirectAfterLogin', currentUrl);
                    router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
                    return;
                  }
                  setShowReportModal(true);
                }}
                className="w-full text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                Report this ad
              </button>
            </div>
          </div>
        </div>

        {/* Swap Request Modal */}
        {showSwapModal && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-t-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Swap Request</h2>
                <button
                  onClick={() => {
                    setShowSwapModal(false);
                    setSelectedAdId(null);
                    setSwapMessage('');
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Select your ad to swap with this one
                </p>

                {loadingMyAds ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading your ads...</p>
                  </div>
                ) : myAds.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">You don't have any active ads</p>
                    <Link
                      href="/post-ad"
                      className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      Post an Ad
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                      {myAds.map((myAd: any) => (
                        <button
                          key={myAd.id}
                          onClick={() => setSelectedAdId(myAd.id)}
                          className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                            selectedAdId === myAd.id
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            {myAd.imageUrl && (
                              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                  src={getImageUrl(myAd.imageUrl)}
                                  alt={myAd.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                {myAd.title}
                              </h3>
                              <p className="text-primary-600 dark:text-primary-400 font-bold">
                                {formatPrice(myAd.price)}
                              </p>
                            </div>
                            {selectedAdId === myAd.id && (
                              <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                                <div className="w-3 h-3 rounded-full bg-white"></div>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Message (Optional)
                      </label>
                      <textarea
                        value={swapMessage}
                        onChange={(e) => setSwapMessage(e.target.value)}
                        placeholder="Add a message for the seller..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex space-x-3">
                <button
                  onClick={() => {
                    setShowSwapModal(false);
                    setSelectedAdId(null);
                    setSwapMessage('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitSwap}
                  disabled={!selectedAdId || submittingSwap || myAds.length === 0}
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingSwap ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </div>
          </div>
          )}

          {/* Report Modal */}
          {showReportModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Report Listing</h2>
                    <button
                      onClick={() => {
                        setShowReportModal(false);
                        setReportReason('');
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Please provide a reason for reporting this ad.
                  </p>
                </div>

                <div className="p-6">
                  <label htmlFor="reportReason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason
                  </label>
                  <textarea
                    id="reportReason"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Enter your reason for reporting this ad..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex space-x-3">
                  <button
                    onClick={() => {
                      setShowReportModal(false);
                      setReportReason('');
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReport}
                    disabled={!reportReason.trim() || submittingReport}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {submittingReport ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit Report</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
      </main>
      <Footer />
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { usersApi, adsApi, sellerRatingApi, getImageUrl } from '@/lib/api';
import { Shield, Star, MapPin, Package, MessageCircle, Phone, Mail, TrendingUp, User } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Seller {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  verificationTier?: string;
  createdAt?: string;
  adsCount?: number;
  averageRating?: number;
  totalRatings?: number;
  kycStatus?: string;
}

interface Rating {
  rating: number;
  review?: string;
  createdAt: string;
  user: {
    name: string;
  };
}

export default function SellerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sellerRes, adsRes, ratingsRes] = await Promise.all([
          usersApi.getById(params.id as string),
          adsApi.getAll(), // Filter by seller in frontend
          sellerRatingApi.getRatings(params.id as string).catch(() => ({ data: [] })),
        ]);

        const sellerData = sellerRes.data;
        setSeller(sellerData);
        // Filter ads by seller - check multiple possible userId fields
        const sellerAds = (adsRes.data || []).filter((ad: any) => {
          const adUserId = ad.userId || ad.user?.id || ad.UserId;
          return adUserId && adUserId.toString().toLowerCase() === (params.id as string).toLowerCase();
        });
        setAds(sellerAds);
        
        const sellerRatings = ratingsRes.data || [];
        setRatings(sellerRatings);
        
        if (sellerRatings.length > 0) {
          const avg = sellerRatings.reduce((sum: number, r: Rating) => sum + r.rating, 0) / sellerRatings.length;
          setAverageRating(avg);
        }
      } catch (error) {
        toast.error('Failed to load seller details');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!seller) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Seller Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {seller.profileImage ? (
              <Image
                src={getImageUrl(seller.profileImage)}
                alt={seller.name}
                width={120}
                height={120}
                className="rounded-full"
              />
            ) : (
              <div className="w-30 h-30 rounded-full bg-primary-500 flex items-center justify-center">
                <span className="text-white text-4xl font-medium">
                  {seller.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {seller.name}
                </h1>
                {seller.verificationTier && (
                  <div className="flex items-center space-x-1 px-3 py-1 bg-green-100 dark:bg-green-900 rounded-full">
                    <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {seller.verificationTier}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {(seller.averageRating || averageRating).toFixed(1)}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    ({seller.totalRatings || ratings.length} {(seller.totalRatings || ratings.length) === 1 ? 'rating' : 'ratings'})
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                  <Package className="w-5 h-5" />
                  <span>{seller.adsCount || ads.length} {(seller.adsCount || ads.length) === 1 ? 'ad' : 'ads'}</span>
                </div>
                {seller.createdAt && (
                  <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                    <TrendingUp className="w-5 h-5" />
                    <span>Member since {new Date(seller.createdAt).getFullYear()}</span>
                  </div>
                )}
                {seller.kycStatus === 'Approved' && (
                  <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                    <Shield className="w-5 h-5" />
                    <span className="text-sm font-semibold">KYC Verified</span>
                  </div>
                )}
              </div>
              <div className="flex space-x-3">
                <Link
                  href={`/messages?user=${seller.id}`}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Send Message</span>
                </Link>
                {seller.phone && (
                  <a
                    href={`tel:${seller.phone}`}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Call</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ratings Section */}
        {ratings.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Customer Reviews
            </h2>
            <div className="space-y-4">
              {ratings.map((rating, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {rating.user.name}
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= rating.rating
                                ? 'text-yellow-500 fill-current'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {rating.review && (
                    <p className="text-gray-600 dark:text-gray-400 mt-2">{rating.review}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seller's Ads */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {seller.name}'s Listings ({ads.length})
          </h2>
          {ads.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No ads posted yet
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {ads.map((ad) => (
                <Link
                  key={ad.id}
                  href={`/ads/${ad.id}`}
                  className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden card-hover group"
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
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {ad.title}
                    </h3>
                    <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                      {new Intl.NumberFormat('en-PK', {
                        style: 'currency',
                        currency: 'PKR',
                        maximumFractionDigits: 0,
                      }).format(ad.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}



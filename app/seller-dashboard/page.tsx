'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/lib/store/authStore';
import { adsApi, adAnalyticsApi } from '@/lib/api';
import { TrendingUp, Eye, MessageCircle, Star, Package, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface AdStats {
  id: number;
  title: string;
  views: number;
  clicks: number;
  saves: number;
  messages: number;
}

export default function SellerDashboardPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [ads, setAds] = useState<any[]>([]);
  const [adStats, setAdStats] = useState<AdStats[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalViews: 0,
    totalClicks: 0,
    totalSaves: 0,
    totalMessages: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const adsResponse = await adsApi.getMyAds();
        setAds(adsResponse.data || []);

        // Fetch analytics for each ad
        const statsPromises = (adsResponse.data || []).map(async (ad: any) => {
          try {
            const analyticsResponse = await adAnalyticsApi.getAnalytics(ad.id);
            return {
              id: ad.id,
              title: ad.title,
              ...analyticsResponse.data,
            };
          } catch (error) {
            return {
              id: ad.id,
              title: ad.title,
              views: 0,
              clicks: 0,
              saves: 0,
              messages: 0,
            };
          }
        });

        const stats = await Promise.all(statsPromises);
        setAdStats(stats);

        // Calculate overall stats
        const overall = stats.reduce(
          (acc, stat) => ({
            totalViews: acc.totalViews + (stat.views || 0),
            totalClicks: acc.totalClicks + (stat.clicks || 0),
            totalSaves: acc.totalSaves + (stat.saves || 0),
            totalMessages: acc.totalMessages + (stat.messages || 0),
            averageRating: acc.averageRating,
          }),
          { totalViews: 0, totalClicks: 0, totalSaves: 0, totalMessages: 0, averageRating: 0 }
        );
        setOverallStats(overall);
      } catch (error) {
        console.error('Failed to load seller dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, router]);

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
            Seller Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your performance and optimize your listings
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {overallStats.totalViews.toLocaleString()}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Clicks</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {overallStats.totalClicks.toLocaleString()}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Saves</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {overallStats.totalSaves.toLocaleString()}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <MessageCircle className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Messages</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {overallStats.totalMessages.toLocaleString()}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {overallStats.averageRating.toFixed(1)}
            </p>
          </div>
        </div>

        {/* Ad Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Ad Performance
          </h2>

          {adStats.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No ads to analyze</p>
              <Link
                href="/post-ad"
                className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
              >
                <span>Post Your First Ad</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      Ad Title
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      Views
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      Clicks
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      Saves
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      Messages
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {adStats.map((stat) => (
                    <tr
                      key={stat.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="py-3 px-4">
                        <Link
                          href={`/ads/${stat.id}`}
                          className="font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                        >
                          {stat.title}
                        </Link>
                      </td>
                      <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">
                        {stat.views?.toLocaleString() || 0}
                      </td>
                      <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">
                        {stat.clicks?.toLocaleString() || 0}
                      </td>
                      <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">
                        {stat.saves?.toLocaleString() || 0}
                      </td>
                      <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">
                        {stat.messages?.toLocaleString() || 0}
                      </td>
                      <td className="text-right py-3 px-4">
                        <Link
                          href={`/ads/${stat.id}/analytics`}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}





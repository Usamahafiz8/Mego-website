'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '../../../../components/layout/Header';
import { Footer } from '../../../../components/layout/Footer';
import { adAnalyticsApi, adHistoryApi, adQualityApi, adsApi, getImageUrl } from '../../../../lib/api';
import { Eye, MousePointerClick, Heart, Share2, TrendingUp, Clock, Star, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface Analytics {
  views: number;
  clicks: number;
  saves: number;
  shares: number;
  messages: number;
}

interface HistoryItem {
  action: string;
  timestamp: string;
  changes?: any;
}

export default function AdAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const [ad, setAd] = useState<any>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [qualityScore, setQualityScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [adRes, analyticsRes, historyRes, qualityRes] = await Promise.all([
          adsApi.getById(Number(params.id)),
          adAnalyticsApi.getAnalytics(Number(params.id)),
          adHistoryApi.getHistory(Number(params.id)),
          adQualityApi.getScore(Number(params.id)),
        ]);

        setAd(adRes.data);
        setAnalytics(analyticsRes.data);
        setHistory(historyRes.data || []);
        setQualityScore(qualityRes.data?.score || null);
      } catch (error) {
        toast.error('Failed to load analytics');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id, router]);

  const metrics = [
    { icon: Eye, label: 'Views', value: analytics?.views || 0, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900' },
    { icon: MousePointerClick, label: 'Clicks', value: analytics?.clicks || 0, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900' },
    { icon: Heart, label: 'Saves', value: analytics?.saves || 0, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900' },
    { icon: Share2, label: 'Shares', value: analytics?.shares || 0, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900' },
  ];

  if (loading) {
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
          <button
            onClick={() => router.back()}
            className="mb-4 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Ad Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track performance and engagement for your ad
          </p>
        </div>

        {/* Ad Preview */}
        {ad && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="relative w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                {ad.imageUrl ? (
                  <Image
                    src={getImageUrl(ad.imageUrl)}
                    alt={ad.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {ad.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {ad.category} • {ad.location}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quality Score */}
        {qualityScore !== null && (
          <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Ad Quality Score</p>
                <p className="text-4xl font-bold">{qualityScore}/100</p>
                <p className="text-sm opacity-75 mt-2">
                  {qualityScore >= 80 ? 'Excellent' : qualityScore >= 60 ? 'Good' : qualityScore >= 40 ? 'Fair' : 'Needs Improvement'}
                </p>
              </div>
              <Star className="w-16 h-16 opacity-50" />
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 card-hover"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${metric.bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{metric.label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {metric.value.toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>

        {/* Performance Chart Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <BarChart3 className="w-6 h-6 mr-2" />
              Performance Over Time
            </h2>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">Chart visualization coming soon</p>
          </div>
        </div>

        {/* Ad History */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Clock className="w-6 h-6 mr-2" />
            Ad History
          </h2>
          {history.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">No history available</p>
          ) : (
            <div className="space-y-4">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white capitalize">
                      {item.action}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}





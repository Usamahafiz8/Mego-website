'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/lib/store/authStore';
import { walletApi, loyaltyApi } from '@/lib/api';
import { Wallet, Coins, ArrowUp, ArrowDown, ArrowRight, Sparkles, CheckCircle, DollarSign, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface Withdrawal {
  id: string;
  amount: number;
  method: string;
  createdAt: string;
  date?: string;
}

export default function WalletPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [points, setPoints] = useState({ total: 0, available: 0 });
  const [recentWithdrawals, setRecentWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [featureIndex, setFeatureIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const rate = 0.1; // 1 Point = PKR 0.10
  const balancePKR = (points.available * rate).toFixed(2);
  const minWithdrawPoints = 500;
  const minWithdrawPKR = (minWithdrawPoints * rate).toFixed(2);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchData();
    
    // Auto-refresh every 2 minutes (reduced frequency for better performance)
    const interval = setInterval(() => {
      fetchData();
    }, 120000);

    return () => clearInterval(interval);
  }, [isAuthenticated, router]);

  // Auto-scroll recent withdrawals carousel
  useEffect(() => {
    if (recentWithdrawals.length === 0) return;
    const interval = setInterval(() => {
      const nextIndex = (featureIndex + 1) % recentWithdrawals.length;
      setFeatureIndex(nextIndex);
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          left: nextIndex * 180,
          behavior: 'smooth',
        });
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [recentWithdrawals, featureIndex]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pointsRes, withdrawalsRes] = await Promise.all([
        loyaltyApi.getPoints(),
        walletApi.getRecentWithdrawals().catch(() => ({ data: { withdrawals: [] } })),
      ]);

      setPoints({
        total: pointsRes.data?.total || 0,
        available: pointsRes.data?.available || pointsRes.data?.availablePoints || 0,
      });

      setRecentWithdrawals(withdrawalsRes.data?.withdrawals || withdrawalsRes.data || []);
    } catch (error) {
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (method: string) => {
    if (points.available < minWithdrawPoints) {
      toast.error(`You must have at least ${minWithdrawPoints} points (PKR ${minWithdrawPKR}) to withdraw.`);
      return;
    }

    if (!confirm(`Withdraw PKR ${balancePKR} via ${method}?`)) return;

    try {
      setWithdrawing(true);
      await walletApi.requestWithdraw({ method, amount: balancePKR });
      toast.success('Your withdrawal request has been submitted!');
      await fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send withdrawal request');
    } finally {
      setWithdrawing(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
        {/* Header Card with Points */}
        <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg p-8 mb-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">My Wallet</h1>
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-semibold">Pro Member</span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm opacity-90 mb-2">Total Points</p>
              <p className="text-6xl font-black tracking-tight">{points.total.toLocaleString()}</p>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-lg">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-semibold">{points.available.toLocaleString()} available</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-lg">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-semibold">PKR {balancePKR}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Withdrawals */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Withdrawals</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Latest payout history</p>
            </div>
            <button
              onClick={fetchData}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {recentWithdrawals.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-gray-600 dark:text-gray-400 text-center">No recent withdrawals yet.</p>
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {recentWithdrawals.map((withdrawal, index) => (
                <div
                  key={withdrawal.id || index}
                  className="flex-shrink-0 w-40 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 shadow-md"
                >
                  <p className="text-xl font-black text-yellow-600 dark:text-yellow-500 mb-2">
                    PKR {withdrawal.amount?.toLocaleString() || '0'}
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white mb-1">
                    {withdrawal.method || 'Wallet'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {formatDate(withdrawal.createdAt || withdrawal.date)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Withdraw Methods */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Withdraw via</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Choose your payout method</p>
          </div>

          <div className="space-y-4 mb-6">
            <button
              onClick={() => handleWithdraw('JazzCash')}
              disabled={withdrawing || points.available < minWithdrawPoints}
              className="w-full flex items-center space-x-4 p-5 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all bg-gray-50 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <Wallet className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">JazzCash</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Instant wallet payout</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={() => handleWithdraw('Easypaisa')}
              disabled={withdrawing || points.available < minWithdrawPoints}
              className="w-full flex items-center space-x-4 p-5 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition-all bg-gray-50 dark:bg-gray-900 hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                <Wallet className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Easypaisa</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Trusted by millions</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <button
            onClick={() => handleWithdraw('JazzCash')}
            disabled={withdrawing || points.available < minWithdrawPoints}
            className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white rounded-lg font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {withdrawing ? 'Processing...' : 'Withdraw Now'}
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p className="flex items-center space-x-2">
              <span className="font-semibold">•</span>
              <span>Minimum withdrawal: PKR {minWithdrawPKR} ({minWithdrawPoints} points)</span>
            </p>
            <p className="flex items-center space-x-2">
              <span className="font-semibold">•</span>
              <span>Processing time: 24 hours</span>
            </p>
            <p className="flex items-center space-x-2">
              <span className="font-semibold">•</span>
              <span>1 Point = PKR {rate.toFixed(2)}</span>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

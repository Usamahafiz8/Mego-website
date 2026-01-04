'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/lib/store/authStore';
import { loyaltyApi, pointsExchangeApi } from '@/lib/api';
import { Gift, Coins, Trophy, Users, Zap, Star, ArrowRight, RefreshCw, RotateCw, List, Share2, Wallet, CheckCircle, DollarSign, Copy } from 'lucide-react';
import Link from 'next/link';
import { PointsExchangeModal } from '@/components/loyalty/PointsExchangeModal';
import toast from 'react-hot-toast';

export default function LoyaltyPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [points, setPoints] = useState({ total: 0, available: 0 });
  const [tasks, setTasks] = useState<any[]>([]);
  const [referralCode, setReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState({ total: 0, earned: 0 });
  const [loading, setLoading] = useState(true);
  const [showExchangeModal, setShowExchangeModal] = useState(false);

  const rate = 0.1; // 1 Point = PKR 0.10
  const balancePKR = (points.available * rate).toFixed(2);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchData();
    
    // Auto-refresh points every 2 minutes
    const interval = setInterval(() => {
      refreshPoints();
    }, 120000);

    return () => clearInterval(interval);
  }, [isAuthenticated, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pointsRes, tasksRes, referralRes, statsRes] = await Promise.all([
        loyaltyApi.getPoints(),
        loyaltyApi.getTasks(),
        loyaltyApi.getReferralCode().catch(async () => {
          // Try to generate if doesn't exist
          try {
            const genRes = await loyaltyApi.generateReferralCode();
            return { data: { code: genRes.data?.referralCode || '' } };
          } catch {
            return { data: { code: '' } };
          }
        }),
        loyaltyApi.getReferralStats().catch(() => ({ data: { total: 0, earned: 0 } })),
      ]);

      setPoints({
        total: pointsRes.data?.total || 0,
        available: pointsRes.data?.available || pointsRes.data?.availablePoints || 0,
      });
      setTasks(tasksRes.data || []);
      setReferralCode(referralRes.data?.code || '');
      setReferralStats(statsRes.data || { total: 0, earned: 0 });
    } catch (error) {
      console.error('Failed to load loyalty data:', error);
      toast.error('Failed to load loyalty data');
    } finally {
      setLoading(false);
    }
  };

  const handleSpin = async () => {
    try {
      const response = await loyaltyApi.spin();
      toast.success(`You won ${response.data.value} ${response.data.prize}!`);
      await refreshPoints();
      await fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to spin');
    }
  };

  const refreshPoints = async () => {
    try {
      const pointsRes = await loyaltyApi.getPoints();
      setPoints({
        total: pointsRes.data?.total || 0,
        available: pointsRes.data?.available || pointsRes.data?.availablePoints || 0,
      });
    } catch (error) {
      // Ignore errors
    }
  };

  const handleExchangeSuccess = async () => {
    await refreshPoints();
  };

  const handleCopyReferral = () => {
    if (!referralCode) {
      toast.error('Referral code not available');
      return;
    }
    navigator.clipboard.writeText(`${window.location.origin}/register?ref=${referralCode}`);
    toast.success('Referral link copied!');
  };

  const handleCopyCode = () => {
    if (!referralCode) {
      toast.error('Referral code not available');
      return;
    }
    navigator.clipboard.writeText(referralCode);
    toast.success('Referral code copied!');
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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                🎁 Loyalty & Rewards Center
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Earn points, get rewards, and unlock amazing benefits
              </p>
            </div>
            <button
              onClick={async () => {
                await fetchData();
                toast.success('Data refreshed!');
              }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Points Summary Card */}
        <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl p-8 mb-8 text-white shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Trophy className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Your Points Balance</h2>
            </div>
          </div>
          <p className="text-7xl font-black tracking-tight mb-6">{points.total.toLocaleString()}</p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-semibold">{points.available.toLocaleString()} available</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <DollarSign className="w-5 h-5" />
              <span className="text-sm font-semibold">≈ PKR {balancePKR}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/loyalty#spin"
            className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all shadow-md hover:shadow-lg group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <RotateCw className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-center mb-1">Spin Wheel</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Daily rewards</p>
          </Link>

          <Link
            href="/daily-tasks"
            className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition-all shadow-md hover:shadow-lg group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <List className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-center mb-1">Daily Tasks</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Earn bonus points</p>
          </Link>

          <Link
            href="/referral-center"
            className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-md hover:shadow-lg group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Share2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-center mb-1">Referral Center</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Invite & earn</p>
          </Link>

          <Link
            href="/wallet"
            className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all shadow-md hover:shadow-lg group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-center mb-1">My Wallet</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Withdraw points</p>
          </Link>
        </div>

        {/* Spin Wheel Section */}
        <div id="spin" className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 mb-8 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Daily Spin Wheel
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Spin once daily to win amazing rewards!
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <button
              onClick={handleSpin}
              className="relative w-72 h-72 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl hover:scale-105 transition-transform shadow-2xl active:scale-95"
            >
              <div className="absolute inset-0 rounded-full border-8 border-white/30"></div>
              <div className="relative z-10 text-center">
                <Zap className="w-16 h-16 mx-auto mb-3" />
                <span className="text-2xl">SPIN NOW</span>
              </div>
            </button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Tasks Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Daily Tasks</h2>
              <Link
                href="/daily-tasks"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold text-sm flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 text-center py-4">No tasks available</p>
              ) : (
                tasks.slice(0, 3).map((task, index) => (
                  <div
                    key={task.taskType || index}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      task.completed
                        ? 'bg-green-50 dark:bg-green-900/20'
                        : 'bg-gray-50 dark:bg-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        task.completed
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : 'bg-primary-100 dark:bg-primary-900/30'
                      }`}>
                        {task.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <Star className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                          {task.title || task.name}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{task.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                        +{task.points}
                      </span>
                      {task.completed && (
                        <div className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Done</div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Referral Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Referral Program</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">Referrals</span>
                </div>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {referralStats.total}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">Points</span>
                </div>
                <p className="text-2xl font-bold text-yellow-600">{referralStats.earned}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Referral Code
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={referralCode || 'Loading...'}
                  readOnly
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-lg font-bold"
                  placeholder="Loading referral code..."
                />
                <button
                  onClick={handleCopyCode}
                  disabled={!referralCode}
                  className="px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  title="Copy Code"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={handleCopyReferral}
                disabled={!referralCode}
                className="mt-3 w-full px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Copy Referral Link</span>
              </button>
              <Link
                href="/referral-center"
                className="mt-3 block text-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-semibold"
              >
                View Referral Center →
              </Link>
            </div>
          </div>
        </div>

        {/* Redeem Points Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Redeem Your Points
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/wallet')}
              className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 transition-all text-left group"
            >
              <Gift className="w-10 h-10 text-primary-600 dark:text-primary-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Mobile Recharge</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Exchange points for mobile packages</p>
              <span className="text-primary-600 dark:text-primary-400 text-sm font-semibold flex items-center space-x-1">
                <span>View Options</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>
            
            <button
              onClick={() => setShowExchangeModal(true)}
              className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-yellow-500 dark:hover:border-yellow-500 transition-all text-left group"
            >
              <Coins className="w-10 h-10 text-yellow-600 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">MEGO Coins</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Convert points to coins</p>
              <span className="text-primary-600 dark:text-primary-400 text-sm font-semibold flex items-center space-x-1">
                <span>Exchange Now</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>
            
            <button
              onClick={() => router.push('/my-ads')}
              className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 transition-all text-left group"
            >
              <Zap className="w-10 h-10 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Ad Boosts</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Boost your ads with points</p>
              <span className="text-primary-600 dark:text-primary-400 text-sm font-semibold flex items-center space-x-1">
                <span>Boost Now</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          </div>
        </div>
      </main>
      <Footer />
      
      <PointsExchangeModal
        isOpen={showExchangeModal}
        onClose={() => setShowExchangeModal(false)}
        currentPoints={points.available}
        onExchangeSuccess={handleExchangeSuccess}
      />
    </div>
  );
}

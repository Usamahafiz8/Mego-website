'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/lib/store/authStore';
import { loyaltyApi } from '@/lib/api';
import { Users, Gift, Copy, Share2, Trophy, TrendingUp, CheckCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReferralCenterPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [referralCode, setReferralCode] = useState('');
  const [redeemCode, setRedeemCode] = useState('');
  const [referralStats, setReferralStats] = useState({ total: 0, earned: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [codeRes, statsRes] = await Promise.all([
          loyaltyApi.getReferralCode().catch(async () => {
            // If no code exists, generate one
            const genRes = await loyaltyApi.generateReferralCode();
            return { data: { code: genRes.data?.referralCode || '' } };
          }),
          loyaltyApi.getReferralStats(),
        ]);

        setReferralCode(codeRes.data?.code || '');
        setReferralStats(statsRes.data || { total: 0, earned: 0, pending: 0 });
      } catch (error) {
        // Try to generate if fetch fails
        try {
          const genRes = await loyaltyApi.generateReferralCode();
          setReferralCode(genRes.data?.referralCode || '');
        } catch (genError) {
          toast.error('Failed to load referral data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Auto-refresh stats every 2 minutes (reduced frequency for better performance)
    const interval = setInterval(async () => {
      try {
        const statsRes = await loyaltyApi.getReferralStats();
        setReferralStats(statsRes.data || { total: 0, earned: 0, pending: 0 });
      } catch (error) {
        // Ignore errors
      }
    }, 120000);

    return () => clearInterval(interval);
  }, [isAuthenticated, router]);

  const handleCopyCode = () => {
    if (!referralCode) {
      toast.error('Referral code not available. Please wait...');
      return;
    }
    navigator.clipboard.writeText(referralCode);
    toast.success('Referral code copied!');
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const [codeRes, statsRes] = await Promise.all([
        loyaltyApi.getReferralCode(),
        loyaltyApi.getReferralStats(),
      ]);
      setReferralCode(codeRes.data?.code || '');
      setReferralStats(statsRes.data || { total: 0, earned: 0, pending: 0 });
      toast.success('Refreshed!');
    } catch (error) {
      toast.error('Failed to refresh');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!referralCode) {
      toast.error('Referral code not available. Please wait...');
      return;
    }
    
    const shareUrl = `${window.location.origin}/register?ref=${referralCode}`;
    const shareText = `Join MEGO using my referral code: ${referralCode}\n\nGet amazing deals and earn rewards!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join MEGO',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast.success('Referral link copied to clipboard!');
    }
  };

  const handleRedeem = async () => {
    if (!redeemCode.trim()) {
      toast.error('Please enter a referral code');
      return;
    }

    try {
      const response = await loyaltyApi.redeemReferralCode(redeemCode.trim());
      toast.success(response.data?.message || 'Referral code redeemed successfully!');
      setRedeemCode('');
      // Refresh stats
      const statsRes = await loyaltyApi.getReferralStats();
      setReferralStats(statsRes.data || { total: 0, earned: 0, pending: 0 });
      // Refresh points
      const pointsRes = await loyaltyApi.getPoints();
      // Trigger page refresh to show updated points
      window.location.reload();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid referral code');
    }
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                <Users className="w-8 h-8 mr-3" />
                Referral Center
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Invite friends and earn rewards together
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Referrals</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {referralStats.total}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Points Earned</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {referralStats.earned}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {referralStats.pending}
            </p>
          </div>
        </div>

        {/* Your Referral Code */}
        <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Gift className="w-6 h-6 mr-2" />
            Your Referral Code
          </h2>
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-lg px-6 py-4">
              <p className="text-sm opacity-90 mb-1">Share this code with friends</p>
              <p className="text-3xl font-bold font-mono">{referralCode || 'Loading...'}</p>
            </div>
            <button
              onClick={handleCopyCode}
              disabled={!referralCode}
              className="px-6 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Copy className="w-5 h-5" />
              <span>Copy</span>
            </button>
            <button
              onClick={handleShare}
              disabled={!referralCode}
              className="px-6 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-sm">
              <strong>How it works:</strong> Share your code with friends. When they sign up and post their first ad, you both earn points!
            </p>
          </div>
        </div>

        {/* Redeem Referral Code */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Redeem Referral Code
          </h2>
          <div className="flex space-x-4">
            <input
              type="text"
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
              placeholder="Enter referral code"
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={handleRedeem}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Redeem</span>
            </button>
          </div>
        </div>

        {/* Referral Benefits */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Referral Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0">
                <Gift className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">For You</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Earn points when your friends sign up and post their first ad
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">For Friends</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your friends get bonus points when they join using your code
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}


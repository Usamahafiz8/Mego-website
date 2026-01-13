'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/lib/store/authStore';
import { authApi, getImageUrl } from '@/lib/api';
import {
  User, Heart, Wallet, Gift, TrendingUp, Eye, ArrowLeftRight,
  FileText, MapPin, Settings, HelpCircle, Shield, Camera,
  Mail, Phone, LogOut, ChevronRight, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface UserData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  verificationTier?: string;
  kycInfo?: {
    status?: string;
  };
  createdAt?: string;
}

const menuItems = (user: UserData | null) => [
  { id: 1, title: 'My Ads', icon: 'albums', route: '/my-ads', color: 'text-blue-600 dark:text-blue-400' },
  { id: 2, title: 'Favorites', icon: 'heart', route: '/favorites', color: 'text-red-600 dark:text-red-400' },
  { id: 3, title: 'Wallet', icon: 'wallet', route: '/wallet', color: 'text-green-600 dark:text-green-400' },
  { id: 4, title: 'Loyalty & Rewards', icon: 'gift', route: '/loyalty', color: 'text-purple-600 dark:text-purple-400' },
  { id: 5, title: 'Seller Dashboard', icon: 'trending-up', route: '/seller-dashboard', color: 'text-orange-600 dark:text-orange-400' },
  { id: 6, title: 'Recently Viewed', icon: 'eye', route: '/recently-viewed', color: 'text-indigo-600 dark:text-indigo-400' },
  { id: 7, title: 'Swap Requests', icon: 'arrow-left-right', route: '/swap-requests', color: 'text-pink-600 dark:text-pink-400' },
  { id: 8, title: 'Buyer Requests', icon: 'file-text', route: '/buyer-requests', color: 'text-cyan-600 dark:text-cyan-400' },
  { id: 9, title: 'Neighborhood Feed', icon: 'map-pin', route: '/neighborhood', color: 'text-teal-600 dark:text-teal-400' },
  { id: 10, title: 'Settings', icon: 'settings', route: '/settings', color: 'text-gray-600 dark:text-gray-400' },
  { id: 11, title: 'Help & Support', icon: 'help-circle', route: '/help', color: 'text-yellow-600 dark:text-yellow-400' },
  {
    id: 12,
    title: user?.kycInfo?.status === 'Approved' ? 'KYC Verified' : 'Verify Identity (KYC)',
    icon: 'shield',
    route: '/kyc',
    color: user?.kycInfo?.status === 'Approved' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
    badge: user?.kycInfo?.status === 'Approved' ? 'Verified' : undefined,
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, isAuthenticated, logout } = useAuthStore();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Removed authentication redirect - page accessible without login
    // if (!isAuthenticated) {
    //   router.push('/login');
    //   return;
    // }

    if (isAuthenticated) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchUser = async () => {
    try {
      const response = await authApi.getProfile();
      setUser(response.data);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUpdating(true);
      const formData = new FormData();
      formData.append('Image', file);

      const response = await authApi.updateProfile(formData);
      setUser((prev) => {
        if (!prev) return null;
        return { ...prev, profileImage: response.data.profileImage };
      });
      toast.success('Profile picture updated!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile picture');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      router.push('/');
      toast.success('Logged out successfully');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const menus = menuItems(user || authUser);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header Card */}
        <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-600 rounded-2xl p-8 mb-8 text-white relative overflow-hidden animate-fadeInUp shadow-large">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-6">
            <div className="relative">
              <button
                onClick={handleImageClick}
                disabled={updating}
                className="relative group"
              >
                {user?.profileImage || authUser?.profileImage ? (
                  <div className="relative">
                    <Image
                      src={getImageUrl(user?.profileImage || authUser?.profileImage || '')}
                      alt={user?.name || authUser?.name || 'User'}
                      width={120}
                      height={120}
                      className="rounded-full border-4 border-white/30 object-cover"
                    />
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-30 h-30 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
                {updating && (
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                <Camera className="w-4 h-4 text-primary-600" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                <h1 className="text-3xl font-bold">
                  {user?.name || authUser?.name || 'User'}
                </h1>
                {user?.kycInfo?.status === 'Approved' && (
                  <div className="flex items-center space-x-1 px-3 py-1 bg-green-500/20 rounded-full border border-green-300/30">
                    <CheckCircle2 className="w-4 h-4 text-green-200" />
                    <span className="text-sm font-semibold text-green-100">Verified</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {user?.email && (
                  <div className="flex items-center justify-center md:justify-start space-x-2 text-white/90">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                )}
                {user?.phone && (
                  <div className="flex items-center justify-center md:justify-start space-x-2 text-white/90">
                    <Phone className="w-4 h-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user?.verificationTier && (
                  <div className="flex items-center justify-center md:justify-start space-x-2 text-white/90">
                    <Shield className="w-4 h-4" />
                    <span>{user.verificationTier} Tier</span>
                  </div>
                )}
                {user?.createdAt && (
                  <div className="text-sm text-white/70">
                    Member since {new Date(user.createdAt).getFullYear()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white dark:bg-gray-900/50 rounded-2xl border-2 border-gray-100 dark:border-gray-800 overflow-hidden mb-8 animate-fadeInUp shadow-soft" style={{ animationDelay: '100ms' }}>
          <div className="p-6 border-b-2 border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold text-primary-900 dark:text-white">Account</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Quick actions & modules</p>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {menus.map((item, index) => {
              const IconComponent = {
                albums: User,
                heart: Heart,
                wallet: Wallet,
                gift: Gift,
                'trending-up': TrendingUp,
                eye: Eye,
                'arrow-left-right': ArrowLeftRight,
                'file-text': FileText,
                'map-pin': MapPin,
                settings: Settings,
                'help-circle': HelpCircle,
                shield: Shield,
              }[item.icon] || User;

              return (
                <Link
                  key={item.id}
                  href={item.route}
                  className="flex items-center space-x-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 flex items-center justify-center ${item.color}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {item.title}
                      </span>
                      {item.badge && (
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded text-xs font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white rounded-xl transition-all font-bold shadow-glow hover:shadow-glow animate-fadeInUp" style={{ animationDelay: '200ms' }}
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </main>
      <Footer />
    </div>
  );
}


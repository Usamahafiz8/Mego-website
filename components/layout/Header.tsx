'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, Plus, User, Bell, Moon, Sun, Menu, X, LogOut, Settings, Wallet, Gift, Users, ArrowLeftRight, Star, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useThemeStore } from '@/lib/store/themeStore';
import { useState, useEffect } from 'react';
import { getImageUrl } from '@/lib/api';
import { useRouter } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { darkMode, toggleDarkMode } = useThemeStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before using theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
    setUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 shadow-soft" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group focus:outline-none" suppressHydrationWarning>
            <div className="relative h-10 w-[120px] flex items-center justify-center bg-white dark:bg-gray-900 rounded-lg px-3 py-1 group-hover:scale-105 transition-all duration-300">
              <Image
                src="/images/mego-logo.png"
                alt="MEGO Logo"
                width={120}
                height={40}
                className="h-full w-auto object-contain"
                priority
              />
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Search for anything..."
                className="w-full pl-12 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all shadow-soft hover:shadow-medium"
                onClick={() => router.push('/search')}
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Post Ad Button */}
            <Link
              href="/post-ad"
              className="hidden sm:flex items-center space-x-2 btn-primary text-white px-5 py-2.5 rounded-xl font-semibold shadow-medium hover:shadow-large"
            >
              <Plus className="w-4 h-4" />
              <span>Post Ad</span>
            </Link>

            {/* Theme Toggle - Night/Day Mode Button */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-110 active:scale-95"
              aria-label="Toggle dark mode"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              suppressHydrationWarning
            >
              {mounted ? (
                darkMode ? (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform duration-300" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform duration-300" />
                )
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform duration-300" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Link
                  href="/notifications"
                  className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-110 active:scale-95"
                >
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white dark:border-gray-900"></span>
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 ring-2 ring-transparent hover:ring-primary-500/20"
                  >
                    {mounted && user?.profileImage ? (
                      <img
                        src={getImageUrl(user.profileImage)}
                        alt={user?.name || 'User'}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-primary-500/20"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {mounted && user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10 animate-fadeIn"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-large border border-gray-200/50 dark:border-gray-700/50 py-2 z-20 backdrop-blur-md">
                        <Link
                          href="/profile"
                          className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all rounded-lg mx-2"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                          <span className="font-medium">My Profile</span>
                        </Link>
                        <Link
                          href="/dashboard"
                          className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <TrendingUp className="w-4 h-4" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          href="/wallet"
                          className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Wallet className="w-4 h-4" />
                          <span>Wallet</span>
                        </Link>
                        <Link
                          href="/loyalty"
                          className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Gift className="w-4 h-4" />
                          <span>Loyalty Center</span>
                        </Link>
                        <Link
                          href="/daily-tasks"
                          className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Star className="w-4 h-4" />
                          <span>Daily Tasks</span>
                        </Link>
                        <Link
                          href="/referral-center"
                          className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Users className="w-4 h-4" />
                          <span>Referral Center</span>
                        </Link>
                        <Link
                          href="/swap-requests"
                          className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <ArrowLeftRight className="w-4 h-4" />
                          <span>Swap Requests</span>
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </Link>
                        <hr className="my-2 border-gray-200 dark:border-gray-700" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-primary-600 dark:text-primary-400"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for anything..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all shadow-soft"
              onClick={() => router.push('/search')}
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 py-4 space-y-2">
            <Link
              href="/post-ad"
              className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Plus className="w-5 h-5" />
              <span>Post Ad</span>
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/loyalty"
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Gift className="w-5 h-5" />
                  <span>Loyalty Center</span>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}


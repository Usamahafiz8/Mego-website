'use client';

import Link from 'next/link';
import { Search, ArrowRight, Sparkles, Shield, Zap, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/search');
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-600 text-white py-24 md:py-32 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-400/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-6 animate-fadeIn border border-white/20">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-semibold">Pakistan's #1 Marketplace</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 animate-fadeInUp leading-tight">
            <span className="block">Buy • Sell •</span>
            <span className="block bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-100 bg-clip-text text-transparent animate-gradient">
              Connect
            </span>
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl mb-10 text-gray-100 max-w-4xl mx-auto font-medium animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            Trusted marketplace with <span className="font-bold text-yellow-200">verified sellers</span>, secure transactions, and <span className="font-bold text-yellow-200">instant rewards</span>
          </p>

          {/* Enhanced Search Bar */}
          <div className="max-w-3xl mx-auto mb-10 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <div className="relative group">
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl group-hover:bg-white/30 transition-all"></div>
              <div className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20">
                <div className="flex items-center">
                  <div className="flex-1 flex items-center px-6">
                    <Search className="w-6 h-6 text-gray-400 mr-3 group-focus-within:text-primary-600 transition-colors" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Search phones, cars, property, electronics..."
                      className="flex-1 py-5 text-gray-900 text-lg bg-transparent focus:outline-none placeholder-gray-400"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    className="m-2 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white px-8 py-5 rounded-xl font-semibold flex items-center space-x-2 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                  >
                    <span>Search</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            <Link
              href="/post-ad"
              className="group relative bg-white text-primary-600 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all shadow-2xl hover:shadow-3xl flex items-center space-x-3 hover:scale-105 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Zap className="w-6 h-6 relative z-10" />
              <span className="relative z-10">Post Ad in 60 Seconds</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/search"
              className="group bg-white/10 backdrop-blur-md border-2 border-white/30 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/20 hover:border-white/50 transition-all shadow-xl hover:shadow-2xl flex items-center space-x-3 hover:scale-105 active:scale-95"
            >
              <TrendingUp className="w-6 h-6" />
              <span>Browse 10,000+ Ads</span>
            </Link>
          </div>

          {/* Enhanced Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center space-x-3 px-5 py-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/15 transition-all group">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <Shield className="w-5 h-5 text-green-300 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">Verified Sellers</span>
            </div>
            <div className="flex items-center space-x-3 px-5 py-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/15 transition-all group">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50"></div>
              <Shield className="w-5 h-5 text-blue-300 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">Secure Payments</span>
            </div>
            <div className="flex items-center space-x-3 px-5 py-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/15 transition-all group">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50"></div>
              <Zap className="w-5 h-5 text-yellow-300 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">Instant Rewards</span>
            </div>
            <div className="flex items-center space-x-3 px-5 py-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/15 transition-all group">
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50"></div>
              <Sparkles className="w-5 h-5 text-purple-300 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">24/7 Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Particles Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
    </section>
  );
}



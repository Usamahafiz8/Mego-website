'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600">
        {/* Overlay Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '48px 48px'
          }} />
        </div>

        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center animate-fadeInUp">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-6 animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
            Pakistan&apos;s #1 Marketplace
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Buy, Sell, or Swap
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-accent-300">
              Anything, Anywhere
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
            Join thousands of buyers and sellers on Pakistan&apos;s most trusted marketplace platform
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-8">
            <div className="relative flex items-center bg-white dark:bg-black rounded-2xl shadow-luxury overflow-hidden border-2 border-transparent focus-within:border-accent-400 transition-all duration-300">
              <Search className="absolute left-5 w-6 h-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search for cars, mobiles, properties, and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-4 py-5 text-base md:text-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none"
              />
              <Button
                type="submit"
                variant="accent"
                size="lg"
                className="m-2 px-8"
                icon={<Search className="w-5 h-5" />}
              >
                Search
              </Button>
            </div>
          </form>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="accent"
              size="lg"
              onClick={() => router.push('/post-ad')}
              icon={<ArrowRight className="w-5 h-5" />}
              iconPosition="right"
              className="min-w-[200px]"
            >
              Post Your Ad Now
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => router.push('/dashboard')}
              className="min-w-[200px] bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/30"
            >
              Browse All Ads
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent-400/20 flex items-center justify-center">
                <span className="text-accent-400 font-bold">✓</span>
              </div>
              <span>Safe & Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent-400/20 flex items-center justify-center">
                <span className="text-accent-400 font-bold">✓</span>
              </div>
              <span>Verified Sellers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent-400/20 flex items-center justify-center">
                <span className="text-accent-400 font-bold">✓</span>
              </div>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-black to-transparent" />
    </section>
  );
}

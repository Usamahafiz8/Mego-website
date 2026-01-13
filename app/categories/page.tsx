'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CategoryCard } from '@/components/home/CategoryCard';
import Link from 'next/link';
import {
  CarFront, Building2, SmartphoneNfc, MonitorSmartphone, ShoppingBag, Gamepad2,
  Trophy, BookOpen, Armchair, Watch, Camera, Headset,
  Bike, Baby, PawPrint, Music, Palette, Wrench, Sprout, Dumbbell
} from 'lucide-react';

// Main categories with images (matching home page)
const mainCategories = [
  { name: 'Vehicles', icon: CarFront, image: '/images/categories/vehicles.png', count: 12000, color: 'from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900' },
  { name: 'Property', icon: Building2, image: '/images/categories/property.png', count: 8000, color: 'from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900' },
  { name: 'Mobiles', icon: SmartphoneNfc, image: '/images/categories/mobiles.png', count: 15000, color: 'from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900' },
  { name: 'Electronics', icon: MonitorSmartphone, image: '/images/categories/electronics.png', count: 10000, color: 'from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900' },
  { name: 'Fashion', icon: ShoppingBag, image: '/images/categories/fashion.png', count: 7000, color: 'from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900' },
  { name: 'Gaming', icon: Gamepad2, image: '/images/categories/gaming.png', count: 5000, color: 'from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900' },
  { name: 'Sports', icon: Trophy, image: '/images/categories/sports.png', count: 4000, color: 'from-red-50 to-red-100 dark:from-red-950 dark:to-red-900' },
  { name: 'Books', icon: BookOpen, image: '/images/categories/books.png', count: 3000, color: 'from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900' },
  { name: 'Furniture', icon: Armchair, image: '/images/categories/furniture.png', count: 6000, color: 'from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900' },
  { name: 'Watches', icon: Watch, image: '/images/categories/watches.png', count: 2000, color: 'from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900' },
  { name: 'Cameras', icon: Camera, image: '/images/categories/cameras.png', count: 3000, color: 'from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900' },
  { name: 'Audio', icon: Headset, image: '/images/categories/audio.png', count: 4000, color: 'from-lime-50 to-lime-100 dark:from-lime-950 dark:to-lime-900' },
];

// Additional categories with images
const additionalCategories = [
  { name: 'Motorcycles', icon: Bike, image: '/images/categories/motorcycles.png', count: 5000, color: 'from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800' },
  { name: 'Baby Items', icon: Baby, image: '/images/categories/baby-items.png', count: 2000, color: 'from-pink-100 to-pink-200 dark:from-pink-900 dark:to-pink-800' },
  { name: 'Pets', icon: PawPrint, image: '/images/categories/pets.png', count: 3000, color: 'from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800' },
  { name: 'Musical Instruments', icon: Music, image: '/images/categories/musical-instruments.png', count: 1000, color: 'from-violet-100 to-violet-200 dark:from-violet-900 dark:to-violet-800' },
  { name: 'Art & Collectibles', icon: Palette, image: '/images/categories/art-collectibles.png', count: 1000, color: 'from-rose-100 to-rose-200 dark:from-rose-900 dark:to-rose-800' },
  { name: 'Tools & Hardware', icon: Wrench, image: '/images/categories/tools-hardware.png', count: 4000, color: 'from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800' },
  { name: 'Garden & Outdoor', icon: Sprout, image: '/images/categories/garden-outdoor.png', count: 2000, color: 'from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800' },
  { name: 'Sports Equipment', icon: Dumbbell, image: '/images/categories/sports-equipment.png', count: 3000, color: 'from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800' },
];

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fadeInUp">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-900 dark:text-white mb-4">
            Browse All Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Find exactly what you&apos;re looking for across all categories
          </p>
        </div>

        {/* Main Categories with Images */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-8 flex items-center gap-3 animate-fadeInUp">
            <span className="w-2 h-8 bg-gradient-to-b from-primary-500 to-accent-400 rounded-full"></span>
            Popular Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {mainCategories.map((category, index) => (
              <div
                key={index}
                className="animate-fadeInUp"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CategoryCard
                  name={category.name}
                  icon={category.icon}
                  image={category.image}
                  count={category.count}
                  color={category.color}
                  href={`/search?category=${category.name}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Additional Categories */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-8 flex items-center gap-3 animate-fadeInUp">
            <span className="w-2 h-8 bg-gradient-to-b from-secondary-500 to-primary-400 rounded-full"></span>
            More Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
            {additionalCategories.map((category, index) => (
              <div
                key={index}
                className="animate-fadeInUp"
                style={{ animationDelay: `${(index + mainCategories.length) * 50}ms` }}
              >
                <CategoryCard
                  name={category.name}
                  icon={category.icon}
                  image={category.image}
                  count={category.count}
                  color={category.color}
                  href={`/search?category=${category.name}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="animate-fadeInUp" style={{ animationDelay: '600ms' }}>
          <div className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 rounded-3xl p-8 md:p-12 text-center">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-400/10 via-transparent to-secondary-400/10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-400/20 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Can&apos;t find what you&apos;re looking for?
              </h2>
              <p className="text-gray-300 mb-8 max-w-xl mx-auto">
                Post a buyer request and let sellers come to you! It&apos;s free and takes less than a minute.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/buyer-requests"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-accent-400 to-accent-500 hover:from-accent-500 hover:to-accent-600 text-black px-8 py-4 rounded-xl transition-all duration-300 font-bold shadow-glow-yellow hover:shadow-glow-yellow hover:-translate-y-1"
                >
                  <span>Post Buyer Request</span>
                </Link>
                <Link
                  href="/post-ad"
                  className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl transition-all duration-300 font-semibold border border-white/20"
                >
                  <span>Sell Something</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

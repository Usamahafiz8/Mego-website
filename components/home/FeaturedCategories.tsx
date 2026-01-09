'use client';

import {
  CarFront, Building2, SmartphoneNfc, MonitorSmartphone, ShoppingBag, Gamepad2,
  Trophy, BookOpen, Armchair, Watch, Camera, Headset
} from 'lucide-react';
import { CategoryCard } from './CategoryCard';

const categories = [
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

export function FeaturedCategories() {
  return (
    <section className="py-20 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fadeInUp">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-900 dark:text-white mb-4">
            Browse by Category
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Find exactly what you&apos;re looking for across all categories
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category, index) => (
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
    </section>
  );
}

'use client';

import Link from 'next/link';
import { 
  Car, Home, Smartphone, Laptop, Shirt, Gamepad2, 
  Dumbbell, Book, Sofa, Watch, Camera, Headphones 
} from 'lucide-react';

const categories = [
  { name: 'Vehicles', icon: Car, color: 'bg-blue-500', count: '12K+' },
  { name: 'Property', icon: Home, color: 'bg-green-500', count: '8K+' },
  { name: 'Mobiles', icon: Smartphone, color: 'bg-purple-500', count: '15K+' },
  { name: 'Electronics', icon: Laptop, color: 'bg-red-500', count: '10K+' },
  { name: 'Fashion', icon: Shirt, color: 'bg-pink-500', count: '7K+' },
  { name: 'Gaming', icon: Gamepad2, color: 'bg-yellow-500', count: '5K+' },
  { name: 'Sports', icon: Dumbbell, color: 'bg-orange-500', count: '4K+' },
  { name: 'Books', icon: Book, color: 'bg-indigo-500', count: '3K+' },
  { name: 'Furniture', icon: Sofa, color: 'bg-teal-500', count: '6K+' },
  { name: 'Watches', icon: Watch, color: 'bg-cyan-500', count: '2K+' },
  { name: 'Cameras', icon: Camera, color: 'bg-gray-500', count: '3K+' },
  { name: 'Audio', icon: Headphones, color: 'bg-rose-500', count: '4K+' },
];

export function FeaturedCategories() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Browse by Category
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Find exactly what you're looking for
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Link
                key={index}
                href={`/search?category=${category.name}`}
                className="group p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 card-hover text-center"
              >
                <div className={`${category.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {category.count} ads
                </p>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/categories"
            className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold"
          >
            View All Categories
            <span className="ml-2">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}





'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import { categoriesApi } from '@/lib/api';
import { 
  Car, Home, Smartphone, Laptop, Shirt, Gamepad2, 
  Dumbbell, Book, Sofa, Watch, Camera, Headphones,
  Bike, Baby, Pet, Music, Art, Tools, Garden, Sports,
  Package
} from 'lucide-react';

// Icon mapping for categories
const categoryIcons: Record<string, any> = {
  'Vehicles': Car,
  'Property': Home,
  'Mobiles': Smartphone,
  'Electronics': Laptop,
  'Fashion': Shirt,
  'Gaming': Gamepad2,
  'Sports': Dumbbell,
  'Books': Book,
  'Furniture': Sofa,
  'Watches': Watch,
  'Cameras': Camera,
  'Audio': Headphones,
  'Motorcycles': Bike,
  'Baby Items': Baby,
  'Pets': Pet,
  'Musical Instruments': Music,
  'Art & Collectibles': Art,
  'Tools & Hardware': Tools,
  'Garden & Outdoor': Garden,
  'Sports Equipment': Sports,
};

// Color mapping for categories
const categoryColors: Record<string, string> = {
  'Vehicles': 'bg-blue-500',
  'Property': 'bg-green-500',
  'Mobiles': 'bg-purple-500',
  'Electronics': 'bg-red-500',
  'Fashion': 'bg-pink-500',
  'Gaming': 'bg-yellow-500',
  'Sports': 'bg-orange-500',
  'Books': 'bg-indigo-500',
  'Furniture': 'bg-teal-500',
  'Watches': 'bg-cyan-500',
  'Cameras': 'bg-gray-500',
  'Audio': 'bg-rose-500',
  'Motorcycles': 'bg-blue-600',
  'Baby Items': 'bg-pink-400',
  'Pets': 'bg-amber-500',
  'Musical Instruments': 'bg-violet-500',
  'Art & Collectibles': 'bg-rose-400',
  'Tools & Hardware': 'bg-slate-500',
  'Garden & Outdoor': 'bg-emerald-500',
  'Sports Equipment': 'bg-orange-600',
};

interface Category {
  id: string;
  name: string;
  slug: string;
  adCount: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Fallback to empty array
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K+`;
    }
    return `${count}+`;
  };

  const getIcon = (name: string) => {
    return categoryIcons[name] || Package;
  };

  const getColor = (name: string) => {
    return categoryColors[name] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Browse All Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Find exactly what you're looking for
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No categories found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {categories.map((category) => {
              const Icon = getIcon(category.name);
              const color = getColor(category.name);
              return (
                <Link
                  key={category.id}
                  href={`/search?category=${encodeURIComponent(category.name)}`}
                  className="group p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 card-hover text-center transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  <div className={`${color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatCount(category.adCount)} ads
                  </p>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-12 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Can't find what you're looking for?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Post a buyer request and let sellers come to you!
          </p>
          <Link
            href="/buyer-requests"
            className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            <span>Post Buyer Request</span>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}





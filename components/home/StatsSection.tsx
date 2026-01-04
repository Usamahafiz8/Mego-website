'use client';

import { Users, Package, TrendingUp, Award } from 'lucide-react';

const stats = [
  { icon: Users, label: 'Active Users', value: '50K+', color: 'text-blue-500' },
  { icon: Package, label: 'Listings', value: '100K+', color: 'text-green-500' },
  { icon: TrendingUp, label: 'Daily Deals', value: '5K+', color: 'text-purple-500' },
  { icon: Award, label: 'Happy Customers', value: '45K+', color: 'text-yellow-500' },
];

export function StatsSection() {
  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="text-center p-6 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 card-hover"
              >
                <Icon className={`w-12 h-12 mx-auto mb-4 ${stat.color}`} />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}





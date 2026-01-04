'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/lib/store/authStore';
import { buyerRequestApi, getImageUrl } from '@/lib/api';
import { Plus, MapPin, Package, Users } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface BuyerRequest {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  budget?: number;
  createdAt: string;
  user: {
    name: string;
    profileImage?: string;
  };
}

export default function BuyerRequestsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [requests, setRequests] = useState<BuyerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await buyerRequestApi.getAll();
        setRequests(response.data || []);
      } catch (error) {
        toast.error('Failed to load buyer requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Buyer Requests
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Post what you need and let sellers respond
            </p>
          </div>
          <Link
            href="/buyer-requests/new"
            className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Post Request</span>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">No buyer requests yet</p>
            <Link
              href="/buyer-requests/new"
              className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-5 h-5" />
              <span>Post Your First Request</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 card-hover"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {request.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {request.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{request.location}</span>
                      </div>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                        {request.category}
                      </span>
                      {request.budget && (
                        <span className="font-semibold text-primary-600 dark:text-primary-400">
                          Budget: {new Intl.NumberFormat('en-PK', {
                            style: 'currency',
                            currency: 'PKR',
                          }).format(request.budget)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Posted {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    Respond
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}





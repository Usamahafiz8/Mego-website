'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/lib/store/authStore';
import { kycApi } from '@/lib/api';
import { Upload, CheckCircle, XCircle, Clock, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

type KycStatus = 'pending' | 'approved' | 'rejected' | 'not_submitted';

export default function KycPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [status, setStatus] = useState<KycStatus>('not_submitted');
  const [cnicImage, setCnicImage] = useState<File | null>(null);
  const [selfieImage, setSelfieImage] = useState<File | null>(null);
  const [cnicPreview, setCnicPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchStatus = async () => {
      try {
        const response = await kycApi.getStatus();
        setStatus(response.data.status || 'not_submitted');
      } catch (error) {
        // User hasn't submitted KYC yet
        setStatus('not_submitted');
      }
    };

    fetchStatus();
  }, [isAuthenticated, router]);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'cnic' | 'selfie'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'cnic') {
        setCnicImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setCnicPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setSelfieImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelfiePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cnicImage || !selfieImage) {
      toast.error('Please upload both CNIC and Selfie images');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('cnicImage', cnicImage);
      formData.append('selfieImage', selfieImage);

      await kycApi.submit(formData);
      toast.success('KYC submitted successfully! It will be reviewed by our team.');
      setStatus('pending');
      setCnicImage(null);
      setSelfieImage(null);
      setCnicPreview(null);
      setSelfiePreview(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit KYC');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const getStatusComponent = () => {
    switch (status) {
      case 'pending':
        return (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                  KYC Verification Pending
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300">
                  Your KYC submission is under review. We'll notify you once it's processed.
                </p>
              </div>
            </div>
          </div>
        );
      case 'approved':
        return (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  KYC Verified
                </h3>
                <p className="text-green-700 dark:text-green-300">
                  Your identity has been verified. You now have access to advanced features.
                </p>
              </div>
            </div>
          </div>
        );
      case 'rejected':
        return (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
            <div className="flex items-center space-x-3">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100">
                  KYC Rejected
                </h3>
                <p className="text-red-700 dark:text-red-300">
                  Your KYC submission was rejected. Please resubmit with clear images.
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
            <Shield className="w-8 h-8 mr-3" />
            KYC Verification
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Verify your identity to unlock advanced features
          </p>
        </div>

        {getStatusComponent()}

        {status !== 'approved' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Submit KYC Documents
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Upload a clear photo of your CNIC and a selfie holding your CNIC for verification.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* CNIC Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CNIC Photo *
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                  {cnicPreview ? (
                    <div className="relative">
                      <Image
                        src={cnicPreview}
                        alt="CNIC Preview"
                        width={400}
                        height={250}
                        className="mx-auto rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCnicImage(null);
                          setCnicPreview(null);
                        }}
                        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <label className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                          Click to upload CNIC photo
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageChange(e, 'cnic')}
                          required
                        />
                      </label>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Selfie Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selfie with CNIC *
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                  {selfiePreview ? (
                    <div className="relative">
                      <Image
                        src={selfiePreview}
                        alt="Selfie Preview"
                        width={300}
                        height={300}
                        className="mx-auto rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelfieImage(null);
                          setSelfiePreview(null);
                        }}
                        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <label className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                          Click to upload selfie
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageChange(e, 'selfie')}
                          required
                        />
                      </label>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !cnicImage || !selfieImage}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit for Verification'}
              </button>
            </form>
          </div>
        )}

        {/* Benefits */}
        <div className="mt-8 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Benefits of KYC Verification
          </h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li>• Access to advanced seller features</li>
            <li>• Higher trust score and visibility</li>
            <li>• Ability to post premium listings</li>
            <li>• Priority customer support</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}





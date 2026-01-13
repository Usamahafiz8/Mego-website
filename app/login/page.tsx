'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store/authStore';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Phone, Lock, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!formData.phone || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      console.log('🔵 Login attempt:', {
        url: `${process.env.NEXT_PUBLIC_API_URL || 'http://3.236.171.71'}/v1/auth/login`,
        phone: formData.phone,
      });

      const response = await authApi.login(formData);

      console.log('🟢 Login response:', response);
      console.log('🟢 Response data:', response?.data);
      console.log('🟢 Response status:', response?.status);

      if (!response || !response.data) {
        console.error('❌ No response data:', response);
        toast.error('Invalid response from server');
        setLoading(false);
        return;
      }

      // Handle different response formats
      let token: string | null = null;
      let user: any = null;

      // Try different response formats
      if (response.data.token) {
        token = response.data.token;
        const { token: _, ...userData } = response.data;
        user = userData;
      } else if (response.data.data?.token) {
        token = response.data.data.token;
        const { token: _, ...userData } = response.data.data;
        user = userData;
      } else if (response.data.user && response.data.token) {
        token = response.data.token;
        user = response.data.user;
      } else {
        console.warn('⚠️ Unexpected response format, trying to extract token...');
        token = response.data.token || response.data.accessToken || response.data.access_token || null;
        user = response.data.user || response.data.data || response.data;
      }

      if (!token) {
        console.error('❌ No token found in response:', {
          responseData: response.data,
          keys: Object.keys(response.data || {}),
        });
        toast.error('Token not received from server. Please check backend response format.');
        setLoading(false);
        return;
      }

      if (!user || !user.id) {
        console.warn('⚠️ User data incomplete:', user);
      }

      console.log('✅ Setting auth with:', { user, hasToken: !!token });
      setAuth(user || { id: 'temp', phone: formData.phone }, token);

      document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

      toast.success('Login successful!');

      const redirectUrl = searchParams.get('redirect') || localStorage.getItem('redirectAfterLogin');
      const finalUrl = redirectUrl || '/dashboard';

      if (redirectUrl) {
        localStorage.removeItem('redirectAfterLogin');
      }

      setTimeout(() => {
        window.location.href = finalUrl;
      }, 500);
    } catch (error: any) {
      console.error('❌ Login error details:', {
        error,
        message: error.message,
        response: error.response,
        request: error.request,
        config: error.config,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });

      let errorMessage = 'Login failed. Please try again.';

      if (error.response) {
        const serverMessage = error.response.data?.message || error.response.data?.error || error.response.data?.msg;
        errorMessage = serverMessage || `Server error: ${error.response.status} ${error.response.statusText}`;
        console.error('❌ Server error response:', error.response.data);
      } else if (error.request) {
        errorMessage = 'Cannot connect to server. Please check your internet connection and backend URL.';
        console.error('❌ No response received. Request:', error.request);
      } else {
        errorMessage = error.message || errorMessage;
        console.error('❌ Error setting up request:', error.message);
      }

      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    toast.error('Google login coming soon');
  };

  const handleFacebookLogin = async () => {
    toast.error('Facebook login coming soon');
  };

  const features = [
    { icon: Shield, text: 'Secure & encrypted' },
    { icon: Zap, text: 'Lightning fast' },
    { icon: Sparkles, text: 'Premium experience' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
      <Header />
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Branding & Features */}
            <div className="hidden lg:block animate-fadeInUp overflow-visible">
              <div className="relative overflow-visible">
                {/* Decorative Elements */}
                <div className="absolute -top-20 -left-10 w-72 h-72 bg-gradient-to-br from-primary-400/30 to-accent-400/30 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-gradient-to-br from-secondary-400/20 to-primary-400/20 rounded-full blur-3xl"></div>

                <div className="relative z-10 pl-4">
                  {/* Logo & Tagline */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3">
                      <Image
                        src="/images/mego-logo.png"
                        alt="MEGO Logo"
                        width={180}
                        height={64}
                        className="h-32 w-auto"
                      />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                      Welcome back to<br />
                      <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-yellow-400 bg-clip-text text-transparent">
                        Pakistan&apos;s #1 Marketplace
                      </span>
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      Buy and sell anything. Connect with millions of users nationwide.
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-4">
                    {features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 transition-all hover:shadow-lg hover:-translate-y-0.5"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 flex items-center justify-center">
                          <feature.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="mt-8 grid grid-cols-3 gap-4">
                    {[
                      { value: '5M+', label: 'Users' },
                      { value: '10K+', label: 'Daily Ads' },
                      { value: '98%', label: 'Satisfaction' },
                    ].map((stat, index) => (
                      <div key={index} className="text-center p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                        <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{stat.value}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="animate-fadeInUp" style={{ animationDelay: '100ms' }}>
              <div className="relative">
                {/* Mobile Logo */}
                <div className="lg:hidden text-center mb-8">
                  <div className="inline-flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-xl font-black text-white">M</span>
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent">
                      MEGO
                    </span>
                  </div>
                </div>

                {/* Form Card */}
                <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-200/50 dark:border-gray-700/50 p-8 md:p-10">
                  {/* Gradient Border Effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-500/20 via-transparent to-accent-500/20 pointer-events-none"></div>

                  <div className="relative z-10">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Sign In
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        Welcome back! Please enter your details.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Phone Field */}
                      <div className="space-y-2">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Phone Number
                        </label>
                        <div className={`relative rounded-xl transition-all duration-300 ${focusedField === 'phone' ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-900' : ''}`}>
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Phone className={`h-5 w-5 transition-colors ${focusedField === 'phone' ? 'text-primary-500' : 'text-gray-400'}`} />
                          </div>
                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            required
                            className="block w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 dark:focus:border-primary-500 transition-all text-base"
                            placeholder="03XX XXXXXXX"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            onFocus={() => setFocusedField('phone')}
                            onBlur={() => setFocusedField(null)}
                          />
                        </div>
                      </div>

                      {/* Password Field */}
                      <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Password
                        </label>
                        <div className={`relative rounded-xl transition-all duration-300 ${focusedField === 'password' ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-900' : ''}`}>
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className={`h-5 w-5 transition-colors ${focusedField === 'password' ? 'text-primary-500' : 'text-gray-400'}`} />
                          </div>
                          <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            className="block w-full pl-12 pr-12 py-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 dark:focus:border-primary-500 transition-all text-base"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField(null)}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Remember Me & Forgot Password */}
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 transition-colors"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                            Remember me
                          </span>
                        </label>
                        <Link
                          href="/forgot-password"
                          className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Signing in...</span>
                          </>
                        ) : (
                          <>
                            <span>Sign In</span>
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>

                      {/* Divider */}
                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-white dark:bg-gray-900 text-gray-500">
                            Or continue with
                          </span>
                        </div>
                      </div>

                      {/* Social Buttons */}
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={handleGoogleLogin}
                          className="flex items-center justify-center gap-3 py-3.5 px-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 hover:-translate-y-0.5 group"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                          </svg>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Google</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleFacebookLogin}
                          className="flex items-center justify-center gap-3 py-3.5 px-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 hover:-translate-y-0.5 group"
                        >
                          <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Facebook</span>
                        </button>
                      </div>
                    </form>

                    {/* Sign Up Link */}
                    <p className="mt-8 text-center text-gray-600 dark:text-gray-400">
                      Don&apos;t have an account?{' '}
                      <Link
                        href="/register"
                        className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                      >
                        Create one now
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-xl font-black text-white">M</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

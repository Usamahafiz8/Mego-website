'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store/authStore';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, Phone, User, ArrowRight, CheckCircle2, Sparkles, Shield, Users } from 'lucide-react';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!formData.name || !formData.phone || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...signupData } = formData;

      console.log('🔵 Signup attempt:', {
        url: `${process.env.NEXT_PUBLIC_API_URL || 'http://3.236.171.71'}/v1/auth/signup`,
        data: { ...signupData, password: '***' }
      });

      const response = await authApi.signup(signupData);

      console.log('🟢 Signup response:', response);
      console.log('🟢 Response data:', response?.data);
      console.log('🟢 Response status:', response?.status);

      if (!response || !response.data) {
        console.error('❌ No response data:', response);
        toast.error('Invalid response from server');
        setLoading(false);
        return;
      }

      let token: string | null = null;
      let user: any = null;

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
      setAuth(user || { id: 'temp', name: signupData.name, phone: signupData.phone, email: signupData.email }, token);

      document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

      toast.success('Account created successfully!');

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
    } catch (error: any) {
      console.error('❌ Signup error details:', {
        error,
        message: error.message,
        response: error.response,
        request: error.request,
        config: error.config,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });

      let errorMessage = 'Registration failed. Please try again.';

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

  const benefits = [
    { icon: Sparkles, title: 'Easy Listing', desc: 'Post your ads in minutes' },
    { icon: Users, title: 'Millions of Buyers', desc: 'Reach customers nationwide' },
    { icon: Shield, title: 'Safe & Secure', desc: 'Verified users & secure transactions' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
      <Header />
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Branding & Benefits */}
            <div className="hidden lg:block animate-fadeInUp overflow-visible">
              <div className="relative overflow-visible">
                {/* Decorative Elements */}
                <div className="absolute -top-20 -left-10 w-72 h-72 bg-gradient-to-br from-secondary-400/30 to-primary-400/30 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-gradient-to-br from-accent-400/20 to-secondary-400/20 rounded-full blur-3xl"></div>

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
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                      Start selling today on<br />
                      <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-yellow-400 bg-clip-text text-transparent">
                        Pakistan&apos;s #1 Marketplace
                      </span>
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      Join millions of sellers and reach customers across Pakistan.
                    </p>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-4">
                    {benefits.map((benefit, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-5 rounded-2xl bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 transition-all hover:shadow-lg hover:-translate-y-0.5"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-500/10 to-primary-500/10 flex items-center justify-center flex-shrink-0">
                          <benefit.icon className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{benefit.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{benefit.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Testimonial */}
                  <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950/50 dark:to-secondary-950/50 border border-primary-200/50 dark:border-primary-800/50">
                    <p className="text-gray-700 dark:text-gray-300 italic mb-4">
                      &quot;I sold my old laptop within 2 hours of posting! MEGO is amazing for quick sales.&quot;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                        A
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Ahmed K.</div>
                        <div className="text-sm text-gray-500">Verified Seller</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Register Form */}
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
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-secondary-500/20 via-transparent to-primary-500/20 pointer-events-none"></div>

                  <div className="relative z-10">
                    <div className="text-center mb-6">
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Create Account
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        Join MEGO and start selling today
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Name Field */}
                      <div className="space-y-1.5">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Full Name
                        </label>
                        <div className={`relative rounded-xl transition-all duration-300 ${focusedField === 'name' ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-900' : ''}`}>
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className={`h-5 w-5 transition-colors ${focusedField === 'name' ? 'text-primary-500' : 'text-gray-400'}`} />
                          </div>
                          <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-all"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            onFocus={() => setFocusedField('name')}
                            onBlur={() => setFocusedField(null)}
                          />
                        </div>
                      </div>

                      {/* Phone & Email Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Phone
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
                              className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-all"
                              placeholder="03XX XXXXXXX"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              onFocus={() => setFocusedField('phone')}
                              onBlur={() => setFocusedField(null)}
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email
                          </label>
                          <div className={`relative rounded-xl transition-all duration-300 ${focusedField === 'email' ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-900' : ''}`}>
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Mail className={`h-5 w-5 transition-colors ${focusedField === 'email' ? 'text-primary-500' : 'text-gray-400'}`} />
                            </div>
                            <input
                              id="email"
                              name="email"
                              type="email"
                              required
                              className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-all"
                              placeholder="your@email.com"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              onFocus={() => setFocusedField('email')}
                              onBlur={() => setFocusedField(null)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Password Field */}
                      <div className="space-y-1.5">
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
                            className="block w-full pl-12 pr-12 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-all"
                            placeholder="Create a strong password"
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
                        {/* Password Strength Indicator */}
                        {formData.password && (
                          <div className="mt-2">
                            <div className="flex gap-1 mb-1">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`h-1.5 flex-1 rounded-full transition-colors ${i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200 dark:bg-gray-700'}`}
                                />
                              ))}
                            </div>
                            <p className={`text-xs ${passwordStrength >= 4 ? 'text-green-600' : passwordStrength >= 3 ? 'text-lime-600' : passwordStrength >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {strengthLabels[passwordStrength - 1] || 'Very Weak'}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password Field */}
                      <div className="space-y-1.5">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Confirm Password
                        </label>
                        <div className={`relative rounded-xl transition-all duration-300 ${focusedField === 'confirmPassword' ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-900' : ''}`}>
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className={`h-5 w-5 transition-colors ${focusedField === 'confirmPassword' ? 'text-primary-500' : 'text-gray-400'}`} />
                          </div>
                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            className="block w-full pl-12 pr-12 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-all"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            onFocus={() => setFocusedField('confirmPassword')}
                            onBlur={() => setFocusedField(null)}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                            )}
                          </button>
                          {formData.confirmPassword && formData.password === formData.confirmPassword && (
                            <div className="absolute inset-y-0 right-10 flex items-center">
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Terms Agreement */}
                      <label className="flex items-start gap-3 cursor-pointer group mt-4">
                        <input
                          type="checkbox"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="w-5 h-5 mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 transition-colors"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          I agree to the{' '}
                          <Link href="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link href="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                            Privacy Policy
                          </Link>
                        </span>
                      </label>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={loading || !agreedToTerms}
                        className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 dark:shadow-primary-500/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-6"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Creating account...</span>
                          </>
                        ) : (
                          <>
                            <span>Create Account</span>
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </form>

                    {/* Sign In Link */}
                    <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
                      Already have an account?{' '}
                      <Link
                        href="/login"
                        className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                      >
                        Sign in
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

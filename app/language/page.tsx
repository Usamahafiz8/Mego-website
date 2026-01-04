'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/lib/store/authStore';
import { authApi } from '@/lib/api';
import { Globe, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'ur-Roman', name: 'Roman Urdu', nativeName: 'Roman Urdu' },
];

export default function LanguagePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Load current language
    const currentLang = user?.language || 'en';
    setSelectedLanguage(currentLang);
  }, [isAuthenticated, router, user]);

  const handleLanguageChange = async (langCode: string) => {
    setSelectedLanguage(langCode);
    
    try {
      setLoading(true);
      await authApi.updateLanguage({ language: langCode });
      toast.success('Language updated successfully');
      // Reload page to apply language changes
      window.location.reload();
    } catch (error) {
      toast.error('Failed to update language');
      setSelectedLanguage(user?.language || 'en');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
            <Globe className="w-8 h-8 mr-3" />
            Language Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Choose your preferred language for the interface
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="space-y-3">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                disabled={loading}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedLanguage === language.code
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {language.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {language.nativeName}
                    </p>
                  </div>
                  {selectedLanguage === language.code && (
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> Changing language will refresh the page to apply the new language settings.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}





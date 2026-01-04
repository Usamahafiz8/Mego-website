import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';

// Lazy load heavy components for better performance
const StatsSection = dynamic(() => import('@/components/home/StatsSection').then(mod => ({ default: mod.StatsSection })), {
  loading: () => <div className="h-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />,
  ssr: true,
});

const FeaturedCategories = dynamic(() => import('@/components/home/FeaturedCategories').then(mod => ({ default: mod.FeaturedCategories })), {
  loading: () => <div className="h-96 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />,
  ssr: true,
});

const FeaturedAds = dynamic(() => import('@/components/home/FeaturedAds').then(mod => ({ default: mod.FeaturedAds })), {
  loading: () => <div className="h-96 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />,
  ssr: true,
});

const WhyChooseUs = dynamic(() => import('@/components/home/WhyChooseUs').then(mod => ({ default: mod.WhyChooseUs })), {
  loading: () => <div className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />,
  ssr: true,
});

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="page-transition">
        <HeroSection />
        <StatsSection />
        <FeaturedCategories />
        <FeaturedAds />
        <WhyChooseUs />
      </main>
      <Footer />
    </div>
  );
}





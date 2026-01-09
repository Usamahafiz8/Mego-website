import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';

// Lazy load heavy components for better performance
const FeaturedCategories = dynamic(
  () => import('@/components/home/FeaturedCategories').then((mod) => mod.FeaturedCategories),
  {
    loading: () => <div className="h-96 bg-gray-100 dark:bg-gray-900 animate-pulse rounded-lg" />,
    ssr: true,
  }
);

const FeaturedAds = dynamic(
  () => import('@/components/home/FeaturedAds').then((mod) => mod.FeaturedAds),
  {
    loading: () => <div className="h-96 bg-gray-100 dark:bg-gray-900 animate-pulse rounded-lg" />,
    ssr: true,
  }
);

const WhyChooseUs = dynamic(
  () => import('@/components/home/WhyChooseUs').then((mod) => mod.WhyChooseUs),
  {
    loading: () => <div className="h-64 bg-gray-100 dark:bg-gray-900 animate-pulse rounded-lg" />,
    ssr: true,
  }
);

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />
      <main>
        <HeroSection />
        <FeaturedCategories />
        <FeaturedAds />
        <WhyChooseUs />
      </main>
      <Footer />
    </div>
  );
}

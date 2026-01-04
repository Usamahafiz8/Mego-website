import { Shield, Zap, Gift, Users, Star, Headphones } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Verified Sellers',
    description: 'All sellers go through verification process for your safety',
  },
  {
    icon: Zap,
    title: '1-Minute Posting',
    description: 'Post your ad in just 3 simple steps - Photo, Title, Price',
  },
  {
    icon: Gift,
    title: 'Earn Rewards',
    description: 'Get points for posting, referring friends, and more',
  },
  {
    icon: Users,
    title: 'Trusted Community',
    description: 'Join thousands of verified buyers and sellers',
  },
  {
    icon: Star,
    title: 'Quality Listings',
    description: 'AI-powered quality scoring ensures best listings',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Our support team is always here to help you',
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-16 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose MEGO?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            We're not just another marketplace. We're your trusted partner in buying and selling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 card-hover"
              >
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}





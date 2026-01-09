import { Shield, Zap, Gift, Users, Star, Headphones } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Verified Sellers',
    description: 'All sellers go through verification process for your safety',
    gradient: 'from-blue-500 to-blue-600',
    iconBg: 'from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900',
  },
  {
    icon: Zap,
    title: '1-Minute Posting',
    description: 'Post your ad in just 3 simple steps - Photo, Title, Price',
    gradient: 'from-yellow-500 to-orange-500',
    iconBg: 'from-yellow-50 to-orange-100 dark:from-yellow-950 dark:to-orange-900',
  },
  {
    icon: Gift,
    title: 'Earn Rewards',
    description: 'Get points for posting, referring friends, and more',
    gradient: 'from-purple-500 to-pink-500',
    iconBg: 'from-purple-50 to-pink-100 dark:from-purple-950 dark:to-pink-900',
  },
  {
    icon: Users,
    title: 'Trusted Community',
    description: 'Join thousands of verified buyers and sellers',
    gradient: 'from-emerald-500 to-teal-500',
    iconBg: 'from-emerald-50 to-teal-100 dark:from-emerald-950 dark:to-teal-900',
  },
  {
    icon: Star,
    title: 'Quality Listings',
    description: 'AI-powered quality scoring ensures best listings',
    gradient: 'from-amber-500 to-yellow-500',
    iconBg: 'from-amber-50 to-yellow-100 dark:from-amber-950 dark:to-yellow-900',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Our support team is always here to help you',
    gradient: 'from-cyan-500 to-blue-500',
    iconBg: 'from-cyan-50 to-blue-100 dark:from-cyan-950 dark:to-blue-900',
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-20 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fadeInUp">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-900 dark:text-white mb-4">
            Why Choose MEGO?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            We&apos;re not just another marketplace. We&apos;re your trusted partner in buying and selling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-white dark:bg-gray-900/50 p-8 rounded-3xl border-2 border-gray-100 dark:border-gray-800 backdrop-blur-sm transition-all duration-500 hover:border-primary-300 dark:hover:border-primary-800 hover:-translate-y-2 hover:shadow-luxury dark:hover:shadow-2xl cursor-pointer overflow-hidden animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none"></div>

                {/* Icon with gradient background */}
                <div className={`relative w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br ${feature.iconBg} flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:shadow-glow`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <Icon className={`w-8 h-8 text-${feature.gradient.split('-')[1]}-600 dark:text-${feature.gradient.split('-')[1]}-400 transition-all duration-500 group-hover:scale-110 relative z-10`} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-3 transition-all duration-300 group-hover:text-primary-800 dark:group-hover:text-primary-300">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>

                {/* Bottom accent line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-3xl`}></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MEGO - Pakistan\'s Premier Online Marketplace',
  description: 'Buy and sell goods in Pakistan. Trusted marketplace with AR previews, rewards, and more.',
  keywords: 'marketplace, buy, sell, Pakistan, OLX alternative, classifieds',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--background-end-rgb)',
                color: 'var(--foreground-rgb)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}





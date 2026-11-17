import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { LocationProvider } from '@/features/location/LocationProvider';
import { CartProvider } from '@/features/cart/CartProvider';
import { APP_NAME, APP_TAGLINE } from '@/lib/config';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' });

export const metadata: Metadata = {
  title: { default: `${APP_NAME} — ${APP_TAGLINE}`, template: `%s · ${APP_NAME}` },
  description:
    'Buy fresh organic vegetables and dry vegetable products directly from verified local farmers near you.',
};

export const viewport: Viewport = {
  themeColor: '#2F6B3B',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen">
        <AuthProvider>
          <LocationProvider>
            <CartProvider>{children}</CartProvider>
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/layout/BottomNav';
import { AuthProvider } from '@shared/components/AuthProvider';
import AuthGuard from '@/components/auth/AuthGuard';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'AI Diyetisyen — Yapay Zekâ Destekli Beslenme Asistanı',
  description:
    'Yapay zekâ ile kişiselleştirilmiş, Türk mutfağına özel beslenme planları oluşturun. Metabolizmanızı analiz edin, sağlıklı yaşam hedeflerinize ulaşın.',
  keywords: [
    'AI diyetisyen',
    'yapay zeka beslenme',
    'diyet planı',
    'Türk mutfağı diyet',
    'kalori hesaplama',
    'metabolizma analizi',
    'kişisel beslenme',
  ],
  authors: [{ name: 'AI Diyetisyen' }],
  openGraph: {
    title: 'AI Diyetisyen — Yapay Zekâ Destekli Beslenme',
    description: 'Kişiselleştirilmiş, Türk mutfağına özel beslenme planları.',
    type: 'website',
    locale: 'tr_TR',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-[#05070A] text-[#EDEDED] antialiased overflow-x-hidden">
        <AuthProvider>
          <AuthGuard>
            <main className="pb-24">
              {children}
            </main>
            <BottomNav />
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}


import type { Metadata } from 'next';
import { Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const plexMono = IBM_Plex_Mono({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex-mono',
});

export const metadata: Metadata = {
  title: 'Forest & Ray Dashboard',
  description: 'Internal dashboard for Forest & Ray Dental Clinic WhatsApp agent.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${plexMono.variable} font-sans antialiased bg-slate-950 text-gray-900 overflow-hidden`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

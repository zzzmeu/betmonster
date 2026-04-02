import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Nav } from '@/components/nav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BetMonster — Tipster Intelligence',
  description: 'Separating signal from noise in sports betting. AI-powered tipster profiling and pick curation.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#09090b',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-zinc-100 min-h-screen antialiased`}>
        <Nav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
          {children}
        </main>
        <footer className="hidden md:block border-t border-zinc-800 py-6 text-center text-zinc-600 text-xs">
          BetMonster © {new Date().getFullYear()} — Tipster intelligence, not financial advice.
        </footer>
      </body>
    </html>
  );
}

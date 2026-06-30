import type { Metadata } from 'next';
import { Lora, Manrope, Spline_Sans_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';

// Brand type system: Lora (display) · Manrope (body & UI) · Spline Sans Mono (labels/metadata).
const lora = Lora({ subsets: ['latin'], variable: '--font-lora', display: 'swap' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' });
const splineMono = Spline_Sans_Mono({ subsets: ['latin'], variable: '--font-spline-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'Neighbrd — Howdy, neighbor.',
  description: 'A personal CRM for staying close to the people who matter.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${lora.variable} ${manrope.variable} ${splineMono.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

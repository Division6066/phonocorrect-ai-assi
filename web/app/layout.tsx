import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'PhonoCorrect AI - Phonetic Spelling Assistant',
  description: 'A phonetic spelling assistant that helps you write with confidence. Get intelligent suggestions based on how words sound, not just how they are spelled.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
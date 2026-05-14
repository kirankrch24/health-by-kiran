import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Health by Kiran Kumar',
  description: 'A premium personal dashboard for tracking fitness goals, fasting, blood sugar mechanics, and progress across the 75 Hard Challenge.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

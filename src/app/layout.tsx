import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Brew & Co. POS',
  description: 'Coffee Shop Point-of-Sale System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { fontSize: '0.875rem' },
            success: { iconTheme: { primary: '#d97706', secondary: '#fff' } },
          }}
        />
        {children}
      </body>
    </html>
  );
}

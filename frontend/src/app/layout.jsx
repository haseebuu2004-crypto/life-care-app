
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const metadata = {
  title: 'Life Care System',
  description: 'Life Care System SaaS App',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

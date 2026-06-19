import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'ShurizAnime - Nonton Anime Sub Indo Gratis',
  description: 'Nonton anime subtitle Indonesia terlengkap dan terupdate. Streaming anime sub indo gratis di ShurizAnime.',
  keywords: 'nonton anime, anime sub indo, streaming anime, anime terbaru, shurizanime',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
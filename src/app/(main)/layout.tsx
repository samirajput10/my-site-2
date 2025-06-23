import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ChatButton } from '@/components/layout/ChatButton';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow bg-background">{children}</main>
      <Footer />
      <ChatButton />
    </div>
  );
}

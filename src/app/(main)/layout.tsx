import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
// TopNotificationBar import removed
import { ChatButton } from '@/components/layout/ChatButton';
import { ChatWindow } from '@/components/layout/ChatWindow';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* TopNotificationBar removed */}
      <Header />
      <main className="flex-grow bg-background">{children}</main>
      <Footer />
      <ChatButton />
      <ChatWindow />
    </div>
  );
}

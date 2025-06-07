import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
<<<<<<< HEAD
=======
// TopNotificationBar import removed
import { ChatButton } from '@/components/layout/ChatButton';
import { ChatWindow } from '@/components/layout/ChatWindow';
>>>>>>> 8c7225b (first commit)

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
<<<<<<< HEAD
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
=======
      {/* TopNotificationBar removed */}
      <Header />
      <main className="flex-grow bg-background">{children}</main>
      <Footer />
      <ChatButton /> 
      <ChatWindow />
>>>>>>> 8c7225b (first commit)
    </div>
  );
}

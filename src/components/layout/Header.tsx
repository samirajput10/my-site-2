
"use client";

import Link from 'next/link';
import { Heart, ShoppingCart, LayoutDashboard, Sparkles, Menu, X, LogIn, LogOut, UserPlus, UserCircle } from 'lucide-react';
import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { auth } from '@/lib/firebase/config';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

const mainNavLinks = [
  { href: '/', label: 'Home', icon: null },
  { href: '/style-assistant', label: 'Style AI', icon: <Sparkles size={18} /> },
  { href: '/seller/dashboard', label: 'Seller Hub', icon: <LayoutDashboard size={18} /> },
];

export function Header() {
  const { totalItems: cartTotalItems } = useCart();
  const { wishlistItems } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await firebaseSignOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      if (isMobile) setMobileMenuOpen(false);
      router.push('/'); // Navigate to home after logout
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: 'Logout Failed',
        description: 'Could not log you out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const commonLinks = (isMobileLink: boolean) => (
    <>
      <Button variant="ghost" asChild className={isMobileLink ? "justify-start w-full" : ""}>
        <Link href="/wishlist" onClick={() => isMobileLink && setMobileMenuOpen(false)} className="relative">
          <Heart size={18} className="mr-2" />
          Wishlist
          {wishlistItems.length > 0 && (
            <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {wishlistItems.length}
            </span>
          )}
        </Link>
      </Button>
      <Button variant="ghost" asChild className={isMobileLink ? "justify-start w-full" : ""}>
        <Link href="/cart" onClick={() => isMobileLink && setMobileMenuOpen(false)} className="relative">
          <ShoppingCart size={18} className="mr-2" />
          Cart
          {cartTotalItems > 0 && (
            <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {cartTotalItems}
            </span>
          )}
        </Link>
      </Button>
    </>
  );

  const NavLinkItems = ({ isMobileLink = false }: { isMobileLink?: boolean }) => (
    <>
      {mainNavLinks.map((link) => (
        <Button key={link.label} variant="ghost" asChild className={isMobileLink ? "justify-start w-full" : ""}>
          <Link href={link.href} onClick={() => isMobileLink && setMobileMenuOpen(false)}>
            {link.icon && <span className="mr-2">{link.icon}</span>}
            {link.label}
          </Link>
        </Button>
      ))}
      {commonLinks(isMobileLink)}
      {!loadingAuth && (
        currentUser ? (
          <>
            {isMobileLink && currentUser.email && (
               <div className="px-2 py-1.5 text-sm text-muted-foreground flex items-center">
                 <UserCircle size={18} className="mr-2" /> {currentUser.email}
               </div>
            )}
            <Button variant="ghost" onClick={handleLogout} className={isMobileLink ? "justify-start w-full text-destructive" : "text-destructive hover:bg-destructive/10"}>
              <LogOut size={18} className="mr-2" />
              Logout
            </Button>
            {!isMobileLink && currentUser.email && (
               <Button variant="ghost" className="pointer-events-none hidden lg:flex">
                 <UserCircle size={18} className="mr-2" /> {currentUser.email.length > 15 ? `${currentUser.email.substring(0,15)}...` : currentUser.email}
               </Button>
            )}
          </>
        ) : (
          <>
            <Button variant="ghost" asChild className={isMobileLink ? "justify-start w-full" : ""}>
              <Link href="/login" onClick={() => isMobileLink && setMobileMenuOpen(false)}>
                <LogIn size={18} className="mr-2" />
                Login
              </Link>
            </Button>
            <Button variant="default" asChild className={isMobileLink ? "justify-start w-full" : "bg-primary hover:bg-primary/90 text-primary-foreground"}>
              <Link href="/signup" onClick={() => isMobileLink && setMobileMenuOpen(false)}>
                <UserPlus size={18} className="mr-2" />
                Sign Up
              </Link>
            </Button>
          </>
        )
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Logo />
        {isMobile ? (
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
              <div className="p-4">
                <div className="mb-6 flex justify-between items-center">
                   <Logo />
                   <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                     <X />
                     <span className="sr-only">Close menu</span>
                   </Button>
                </div>
                <nav className="flex flex-col space-y-1">
                  <NavLinkItems isMobileLink />
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <nav className="flex items-center space-x-1">
            <NavLinkItems />
          </nav>
        )}
      </div>
    </header>
  );
}

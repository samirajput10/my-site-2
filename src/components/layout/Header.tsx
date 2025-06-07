"use client";

import Link from 'next/link';
import { Heart, ShoppingCart, LayoutDashboard, Sparkles, Menu, X } from 'lucide-react';
import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

const navLinks = [
  { href: '/', label: 'Home', icon: null },
  { href: '/style-assistant', label: 'Style AI', icon: <Sparkles size={18} /> },
  { href: '/seller/dashboard', label: 'Seller Hub', icon: <LayoutDashboard size={18} /> },
];

export function Header() {
  const { totalItems: cartTotalItems } = useCart();
  const { wishlistItems } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const NavLinkItems = ({ isMobileLink = false }: { isMobileLink?: boolean }) => (
    <>
      {navLinks.map((link) => (
        <Button key={link.label} variant="ghost" asChild className={isMobileLink ? "justify-start w-full" : ""}>
          <Link href={link.href} onClick={() => isMobileLink && setMobileMenuOpen(false)}>
            {link.icon && <span className="mr-2">{link.icon}</span>}
            {link.label}
          </Link>
        </Button>
      ))}
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
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="p-4">
                <div className="mb-6 flex justify-between items-center">
                   <Logo />
                   <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                     <X />
                     <span className="sr-only">Close menu</span>
                   </Button>
                </div>
                <nav className="flex flex-col space-y-2">
                  <NavLinkItems isMobileLink />
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <nav className="flex items-center space-x-2">
            <NavLinkItems />
          </nav>
        )}
      </div>
    </header>
  );
}


"use client";

import Link from 'next/link';
import { Heart, ShoppingCart, User, Menu, X, Search, LogIn, LogOut, UserPlus, Settings, ShoppingBag, Sparkles, LayoutDashboard } from 'lucide-react'; // Added Sparkles and LayoutDashboard, removed unused icons
import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { auth } from '@/lib/firebase/config';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

const mainNavLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  // Links to anchors might be better handled by specific landing page sections or removed if not applicable
  // { href: '/#brands', label: 'Brands' }, 
  // { href: '/#discover', label: 'Discover' },
];

export function Header() {
  const { totalItems: cartTotalItems } = useCart();
  const { wishlistItems } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const isMobile = useIsMobile();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

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
      router.push('/');
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: 'Logout Failed',
        description: 'Could not log you out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      if (isMobile) setMobileSearchOpen(false);
      setSearchQuery(''); 
    }
  };

  const UserActionsMenu = ({onItemClick}: {onItemClick?: () => void}) => (
    <>
      {currentUser ? (
        <>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">My Account</p>
              <p className="text-xs leading-none text-muted-foreground">
                {currentUser.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {/* <DropdownMenuItem onClick={() => { router.push('/#profile'); onItemClick?.(); }}> // Placeholder, actual profile page TBD
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => { router.push('/#orders'); onItemClick?.(); }}> // Placeholder
            <ShoppingBag className="mr-2 h-4 w-4" />
            <span>Orders</span>
          </DropdownMenuItem> */}
          <DropdownMenuItem onClick={() => { router.push('/wishlist'); onItemClick?.(); }}>
            <Heart className="mr-2 h-4 w-4" />
            <span>Wishlist</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => {handleLogout(); onItemClick?.();}} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </>
      ) : (
        <>
          <DropdownMenuItem onClick={() => { router.push('/login'); onItemClick?.(); }}>
            <LogIn className="mr-2 h-4 w-4" />
            <span>Login</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => { router.push('/signup'); onItemClick?.(); }}>
            <UserPlus className="mr-2 h-4 w-4" />
            <span>Sign Up</span>
          </DropdownMenuItem>
        </>
      )}
      <DropdownMenuSeparator />
       <DropdownMenuItem onClick={() => { router.push('/style-assistant'); onItemClick?.(); }}>
        <Sparkles className="mr-2 h-4 w-4" />
        <span>AI Style Assistant</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => { router.push('/seller/dashboard'); onItemClick?.(); }}>
        <LayoutDashboard className="mr-2 h-4 w-4" />
        <span>Seller Dashboard</span>
      </DropdownMenuItem>
       {/* Other links like Settings, Help can be added here */}
    </>
  );

  const SearchBar = ({className}: {className?: string}) => (
    <form onSubmit={handleSearchSubmit} className={`relative w-full ${className}`}>
      <Input
        type="text"
        placeholder="Search for products, brands..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-2 rounded-full border-input bg-background focus:ring-primary focus:border-transparent text-sm"
        aria-label="Search products"
      />
      <Button type="submit" variant="ghost" size="icon" className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-primary">
        <Search className="h-4 w-4" />
         <span className="sr-only">Submit search</span>
      </Button>
    </form>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center">
          <Logo />
        </div>

        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <SearchBar />
        </div>

        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {mainNavLinks.map((link) => (
            <Button key={link.label} variant="ghost" asChild className="text-foreground hover:text-primary">
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center space-x-2 sm:space-x-3">
            {isMobile && (
              <Sheet open={mobileSearchOpen} onOpenChange={setMobileSearchOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary md:hidden">
                        <Search className="h-5 w-5"/>
                        <span className="sr-only">Open Search</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="top" className="p-4 pt-8 bg-card text-card-foreground">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold sr-only">Search Products</h3>
                      <SheetClose asChild>
                          <Button variant="ghost" size="icon" className="absolute right-4 top-4"><X className="h-5 w-5"/></Button>
                      </SheetClose>
                    </div>
                    <SearchBar />
                </SheetContent>
              </Sheet>
            )}
            <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-primary relative">
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
                <span className="sr-only">Wishlist</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-primary relative">
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartTotalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {cartTotalItems}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </Link>
            </Button>

            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                    <User className="h-5 w-5" />
                    <span className="sr-only">User Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover text-popover-foreground">
                  <UserActionsMenu />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] p-0 flex flex-col bg-card text-card-foreground">
                  <div className="flex justify-between items-center p-4 border-b border-border">
                    <SheetClose asChild><Logo /></SheetClose>
                    <SheetClose asChild>
                       <Button variant="ghost" size="icon"><X className="h-5 w-5"/></Button>
                    </SheetClose>
                  </div>
                  <nav className="flex-grow p-4 space-y-2">
                    {mainNavLinks.map((link) => (
                      <SheetClose key={link.label} asChild>
                        <Button variant="ghost" asChild className="w-full justify-start text-lg py-3 text-foreground hover:text-primary">
                          <Link href={link.href}>{link.label}</Link>
                        </Button>
                      </SheetClose>
                    ))}
                  </nav>
                  <div className="p-4 border-t border-border">
                    <UserActionsMenu onItemClick={() => setMobileMenuOpen(false)} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
      </div>
    </header>
  );
}

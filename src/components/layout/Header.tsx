
"use client";

import Link from 'next/link';
<<<<<<< HEAD
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
=======
import { Heart, ShoppingCart, User, Menu, X, Search, LogIn, LogOut, UserPlus, Settings, ShoppingBag, Info, LifeBuoy, Sparkles, LayoutDashboard } from 'lucide-react'; // Added Sparkles and LayoutDashboard
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
>>>>>>> 8c7225b (first commit)
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

const mainNavLinks = [
<<<<<<< HEAD
  { href: '/', label: 'Home', icon: null },
  { href: '/style-assistant', label: 'Style AI', icon: <Sparkles size={18} /> },
  { href: '/seller/dashboard', label: 'Seller Hub', icon: <LayoutDashboard size={18} /> },
=======
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/#brands', label: 'Brands' },
  { href: '/#discover', label: 'Discover' },
>>>>>>> 8c7225b (first commit)
];

export function Header() {
  const { totalItems: cartTotalItems } = useCart();
  const { wishlistItems } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
<<<<<<< HEAD
  const isMobile = useIsMobile();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
=======
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const isMobile = useIsMobile();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
>>>>>>> 8c7225b (first commit)

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
<<<<<<< HEAD
      if (isMobile) setMobileMenuOpen(false);
      router.push('/'); // Navigate to home after logout
=======
      router.push('/');
>>>>>>> 8c7225b (first commit)
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: 'Logout Failed',
        description: 'Could not log you out. Please try again.',
        variant: 'destructive',
      });
    }
  };

<<<<<<< HEAD
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
=======
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      if (isMobile) setMobileSearchOpen(false);
      setSearchQuery(''); // Clear search query after submit
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
          <DropdownMenuItem onClick={() => { router.push('/#profile'); onItemClick?.(); }}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => { router.push('/#orders'); onItemClick?.(); }}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            <span>Orders</span>
          </DropdownMenuItem>
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
    </>
  );

  const SearchBar = ({className}: {className?: string}) => (
    <form onSubmit={handleSearchSubmit} className={`relative w-full ${className}`}>
      <Input
        type="text"
        placeholder="Search for brands, styles..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2 rounded-full border-input bg-background focus:ring-primary focus:border-transparent"
      />
      <Button type="submit" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-primary">
        <Search className="h-5 w-5" />
      </Button>
    </form>
  );

  return (
    <header className="sticky top-0 z-50 bg-card shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Logo />

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
                <Button variant="ghost" size="icon" onClick={() => setMobileSearchOpen(true)} className="text-muted-foreground hover:text-primary md:hidden">
                    <Search className="h-5 w-5"/>
                    <span className="sr-only">Open Search</span>
                </Button>
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
                <Sheet open={mobileSearchOpen} onOpenChange={setMobileSearchOpen}>
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
            </div>
          </div>
        </div>
>>>>>>> 8c7225b (first commit)
      </div>
    </header>
  );
}

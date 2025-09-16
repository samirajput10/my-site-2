
"use client";

import Link from 'next/link';
import { Heart, ShoppingCart, User, Menu, X, LogIn, LogOut, UserPlus, Settings, ShoppingBag, Sparkles, LayoutDashboard, ChevronDown, Check, Sun, Moon, Camera } from 'lucide-react'; // Added icons
import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
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
import { useCurrency } from '@/contexts/CurrencyContext';
import { useTheme } from 'next-themes';

const mainNavLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/ai-try-on', label: 'AI Try-On', icon: Camera },
];

export function Header() {
  const { totalItems: cartTotalItems } = useCart();
  const { wishlistItems } = useWishlist();
  const { currency } = useCurrency();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | { uid: string, email: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const { setTheme } = useTheme();

  useEffect(() => {
    // Check for mock admin session first
    const mockAdminSession = sessionStorage.getItem('loggedInUser');
    if (mockAdminSession) {
      const adminUser = JSON.parse(mockAdminSession);
      setCurrentUser(adminUser);
      setIsAdmin(true);
      setLoadingAuth(false);
      return; // Stop if admin is logged in
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        const userProfileString = localStorage.getItem(`userProfile_${user.uid}`);
        const userProfile = userProfileString ? JSON.parse(userProfileString) : {};
        setIsAdmin(userProfile.role === 'admin');
      } else {
        setIsAdmin(false);
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      // Check if it's the mock admin user
      if (currentUser?.uid === 'admin_user_mock_uid') {
        sessionStorage.removeItem('loggedInUser');
        localStorage.removeItem(`userProfile_${currentUser.uid}`);
      } else {
        await firebaseSignOut(auth);
        if (currentUser) {
           localStorage.removeItem(`userProfile_${currentUser.uid}`);
        }
      }
      
      setCurrentUser(null);
      setIsAdmin(false);

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

  // This is now a full DropdownMenu component
  const UserActionsMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
          <User className="h-5 w-5" />
          <span className="sr-only">User Menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover text-popover-foreground">
        {currentUser ? (
          <>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{isAdmin ? "Admin Account" : "My Account"}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {currentUser.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/wishlist')}>
              <Heart className="mr-2 h-4 w-4" />
              <span>Wishlist</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/ai-try-on')}>
              <Camera className="mr-2 h-4 w-4" />
              <span>AI Try-On</span>
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem onClick={() => router.push('/seller/dashboard')}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Admin Panel</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={() => router.push('/login')}>
              <LogIn className="mr-2 h-4 w-4" />
              <span>Login</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/signup')}>
              <UserPlus className="mr-2 h-4 w-4" />
              <span>Sign Up</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/ai-try-on')}>
              <Camera className="mr-2 h-4 w-4" />
              <span>AI Try-On</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const MobileNavLinks = ({onItemClick}: {onItemClick?: () => void}) => (
    <>
      {mainNavLinks.map((link) => (
        <SheetClose key={link.label} asChild>
          <Button variant="ghost" asChild className="w-full justify-start text-lg py-3 text-foreground hover:text-primary">
              <Link href={link.href} onClick={onItemClick}>
                {link.icon && <link.icon className="mr-2 h-4 w-4" />}
                {link.label}
              </Link>
          </Button>
        </SheetClose>
      ))}
    </>
  );

  const MobileUserActions = ({onItemClick}: {onItemClick?: () => void}) => {
    const handleAndClose = (path: string) => {
      router.push(path);
      onItemClick?.();
    };
    const handleLogoutAndClose = () => {
      handleLogout();
      onItemClick?.();
    };

    return (
      <div className="flex flex-col space-y-2">
        {currentUser ? (
          <>
            <div className="px-2 py-1.5 text-sm font-semibold">{isAdmin ? "Admin Account" : "My Account"}</div>
            <p className="px-2 pb-2 text-xs text-muted-foreground">{currentUser.email}</p>
            <SheetClose asChild><Button variant="ghost" onClick={() => handleAndClose('/wishlist')} className="w-full justify-start"><Heart className="mr-2 h-4 w-4" />Wishlist</Button></SheetClose>
            <SheetClose asChild><Button variant="ghost" onClick={() => handleAndClose('/ai-try-on')} className="w-full justify-start"><Camera className="mr-2 h-4 w-4" />AI Try-On</Button></SheetClose>
            {isAdmin && <SheetClose asChild><Button variant="ghost" onClick={() => handleAndClose('/seller/dashboard')} className="w-full justify-start"><LayoutDashboard className="mr-2 h-4 w-4" />Admin Panel</Button></SheetClose>}
            <DropdownMenuSeparator />
            <SheetClose asChild><Button variant="ghost" onClick={handleLogoutAndClose} className="w-full justify-start text-destructive"><LogOut className="mr-2 h-4 w-4" />Sign Out</Button></SheetClose>
          </>
        ) : (
          <>
            <SheetClose asChild><Button variant="ghost" onClick={() => handleAndClose('/login')} className="w-full justify-start"><LogIn className="mr-2 h-4 w-4" />Login</Button></SheetClose>
            <SheetClose asChild><Button variant="ghost" onClick={() => handleAndClose('/signup')} className="w-full justify-start"><UserPlus className="mr-2 h-4 w-4" />Sign Up</Button></SheetClose>
            <DropdownMenuSeparator />
            <SheetClose asChild><Button variant="ghost" onClick={() => handleAndClose('/ai-try-on')} className="w-full justify-start"><Camera className="mr-2 h-4 w-4" />AI Try-On</Button></SheetClose>
          </>
        )}
      </div>
    );
  }


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md dark:shadow-[0_4px_6px_-1px_rgba(255,255,255,0.08),_0_2px_4px_-2px_rgba(255,255,255,0.08)]">
      <div className="flex h-20 items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {mainNavLinks.map((link) => (
              <Button key={link.label} variant="ghost" asChild className="text-foreground hover:text-primary">
                <Link href={link.href}>
                  {link.icon && <link.icon className="mr-2 h-4 w-4" />}
                  {link.label}
                </Link>
              </Button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
            
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden md:block">
               <UserActionsMenu />
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
                    <MobileNavLinks onItemClick={() => setMobileMenuOpen(false)} />
                  </nav>
                  <div className="p-4 border-t border-border">
                    <MobileUserActions onItemClick={() => setMobileMenuOpen(false)} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
      </div>
    </header>
  );
}

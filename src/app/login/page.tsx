
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { auth, db, GoogleAuthProvider, signInWithPopup } from '@/lib/firebase/config';
import { signInWithEmailAndPassword, sendEmailVerification, type User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { LogIn, Loader2, Eye, EyeOff } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';

// Hardcoded admin credentials
const ADMIN_EMAIL = "brandboy553340@gmail.com";
const ADMIN_PASSWORD = "117691tcs";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setShowResend(false);
    setLoading(true);

    // Step 1: Check for hardcoded admin credentials first
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const mockAdminUser = {
        uid: 'admin_user_mock_uid',
        email: ADMIN_EMAIL,
      };
      localStorage.setItem(`userProfile_${mockAdminUser.uid}`, JSON.stringify({ role: 'admin' }));
      sessionStorage.setItem('loggedInUser', JSON.stringify(mockAdminUser));

      toast({ title: 'Login Successful', description: 'Welcome back, Admin!' });
      router.push('/seller/dashboard');
      setLoading(false);
      return;
    }

    // Step 2: If not admin, proceed with Firebase authentication for regular users
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        setError("Please verify your email before logging in.");
        setShowResend(true);
        setLoading(false);
        return;
      }

      const role = 'buyer';
      localStorage.setItem(`userProfile_${userCredential.user.uid}`, JSON.stringify({ role: role }));

      toast({ title: 'Login Successful', description: `Welcome back!` });
      router.push('/');

    } catch (err: any) {
      console.error("Login error:", err);
      let errorMessage = "Failed to login. Please check your credentials.";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      }
      setError(errorMessage);
      toast({ title: 'Login Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendVerification = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        toast({ title: "Verification Email Sent", description: "A new verification link has been sent to your email." });
      } catch (error) {
        toast({ title: "Error", description: "Failed to send verification email. Please try again.", variant: 'destructive' });
      }
    } else {
        toast({ title: "Error", description: "Could not find user. You may need to log in again.", variant: 'destructive' });
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user is new, if so, set up their data
      const userDocRef = doc(db, `users/${user.uid}`);
      const docSnap = await getDoc(userDocRef);
      if (!docSnap.exists()) {
        await setDoc(userDocRef, { email: user.email, createdAt: new Date() });
      }

      // Set user role in local storage
      localStorage.setItem(`userProfile_${user.uid}`, JSON.stringify({ role: 'buyer' }));
      
      toast({ title: 'Login Successful', description: `Welcome, ${user.displayName}!` });
      router.push('/');
    } catch (error: any) {
      console.error("Google login error:", error);
      let errorMessage = "Failed to sign in with Google. Please try again.";
      if(error.code === 'auth/popup-closed-by-user') {
          errorMessage = 'Sign-in process was cancelled.';
      }
      setError(errorMessage);
      toast({ title: 'Google Login Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-cover bg-center -z-10" 
        style={{ backgroundImage: 'url(https://i.postimg.cc/DzvKcbzJ/Gemini-Generated-Image-jwx2z2jwx2z2jwx2.png)' }} 
        data-ai-hint="floating fashion items background"
      />
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm -z-10" />
      <Card className="w-full max-w-md shadow-xl bg-card/80 backdrop-blur-lg border-white/20">
        <CardHeader className="text-center">
          <LogIn className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-3xl font-headline">Welcome Back!</CardTitle>
          <CardDescription>Sign in to continue to StyleFusion.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || googleLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading || googleLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
            </div>
            {error && (
              <p className="text-sm text-destructive flex items-center justify-between">
                {error}
                {showResend && (
                    <Button variant="link" type="button" onClick={handleResendVerification} className="p-0 h-auto text-xs">Resend Email</Button>
                )}
              </p>
            )}
             <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading || googleLoading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card/80 px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
        
          <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={loading || googleLoading}>
            {googleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FaGoogle className="mr-2 h-4 w-4" />
            )}
            Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Button variant="link" asChild className="p-0 h-auto">
              <Link href="/signup">Sign up</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

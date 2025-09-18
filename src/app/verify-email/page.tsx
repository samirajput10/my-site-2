
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase/config';
import { sendEmailVerification, onAuthStateChanged, User } from 'firebase/auth';
import { MailCheck, MailWarning, Loader2 } from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const email = searchParams.get('email');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleResendVerification = async () => {
    if (!currentUser) {
        toast({ title: "Error", description: "You must be logged in to resend a verification email.", variant: "destructive" });
        return;
    }
    setLoading(true);
    try {
      await sendEmailVerification(currentUser);
      toast({
        title: 'Verification Email Sent',
        description: `A new verification link has been sent to ${currentUser.email}.`,
      });
    } catch (error) {
      console.error("Resend verification error:", error);
      toast({
        title: 'Error',
        description: 'Failed to send verification email. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <MailCheck className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-3xl font-headline">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification link to <strong>{email || 'your email address'}</strong>. Please check your inbox and click the link to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
                After verifying, you can log in to your account. This page will not update automatically.
            </p>
             <Button onClick={() => router.push('/login')} className="w-full">
                Go to Login
            </Button>
        </CardContent>
        <CardContent className="space-y-4 text-center">
          <div className="text-sm text-muted-foreground">
            Didn't receive an email?
            <Button
              variant="link"
              onClick={handleResendVerification}
              disabled={loading || !currentUser}
              className="p-1 h-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Sending...
                </>
              ) : (
                'Resend link'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    )
}

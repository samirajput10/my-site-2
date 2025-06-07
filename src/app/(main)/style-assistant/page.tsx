"use client";

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { getStyleAdvice } from '@/actions/styleActions';
import Image from 'next/image';

export default function StyleAssistantPage() {
  const [prompt, setPrompt] = useState('');
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!prompt.trim()) {
      setError("Please describe your style need or occasion.");
      return;
    }
    setError(null);
    setSuggestions(null);

    startTransition(async () => {
      const result = await getStyleAdvice({ prompt });
      if ('error' in result) {
        setError(result.error);
      } else {
        setSuggestions(result.suggestions);
      }
    });
  };

  return (
    <div className="container mx-auto py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <Sparkles className="mx-auto h-16 w-16 text-primary mb-4" />
          <h1 className="text-4xl font-headline font-bold mb-3">AI Style Assistant</h1>
          <p className="text-lg text-muted-foreground">
            Describe your fashion needs, an upcoming event, or a style you're curious about, and get personalized advice!
          </p>
        </div>

        <Card className="shadow-xl rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Sparkles className="h-6 w-6 mr-2 text-primary" />
              Get Personalized Style Advice
            </CardTitle>
            <CardDescription>
              For example: "I need an outfit for a beach wedding" or "Help me find a casual chic look for fall."
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="style-prompt" className="text-base">Your Style Request</Label>
                <Textarea
                  id="style-prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Tell me about your style needs..."
                  rows={5}
                  className="mt-1 text-base"
                  disabled={isPending}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" size="lg" disabled={isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Getting Advice...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Get Style Advice
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {error && (
          <Card className="mt-8 bg-destructive/10 border-destructive text-destructive rounded-xl">
            <CardContent className="p-6 flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 mt-1" />
              <div>
                <CardTitle className="text-lg">Oops! Something went wrong.</CardTitle>
                <p className="text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {suggestions && (
          <Card className="mt-8 shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                 <Image src="https://placehold.co/40x40.png" alt="AI Stylist" width={40} height={40} className="rounded-full mr-3" data-ai-hint="avatar fashion" />
                Your Style Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none whitespace-pre-line text-base leading-relaxed">
                {suggestions}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

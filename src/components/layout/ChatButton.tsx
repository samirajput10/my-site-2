// src/components/layout/ChatButton.tsx
"use client";

import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react'; // Using MessageSquare, fa-comments equivalent
import { toggleChat } from './ChatWindow'; // Import the toggle function

export function ChatButton() {
  return (
    <Button
      onClick={toggleChat} // Call the toggle function
      variant="default" // Default Shadcn button style (primary)
      size="icon"
      className="fixed bottom-4 right-4 bg-primary text-primary-foreground rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-primary/90 transition duration-300"
      aria-label="Open live chat"
    >
      <MessageSquare className="h-6 w-6" />
    </Button>
  );
}


"use client";

import { Button } from '@/components/ui/button';
import { FaWhatsapp as WhatsAppIcon } from 'react-icons/fa';

const WHATSAPP_NUMBER = "923174919129";
const GREETING_MESSAGE = "Hello Lustra! I have a question.";

export function ChatButton() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(GREETING_MESSAGE)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50"
    >
      <Button
        size="icon"
        className="w-16 h-16 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-transform hover:scale-110"
      >
        <WhatsAppIcon className="h-8 w-8" />
      </Button>
    </a>
  );
}


import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProductImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  aiHint?: string;
}

const WHITELISTED_HOSTNAMES = ['placehold.co', 'firebasestorage.googleapis.com', 'i.postimg.cc'];

export function ProductImage({ src, alt, width, height, className, priority = false, aiHint = "fashion clothing" }: ProductImageProps) {
  const placeholderSrc = `https://placehold.co/${width}x${height}.png`;
  
  let isWhitelisted = false;
  if (src) {
    try {
      // Check for local paths first, which are always "whitelisted"
      if (src.startsWith('/')) {
        isWhitelisted = true;
      } else {
        const url = new URL(src);
        if (WHITELISTED_HOSTNAMES.includes(url.hostname)) {
          isWhitelisted = true;
        }
      }
    } catch (error) {
      // Invalid URL format, treat as not whitelisted.
      isWhitelisted = false;
    }
  }


  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = placeholderSrc;
  };

  const imageClasses = "object-cover transition-transform duration-300 group-hover:scale-105 w-full h-full";

  // Use a standard div and img tag to adhere to the new CSS structure
  return (
      <img
        src={isWhitelisted ? (src || placeholderSrc) : (src || placeholderSrc)}
        alt={alt}
        width={width}
        height={height}
        className={cn(imageClasses, className)}
        data-ai-hint={aiHint}
        onError={handleError}
        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        loading={priority ? 'eager' : 'lazy'}
      />
  );
}

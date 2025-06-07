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

export function ProductImage({ src, alt, width, height, className, priority = false, aiHint = "fashion clothing" }: ProductImageProps) {
  const placeholderSrc = src.startsWith('https://placehold.co') ? src : `https://placehold.co/${width}x${height}.png`;
  
  return (
    <div className={cn("relative overflow-hidden rounded-md", className)} style={{ width, height }}>
      <Image
        src={src.startsWith('https://placehold.co') ? placeholderSrc : src}
        alt={alt}
        width={width}
        height={height}
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        priority={priority}
        data-ai-hint={aiHint}
        onError={(e) => { (e.target as HTMLImageElement).src = placeholderSrc; }}
      />
    </div>
  );
}

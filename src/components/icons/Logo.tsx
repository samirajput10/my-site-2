
import Link from 'next/link';
import { Shirt } from 'lucide-react'; // Changed from Gem to Shirt for clothing

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2 group">
      <Shirt className="h-7 w-7 text-primary group-hover:text-primary/90 transition-colors" />
      <h1 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
        StyleFusion
      </h1>
    </Link>
  );
}

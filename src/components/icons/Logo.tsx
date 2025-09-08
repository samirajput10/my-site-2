
import Link from 'next/link';
import { Gem } from 'lucide-react'; // Changed from Shirt to Gem for jewelry

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2 group">
      <Gem className="h-7 w-7 text-primary group-hover:text-primary/90 transition-colors" />
      <h1 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
        Dazelle
      </h1>
    </Link>
  );
}

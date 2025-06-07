import Link from 'next/link';
<<<<<<< HEAD

export function Logo() {
  return (
    <Link href="/" className="text-3xl font-headline font-bold text-primary hover:text-primary/90 transition-colors">
      Fashion Frenzy
=======
import { Shirt } from 'lucide-react'; // Using Shirt icon as per user HTML (fa-tshirt)

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2 group">
      <Shirt className="h-7 w-7 text-primary group-hover:text-primary/90 transition-colors" />
      <h1 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
        Fashion Frenzy
      </h1>
>>>>>>> 8c7225b (first commit)
    </Link>
  );
}

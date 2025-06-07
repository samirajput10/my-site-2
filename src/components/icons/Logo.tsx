import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="text-3xl font-headline font-bold text-primary hover:text-primary/90 transition-colors">
      Fashion Frenzy
    </Link>
  );
}

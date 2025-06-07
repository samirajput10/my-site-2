<<<<<<< HEAD
export function Footer() {
  return (
    <footer className="border-t border-border/40 py-8 text-center text-sm text-muted-foreground">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} Fashion Frenzy. All rights reserved.</p>
        <p className="mt-1">
          Designed with <span className="text-primary">&hearts;</span> by an AI Fashionista.
        </p>
=======
// src/components/layout/Footer.tsx
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-border/40 py-8 text-center text-sm text-muted-foreground bg-footer-bg text-footer-text">
      <div className="container">
        <p>&copy; {currentYear} Fashion Frenzy. All rights reserved.</p>
        <p className="mt-1">
          Designed with <span className="text-primary">♥</span> by an AI Fashionista.
        </p>
        {/* Example of using footer-heading color, can be adapted for actual headings if needed */}
        {/* <h4 className="text-footer-heading mt-4">Quick Links</h4> */}
        {/* <Link href="/about" className="text-footer-text hover:text-primary-foreground">About</Link> */}
>>>>>>> 8c7225b (first commit)
      </div>
    </footer>
  );
}

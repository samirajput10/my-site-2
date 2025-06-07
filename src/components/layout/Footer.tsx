export function Footer() {
  return (
    <footer className="border-t border-border/40 py-8 text-center text-sm text-muted-foreground">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} Fashion Frenzy. All rights reserved.</p>
        <p className="mt-1">
          Designed with <span className="text-primary">&hearts;</span> by an AI Fashionista.
        </p>
      </div>
    </footer>
  );
}

import Link from 'next/link';

// landing page for cineflixx
// gives a first impression and clear call-to-actions
export default function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center 
                 text-foreground text-center p-4 
                 bg-gradient-to-br from-background via-card/50 to-background
                 dark:from-background dark:via-card/50 dark:to-background"
    >
      {/* app title, big and bold, trying to catch attention */}
      <h1 className="text-7xl sm:text-8xl font-black mb-6 text-primary tracking-tighter drop-shadow-lg">
        Cineflixx 🍿
      </h1>

      {/* tagline / elevator pitch */}
      <p className="text-xl sm:text-2xl mb-10 max-w-xl text-secondary font-medium">
        your ultimate film explorer. discover, track, and save your next obsession.
      </p>

      <div className="flex space-x-6">
        {/* primary call-to-action button */}
        <Link
          href="/dashboard"
          className="px-8 py-3 text-lg font-semibold rounded-full 
                     bg-primary text-white 
                     hover:bg-primary/90 
                     transition-all duration-300 
                     shadow-xl shadow-primary/40 dark:shadow-primary/30
                     transform hover:scale-[1.02]"
        >
          start exploring
        </Link>

        {/* secondary button for login */}
        <Link
          href="/login"
          className="px-8 py-3 text-lg font-semibold rounded-full 
                     bg-card text-card-foreground 
                     border-2 border-secondary/30 dark:border-secondary/50 
                     hover:bg-secondary/10 dark:hover:bg-secondary/20 
                     transition-colors duration-300"
        >
          login
        </Link>
      </div>

      {/* footer / attribution for tmdb */}
      <footer className="absolute bottom-4 text-xs text-secondary/60">
        powered by tmdb
      </footer>
    </div>
  );
}

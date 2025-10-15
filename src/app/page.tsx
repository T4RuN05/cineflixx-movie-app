// Path: src/app/page.tsx

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center 
                    text-foreground text-center p-4 
                    bg-gradient-to-br from-background via-card/50 to-background
                    dark:from-background dark:via-card/50 dark:to-background">
      
      {/* App Title */}
      <h1 className="text-7xl sm:text-8xl font-black mb-6 text-primary tracking-tighter drop-shadow-lg">
        Cineflixx 🍿
      </h1>
      
      {/* Tagline */}
      <p className="text-xl sm:text-2xl mb-10 max-w-xl text-secondary font-medium">
        Your ultimate film explorer. Discover, track, and save your next obsession.
      </p>
      
      <div className="flex space-x-6">
        {/* Start Exploring Button (Primary CTA) */}
        <Link href="/dashboard" className="px-8 py-3 text-lg font-semibold rounded-full 
          bg-primary text-white 
          hover:bg-primary/90 
          transition-all duration-300 
          shadow-xl shadow-primary/40 dark:shadow-primary/30
          transform hover:scale-[1.02]">
          Start Exploring
        </Link>
        
        {/* Login Button (Secondary CTA - FIXED VISIBILITY) */}
        <Link href="/login" className="px-8 py-3 text-lg font-semibold rounded-full 
          
          /* FIX: Ensure visibility with clear background/border */
          bg-card text-card-foreground 
          border-2 border-secondary/30 dark:border-secondary/50 
          hover:bg-secondary/10 dark:hover:bg-secondary/20 
          transition-colors duration-300">
          Login
        </Link>
      </div>

      {/* Footer/Attribution (Optional, for aesthetic balance) */}
      <footer className="absolute bottom-4 text-xs text-secondary/60">
        Powered by TMDB
      </footer>
    </div>
  );
}
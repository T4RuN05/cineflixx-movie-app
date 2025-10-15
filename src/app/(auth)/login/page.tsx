'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';

/**
 * LoginPage: Handles user login authentication using client-side context.
 * * NOTE ON SECURITY: This is a mock implementation. In a production app, 
 * the login function would involve a secure HTTP POST request to a backend API.
 */
export default function LoginPage() {
  // Local state to manage form inputs and the loading indicator
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Get necessary functions for authentication and navigation
  const { login, showToast } = useAppContext();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Call the mock 'login' function from context. This checks credentials 
    // against the data stored in localStorage under 'cineflixx_credentials'.
    const result = await login(email, password);
    
    if (result.success) {
      showToast('Login successful! Welcome back.', 'success');
      // Navigate to the secured dashboard route upon successful login
      router.push('/dashboard');
    } else {
      // Display the specific error message returned by the mock auth system
      showToast(result.message, 'error');
    }

    setLoading(false);
  };

  return (
    // The background uses custom Tailwind utility classes (bg-gradient-to-br) 
    // which automatically adjust for light/dark mode via global.css variables.
    <div className="min-h-screen flex items-center justify-center 
                    bg-gradient-to-br from-background via-card/50 to-background
                    p-4 sm:p-8">
      
      {/* Auth Card Container: Designed to match the modern, clean mock-up */}
      <div className="w-full max-w-md 
                      bg-card/90 backdrop-blur-sm 
                      p-8 sm:p-10 rounded-3xl 
                      shadow-2xl shadow-secondary/20 dark:shadow-secondary/40
                      border border-secondary/10">
        
        <h2 className="text-3xl font-extrabold mb-2 text-center text-card-foreground">
          Welcome Back
        </h2>
        <p className="text-center text-secondary mb-8 text-sm">
          Log in to continue exploring
        </p>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          
          <input 
            type="email" 
            placeholder="Email address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-3 rounded-xl bg-background border border-secondary/10 focus:border-primary outline-none transition-colors text-card-foreground"
            required 
          />
          
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-3 rounded-xl bg-background border border-secondary/10 focus:border-primary outline-none transition-colors text-card-foreground"
            required 
          />

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading} // Prevent multiple submissions while fetching/processing
            className="w-full py-3 mt-6 font-semibold rounded-xl 
                       bg-primary text-white 
                       hover:bg-primary/90 transition-all 
                       shadow-lg shadow-primary/50 dark:shadow-primary/40
                       transform hover:scale-[1.005] disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-secondary">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary hover:underline font-semibold">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

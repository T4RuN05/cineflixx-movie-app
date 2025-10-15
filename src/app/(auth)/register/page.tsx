'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';

export default function RegisterPage() {
  // State to manage input fields and UI loading status
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Custom hooks for global state and UI feedback
  const { register, showToast } = useAppContext();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // RATIONALE: Client-side validation is a standard best practice for immediate feedback.
    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      setLoading(false);
      return;
    }

    // Attempt mock registration via Context API. This function securely saves credentials to localStorage.
    const result = await register(name, email, password);
    
    if (result.success) {
      // FIX: Apostrophe in 'Logging in&apos;...' is escaped for Vercel build compliance.
      showToast('Registration successful! Logging in&apos;...', 'success'); 
      // Auto-redirect to the protected dashboard after successful mock registration/login
      router.push('/dashboard');
    } else {
      // Show error returned by the mock authentication logic (e.g., "User already registered")
      showToast(result.message, 'error');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center 
                    bg-gradient-to-br from-background via-card/50 to-background
                    p-4 sm:p-8">
      
      {/* Auth Card Container: Uses soft card colors, shadows, and blurred background for aesthetic appeal */}
      <div className="w-full max-w-md 
                      bg-card/90 backdrop-blur-sm 
                      p-8 sm:p-10 rounded-3xl 
                      shadow-2xl shadow-secondary/20 dark:shadow-secondary/40
                      border border-secondary/10">
        
        <h2 className="text-3xl font-extrabold mb-2 text-center text-card-foreground">
          Movie Explorer
        </h2>
        <p className="text-center text-secondary mb-8 text-sm">
          Create an account to start exploring
        </p>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          
          {/* Input Fields: All are controlled components bound to local state */}
          <input 
            type="text" 
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-5 py-3 rounded-xl bg-background border border-secondary/10 focus:border-primary outline-none transition-colors text-card-foreground"
            required 
          />
          
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
          
          <input 
            type="password" 
            placeholder="Confirm Password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-5 py-3 rounded-xl bg-background border border-secondary/10 focus:border-primary outline-none transition-colors text-card-foreground"
            required 
          />

          {/* Submit Button: Uses primary color accent, disabled when loading */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 mt-6 font-semibold rounded-xl 
                       bg-primary text-white 
                       hover:bg-primary/90 transition-all 
                       shadow-lg shadow-primary/50 dark:shadow-primary/40
                       transform hover:scale-[1.005] disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-secondary">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
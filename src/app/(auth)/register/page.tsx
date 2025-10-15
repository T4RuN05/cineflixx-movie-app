'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';

/**
 * RegisterPage: Manages user registration and password confirmation.
 * * RATIONALE: We perform basic client-side password matching before calling 
 * the mock registration API to improve immediate user feedback.
 */
export default function RegisterPage() {
  // State for all required input fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Hooks for context and navigation
  const { register, showToast } = useAppContext();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TRADE-OFF: Simple password match validation (client-side only for this mock)
    if (password !== confirmPassword) {
      showToast('Passwords do not match. Please verify.', 'error');
      setLoading(false);
      return;
    }

    // Attempt to register the new user (saves to localStorage)
    const result = await register(name, email, password);
    
    if (result.success) {
      // Auto-login upon successful registration, followed by dashboard redirect
      showToast('Registration successful! Logging in...', 'success');
      router.push('/dashboard');
    } else {
      // Handles 'User already registered' error
      showToast(result.message, 'error');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center 
                    bg-gradient-to-br from-background via-card/50 to-background
                    p-4 sm:p-8">
      
      {/* Auth Card Container */}
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

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading} // Disable the button while API call or process is running
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

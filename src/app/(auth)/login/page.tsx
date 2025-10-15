'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, showToast } = useAppContext();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // RATIONALE: Attempt login via Context API (Mock Auth). This function handles 
    // mock credential checking against localStorage.
    const result = await login(email, password);
    
    if (result.success) {
      showToast('Login successful! Welcome back.', 'success');
      // Redirect to protected dashboard after successful login
      router.push('/dashboard');
    } else {
      // Show error returned by the mock authentication logic
      showToast(result.message, 'error');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center 
                    bg-gradient-to-br from-background via-card/50 to-background
                    p-4 sm:p-8">
      
      {/* Auth Card Container: Uses soft card colors and shadows for aesthetic appeal */}
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
          
          {/* Email Input (Controlled Component) */}
          <input 
            type="email" 
            placeholder="Email address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-3 rounded-xl bg-background border border-secondary/10 focus:border-primary outline-none transition-colors text-card-foreground"
            required 
          />
          
          {/* Password Input (Controlled Component) */}
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-3 rounded-xl bg-background border border-secondary/10 focus:border-primary outline-none transition-colors text-card-foreground"
            required 
          />

          {/* Submit Button: Disabled during API call to prevent double-submission */}
          <button 
            type="submit" 
            disabled={loading}
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
          {/* FIX: Escaping the apostrophe for Vercel/React compliance */}
          Don&apos;t have an account?{' '} 
          <Link href="/register" className="text-primary hover:underline font-semibold">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
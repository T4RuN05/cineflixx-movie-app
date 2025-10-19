

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { MovieGridSkeleton } from './LoadingSkeleton'; 

/**
 * AuthGuard checks the authentication state and redirects unauthorized users.
 * It wraps the content of all protected pages.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
    // Get state and functions from context
    const { isAuthenticated, user, showToast } = useAppContext();
    const router = useRouter();
    const pathname = usePathname();
   
    const isProtected = pathname === '/dashboard' || pathname === '/favorites';
    const isLoadingAuth = user === undefined; 

    useEffect(() => {
        if (isProtected && !isLoadingAuth && !isAuthenticated) {
            showToast('Please log in to access this page.', 'error');
            router.replace('/login');
        }
        
        // Dependencies: showToast is stable (wrapped in useCallback in AppContext), 
        // isAuthenticated ensures the effect runs only when the user state changes.
    }, [isAuthenticated, isLoadingAuth, isProtected, router, showToast]); 


    if (isLoadingAuth || (isProtected && !isAuthenticated)) {
        return (
            <div className="container py-8">
                <MovieGridSkeleton count={12} />
            </div>
        );
    }
    return <>{children}</>;
}
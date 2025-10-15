'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaMoon, FaSun, FaBars, FaTimes } from 'react-icons/fa';
import { useAppContext } from '@/context/AppContext';
import { useState } from 'react';


const NavLink = ({ 
    href, 
    children, 
    onClick, 
    className 
}: { 
    href: string; 
    children: React.ReactNode; 
    onClick?: () => void; 
    className?: string; 
}) => {
    const pathname = usePathname();
    const isActive = pathname === href || (href === '/dashboard' && pathname.startsWith('/movie/')); 
    
    const finalClassName = `text-sm font-medium transition-colors duration-200 hover:text-primary 
        ${isActive ? 'text-primary border-b-2 border-primary' : 'text-foreground/80 hover:text-foreground'}
        ${className || ''}`; 
    
    return (
        <Link 
            href={href} 
            onClick={onClick}
            className={finalClassName} 
        >
            {children}
        </Link>
    );
};

export default function Header() {
    const { isDarkMode, toggleDarkMode, isAuthenticated, logout, showToast, user } = useAppContext();
    const router = useRouter();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const showFullHeader = !['/', '/login', '/register'].includes(pathname);

    if (!showFullHeader) {
        return null; 
    }
    
    const handleLogout = () => {
        logout();
        showToast('You have been logged out.', 'success');
        router.push('/'); 
    };

    const handleLinkClick = () => {
        setIsMenuOpen(false);
    };

    const logoDestination = isAuthenticated ? '/dashboard' : '/';

    return (
        <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-card-foreground/10 shadow-md">
            <div className="container h-16 flex items-center justify-between">
                
                {/* Logo/App Name: Conditional href */}
                <Link href={logoDestination} className="text-2xl font-bold tracking-tight text-primary">
                    Cineflixx
                </Link>

                <div className="flex items-center space-x-4 sm:space-x-6">
                    
                    {/* Desktop Links */}
                    <nav className="hidden md:flex space-x-6">
                        <NavLink href="/dashboard">Dashboard</NavLink>
                        <NavLink href="/favorites">My Favorites</NavLink>
                    </nav>
                    
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-full bg-card hover:bg-card-foreground/20 transition-colors duration-200 border border-secondary/10"
                        aria-label="Toggle dark mode"
                    >
                        {isDarkMode ? (
                            <FaSun className="h-5 w-5 text-yellow-400" />
                        ) : (
                            <FaMoon className="h-5 w-5 text-secondary" />
                        )}
                    </button>

                    {/* Desktop Auth Button */}
                    <div className="hidden md:flex space-x-4">
                        {isAuthenticated ? (
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm font-medium bg-secondary text-white rounded-lg hover:bg-secondary/80 transition-colors"
                            >
                                Logout ({user?.name || 'User'})
                            </button>
                        ) : (
                            <Link 
                                href="/login" 
                                className="px-4 py-2 text-sm font-medium bg-secondary text-white rounded-lg hover:bg-secondary/80 transition-colors"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                    
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-full bg-card hover:bg-card-foreground/20 transition-colors duration-200 border border-secondary/10"
                        aria-label="Toggle navigation menu"
                    >
                        {isMenuOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <div className={`md:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-60 border-t border-card-foreground/10 py-2' : 'max-h-0'}`}>
                <nav className="flex flex-col space-y-1 px-4">
                    {/* Mobile Navigation Links */}
                    <NavLink 
                        href="/dashboard" 
                        onClick={handleLinkClick} 
                        className="block w-full py-2 text-base text-foreground/90 hover:bg-secondary/10 rounded-lg transition-colors"
                    >
                        Dashboard
                    </NavLink>
                    <NavLink 
                        href="/favorites" 
                        onClick={handleLinkClick}
                        className="block w-full py-2 text-base text-foreground/90 hover:bg-secondary/10 rounded-lg transition-colors"
                    >
                        My Favorites
                    </NavLink>

                    {/* Mobile Auth Button */}
                    <div className="pt-2 pb-1">
                        {isAuthenticated ? (
                            <button
                                onClick={() => { handleLogout(); handleLinkClick(); }}
                                className="w-full text-left px-4 py-2 text-base font-medium bg-secondary text-white rounded-lg hover:bg-secondary/80 transition-colors"
                            >
                                Logout ({user?.name || 'User'})
                            </button>
                        ) : (
                            <Link 
                                href="/login" 
                                onClick={handleLinkClick}
                                className="w-full block text-left px-4 py-2 text-base font-medium bg-secondary text-white rounded-lg hover:bg-secondary/80 transition-colors"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}
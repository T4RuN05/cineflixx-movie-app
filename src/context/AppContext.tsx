'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback, useRef } from 'react';

// --- Type Definitions (Ensures TypeScript safety across the app) ---
interface Movie {
  id: number; title: string; poster_path: string | null; vote_average: number;
  release_date: string; overview: string; 
}

interface User {
  name: string;
  email: string;
  token: string; // Mock JWT token
}

// NEW TYPE: Represents the full object stored in the mock credentials storage.
// The password must be included here for the mock login validation.
interface StoredCredential extends User {
    password: string;
}

// Result type for login/register operations
type AuthResult = { success: true } | { success: false, message: string };

interface AppContextType {
  // ... (Methods) ...
  isDarkMode: boolean; toggleDarkMode: () => void;
  favorites: Movie[]; addFavorite: (movie: Movie) => void;
  removeFavorite: (movieId: number) => void; isFavorite: (movieId: number) => boolean;
  
  // --- AUTH STATE ---
  user: User | null | undefined; // undefined = loading state before localStorage check
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  
  // --- UI STATE ---
  toast: { message: string, type: 'success' | 'error' } | null;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- Storage Keys ---
const USER_KEY = 'cineflixx_user';
const CREDENTIALS_KEY = 'cineflixx_credentials'; 


export const AppProvider = ({ children }: { children: ReactNode }) => {
  // State: user is 'undefined' initially, signaling the AuthGuard to wait for hydration.
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [user, setUser] = useState<User | null | undefined>(undefined); 
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const isAuthenticated = !!user;
  const currentUserEmailRef = useRef<string | null>(null);


  // 
  // 1. USER-SCOPED FAVORITES STORAGE LOGIC
  // RATIONALE: Uses dynamic keys to prevent different users from seeing each other's favorites.
  // 

  const getFavoritesKey = (email: string) => `cineflixx_favorites_${email}`;

  const loadFavorites = useCallback((email: string) => {
    const key = getFavoritesKey(email);
    const storedFavorites = localStorage.getItem(key);
    try {
      return storedFavorites ? JSON.parse(storedFavorites) : [];
    } catch (e) {
      console.error(`ERROR: Failed to parse favorites for ${email}.`);
      return [];
    }
  }, []);

  const saveFavorites = useCallback((email: string, currentFavorites: Movie[]) => {
    const key = getFavoritesKey(email);
    localStorage.setItem(key, JSON.stringify(currentFavorites));
  }, []);
  
  // 
  // 2. INITIALIZATION & SYNCHRONIZATION EFFECTS
  // 

  // EFFECT 1: Runs once on mount to hydrate state from localStorage.
  useEffect(() => {
    // Theme Loading (standard procedure)
    const root = window.document.documentElement;
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDarkMode = storedTheme === 'dark' || (!storedTheme && systemPrefersDark);
    setIsDarkMode(initialDarkMode);
    root.classList.toggle('dark', initialDarkMode);

    // User Loading
    const storedUser = localStorage.getItem(USER_KEY);
    let initialUser: User | null = null;
    if (storedUser) {
        try { initialUser = JSON.parse(storedUser); } catch (e) { localStorage.removeItem(USER_KEY); }
    }
    setUser(initialUser); 

    // Initial Favorites Load (only loads if a user object was retrieved)
    if (initialUser) {
        currentUserEmailRef.current = initialUser.email;
        setFavorites(loadFavorites(initialUser.email));
    }
  }, [loadFavorites]);

  // EFFECT 2: Handles user changes (Login/Logout) and loads the correct favorites list.
  useEffect(() => {
    if (user && user.email !== currentUserEmailRef.current) {
        // RATIONALE: New user logged in. Load their specific data.
        setFavorites(loadFavorites(user.email));
        currentUserEmailRef.current = user.email;
    } else if (user === null && currentUserEmailRef.current !== null) { 
        // RATIONALE: User logged out. Clear current user state in context.
        currentUserEmailRef.current = null;
        setFavorites([]); 
    }
    
    // FRAMEWORK CONVENTION: Sync user object to localStorage on change.
    if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else if (user === null) {
        localStorage.removeItem(USER_KEY);
    }
  }, [user, loadFavorites]);

  // EFFECT 3: Sync favorites state to localStorage dynamically.
  useEffect(() => {
    if (user) {
        // RATIONALE: Runs whenever the favorites list is modified (add/remove).
        saveFavorites(user.email, favorites);
    }
  }, [favorites, user, saveFavorites]);


  // 
  // 3. AUTHENTICATION LOGIC (Mock)
  // TRADE-OFF: This system uses localStorage and is NOT secure for production.
  // 
  
  const mockGetCredentials = (): Record<string, unknown> => {
    const creds = localStorage.getItem(CREDENTIALS_KEY);
    try {
        return creds ? JSON.parse(creds) : {};
    } catch (error) {
        console.error("Failed to parse credentials from localStorage:", error);
        return {};
    }
  };

  // Login/Register use useCallback to stabilize the function references.
  const register = useCallback(async (name: string, email: string, password: string): Promise<AuthResult> => {
    const credentials = mockGetCredentials();
    if (credentials[email]) {
      return { success: false, message: 'User already registered.' };
    }
    
    // Create the full credential object to store
    const newCredential: StoredCredential = { name, email, password, token: crypto.randomUUID() };
    
    // CRITICAL FIX 1: Ensure we assert the key/value pair is the StoredCredential type
    credentials[email] = newCredential; 
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
    
    // Auto-login: Only expose the minimal User data to the global user state
    const newUser: User = { name, email, token: newCredential.token };
    setUser(newUser);
    return { success: true };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const credentials = mockGetCredentials();
    
    // Assert the stored object is the StoredCredential type for validation
    const storedCredential = credentials[email] as StoredCredential; 
    
    // CRITICAL FIX 2: Access the password property safely on the asserted type
    if (!storedCredential || storedCredential.password !== password) {
      return { success: false, message: 'Invalid email or password.' };
    }
    
    // Login successful: Create the minimal User object for global state
    const loggedInUser: User = { name: storedCredential.name, email, token: storedCredential.token };
    setUser(loggedInUser);
    return { success: true };
  }, []);

  const logout = () => {
    // Setting user to null triggers necessary cleanup via useEffects.
    setUser(null); 
  };

  // 
  // 4. UI and Theme Logic (useCallback for stability)
  // 

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      window.document.documentElement.classList.toggle('dark', newMode);
      return newMode;
    });
  }, []); 

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    // Hide after 3 seconds
    setTimeout(() => setToast(null), 3000); 
  }, []); 
  
  const addFavorite = (movie: Movie) => { 
    if (!favorites.some(f => f.id === movie.id)) { setFavorites(prev => [...prev, movie]); }
  };
  const removeFavorite = (movieId: number) => { 
    setFavorites(prev => prev.filter(m => m.id !== movieId)); 
  };
  const isFavorite = (movieId: number) => { return favorites.some(m => m.id === movieId); };


  return (
    <AppContext.Provider
      value={{
        isDarkMode, toggleDarkMode,
        favorites, addFavorite, removeFavorite, isFavorite,
        
        user, isAuthenticated, login, register, logout,
        
        toast, showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    if (typeof window !== 'undefined') { 
        // FRAMEWORK CONVENTION: Throws error if used outside a provider block.
        throw new Error('useAppContext must be used within an AppProvider'); 
    }
  }
  return context as AppContextType;
};

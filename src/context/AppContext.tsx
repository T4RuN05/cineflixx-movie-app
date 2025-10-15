'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback, useRef } from 'react';

interface Movie { 
  id: number; 
  title: string; 
  poster_path: string | null; 
  vote_average: number;
  release_date: string; 
  overview: string; 
}

interface User { 
  name: string;
  email: string;
  token: string;
}

type AuthResult = { success: true } | { success: false, message: string }; // FIX 4: Restores AuthResult type

interface AppContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  favorites: Movie[];
  addFavorite: (movie: Movie) => void;
  removeFavorite: (movieId: number) => void;
  isFavorite: (movieId: number) => boolean;
  
  //  AUTH STATE & ACTIONS 
  user: User | null | undefined; // Can be null, User, or undefined (loading)
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  
  //  UI STATE 
  toast: { message: string, type: 'success' | 'error' } | null;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// storage keys
const USER_KEY = 'cineflixx_user';
const CREDENTIALS_KEY = 'cineflixx_credentials'; 


// component
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = loading
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  const isAuthenticated = !!user;

  // Ref to hold the current user's email, used in the save/load functions
  const currentUserEmailRef = useRef<string | null>(null);


  
  // DYNAMIC FAVORITES STORAGE LOGIC
  

  const getFavoritesKey = (email: string) => `cineflixx_favorites_${email}`;

  const loadFavorites = useCallback((email: string) => {
    const key = getFavoritesKey(email);
    const storedFavorites = localStorage.getItem(key);
    try {
      return storedFavorites ? JSON.parse(storedFavorites) : [];
    } catch (e) {
      console.error(`Failed to load favorites for ${email}`);
      return [];
    }
  }, []);

  const saveFavorites = useCallback((email: string, currentFavorites: Movie[]) => {
    const key = getFavoritesKey(email);
    localStorage.setItem(key, JSON.stringify(currentFavorites));
  }, []);
  
  
  // INITIALIZATION & STATE SYNCHRONIZATION
 

  // Load state (Theme, User, Initial Favorites) on mount
  useEffect(() => {
    // Theme
    const root = window.document.documentElement;
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDarkMode = storedTheme === 'dark' || (!storedTheme && systemPrefersDark);
    setIsDarkMode(initialDarkMode);
    root.classList.toggle('dark', initialDarkMode);

    // User (Token)
    const storedUser = localStorage.getItem(USER_KEY);
    let initialUser: User | null = null;
    if (storedUser) {
        try { initialUser = JSON.parse(storedUser); } catch (e) { localStorage.removeItem(USER_KEY); }
    }
    setUser(initialUser);

    // Initial Favorites Load (based on loaded user)
    if (initialUser) {
        currentUserEmailRef.current = initialUser.email;
        setFavorites(loadFavorites(initialUser.email));
    } else {
        currentUserEmailRef.current = null;
        setFavorites([]);
    }
  }, [loadFavorites]);

  // Sync user state to localStorage
  useEffect(() => {
    if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        // When a user logs in, load *their* favorites
        if (user.email !== currentUserEmailRef.current) {
            setFavorites(loadFavorites(user.email));
            currentUserEmailRef.current = user.email;
        }
    } else if (user === null) { // User explicitly logged out
        localStorage.removeItem(USER_KEY);
        currentUserEmailRef.current = null;
        setFavorites([]); 
    }
  }, [user, loadFavorites]);

  // Sync current favorites state to localStorage dynamically
  useEffect(() => {
    if (user) {
        saveFavorites(user.email, favorites);
    }
  }, [favorites, user, saveFavorites]);


  // ===============================================
  // 3. AUTHENTICATION LOGIC (Mock)
  // ===============================================
  
  const mockGetCredentials = (): Record<string, any> => {
    const creds = localStorage.getItem(CREDENTIALS_KEY);
    return creds ? JSON.parse(creds) : {};
  };

  const register = useCallback(async (name: string, email: string, password: string): Promise<AuthResult> => {
    const credentials = mockGetCredentials();
    if (credentials[email]) {
      return { success: false, message: 'User already registered.' };
    }
    credentials[email] = { name, password, token: crypto.randomUUID() };
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
    const newUser: User = { name, email, token: credentials[email].token };
    setUser(newUser);
    return { success: true };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const credentials = mockGetCredentials();
    const storedUser = credentials[email];
    if (!storedUser || storedUser.password !== password) {
      return { success: false, message: 'Invalid email or password.' };
    }
    const loggedInUser: User = { name: storedUser.name, email, token: storedUser.token };
    setUser(loggedInUser);
    return { success: true };
  }, []);

  const logout = () => {
    setUser(null); 
  };


  // UI and Theme Logic
  

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
        isDarkMode, 
        toggleDarkMode, 
        favorites, 
        addFavorite, 
        removeFavorite, 
        isFavorite,
        
        user,
        isAuthenticated, 
        login, 
        register, 
        logout,
        
        toast, 
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom Hook 
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    // Check if running on the client before throwing the error
    if (typeof window !== 'undefined') { 
        throw new Error('useAppContext must be used within an AppProvider'); 
    }
  }
  return context as AppContextType; // Assert type to prevent null/undefined checks elsewhere
};
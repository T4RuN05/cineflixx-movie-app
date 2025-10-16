'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback, useRef } from 'react';

// --- Type Definitions ---
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

interface StoredCredential extends User {
  password: string;
}

type AuthResult = { success: true } | { success: false; message: string };

interface AppContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  favorites: Movie[];
  addFavorite: (movie: Movie) => void;
  removeFavorite: (movieId: number) => void;
  isFavorite: (movieId: number) => boolean;

  user: User | null | undefined;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => void;

  toast: { message: string; type: 'success' | 'error' } | null;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- Storage Keys ---
const USER_KEY = 'cineflixx_user';
const CREDENTIALS_KEY = 'cineflixx_credentials';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const isAuthenticated = !!user;
  const currentUserEmailRef = useRef<string | null>(null);

  const getFavoritesKey = (email: string) => `cineflixx_favorites_${email}`;

  const loadFavorites = useCallback((email: string) => {
    const key = getFavoritesKey(email);
    const storedFavorites = localStorage.getItem(key);
    try {
      return storedFavorites ? JSON.parse(storedFavorites) as Movie[] : [];
    } catch {
      console.error(`ERROR: Failed to parse favorites for ${email}.`);
      return [];
    }
  }, []);

  const saveFavorites = useCallback((email: string, currentFavorites: Movie[]) => {
    localStorage.setItem(getFavoritesKey(email), JSON.stringify(currentFavorites));
  }, []);

  // --- INITIALIZATION ---
  useEffect(() => {
    const root = window.document.documentElement;
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDarkMode = storedTheme === 'dark' || (!storedTheme && systemPrefersDark);
    setIsDarkMode(initialDarkMode);
    root.classList.toggle('dark', initialDarkMode);

    const storedUser = localStorage.getItem(USER_KEY);
    let initialUser: User | null = null;
    if (storedUser) {
      try {
        initialUser = JSON.parse(storedUser) as User;
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }
    setUser(initialUser);

    if (initialUser) {
      currentUserEmailRef.current = initialUser.email;
      setFavorites(loadFavorites(initialUser.email));
    }
  }, [loadFavorites]);

  // --- USER/FAVORITES SYNC ---
  useEffect(() => {
    if (user && user.email !== currentUserEmailRef.current) {
      setFavorites(loadFavorites(user.email));
      currentUserEmailRef.current = user.email;
    } else if (user === null && currentUserEmailRef.current !== null) {
      currentUserEmailRef.current = null;
      setFavorites([]);
    }

    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else if (user === null) {
      localStorage.removeItem(USER_KEY);
    }
  }, [user, loadFavorites]);

  useEffect(() => {
    if (user) {
      saveFavorites(user.email, favorites);
    }
  }, [favorites, user, saveFavorites]);

  // --- AUTH LOGIC ---
  const mockGetCredentials = () => {
    const creds = localStorage.getItem(CREDENTIALS_KEY);
    try {
      return creds ? (JSON.parse(creds) as Record<string, StoredCredential>) : {};
    } catch {
      console.error('Failed to parse credentials from localStorage');
      return {};
    }
  };

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<AuthResult> => {
      const credentials = mockGetCredentials();
      if (credentials[email]) return { success: false, message: 'User already registered.' };

      const newCredential: StoredCredential = { name, email, password, token: crypto.randomUUID() };
      credentials[email] = newCredential;
      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));

      const newUser: User = { name, email, token: newCredential.token };
      setUser(newUser);
      return { success: true };
    },
    []
  );

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const credentials = mockGetCredentials();
      const storedCredential = credentials[email];

      if (!storedCredential || storedCredential.password !== password) {
        return { success: false, message: 'Invalid email or password.' };
      }

      const loggedInUser: User = { name: storedCredential.name, email, token: storedCredential.token };
      setUser(loggedInUser);
      return { success: true };
    },
    []
  );

  const logout = () => setUser(null);

  // --- UI/Theme ---
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

  // --- FAVORITES ---
  const addFavorite = (movie: Movie) => {
    if (!favorites.some(f => f.id === movie.id)) setFavorites(prev => [...prev, movie]);
  };
  const removeFavorite = (movieId: number) => setFavorites(prev => prev.filter(m => m.id !== movieId));
  const isFavorite = (movieId: number) => favorites.some(m => m.id === movieId);

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

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

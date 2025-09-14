import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { handleRedirectResult } from '@/lib/auth';
import { useLocation } from 'wouter';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Handle redirect result from Google Sign-In
    handleRedirectResult().then((redirectUser) => {
      if (redirectUser) {
        // User just signed in via Google redirect, navigate to dashboard
        setLocation('/dashboard');
      }
    }).catch(console.error);

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      const currentPath = window.location.pathname;
      const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(currentPath);
      
      setUser(authUser);
      setLoading(false);
      
      // Redirect authenticated user away from auth pages
      if (authUser && isAuthPage) {
        setLocation('/dashboard');
      }
    });

    return unsubscribe;
  }, [setLocation]);

  const value = {
    user,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

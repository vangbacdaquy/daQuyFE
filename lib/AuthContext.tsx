"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { onAuthStateChanged, getAuth, User } from "firebase/auth";
import { app } from "@/lib/firebase";

const auth = getAuth(app);

interface AuthContextType {
  user: User | null;
  loading: boolean;
  getJwt: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  getJwt: async () => null,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getJwt = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    try {
      return await user.getIdToken();
    } catch (error) {
      console.error("Error getting JWT:", error);
      return null;
    }
  }, [user]);

  const value = {
    user,
    loading,
    getJwt,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

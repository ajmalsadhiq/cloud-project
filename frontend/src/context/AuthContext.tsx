"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import apiClient from "../lib/api";
import { User, ApiResponse } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync token from localStorage and fetch current profile on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("cloudvault_token");
        const storedUser = localStorage.getItem("cloudvault_user");

        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }

          // Verify with backend
          const res = await apiClient.get<ApiResponse<User>>("/auth/me");
          if (res.data?.success && res.data.data) {
            setUser(res.data.data);
            localStorage.setItem("cloudvault_user", JSON.stringify(res.data.data));
          }
        }
      } catch {
        // If token expired or invalid, purge
        localStorage.removeItem("cloudvault_token");
        localStorage.removeItem("cloudvault_user");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiClient.post<ApiResponse<{ user: User; token: string }>>("/auth/login", {
      email,
      password,
    });

    if (res.data?.success && res.data.data) {
      const { user: userData, token: jwtToken } = res.data.data;
      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem("cloudvault_token", jwtToken);
      localStorage.setItem("cloudvault_user", JSON.stringify(userData));
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await apiClient.post<ApiResponse<{ user: User; token: string }>>("/auth/register", {
      name,
      email,
      password,
    });

    if (res.data?.success && res.data.data) {
      const { user: userData, token: jwtToken } = res.data.data;
      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem("cloudvault_token", jwtToken);
      localStorage.setItem("cloudvault_user", JSON.stringify(userData));
    }
  };

  const logout = () => {
    localStorage.removeItem("cloudvault_token");
    localStorage.removeItem("cloudvault_user");
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await apiClient.get<ApiResponse<User>>("/auth/me");
      if (res.data?.success && res.data.data) {
        setUser(res.data.data);
        localStorage.setItem("cloudvault_user", JSON.stringify(res.data.data));
      }
    } catch {
      // Ignored
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

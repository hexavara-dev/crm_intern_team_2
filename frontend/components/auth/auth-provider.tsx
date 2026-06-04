"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  getUser,
  logout as clearCookies,
  setUser,
  setToken,
} from "@/lib/cookies";
import api from "@/lib/api";
import {
  AuthUser,
  LoginCredentials,
  OnboardData,
  RegisterData,
  AuthResponse,
} from "@/types/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  onboard: (data: OnboardData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setInternalUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  useEffect(() => {
    const savedUser = getUser();
    if (savedUser) {
      try {
        const parsed =
          typeof savedUser === "string" ? JSON.parse(savedUser) : savedUser;
        setInternalUser(parsed);
      } catch {
        setInternalUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (
      !isLoading &&
      !user &&
      pathname !== "/login" &&
      pathname !== "/register"
    ) {
      router.push("/login");
    }
  }, [user, isLoading, router, pathname]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const payload: LoginCredentials = {
        email: credentials.email.trim(),
        password: credentials.password,
      };

      const response = await api.post<AuthResponse>("/api/auth/login", payload);
      return response.data;
    },
    onSuccess: (data) => {
      setToken(data.token);
      setUser(data.user);
      setInternalUser(data.user);
      toast.success("Login successful!");

      if (data.user.role === "owner") {
        router.push("/");
        return;
      }

      router.push("/leads");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } };
      const backendError = err.response?.data?.error;

      if (backendError?.includes("Illegal arguments: string, undefined")) {
        toast.error(
          "Login gagal: akun belum punya password yang valid. Minta admin reset/buat ulang akun.",
        );
        return;
      }

      toast.error(
        backendError || "Login failed. Please check your credentials.",
      );
    },
  });

  const onboardMutation = useMutation({
    mutationFn: async (data: OnboardData) => {
      const response = await api.post<AuthResponse>("/api/auth/onboard", data);
      return response.data;
    },
    onSuccess: (data) => {
      setToken(data.token);
      setUser(data.user);
      setInternalUser(data.user);
      toast.success("Account created successfully!");
      router.push("/leads");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Failed to create account.");
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await api.post<AuthResponse>("/api/auth/register", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Registration successful!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Registration failed.");
    },
  });

  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  };

  const onboard = async (data: OnboardData) => {
    await onboardMutation.mutateAsync(data);
  };

  const register = async (data: RegisterData) => {
    await registerMutation.mutateAsync(data);
  };

  const logout = () => {
    clearCookies();
    setInternalUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        onboard,
        register,
        logout,
        isLoading:
          isLoading ||
          loginMutation.isPending ||
          onboardMutation.isPending ||
          registerMutation.isPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

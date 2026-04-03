import { create } from "zustand";
import type { User } from "@workspace/api-client-react";

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const stored = localStorage.getItem("celebfancards_auth");
  let initialUser = null;
  let initialToken = null;

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      initialUser = parsed.user;
      initialToken = parsed.token;
    } catch (e) {
      console.error("Failed to parse stored auth", e);
    }
  }

  return {
    user: initialUser,
    token: initialToken,
    setAuth: (user, token) => {
      localStorage.setItem("celebfancards_auth", JSON.stringify({ user, token }));
      set({ user, token });
    },
    logout: () => {
      localStorage.removeItem("celebfancards_auth");
      set({ user: null, token: null });
    },
  };
});

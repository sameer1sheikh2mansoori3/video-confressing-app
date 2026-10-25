import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "../api/axios";

const sanitizeUser = (user) => {
  if (!user) return null;

  const { password, ...safeUser } = user;

  return safeUser;
};

const getErrorMessage = (error) => {
  return (
    error.response?.data?.message ||
    error.message ||
    "Something went wrong"
  );
};

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      signup: async (formData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.post("/auth/signup", {
            username: formData.username,
            email: formData.email,
            password: formData.password,
          });

          set({
            isLoading: false,
            error: null,
          });

          return response.data;
        } catch (error) {
          const message = getErrorMessage(error);

          set({ isLoading: false, error: message });

          throw new Error(message);
        }
      },

      login: async (formData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.post("/auth/login", {
            email: formData.email,
            password: formData.password,
          });

          const data = response.data;
          const token = data.token || data.accessToken || data.jwt;

          if (!token) {
            throw new Error(
              "Login response mein JWT token nahi mila."
            );
          }

          set({
            user: sanitizeUser(data.user),
            token,
            isLoading: false,
            error: null,
          });

          return data;
        } catch (error) {
          const message = getErrorMessage(error);

          set({ isLoading: false, error: message });

          throw new Error(message);
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isLoading: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);
import React, { createContext, useContext, useState, useEffect } from "react";
import { adminLogin as apiAdminLogin } from "@/lib/api";
import { apiRequest } from "@/lib/queryClient";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => false,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check if token exists in localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    console.log("AuthContext: Login called with", username);
    try {
      console.log("AuthContext: Calling API login");
      const data = await apiAdminLogin(username, password);
      console.log("AuthContext: API response", data);
      
      if (data && data.token) {
        console.log("AuthContext: Setting token in localStorage");
        localStorage.setItem("adminToken", data.token);
        console.log("AuthContext: Setting isAuthenticated to true");
        setIsAuthenticated(true);
        return true;
      }
      console.log("AuthContext: No token received, login failed");
      return false;
    } catch (error) {
      console.error("AuthContext: Login error:", error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      localStorage.removeItem("adminToken");
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const value = {
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

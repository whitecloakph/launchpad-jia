"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useLocalStorage } from "../hooks/useLocalStorage";

// Define the shape of the context data
interface AppContextProps {
  // Add your global props here
  user: any;
  isAuthenticated: boolean;
  theme: string;
  orgID: string;
  setUser: (user: any) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setTheme: (theme: string) => void;
}

// Create the context with default values
const AppContext = createContext<AppContextProps>({
  user: null,
  isAuthenticated: false,
  theme: "light",
  orgID: "",
  setUser: () => {},
  setIsAuthenticated: () => {},
  setTheme: () => {},
});

// Custom hook to use the context
export const useAppContext = () => useContext(AppContext);

// Context Provider component
export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState("light");
  const [orgID, setOrgID] = useState("");
  const searchParams = useSearchParams();
  const [activeOrg, setActiveOrg] = useLocalStorage("activeOrg", null);

  // Add any initialization logic here
  // For example, load user data from localStorage on mount
  React.useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const authToken = localStorage.getItem("authToken");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (authToken) {
      setIsAuthenticated(true);
    }
  }, []);

  React.useEffect(() => {
    const orgIDParams = searchParams.get("orgID");

    if (orgIDParams) {
      setOrgID(orgIDParams);
    }

    if (activeOrg) {
      setOrgID(activeOrg._id);
    }
  }, [activeOrg, searchParams]);

  // The value to be provided to consuming components
  const contextValue = {
    user,
    isAuthenticated,
    theme,
    orgID,
    setUser,
    setIsAuthenticated,
    setTheme,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

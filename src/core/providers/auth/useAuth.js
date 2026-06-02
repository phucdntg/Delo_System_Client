import { createContext, useContext } from "react";

export const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      token: null,
      user: null,
      loading: true,
      isAuthenticated: false,
      selectedOrg: null,
      domainActive: [],
      setDomainActive: () => {},
      saveSelectedOrg: () => {},
      logout: () => {},
      setToken: () => {},
      setUser: () => {},
      updateUser: () => {},
    };
  }

  return context;
}

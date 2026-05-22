import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLazyGetCurrentUserQuery } from "../../domains/auth/login/services/authService";
import {
  ACCESS_TOKEN,
  ORG_ID,
  REFRESH_TOKEN,
} from "../../shared/constants/systemConstants";
import { allRTKServices } from "../services/allRTKServices";
import { store } from "../store";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState(
    Number(localStorage.getItem(ORG_ID) || 0) || null,
  );
  const [triggerGetCurrentUser] = useLazyGetCurrentUserQuery();

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const access = localStorage.getItem(ACCESS_TOKEN);
        if (access) setToken(access);

        if (access) {
          try {
            const res = await triggerGetCurrentUser();
            const fetched = res?.data ?? res;
            if (mounted && fetched) {
              saveUser(fetched);
            }
          } catch (err) {
            console.error("AuthProvider: getCurrentUser failed", err);
            if (mounted) {
              saveToken(null);
              saveUser(null);
            }
          }
        }
      } catch (err) {
        console.error("AuthProvider: failed to read from localStorage", err);
        if (mounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [triggerGetCurrentUser]);

  const saveToken = useCallback((t) => {
    if (t) {
      if (typeof t === "string") {
        localStorage.setItem(ACCESS_TOKEN, t);
        setToken(t);
      } else if (typeof t === "object") {
        const access = t.accessToken || t.access_token || "";
        const refresh = t.refreshToken || t.refresh_token || "";
        if (access) localStorage.setItem(ACCESS_TOKEN, access);
        if (refresh) localStorage.setItem(REFRESH_TOKEN, refresh);
        setToken(access || null);
      }
    } else {
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(REFRESH_TOKEN);
      setToken(null);
    }
  }, []);

  const saveUser = useCallback((u) => {
    if (u) {
      setUser(u);
    } else {
      setUser(null);
    }
  }, []);

  const logout = useCallback(() => {
    saveToken(null);
    saveUser(null);
  }, [saveToken, saveUser]);

  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      const updated = { ...(prev || {}), ...patch };
      return updated;
    });
  }, []);

  const saveSelectedOrg = useCallback((org) => {
    setSelectedOrg(org?.id);
    localStorage.setItem(ORG_ID, org?.id || "");

    Object.values(allRTKServices).forEach((service) => {
      store.dispatch(
        service.util.invalidateTags([{ type: "Branch", id: "LIST" }]),
      );
    });
  }, []);

  const value = {
    token,
    user,
    loading,
    isAuthenticated: !!token,
    selectedOrg,
    saveSelectedOrg,
    logout,
    setToken: saveToken,
    setUser: saveUser,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

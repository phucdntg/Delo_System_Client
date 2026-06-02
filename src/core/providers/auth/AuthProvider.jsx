import { useLazyGetCurrentUserQuery } from "@domains/auth";
import {
  ACCESS_TOKEN,
  ORG_ID,
  REFRESH_TOKEN,
} from "@shared/constants/systemConstants";
import { useCallback, useEffect, useRef, useState } from "react";
import { allRTKServices } from "@core/services/allRTKServices";
import { store } from "@core/store";

import { AuthContext } from "./useAuth";

export function AuthProvider({ children }) {
  const domainActive = ["qms", "lookup", "evaluation", "qna"];
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState(() => {
    const stored = localStorage.getItem(ORG_ID);
    return stored ? Number(stored) : 0;
  });

  const [triggerGetCurrentUser] = useLazyGetCurrentUserQuery();

  // Stabilize ref to prevent HMR re-trigger
  const triggerRef = useRef(triggerGetCurrentUser);

  useEffect(() => {
    triggerRef.current = triggerGetCurrentUser;
  });

  useEffect(() => {
    let mounted = true;
    let called = false;

    async function init() {
      if (called) return;
      called = true;

      try {
        const access = localStorage.getItem(ACCESS_TOKEN);
        if (access) setToken(access);

        if (access) {
          try {
            const res = await triggerRef.current();
            const fetched = res?.data ?? res;
            if (mounted && fetched) {
              saveUser(fetched);
            }
          } catch (err) {
            console.error("AuthProvider: getCurrentUser failed", err);
          }
        }
      } catch (err) {
        console.error("AuthProvider: failed to read from localStorage", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

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
    saveSelectedOrg(null);
  }, [saveToken, saveUser]);

  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      const updated = { ...(prev || {}), ...patch };
      return updated;
    });
  }, []);

  const saveSelectedOrg = useCallback((org) => {
    if (org === null) {
      setSelectedOrg(null);
      localStorage.removeItem(ORG_ID);
      return;
    }

    const orgId = org?.id ?? 0;
    setSelectedOrg(orgId);
    localStorage.setItem(ORG_ID, String(orgId));

    Object.values(allRTKServices).forEach((service) => {
      store.dispatch(
        service.util.invalidateTags([
          { type: "Area", id: "LIST" },
          { type: "Branch", id: "LIST" },
          { type: "Role", id: "LIST" },
        ]),
      );
    });
  }, []);

  useEffect(() => {
    if (selectedOrg === null && user) {
      saveSelectedOrg({ id: 0 });
    }
  }, [user, selectedOrg, saveSelectedOrg]);

  const value = {
    token,
    user,
    loading,
    isAuthenticated: !!token,
    selectedOrg,
    domainActive,
    saveSelectedOrg,
    logout,
    setToken: saveToken,
    setUser: saveUser,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

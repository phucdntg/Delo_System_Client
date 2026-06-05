import { useCallback, useEffect, useMemo, useState } from "react";
import { SidebarContext } from "./useSidebar";

export const SidebarProvider = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => setIsMobileOpen(false), []);

  const toggleMobileSidebar = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const toggleSubmenu = useCallback((item) => {
    setOpenSubmenu((prev) => (prev === item ? null : item));
  }, []);

  const value = useMemo(() => ({
    isExpanded: isMobile ? false : isExpanded,
    isMobileOpen,
    isHovered,
    activeItem,
    openSubmenu,
    toggleSidebar,
    toggleMobileSidebar,
    setIsHovered,
    setActiveItem,
    toggleSubmenu,
    closeSidebar,
  }), [
    isMobile, isExpanded, isMobileOpen, isHovered, activeItem, openSubmenu,
    toggleSidebar, toggleMobileSidebar, setIsHovered, setActiveItem,
    toggleSubmenu, closeSidebar,
  ]);

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

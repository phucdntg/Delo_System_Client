import LogoDefault from "@assets/images/logo-default.png";
import { DOMAIN_MODULES } from "@core/navigation/domainModules";
import { useAuth } from "@core/providers/auth";
import { PATH } from "@shared/constants/systemConstants";
import { useEffect, useRef, useState } from "react";
import { memo } from "react";
import { Link, NavLink } from "react-router-dom";
import { useSidebar } from "../providers/sidebar";

const Sidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, closeSidebar } =
    useSidebar();
  const { domainActive } = useAuth();

  const isSidebarOpen = isExpanded || isHovered || isMobileOpen;

  const sidebarRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(74);

  const visibleModules = DOMAIN_MODULES.filter(
    (m) => m.alwaysVisible || domainActive.includes(m.id),
  ).sort((a, b) => {
    if (a.alwaysVisible) return -1;
    if (b.alwaysVisible) return 1;
    return domainActive.indexOf(a.id) - domainActive.indexOf(b.id);
  });

  useEffect(() => {
    const header = document.getElementById("app-header");
    if (!header) return;
    const updateHeight = () => setHeaderHeight(header.offsetHeight);
    updateHeight();
    const ro = new ResizeObserver(updateHeight);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        e.target instanceof Element &&
        e.target.closest("[data-sidebar-toggle]")
      )
        return;
      if (
        isMobileOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        closeSidebar();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileOpen, closeSidebar]);

  return (
    <aside
      ref={sidebarRef}
      style={{ top: window.innerWidth < 1024 ? `${headerHeight}px` : 0 }}
      className={`fixed select-none flex flex-col left-0 bg-gray-dark h-screen min-h-0 transition-all duration-300 ease-in-out md:z-1000 z-100000 border-r border-white/8
        ${isExpanded || isMobileOpen ? "w-72.5" : isHovered ? "w-72.5" : "w-22.5"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
    >
      <div
        className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}
      >
        <Link to={PATH.HOME} className="m-auto">
          {isSidebarOpen ? (
            <img
              className="m-auto object-contain"
              src={LogoDefault}
              alt="Logo"
              width={100}
              height={40}
            />
          ) : (
            <img
              src={LogoDefault}
              alt="Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          )}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto no-scrollbar">
        {visibleModules.map((module, idx) => (
          <div key={module.id}>
            {isSidebarOpen && (
              <div className="flex items-center gap-2 px-3 pt-4 pb-1 text-xl">
                <span className="text-sm font-semibold tracking-widest uppercase text-white/40 truncate">
                  {module.label}
                </span>
              </div>
            )}

            <ul className="flex flex-col">
              {module.items.map((item) => (
                <li key={item.label}>
                  <NavLink
                    to={item.path}
                    onClick={() => isMobileOpen && closeSidebar()}
                    title={!isSidebarOpen ? item.label : undefined}
                    className={({ isActive }) =>
                      (isActive ? "menu-item-active" : "menu-item-inactive") +
                      " menu-item group"
                    }
                  >
                    <span
                      className={`menu-item-icon-size ${!isSidebarOpen && "mx-auto"}`}
                    >
                      {item.icon}
                    </span>
                    <span
                      className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${
                        isSidebarOpen
                          ? "max-w-60 opacity-100 translate-x-0"
                          : "max-w-0 opacity-0 -translate-x-2 hidden"
                      }`}
                    >
                      {item.label}
                    </span>
                  </NavLink>
                </li>
              ))}
            </ul>

            {idx < visibleModules.length - 1 && (
              <div className="mx-3 my-1 border-t border-white/8" />
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default memo(Sidebar);

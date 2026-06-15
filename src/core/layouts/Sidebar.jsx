import LogoDefault from "@assets/images/logo-default.png";
import { DOMAIN_MODULES } from "@core/navigation/domainModules";
import { useAuth } from "@core/providers/auth";
import { PATH } from "@shared/constants/systemConstants";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { Link, NavLink } from "react-router-dom";
import { useSidebar } from "../providers/sidebar";

const Sidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, closeSidebar } = useSidebar();
  const { domainActive } = useAuth();

  const isSidebarOpen = isExpanded || isHovered || isMobileOpen;

  const sidebarRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(74);

  const visibleModules = useMemo(
    () =>
      DOMAIN_MODULES.filter(
        (m) => m.alwaysVisible || domainActive.includes(m.id),
      ).sort((a, b) => {
        if (a.alwaysVisible) return -1;
        if (b.alwaysVisible) return 1;
        return domainActive.indexOf(a.id) - domainActive.indexOf(b.id);
      }),
    [domainActive],
  );

  const [openModules, setOpenModules] = useState(() => new Set(["system"]));

  const toggleModule = useCallback((id) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const prevSidebarOpen = useRef(isSidebarOpen);
  useEffect(() => {
    if (
      isSidebarOpen &&
      !prevSidebarOpen.current &&
      visibleModules.length > 0
    ) {
      setOpenModules((prev) => {
        const next = new Set(prev);
        next.add(visibleModules[0].id);
        return next;
      });
    }
    prevSidebarOpen.current = isSidebarOpen;
  }, [isSidebarOpen, visibleModules]);

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
        {visibleModules.map((module, idx) => {
          const isOpen = openModules.has(module.id);

          return (
            <div key={module.id}>
              <div
                className="flex items-center justify-between gap-2 p-3 cursor-pointer select-none group"
                onClick={() => toggleModule(module.id)}
              >
                <span className="flex items-center gap-2 overflow-hidden">
                  {module.icon && (
                    <span className="text-white/40 group-hover:text-white/70 transition-colors shrink-0">
                      {module.icon}
                    </span>
                  )}
                  <span
                    className={`text-sm font-semibold tracking-widest uppercase truncate transition-all duration-300 ease-in-out ${
                      isSidebarOpen
                        ? "max-w-60 opacity-100"
                        : "max-w-0 opacity-0 hidden"
                    } text-white/40 group-hover:text-white/70`}
                  >
                    {module.label}
                  </span>
                </span>
                <span
                  className={`shrink-0 text-white/30 transition-all duration-200 ${
                    isSidebarOpen ? "opacity-100" : "max-w-0 opacity-0 hidden"
                  }`}
                >
                  {isOpen ? <IoIosArrowDown /> : <IoIosArrowForward />}
                </span>
              </div>

              <ul className="flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
                {module.items.map((item) => (
                  <li
                    key={item.label}
                    className={`transition-all duration-300 ease-in-out ${
                      !isSidebarOpen || isOpen
                        ? "max-h-12 opacity-100"
                        : "max-h-0 opacity-0 pointer-events-none"
                    }`}
                  >
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
          );
        })}
      </nav>
    </aside>
  );
};

export default memo(Sidebar);

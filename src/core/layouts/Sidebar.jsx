import { useEffect, useRef, useState } from "react";
import { PiBuilding, PiBuildingApartment } from "react-icons/pi";
import { SlOrganization } from "react-icons/sl";
import { Link, NavLink } from "react-router";
import LogoDefault from "@assets/images/logo-default.png";
import { PATH } from "@shared/constants/systemConstants";
import { useAuth } from "../providers/AuthProvider";
import { useSidebar } from "../providers/SidebarProvider";
import { GoShieldCheck } from "react-icons/go";

const MENU_ITEMS = [
  {
    label: "Quản lý tổ chức",
    path: `/${PATH.SYSTEM.BASE}/${PATH.SYSTEM.ORG_MANAGEMENT}`,
    icon: <PiBuildingApartment />,
  },
  {
    label: "Quản lý chi nhánh",
    path: `/${PATH.SYSTEM.BASE}/${PATH.SYSTEM.BRANCH_MANAGEMENT}`,
    icon: <SlOrganization />,
  },
  {
    label: "Quản lý khu vực",
    path: `/${PATH.SYSTEM.BASE}/${PATH.SYSTEM.AREA_MANAGEMENT}`,
    icon: <PiBuilding />,
  },
  {
    label: "Quản lý vai trò",
    path: `/${PATH.SYSTEM.BASE}/${PATH.SYSTEM.ROLE_MANAGEMENT}`,
    icon: <GoShieldCheck />,
  },
];

const Sidebar = () => {
  const { logout } = useAuth();
  const { isExpanded, isMobileOpen, isHovered, closeSidebar } = useSidebar();
  const isSidebarOpen = isExpanded || isHovered || isMobileOpen;
  const sidebarRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(74);

  useEffect(() => {
    const header = document.getElementById("app-header");
    if (!header) return;

    const updateHeight = () => {
      setHeaderHeight(header.offsetHeight);
    };

    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(header);

    return () => resizeObserver.disconnect();
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
      className={`fixed select-none flex flex-col left-0 bg-white h-screen min-h-0 transition-all duration-300 ease-in-out md:z-1000 z-100000 border-r border-gray-200
        ${isExpanded || isMobileOpen ? "w-72.5" : isHovered ? "w-72.5" : "w-22.5"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
    >
      <div
        className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}
      >
        <Link to="/" className="m-auto">
          {isExpanded || isHovered || isMobileOpen ? (
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
        <ul className="flex flex-col">
          {MENU_ITEMS.map((item) => (
            <li key={item.label}>
              <NavLink
                to={item.path}
                onClick={() => isMobileOpen && closeSidebar()}
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
      </nav>
    </aside>
  );
};

export default Sidebar;

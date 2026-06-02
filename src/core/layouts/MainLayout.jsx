import { Outlet } from "react-router-dom";
import { useSidebar } from "../providers/sidebar";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function MainLayout() {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen xl:flex">
      <Sidebar />
      <div
        className={`flex flex-col flex-1 min-h-screen overflow-hidden transition-all duration-300 ease-in-out ${isExpanded || isHovered ? "lg:ml-72.5" : "lg:ml-22.5"} ${isMobileOpen ? "ml-0" : ""}`}
      >
        <Header />
        <div className="w-full p-4 mx-auto md:p-6 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

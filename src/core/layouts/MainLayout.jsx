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
        className={`flex flex-col w-full h-screen overflow-hidden transition-all duration-300 ease-in-out bg-[#eeeeee] ${isExpanded || isHovered ? "lg:ml-72.5" : "lg:ml-22.5"} ${isMobileOpen ? "ml-0" : ""}`}
      >
        <Header />
        <main className="flex-1 min-h-0 overflow-hidden p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

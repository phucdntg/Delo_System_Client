import { createBrowserRouter, Outlet } from "react-router-dom";
import LoginPage from "../../domains/auth/login/pages/LoginPage";
import { systemRoutes } from "../../domains/system/routes";
import { PATH } from "../../shared/constants/systemConstants";
import MainLayout from "../layouts/MainLayout";
import RouteTitleSync from "./RouteTitleSync";

function RootRouteLayout() {
  return (
    <>
      <RouteTitleSync />
      <Outlet />
    </>
  );
}

const routes = [
  {
    element: <RootRouteLayout />,
    children: [
      {
        path: PATH.AUTH,
        handle: { title: "Đăng nhập" },
        element: <LoginPage />,
      },
      {
        path: "*",
        element: <MainLayout />,
        children: [
          {
            path: PATH.SYSTEM.BASE,
            handle: { title: "Hệ thống" },
            children: systemRoutes,
          },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);

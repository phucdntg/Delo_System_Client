import { lazy, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { systemRoutes } from "../../domains/system/routes";
import { PATH } from "@shared/constants/systemConstants";
import MainLayout from "../layouts/MainLayout";
import RouteTitleSync from "./RouteTitleSync";
import ProtectedRoute from "./guards/ProtectedRoute";
import RequireOrgGuard from "./guards/RequireOrgGuard";

const LoginPage = lazy(
  () => import("../../domains/auth/login/pages/LoginPage"),
);

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
        index: true,
        element: (
          <Navigate
            to={`/${PATH.SYSTEM.BASE}/${PATH.SYSTEM.ORG_MANAGEMENT}`}
            replace
          />
        ),
      },
      {
        path: PATH.AUTH,
        handle: { title: "Đăng nhập" },
        element: <LoginPage />,
      },
      {
        path: "",
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: (
              <Navigate
                to={`/${PATH.SYSTEM.BASE}/${PATH.SYSTEM.ORG_MANAGEMENT}`}
                replace
              />
            ),
          },
          {
            path: `/${PATH.SYSTEM.BASE}`,
            children: [
              ...systemRoutes.map((route) => ({
                ...route,
                element: (
                  <ErrorBoundary>
                    <Suspense fallback={<div>Loading...</div>}>
                      <ProtectedRoute>
                        <RequireOrgGuard required={route.requireOrg}>
                          {route.element}
                        </RequireOrgGuard>
                      </ProtectedRoute>
                    </Suspense>
                  </ErrorBoundary>
                ),
              })),
            ],
          },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);

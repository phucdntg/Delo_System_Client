import { evaluationRoutes } from "@domains/evaluation";
import { lookupRoutes } from "@domains/lookup";
import { qmsRoutes } from "@domains/qms";
import { qnaRoutes } from "@domains/qna";
import { systemRoutes } from "@domains/system";
import { PATH } from "@shared/constants/systemConstants";
import { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import RouteTitleSync from "./RouteTitleSync";
import ErrorBoundary from "./guards/ErrorBoundary";
import ProtectedRoute from "./guards/ProtectedRoute";
import RequireOrgGuard from "./guards/RequireOrgGuard";

function RouteGuard({ route }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div>Loading...</div>}>
        <ProtectedRoute>
          <RequireOrgGuard required={route.requireOrg}>
            {route.element}
          </RequireOrgGuard>
        </ProtectedRoute>
      </Suspense>
    </ErrorBoundary>
  );
}

const LoginPage = lazy(
  () => import("../../domains/auth/features/login/pages/LoginPage"),
);

const NotFoundPage = lazy(() => import("../../shared/pages/NotFoundPage"));

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
                element: <RouteGuard route={route} />,
              })),
            ],
          },
          {
            path: `/${PATH.QMS.BASE}`,
            children: [
              ...qmsRoutes.map((route) => ({
                ...route,
                element: <RouteGuard route={route} />,
              })),
            ],
          },
          {
            path: `/${PATH.QNA.BASE}`,
            children: [
              ...qnaRoutes.map((route) => ({
                ...route,
                element: <RouteGuard route={route} />,
              })),
            ],
          },
          {
            path: `/${PATH.EVALUATION.BASE}`,
            children: [
              ...evaluationRoutes.map((route) => ({
                ...route,
                element: <RouteGuard route={route} />,
              })),
            ],
          },
          {
            path: `/${PATH.LOOKUP.BASE}`,
            children: [
              ...lookupRoutes.map((route) => ({
                ...route,
                element: <RouteGuard route={route} />,
              })),
            ],
          },
          {
            path: "*",
            handle: { title: "404 - Không tìm thấy trang" },
            element: (
              <ErrorBoundary>
                <Suspense fallback={<div>Loading...</div>}>
                  <NotFoundPage />
                </Suspense>
              </ErrorBoundary>
            ),
          },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);

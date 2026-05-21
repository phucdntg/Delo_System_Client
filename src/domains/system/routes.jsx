import { lazy } from "react";
import { PATH } from "../../shared/constants/systemConstants";

const OrgManagement = lazy(
  () => import("./features/organization/pages/OrgManagement"),
);

export const systemRoutes = [
  {
    path: PATH.SYSTEM.ORG_MANAGEMENT,
    handle: { title: "Quản lý tổ chức" },
    element: <OrgManagement />,
  },
];

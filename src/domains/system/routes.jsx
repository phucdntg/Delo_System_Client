import { lazy } from "react";
import { PATH } from "../../shared/constants/systemConstants";

const OrgManagement = lazy(
  () => import("./features/organization/pages/OrgManagement"),
);

const BranchManagement = lazy(
  () => import("./features/branch/pages/BranchManagement"),
);

export const systemRoutes = [
  {
    path: PATH.SYSTEM.ORG_MANAGEMENT,
    handle: { title: "Quản lý tổ chức" },
    element: <OrgManagement />,
  },
  {
    path: PATH.SYSTEM.BRANCH_MANAGEMENT,
    handle: { title: "Quản lý chi nhánh" },
    element: <BranchManagement />,
  },
];

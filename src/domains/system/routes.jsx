import { PATH } from "@shared/constants/systemConstants";
import { lazy } from "react";

const OrgManagement = lazy(() => import("./features/organization/pages/OrgManagement"));

const BranchManagement = lazy(() => import("./features/branch/pages/BranchManagement"));

const AreaManagement = lazy(() => import("./features/area/pages/AreaManagement"));

const RoleManagement = lazy(() => import("./features/role/pages/RoleManagement"));

const UserManagement = lazy(() => import("./features/user/pages/UserManagement"));

export const systemRoutes = [
  {
    path: PATH.SYSTEM.ORG_MANAGEMENT,
    handle: { title: "Quản lý tổ chức" },
    element: <OrgManagement />,
    requireOrg: false,
  },
  {
    path: PATH.SYSTEM.BRANCH_MANAGEMENT,
    handle: { title: "Quản lý chi nhánh" },
    element: <BranchManagement />,
    requireOrg: true,
  },
  {
    path: PATH.SYSTEM.AREA_MANAGEMENT,
    handle: { title: "Quản lý khu vực" },
    element: <AreaManagement />,
    requireOrg: true,
  },
  {
    path: PATH.SYSTEM.ROLE_MANAGEMENT,
    handle: { title: "Quản lý vai trò" },
    element: <RoleManagement />,
    requireOrg: false,
  },
  {
    path: PATH.SYSTEM.USER_MANAGEMENT,
    handle: { title: "Quản lý người dùng" },
    element: <UserManagement />,
    requireOrg: false,
  },
];

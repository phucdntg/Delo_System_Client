import { PATH } from "@shared/constants/systemConstants";
import { lazy } from "react";

const CounterManagement = lazy(
  () => import("./features/counter/pages/CounterManagement"),
);

export const qmsRoutes = [
  {
    path: PATH.QMS.COUNTERS,
    handle: { title: "Quản lý quầy" },
    element: <CounterManagement />,
    requireOrg: true,
  },
];

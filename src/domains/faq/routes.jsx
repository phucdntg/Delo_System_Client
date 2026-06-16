/* eslint-disable react-refresh/only-export-components */

import { PATH } from "@shared/constants/systemConstants";
import { lazy } from "react";

const FlowList = lazy(
  () => import("./features/question-flows/pages/FlowList"),
);
const FlowBuilder = lazy(
  () => import("./features/question-flows/pages/FlowBuilder"),
);

export const faqRoutes = [
  {
    index: true,
    handle: { title: "FAQ - Danh sách" },
    element: <FlowList />,
    requireOrg: true,
  },
  {
    path: PATH.FAQ.CREATE,
    handle: { title: "FAQ - Tạo Flow" },
    element: <FlowBuilder />,
    requireOrg: true,
  },
  {
    path: PATH.FAQ.DETAIL,
    handle: { title: "FAQ - Chi tiết Flow" },
    element: <FlowBuilder />,
    requireOrg: true,
  },
];

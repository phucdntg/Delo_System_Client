import { PATH } from "@shared/constants/systemConstants";
import { lazy } from "react";

const CounterManagement = lazy(
  () => import("./features/counter/pages/CounterManagement"),
);

const EvaluationContentManagement = lazy(
  () =>
    import("./features/evaluation-content/pages/EvaluationContentManagement"),
);

export const qmsRoutes = [
  {
    path: PATH.QMS.COUNTERS,
    handle: { title: "Quản lý quầy" },
    element: <CounterManagement />,
    requireOrg: true,
  },
  {
    path: PATH.QMS.EVALUATION_CONTENTS,
    handle: { title: "Quản lý nội dung đánh giá" },
    element: <EvaluationContentManagement />,
    requireOrg: true,
  },
];

import { PATH } from "@shared/constants/systemConstants";
import { lazy } from "react";

const EvaluationManagement = lazy(
  () => import("./features/evaluationManagement/pages/EvaluationManagement"),
);

export const evaluationRoutes = [
  {
    path: PATH.EVALUATION.REVIEWS,
    handle: { title: "Quản lý đánh giá" },
    element: <EvaluationManagement />,
    requireOrg: true,
  },
];

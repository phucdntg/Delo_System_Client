import { PATH } from "@shared/constants/systemConstants";
import { lazy } from "react";

const TopicPage = lazy(() => import("./features/topics/pages/TopicPage"));
const TargetPage = lazy(() => import("./features/targets/pages/TargetPage"));
const ActionPage = lazy(() => import("./features/actions/pages/ActionPage"));
const ContentPage = lazy(() => import("./features/contents/pages/ContentPage"));

export const evaluationRoutes = [
  {
    path: PATH.EVALUATION.TOPICS,
    handle: { title: "Quản lý chủ đề đánh giá" },
    element: <TopicPage />,
    requireOrg: true,
  },
  {
    path: PATH.EVALUATION.TARGETS,
    handle: { title: "Quản lý đối tượng đánh giá" },
    element: <TargetPage />,
    requireOrg: true,
  },
  {
    path: PATH.EVALUATION.ACTIONS,
    handle: { title: "Quản lý hành động đánh giá" },
    element: <ActionPage />,
    requireOrg: true,
  },
  {
    path: PATH.EVALUATION.CONTENTS,
    handle: { title: "Quản lý nội dung đánh giá" },
    element: <ContentPage />,
    requireOrg: true,
  },
];


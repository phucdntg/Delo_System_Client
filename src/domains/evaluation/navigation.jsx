import { PATH } from "@shared/constants/systemConstants";
import { MdOutlineDashboard, MdOutlineStarRate } from "react-icons/md";

export const evaluationNavigation = {
  id: "evaluation",
  label: "Đánh giá",
  shortLabel: "EVAL",
  alwaysVisible: false,
  colorClass: "text-amber-700 bg-amber-100",
  dotColor: "bg-amber-500",
  items: [
    {
      label: "Tổng quan",
      path: `/${PATH.EVALUATION.BASE}/${PATH.EVALUATION.DASHBOARD}`,
      icon: <MdOutlineDashboard />,
    },
    {
      label: "Quản lý đánh giá",
      path: `/${PATH.EVALUATION.BASE}/${PATH.EVALUATION.REVIEWS}`,
      icon: <MdOutlineStarRate />,
    },
  ],
};

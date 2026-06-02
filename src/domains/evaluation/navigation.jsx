import { PATH } from "@shared/constants/systemConstants";
import {
  MdOutlineTopic,
  MdOutlineTrackChanges,
  MdOutlineTouchApp,
  MdOutlineArticle,
} from "react-icons/md";

export const evaluationNavigation = {
  id: "evaluation",
  label: "Đánh giá",
  shortLabel: "EVAL",
  alwaysVisible: false,
  colorClass: "text-amber-700 bg-amber-100",
  dotColor: "bg-amber-500",
  items: [
    {
      label: "Chủ đề đánh giá",
      path: `/${PATH.EVALUATION.BASE}/${PATH.EVALUATION.TOPICS}`,
      icon: <MdOutlineTopic />,
    },
    {
      label: "Đối tượng đánh giá",
      path: `/${PATH.EVALUATION.BASE}/${PATH.EVALUATION.TARGETS}`,
      icon: <MdOutlineTrackChanges />,
    },
    {
      label: "Hành động đánh giá",
      path: `/${PATH.EVALUATION.BASE}/${PATH.EVALUATION.ACTIONS}`,
      icon: <MdOutlineTouchApp />,
    },
    {
      label: "Nội dung đánh giá",
      path: `/${PATH.EVALUATION.BASE}/${PATH.EVALUATION.CONTENTS}`,
      icon: <MdOutlineArticle />,
    },
  ],
};

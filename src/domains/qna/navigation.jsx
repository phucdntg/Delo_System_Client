import { PATH } from "@shared/constants/systemConstants";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi";
import { MdOutlineDashboard } from "react-icons/md";

export const qnaNavigation = {
  id: "qna",
  label: "Q&A",
  shortLabel: "QNA",
  alwaysVisible: false,
  colorClass: "text-blue-700 bg-blue-100",
  dotColor: "bg-blue-500",
  items: [
    {
      label: "Tổng quan",
      path: `/${PATH.QNA.BASE}/${PATH.QNA.DASHBOARD}`,
      icon: <MdOutlineDashboard />,
    },
    {
      label: "Quản lý câu hỏi",
      path: `/${PATH.QNA.BASE}/${PATH.QNA.QUESTIONS}`,
      icon: <HiOutlineQuestionMarkCircle />,
    },
  ],
};

import { PATH } from "@shared/constants/systemConstants";
import { MdOutlineAccountTree } from "react-icons/md";

export const faqNavigation = {
  id: "faq",
  label: "FAQ",
  shortLabel: "FAQ",
  alwaysVisible: false,
  colorClass: "text-purple-700 bg-purple-100",
  dotColor: "bg-purple-500",
  items: [
    {
      label: "Quản lý câu hỏi thường gặp",
      path: `/${PATH.FAQ.BASE}`,
      icon: <MdOutlineAccountTree />,
    },
  ],
};

import { PATH } from "@shared/constants/systemConstants";
import { MdOutlineHelpOutline } from "react-icons/md";

export const faqNavigation = {
  id: "faq",
  label: "FAQ",
  shortLabel: "FAQ",
  alwaysVisible: false,
  colorClass: "text-purple-700 bg-purple-100",
  dotColor: "bg-purple-500",
  items: [
    {
      label: "Danh sách FAQ",
      path: `/${PATH.FAQ.BASE}`,
      icon: <MdOutlineHelpOutline />,
    },
  ],
};

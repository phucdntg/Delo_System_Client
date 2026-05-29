import { PATH } from "@shared/constants/systemConstants";
import { MdOutlineDashboard, MdOutlineSearch } from "react-icons/md";

export const lookupNavigation = {
  id: "lookup",
  label: "Tra cứu thông tin",
  shortLabel: "LOOKUP",
  alwaysVisible: false,
  colorClass: "text-purple-700 bg-purple-100",
  dotColor: "bg-purple-500",
  items: [
    {
      label: "Tổng quan",
      path: `/${PATH.LOOKUP.BASE}/${PATH.LOOKUP.DASHBOARD}`,
      icon: <MdOutlineDashboard />,
    },
    {
      label: "Tra cứu",
      path: `/${PATH.LOOKUP.BASE}/${PATH.LOOKUP.SEARCH}`,
      icon: <MdOutlineSearch />,
    },
  ],
};

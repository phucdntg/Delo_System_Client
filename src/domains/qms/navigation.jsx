import { PATH } from "@shared/constants/systemConstants";
import {
  MdOutlineCountertops,
  MdOutlineDashboard,
  MdOutlineQueuePlayNext,
  MdOutlineSettings,
  MdOutlineRateReview,
} from "react-icons/md";

export const qmsNavigation = {
  id: "qms",
  label: "Quản lý hàng đợi",
  shortLabel: "QMS",
  alwaysVisible: false,
  colorClass: "text-emerald-700 bg-emerald-100",
  dotColor: "bg-emerald-500",
  items: [
    {
      label: "Tổng quan",
      path: `/${PATH.QMS.BASE}/${PATH.QMS.DASHBOARD}`,
      icon: <MdOutlineDashboard />,
    },
    {
      label: "Quản lý quầy",
      path: `/${PATH.QMS.BASE}/${PATH.QMS.COUNTERS}`,
      icon: <MdOutlineCountertops />,
    },
    {
      label: "Quản lý dịch vụ",
      path: `/${PATH.QMS.BASE}/${PATH.QMS.SERVICES}`,
      icon: <MdOutlineQueuePlayNext />,
    },
    {
      label: "Nội dung đánh giá",
      path: `/${PATH.QMS.BASE}/${PATH.QMS.EVALUATION_CONTENTS}`,
      icon: <MdOutlineRateReview />,
    },
    {
      label: "Cấu hình",
      path: `/${PATH.QMS.BASE}/${PATH.QMS.CONFIG}`,
      icon: <MdOutlineSettings />,
    },
  ],
};

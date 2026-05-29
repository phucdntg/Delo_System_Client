import { PATH } from "@shared/constants/systemConstants";
import { GoShieldCheck } from "react-icons/go";
import { LuUsers } from "react-icons/lu";
import { PiBuilding, PiBuildingApartment } from "react-icons/pi";
import { SlOrganization } from "react-icons/sl";

export const systemNavigation = {
  id: "system",
  label: "Quản trị hệ thống",
  shortLabel: "SYS",
  alwaysVisible: true,
  colorClass: "text-[#111f43] bg-[#111f43]/10",
  dotColor: "bg-[#111f43]",
  items: [
    {
      label: "Quản lý tổ chức",
      path: `/${PATH.SYSTEM.BASE}/${PATH.SYSTEM.ORG_MANAGEMENT}`,
      icon: <PiBuildingApartment />,
    },
    {
      label: "Quản lý chi nhánh",
      path: `/${PATH.SYSTEM.BASE}/${PATH.SYSTEM.BRANCH_MANAGEMENT}`,
      icon: <SlOrganization />,
    },
    {
      label: "Quản lý khu vực",
      path: `/${PATH.SYSTEM.BASE}/${PATH.SYSTEM.AREA_MANAGEMENT}`,
      icon: <PiBuilding />,
    },
    {
      label: "Quản lý vai trò",
      path: `/${PATH.SYSTEM.BASE}/${PATH.SYSTEM.ROLE_MANAGEMENT}`,
      icon: <GoShieldCheck />,
    },
    {
      label: "Quản lý người dùng",
      path: `/${PATH.SYSTEM.BASE}/${PATH.SYSTEM.USER_MANAGEMENT}`,
      icon: <LuUsers />,
    },
  ],
};

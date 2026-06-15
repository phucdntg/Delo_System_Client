import { PATH } from "@shared/constants/systemConstants";
import { lazy } from "react";

const FaqPage = lazy(() => import("./pages/FaqPage"));

export const faqRoutes = [
  {
    index: true,
    handle: { title: "FAQ" },
    element: <FaqPage />,
    requireOrg: true,
  },
];

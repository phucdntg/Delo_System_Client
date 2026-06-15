import { PATH } from "@shared/constants/systemConstants";
import { lazy } from "react";

const CounterManagement = lazy(
  () => import("./features/counter/pages/CounterManagement"),
);

const EvaluationContentManagement = lazy(
  () =>
    import("./features/evaluation-content/pages/EvaluationContentManagement"),
);

const QmsDashboard = lazy(
  () => import("@shared/components/ComingSoon"),
);

const QmsServices = lazy(
  () => import("@shared/components/ComingSoon"),
);

const QmsConfig = lazy(
  () => import("@shared/components/ComingSoon"),
);

export const qmsRoutes = [
  {
    path: PATH.QMS.DASHBOARD,
    handle: { title: "Tổng quan" },
    element: <QmsDashboard featureName="Tổng quan" />,
    requireOrg: true,
  },
  {
    path: PATH.QMS.COUNTERS,
    handle: { title: "Quản lý quầy" },
    element: <CounterManagement />,
    requireOrg: true,
  },
  {
    path: PATH.QMS.SERVICES,
    handle: { title: "Quản lý dịch vụ" },
    element: <QmsServices featureName="Quản lý dịch vụ" />,
    requireOrg: true,
  },
  {
    path: PATH.QMS.EVALUATION_CONTENTS,
    handle: { title: "Quản lý nội dung đánh giá" },
    element: <EvaluationContentManagement />,
    requireOrg: true,
  },
  {
    path: PATH.QMS.CONFIG,
    handle: { title: "Cấu hình" },
    element: <QmsConfig featureName="Cấu hình" />,
    requireOrg: true,
  },
];

import { Alert, Tabs } from "antd";
import { useState } from "react";
import EmployeeEvaluationTab from "../components/EmployeeEvaluationTab";
import ServiceEvaluationTab from "../components/ServiceEvaluationTab";

export default function EvaluationContentManagement() {
  const [activeTab, setActiveTab] = useState("employee");

  const tabItems = [
    {
      key: "employee",
      label: "Đánh giá nhân viên",
      children: <EmployeeEvaluationTab />,
    },
    {
      key: "service",
      label: "Đánh giá dịch vụ",
      children: <ServiceEvaluationTab />,
    },
  ];

  return (
    <div className="h-full p-5 bg-white rounded flex flex-col">
      <h2 style={{ marginBottom: "8px", fontSize: "20px", fontWeight: 600 }}>
        Quản lý nội dung đánh giá
      </h2>
      <Alert
        title="Cấu hình các nội dung đánh giá khi khách hàng chưa hài lòng hoặc không hài lòng"
        description="Khi khách hàng đánh giá bình thường hoặc không hài lòng, họ sẽ được yêu cầu chọn lý do từ danh sách nội dung đánh giá được cấu hình tại đây. Điều này giúp thu thập phản hồi chi tiết và cải thiện chất lượng dịch vụ."
        type="info"
        showIcon
        style={{ marginBottom: "16px", flexShrink: 0 }}
      />

      <div className="flex-1 flex flex-col min-h-0">
        <Tabs
          className="flex-1 flex flex-col min-h-0 evaluation-content-tabs"
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          destroyOnHidden={false}
        />
      </div>
    </div>
  );
}

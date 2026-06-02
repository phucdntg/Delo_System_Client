import { Alert, Card, Tabs } from "antd";
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
    <div>
      <Card>
        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{ marginBottom: "8px", fontSize: "20px", fontWeight: 600 }}
          >
            Quản lý nội dung đánh giá
          </h2>
          <Alert
            title="Cấu hình các nội dung đánh giá khi khách hàng chưa hài lòng hoặc không hài lòng"
            description="Khi khách hàng đánh giá bình thường hoặc không hài lòng, họ sẽ được yêu cầu chọn lý do từ danh sách nội dung đánh giá được cấu hình tại đây. Điều này giúp thu thập phản hồi chi tiết và cải thiện chất lượng dịch vụ."
            type="info"
            showIcon
            style={{ marginBottom: "16px" }}
          />
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          destroyOnHidden={false}
        />
      </Card>
    </div>
  );
}

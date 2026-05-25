import { Alert } from "antd";
import { useAuth } from "../../providers/AuthProvider";

export default function RequireOrgGuard({ children, required = true }) {
  const { selectedOrg, loading } = useAuth();

  if (!required) {
    return children;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!selectedOrg) {
    return (
      <div className="flex items-center justify-center min-h-100 p-4">
        <Alert
          title="Vui lòng chọn tổ chức"
          description="Bạn cần chọn một tổ chức để tiếp tục sử dụng tính năng này."
          type="warning"
          showIcon
          className="max-w-lg"
        />
      </div>
    );
  }

  return children;
}

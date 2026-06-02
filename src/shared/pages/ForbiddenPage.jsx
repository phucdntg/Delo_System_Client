import { HomeOutlined, WarningOutlined } from "@ant-design/icons";
import { useTranslate } from "@core/providers/TranslateProvider";
import { PATH } from "@shared/constants/systemConstants";
import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

const ForbiddenPage = () => {
  const { translate } = useTranslate();
  const translateForbidden = translate("forbidden") || {};
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate(`/${PATH.SYSTEM.BASE}/${PATH.SYSTEM.ORG_MANAGEMENT}`);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Result
        status="403"
        title={
          <span className="text-2xl font-semibold">
            {translateForbidden?.title || "403 - Truy cập bị từ chối"}
          </span>
        }
        subTitle={
          <div className="space-y-2">
            <p className="text-base text-gray-600">
              {translateForbidden?.subTitle ||
                "Bạn không có quyền truy cập trang này."}
            </p>
            <p className="text-sm text-gray-500">
              {translateForbidden?.description ||
                "Bạn không có quyền cần thiết để xem nội dung này. Nếu bạn nghĩ đây là một lỗi, vui lòng liên hệ quản trị viên hệ thống."}
            </p>
          </div>
        }
        extra={[
          <Button
            key="home"
            type="primary"
            size="large"
            icon={<HomeOutlined />}
            onClick={handleBackHome}
            className="mt-4"
          >
            {translateForbidden?.backHome || "Về trang chủ"}
          </Button>,
          <Button
            key="contact"
            size="large"
            icon={<WarningOutlined />}
            className="mt-4"
          >
            {translateForbidden?.contactAdmin || "Liên hệ quản trị viên"}
          </Button>,
        ]}
      />
    </div>
  );
};

export default ForbiddenPage;

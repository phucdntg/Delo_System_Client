import { HomeOutlined } from "@ant-design/icons";
import { useTranslate } from "@core/providers/translate";
import { PATH } from "@shared/constants/systemConstants";
import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const { translate } = useTranslate();
  const translateNotFound = translate("notfound") || {};
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate(`/${PATH.SYSTEM.BASE}/${PATH.SYSTEM.ORG_MANAGEMENT}`);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Result
        status="404"
        title={
          <span className="text-2xl font-semibold">
            {translateNotFound?.title || "404 - Không tìm thấy trang"}
          </span>
        }
        subTitle={
          <div className="space-y-2">
            <p className="text-base text-gray-600">
              {translateNotFound?.subTitle ||
                "Xin lỗi, trang bạn đang tìm kiếm không tồn tại."}
            </p>
            <p className="text-sm text-gray-500">
              {translateNotFound?.description ||
                "Trang này có thể đã bị xóa, di chuyển hoặc không bao giờ tồn tại."}
            </p>
          </div>
        }
        extra={
          <Button
            type="primary"
            size="large"
            icon={<HomeOutlined />}
            onClick={handleBackHome}
            className="mt-4"
          >
            {translateNotFound?.backHome || "Về trang chủ"}
          </Button>
        }
      />
    </div>
  );
};

export default NotFoundPage;

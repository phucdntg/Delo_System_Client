import { HomeOutlined, ReloadOutlined } from "@ant-design/icons";
import { useTranslate } from "@core/providers/TranslateProvider";
import { PATH } from "@shared/constants/systemConstants";
import { Button, Collapse, Result } from "antd";
import { useNavigate } from "react-router-dom";

const InternalServerErrorPage = ({ error, errorInfo }) => {
  const { translate } = useTranslate();
  const translateServerError = translate("servererror") || {};
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate(`/${PATH.SYSTEM.BASE}/${PATH.SYSTEM.ORG_MANAGEMENT}`);
  };

  const handleReload = () => {
    window.location.reload();
  };

  const errorDetails = [
    {
      key: "1",
      label: translateServerError?.errorDetails || "Chi tiết lỗi",
      children: (
        <div className="space-y-2">
          {error && (
            <div>
              <strong className="text-red-600">Error:</strong>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                {error.toString()}
              </pre>
            </div>
          )}
          {errorInfo && errorInfo.componentStack && (
            <div>
              <strong className="text-red-600">Component Stack:</strong>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-64">
                {errorInfo.componentStack}
              </pre>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-4">
      <div className="w-full max-w-3xl">
        <Result
          status="500"
          title={
            <span className="text-2xl font-semibold">
              {translateServerError?.title || "500 - Lỗi hệ thống"}
            </span>
          }
          subTitle={
            <div className="space-y-2">
              <p className="text-base text-gray-600">
                {translateServerError?.subTitle ||
                  "Đã xảy ra lỗi không mong muốn."}
              </p>
              <p className="text-sm text-gray-500">
                {translateServerError?.description ||
                  "Chúng tôi xin lỗi vì sự bất tiện này. Lỗi đã được ghi nhận và chúng tôi đang khắc phục. Vui lòng thử lại sau."}
              </p>
            </div>
          }
          extra={[
            <Button
              key="reload"
              type="primary"
              size="large"
              icon={<ReloadOutlined />}
              onClick={handleReload}
              className="mt-4"
            >
              {translateServerError?.reload || "Tải lại trang"}
            </Button>,
            <Button
              key="home"
              size="large"
              icon={<HomeOutlined />}
              onClick={handleBackHome}
              className="mt-4"
            >
              {translateServerError?.backHome || "Về trang chủ"}
            </Button>,
          ]}
        />

        {(error || errorInfo) && (
          <div className="mt-6">
            <Collapse items={errorDetails} defaultActiveKey={[]} />
          </div>
        )}
      </div>
    </div>
  );
};

export default InternalServerErrorPage;

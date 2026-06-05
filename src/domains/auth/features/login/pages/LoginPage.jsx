import { LockOutlined, MailOutlined } from "@ant-design/icons";
import LoginBackground from "@assets/images/bg-auth.jpg";
import LogoDefault from "@assets/images/logo-default.png";
import { useAuth } from "@core/providers/auth";
import { PATH } from "@shared/constants/systemConstants";
import { Button, Form, Input } from "antd";
import { useNavigate } from "react-router-dom";
import {
  useLazyGetCurrentUserQuery,
  useLoginMutation,
} from "../services/authService";

export default function LoginPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [login, { isLoading }] = useLoginMutation();
  const [getCurrentUser] = useLazyGetCurrentUserQuery();

  const handleLogin = async (values) => {
    try {
      const token = await login(values).unwrap();
      if (token?.accessToken && token?.refreshToken) {
        auth.setToken(token);
        const user = await getCurrentUser().unwrap();
        auth.setUser(user);
      }

      navigate(`/${PATH.SYSTEM.BASE}/${PATH.SYSTEM.ORG_MANAGEMENT}`);
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${LoginBackground})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
      className="min-h-screen flex items-center justify-center px-4"
    >
      <div className="w-full max-w-125">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          {/* Logo */}
          <img
            src={LogoDefault}
            alt="Logo"
            className="w-24 h-w-24 mb-4 mx-auto"
          />

          {/* Heading */}
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            Đăng nhập
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Nhập thông tin tài khoản quản trị
          </p>

          {/* Form */}
          <Form
            layout="vertical"
            onFinish={handleLogin}
            requiredMark={false}
            size="middle"
          >
            <Form.Item
              name="username"
              label={
                <span className="text-xs font-medium text-gray-600">
                  Tên đăng nhập
                </span>
              }
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập" },
                { min: 3, message: "Tên đăng nhập tối thiểu 3 ký tự" },
              ]}
            >
              <Input
                size="large"
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="Nhập tên đăng nhập"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <span className="text-xs font-medium text-gray-600">
                  Mật khẩu
                </span>
              }
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu" },
                { min: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
              ]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Nhập mật khẩu"
              />
            </Form.Item>

            <Form.Item className="mb-0 mt-2">
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                block
                className="h-10 rounded-lg font-medium"
                size="large"
                style={{ backgroundColor: "var(--primary-color)" }}
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

        </div>
      </div>
    </div>
  );
}

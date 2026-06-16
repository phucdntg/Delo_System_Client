import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
  UserOutlined,
} from "@ant-design/icons";
import BrandImage from "@assets/images/brand-image.jpg";
import { useAuth } from "@core/providers/auth";
import { useTranslate } from "@core/providers/translate";
import LocaleSwitcher from "@shared/components/LocaleSwitcher";
import { PATH } from "@shared/constants/systemConstants";
import { App, Button, Form, Input } from "antd";
import { useNavigate } from "react-router-dom";
import {
  useLazyGetCurrentUserQuery,
  useLoginMutation,
} from "../services/authService";

export default function LoginPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { message } = App.useApp();
  const { translate } = useTranslate();
  const t = (key) => translate(`login.${key}`);
  const [form] = Form.useForm();
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
    } catch {
      message.error(t("error") || "Đăng nhập thất bại");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9ff]">
      <header className="bg-[#f8f9ff] border-b border-[#c6c6cf] flex justify-between items-center w-full px-10 py-4 z-50">
        <div className="text-[32px] font-bold leading-10 tracking-[-0.01em] text-(--primary-color)">
          DELO SYSTEM
        </div>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
        </div>
      </header>

      <main className="grow flex flex-col md:flex-row">
        <section className="hidden md:flex relative w-1/2 overflow-hidden bg-[#00020e] items-center justify-center">
          <img
            src={BrandImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />

          <div className="absolute inset-0 bg-linear-to-tr from-[#00020e] via-[#00020e]/40 to-transparent" />

          <div className="relative z-10 px-24 max-w-2xl text-white">
            <div className=" text-xs leading-4 tracking-wider font-semibold text-[#b9c5f2] mb-4 uppercase">
              {t("brand.innovationHub")}
            </div>
            <h1 className="text-[48px] font-bold leading-14 tracking-[-0.02em] mb-6">
              {t("brand.buildingDigitalTrust")}
            </h1>
            <p className="text-base leading-relaxed font-normal text-[#98a2c5]">
              {t("brand.welcome")}
            </p>
            <div className="mt-12 flex gap-8">
              <div className="flex flex-col">
                <span className="text-[32px] font-semibold leading-10 tracking-[-0.01em]">
                  99.9%
                </span>
                <span className=" text-xs leading-4 tracking-wider font-semibold text-[#7784ad] uppercase">
                  {t("brand.uptimeSla")}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[32px] font-semibold leading-10 tracking-[-0.01em]">
                  24/7
                </span>
                <span className=" text-xs leading-4 tracking-wider font-semibold text-[#7784ad] uppercase">
                  {t("brand.support")}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">
            <div className="md:hidden mb-8 text-center">
              <h2 className="text-2xl font-bold leading-8 text-(--primary-color)"></h2>
            </div>

            <div
              className="bg-white border border-[#c6c6cf] p-10 rounded-sm"
              style={{
                boxShadow:
                  "0 4px 6px -1px rgba(0, 81, 213, 0.05), 0 2px 4px -1px rgba(0, 81, 213, 0.03)",
              }}
            >
              <div className="mb-10 text-center md:text-left">
                <h3 className="text-[32px] font-semibold leading-10 tracking-[-0.01em] text-(--primary-color) mb-2">
                  {t("card.systemLogin")}
                </h3>
                <p className="text-sm leading-5 font-normal text-[#45464e]">
                  {t("card.enterCredentials")}
                </p>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={handleLogin}
                requiredMark={false}
              >
                <Form.Item
                  name="username"
                  label={
                    <span className=" text-xs leading-4 tracking-wider font-semibold text-[#45464e] uppercase">
                      {t("username")}
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: t("validation.usernameRequired"),
                    },
                    {
                      min: 3,
                      message: t("validation.usernameMinLength"),
                    },
                  ]}
                >
                  <Input
                    prefix={
                      <UserOutlined className="text-[#76767f] text-base" />
                    }
                    placeholder={t("username")}
                    className="w-full bg-white border border-[#c6c6cf] outline-none transition-all text-base text-[#0b1c30]"
                    style={{ padding: 12 }}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={
                    <span className=" text-xs leading-4 tracking-wider font-semibold text-[#45464e] uppercase">
                      {t("password")}
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: t("validation.passwordRequired"),
                    },
                    {
                      min: 6,
                      message: t("validation.passwordMinLength"),
                    },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="" />}
                    placeholder="••••••••"
                    className="w-full bg-white border border-[#c6c6cf] outline-none transition-all text-base text-[#0b1c30]"
                    style={{ padding: 12 }}
                    iconRender={(visible) =>
                      visible ? (
                        <EyeTwoTone className="text-[#76767f]" />
                      ) : (
                        <EyeInvisibleOutlined className="text-[#76767f]" />
                      )
                    }
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }} className="mt-6">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isLoading}
                    block
                    className="w-full hover:bg-[#39456b] text-white bg-(--primary-color)! text-xs leading-4 tracking-wider font-semibold uppercase transition-all active:scale-[0.98]"
                    style={{
                      padding: "16px 24px",
                      height: "auto",
                      border: "none",
                    }}
                  >
                    {isLoading ? t("loading") : t("loginBtn")}
                  </Button>
                </Form.Item>
              </Form>

              <div className="pt-8 text-center">
                <p className="text-sm leading-5 text-[#45464e]">
                  {t("bottomNote.needAccess")}
                  <span className="text-(--primary-color) font-semibold cursor-pointer hover:underline">
                    {t("bottomNote.systemAdmin")}
                  </span>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#eff4ff] border-t border-[#c6c6cf] py-2 px-10 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className=" text-xs leading-4 tracking-wider font-semibold text-[#45464e]">
          &copy; {new Date().getFullYear()} Delo System. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

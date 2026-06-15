import { AuthProvider } from "@core/providers/auth";
import { SidebarProvider } from "@core/providers/sidebar";
import { TranslateProvider } from "@core/providers/translate";
import { store } from "@core/store/index.js";
import { App as AppAntDesign, ConfigProvider } from "antd";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <AuthProvider>
      <TranslateProvider>
        <SidebarProvider>
          <ConfigProvider
            theme={{
              token: {
                borderRadius: 4,
              },
            }}
          >
            <AppAntDesign>
              <App />
            </AppAntDesign>
          </ConfigProvider>
        </SidebarProvider>
      </TranslateProvider>
    </AuthProvider>
  </Provider>,
);

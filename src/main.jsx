import { ConfigProvider } from "antd";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App.jsx";
import { AuthProvider } from "./core/providers/AuthProvider.jsx";
import { SidebarProvider } from "./core/providers/SidebarProvider.jsx";
import { TranslateProvider } from "./core/providers/TranslateProvider.jsx";
import { store } from "./core/store/index.js";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <TranslateProvider>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: "#5865f2",
              },
            }}
          >
            <SidebarProvider>
              <App />
            </SidebarProvider>
          </ConfigProvider>
        </TranslateProvider>
      </AuthProvider>
    </Provider>
  </StrictMode>,
);

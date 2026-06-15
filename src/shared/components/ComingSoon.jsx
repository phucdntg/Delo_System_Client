import { ToolOutlined } from "@ant-design/icons";
import { Typography } from "antd";

const { Text, Title } = Typography;

export default function ComingSoon({ featureName }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
        padding: 48,
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "#f0f4ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <ToolOutlined style={{ fontSize: 36, color: "#465fff" }} />
      </div>
      <Title level={3} style={{ color: "#1d2939", marginBottom: 8 }}>
        {featureName || "Tính năng"}
      </Title>
      <Text style={{ fontSize: 16, color: "#667085", maxWidth: 400 }}>
        Tính năng đang được phát triển và sẽ sớm ra mắt.
      </Text>
    </div>
  );
}

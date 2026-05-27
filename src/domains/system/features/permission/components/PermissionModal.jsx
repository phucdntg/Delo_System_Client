import ModalShared from "@shared/components/ModalShared";
import { Empty, Spin } from "antd";
import { useEffect, useState } from "react";
import PermissionSelector from "./PermissionSelector";

export default function PermissionModal({
  visible,
  title = "Select Permissions",
  onCancel,
  onConfirm,
  selected = [],
  permissions,
  loading = false,
  error = false,
  width = 600,
}) {
  const [draft, setDraft] = useState(selected);

  useEffect(() => {
    if (visible) setDraft(selected);
  }, [visible, selected]);

  const handleOk = () => onConfirm?.(draft);

  if (loading) {
    return (
      <ModalShared
        open={visible}
        width={width}
        title={title}
        onCancel={onCancel}
        footer={null}
      >
        <div style={{ textAlign: "center", padding: 24 }}>
          <Spin />
        </div>
      </ModalShared>
    );
  }

  if (error) {
    return (
      <ModalShared
        open={visible}
        width={width}
        title={title}
        onCancel={onCancel}
        footer={null}
      >
        <Empty description="Failed to load permissions" />
      </ModalShared>
    );
  }

  return (
    <ModalShared
      open={visible}
      title={title}
      onCancel={onCancel}
      onOk={handleOk}
      width={width}
    >
      <PermissionSelector
        permissions={permissions}
        selected={draft}
        onChange={setDraft}
      />
    </ModalShared>
  );
}

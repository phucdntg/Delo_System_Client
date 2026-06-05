import { usePermission } from "@core/hooks/usePermission";
import { useTranslate } from "@core/providers/translate";
import { Modal } from "antd";
import { memo } from "react";

const ModalShared = ({
  title,
  open,
  onCancel,
  onOk,
  confirmLoading = false,
  children,
  isEdit = false,
  permissionKey,
  ...props
}) => {
  const { translate } = useTranslate();
  const translateCommon = translate("common.button") || {};
  const { hasPermission } = usePermission();

  const canSave = permissionKey
    ? hasPermission(`${permissionKey}.${isEdit ? "edit" : "create"}`)
    : true;

  return (
    <Modal
      title={title}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      okText={translateCommon?.save}
      cancelText={translateCommon?.cancel}
      confirmLoading={confirmLoading}
      okButtonProps={{ style: { display: true ? "inline-block" : "none" } }}
      forceRender
      {...props}
    >
      {children}
    </Modal>
  );
};

export default memo(ModalShared);

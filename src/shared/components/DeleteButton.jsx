import { DeleteOutlined } from "@ant-design/icons";
import { useTranslate } from "@core/providers/translate";
import { Button, Popconfirm } from "antd";
import { memo } from "react";

const DeleteButton = memo(({ onDelete }) => {
  const { translate } = useTranslate();

  return (
    <Popconfirm
      title={translate("common.confirm.delete")}
      okText={translate("common.button.ok")}
      cancelText={translate("common.button.cancel")}
      onConfirm={onDelete}
    >
      <Button type="text" danger icon={<DeleteOutlined />} />
    </Popconfirm>
  );
});

export default DeleteButton;

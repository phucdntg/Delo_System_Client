import { DeleteOutlined } from "@ant-design/icons";
import { Button, Popconfirm } from "antd";
import { useTranslate } from "@core/providers/translate";

const DeleteButton = ({ onDelete }) => {
  const { translate } = useTranslate();

  return (
    <Popconfirm
      title={translate("common.confirm.delete")}
      okText={translate("common.button.ok")}
      cancelText={translate("common.button.cancel")}
      onConfirm={onDelete}
    >
      <Button shape="circle" danger icon={<DeleteOutlined />} />
    </Popconfirm>
  );
};

export default DeleteButton;

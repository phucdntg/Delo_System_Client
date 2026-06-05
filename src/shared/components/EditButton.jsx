import { EditOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { memo } from "react";

const EditButton = memo(({ onEdit }) => {
  return <Button shape="circle" icon={<EditOutlined />} onClick={onEdit} />;
});

export default EditButton;

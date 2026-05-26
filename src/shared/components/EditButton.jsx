import { EditOutlined } from "@ant-design/icons";
import { Button } from "antd";

const EditButton = ({ onEdit }) => {
  return <Button shape="circle" icon={<EditOutlined />} onClick={onEdit} />;
};

export default EditButton;

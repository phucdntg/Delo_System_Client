import { DeleteOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";
import { memo, useCallback } from "react";
import { MdOutlineAddCircleOutline } from "react-icons/md";

const OptionItem = memo(
  ({ option, onUpdate, onDelete, onAddSubQuestion }) => {

    const handleLabelChange = useCallback(
      (e) => onUpdate?.(option._id, "label", e.target.value),
      [onUpdate, option._id],
    );

    const handleNextRefChange = useCallback(
      (value) => onUpdate?.(option._id, "nextRef", value),
      [onUpdate, option._id],
    );

    return (
      <div className="flex items-center gap-2 py-1.5 group">
        <span className="text-gray-400 text-sm shrink-0">├─</span>

        <Input
          value={option.label}
          onChange={handleLabelChange}
          placeholder="Nhãn lựa chọn"
          className="flex-1"
          style={{ width: 180 }}
          size="small"
        />

        <span className="text-gray-400 shrink-0">→</span>

        <Input
          value={option.nextRef || ""}
          onChange={(e) => handleNextRefChange(e.target.value)}
          placeholder="ref câu hỏi tiếp (vd: q2)"
          style={{ width: 200 }}
          size="small"
        />

        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => onDelete?.(option._id)}
        />

        <button
          type="button"
          className="text-gray-400 hover:text-blue-500 text-lg transition-colors"
          title="Thêm câu hỏi con"
          onClick={() => onAddSubQuestion?.(option)}
        >
          <MdOutlineAddCircleOutline />
        </button>
      </div>
    );
  },
);

OptionItem.displayName = "OptionItem";

export default OptionItem;

import { Input } from "antd";
import { memo, useCallback } from "react";

const AnswerEditor = memo(({ questionId, content, onUpdate }) => {
  const handleChange = useCallback(
    (e) => {
      onUpdate?.(questionId, "answer", e.target.value);
    },
    [onUpdate, questionId],
  );

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <p className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
        Nội dung trả lời
      </p>
      <Input.TextArea
        value={content}
        onChange={handleChange}
        rows={3}
        placeholder="Nhập nội dung câu trả lời..."
      />
    </div>
  );
});

AnswerEditor.displayName = "AnswerEditor";

export default AnswerEditor;

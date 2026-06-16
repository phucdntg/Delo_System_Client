import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { App, Button, Input, Select, Switch } from "antd";
import { memo, useCallback } from "react";
import { IoInformationCircleOutline } from "react-icons/io5";
import { MdOutlineAddCircleOutline } from "react-icons/md";
import AnswerEditor from "./AnswerEditor";
import OptionItem from "./OptionItem";

const NODE_TYPES = [
  { value: "question", label: "question" },
  { value: "sub_question", label: "sub_question" },
  { value: "info_screen", label: "info_screen" },
];

const QuestionNode = memo(
  ({
    question,
    allQuestions,
    onUpdate,
    onDelete,
    onAddOption,
    onDeleteOption,
    onAddSubQuestion,
  }) => {
    const { modal } = App.useApp();

    const handleFieldChange = useCallback(
      (field, value) => {
        onUpdate?.(question._id, field, value);
      },
      [onUpdate, question._id],
    );

    const handleOptionUpdate = useCallback(
      (optionId, field, value) => {
        onUpdate?.(question._id, `option.${optionId}.${field}`, value);
      },
      [onUpdate, question._id],
    );

    const handleDeleteOption = useCallback(
      (optionId) => {
        onDeleteOption?.(question._id, optionId);
      },
      [onDeleteOption, question._id],
    );

    const handleAddSubQuestionClick = useCallback(
      (option) => {
        onAddSubQuestion?.(question, option);
      },
      [onAddSubQuestion, question],
    );

    const handleViewInfo = useCallback(() => {
      modal.info({
        title: "Thông tin câu hỏi",
        content: (
          <div className="text-sm space-y-1">
            <p>
              <strong>Ref:</strong> {question.ref || "Chưa có"}
            </p>
            <p>
              <strong>ID:</strong> {question.id || "Mới"}
            </p>
            <p>
              <strong>Loại:</strong> {question.nodeType}
            </p>
            <p>
              <strong>Terminal:</strong> {question.isTerminal ? "Có" : "Không"}
            </p>
            <p>
              <strong>Parent:</strong> {question.parentRef || "Root"}
            </p>
          </div>
        ),
      });
    }, [question, modal]);

    return (
      <div className="border border-gray-200 rounded-lg p-4 mb-3 bg-white shadow-sm hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xs font-mono text-gray-400 whitespace-nowrap shrink-0">
              {question.ref || "?"}:
            </span>
            <Input
              value={question.title}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              placeholder="Tiêu đề câu hỏi"
              className="flex-1 min-w-0"
              size="small"
            />
          </div>

          <div className="flex items-center gap-1 ml-2 shrink-0">
            <button
              type="button"
              className="text-gray-400 hover:text-blue-500 text-base transition-colors p-1"
              title="Thông tin"
              onClick={handleViewInfo}
            >
              <IoInformationCircleOutline />
            </button>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {}}
            />
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => onDelete?.(question._id)}
            />
          </div>
        </div>

        {/* Settings row */}
        <div className="flex items-center gap-4 mb-3">
          <Select
            value={question.nodeType}
            onChange={(v) => handleFieldChange("nodeType", v)}
            options={NODE_TYPES}
            size="small"
            style={{ width: 140 }}
          />

          <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
            <span>Terminal:</span>
            <Switch
              size="small"
              checked={question.isTerminal}
              onChange={(v) => handleFieldChange("isTerminal", v)}
            />
          </label>
        </div>

        {/* Options list (chỉ khi isTerminal = false) */}
        {!question.isTerminal && (
          <div className="ml-2">
            <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">
              Lựa chọn
            </p>

            {(question.options || []).map((opt, idx) => (
              <OptionItem
                key={opt._id}
                option={opt}
                index={idx}
                questions={allQuestions}
                onUpdate={handleOptionUpdate}
                onDelete={handleDeleteOption}
                onAddSubQuestion={handleAddSubQuestionClick}
              />
            ))}

            <button
              type="button"
              className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700 transition-colors mt-1"
              onClick={() => onAddOption?.(question._id)}
            >
              <MdOutlineAddCircleOutline size={16} />
              <span>Thêm lựa chọn</span>
            </button>
          </div>
        )}

        {/* Answer (chỉ khi isTerminal = true) */}
        {question.isTerminal && (
          <AnswerEditor
            questionId={question._id}
            content={question.answer?.content}
            onUpdate={(qId, field, value) => {
              onUpdate?.(qId, field, value);
            }}
          />
        )}
      </div>
    );
  },
);

QuestionNode.displayName = "QuestionNode";

export default QuestionNode;

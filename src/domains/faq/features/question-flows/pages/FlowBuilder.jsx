import { useFetchBranchesQuery } from "@domains/system";
import {
  useGetQuestionFlowByIdQuery,
  useCreateQuestionFlowMutation,
  useUpdateQuestionFlowMutation,
} from "@domains/faq";
import { PATH } from "@shared/constants/systemConstants";
import { App, Breadcrumb, Button, Form, Input, Select, Spin } from "antd";
import { useForm } from "antd/es/form/Form";
import { useCallback, useEffect, useRef, useState } from "react";
import { IoAddOutline, IoArrowBackOutline } from "react-icons/io5";
import { MdOutlineSave } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import AddQuestionModal from "../components/AddQuestionModal";
import QuestionNode from "../components/QuestionNode";

let _tempCounter = 0;
const tempId = () => `_temp_${++_tempCounter}`;

export default function FlowBuilder() {
  const { id } = useParams();
  const editId = id;
  const isEdit = Boolean(editId);

  const navigate = useNavigate();
  const { message } = App.useApp();

  const [formInfo] = useForm();
  const [questions, setQuestions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Load data nếu là edit mode
  const {
    data: flowData,
    isLoading: isLoadingFlow,
    isFetching: isFetchingFlow,
  } = useGetQuestionFlowByIdQuery(editId, { skip: !editId });

  const [createFlow, { isLoading: isCreating }] =
    useCreateQuestionFlowMutation();
  const [updateFlow, { isLoading: isUpdating }] =
    useUpdateQuestionFlowMutation();

  // Load data vào form và questions khi API trả về
  const dataLoadedRef = useRef(false);

  useEffect(() => {
    if (flowData && !dataLoadedRef.current) {
      dataLoadedRef.current = true;
      const flow = flowData?.data || flowData;
      formInfo.setFieldsValue({
        name: flow.name,
        description: flow.description,
        branchId: flow.branchId,
      });
      setQuestions(buildTree(flow.questions || []));
    }
  }, [flowData, formInfo]);

  const handleAddQuestion = useCallback((values) => {
    const newQuestion = {
      _id: tempId(),
      ref: null,
      title: values.title,
      description: values.description,
      nodeType: values.nodeType || "question",
      isTerminal: values.isTerminal || false,
      parentRef: values.parentRef || null,
      orderIndex: 0,
      options: [],
      answer: values.isTerminal ? { content: "" } : undefined,
    };

    setQuestions((prev) => {
      const updated = [...prev, newQuestion];
      return assignRefs(updated);
    });

    setModalOpen(false);
  }, []);

  const handleUpdateQuestion = useCallback((qId, field, value) => {
    setQuestions((prev) => {
      if (field.startsWith("option.")) {
        // option update: field = "option.{optionId}.{subField}"
        const parts = field.split(".");
        const optionId = parts[1];
        const subField = parts.slice(2).join(".");

        return prev.map((q) => {
          if (q._id !== qId) return q;
          return {
            ...q,
            options: q.options.map((opt) => {
              if (opt._id !== optionId) return opt;
              if (subField === "nextRef") return { ...opt, nextRef: value };
              return { ...opt, [subField]: value };
            }),
          };
        });
      }

      if (field === "answer") {
        return prev.map((q) => {
          if (q._id !== qId) return q;
          return { ...q, answer: { ...(q.answer || {}), content: value } };
        });
      }

      return prev.map((q) => {
        if (q._id !== qId) return q;
        return { ...q, [field]: value };
      });
    });
  }, []);

  const handleDeleteQuestion = useCallback((qId) => {
    setQuestions((prev) => {
      const idsToRemove = new Set();
      const collectDescendants = (id) => {
        idsToRemove.add(id);
        prev.forEach((q) => {
          q.options?.forEach((opt) => {
            if (
              opt.nextRef === q.ref &&
              idsToRemove.has(q._id)
            ) {
              // find the question with that ref
              const next = prev.find((x) => x.ref === opt.nextRef);
              if (next) idsToRemove.add(next._id);
            }
          });
        });
      };
      collectDescendants(qId);
      const filtered = prev.filter((q) => !idsToRemove.has(q._id));
      return assignRefs(filtered);
    });
  }, []);

  const handleAddOption = useCallback((qId) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q._id !== qId) return q;
        return {
          ...q,
          options: [
            ...(q.options || []),
            {
              _id: tempId(),
              _questionId: qId,
              label: "",
              nextRef: null,
              orderIndex: (q.options || []).length,
            },
          ],
        };
      }),
    );
  }, []);

  const handleDeleteOption = useCallback((qId, optId) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q._id !== qId) return q;
        return {
          ...q,
          options: q.options.filter((o) => o._id !== optId),
        };
      }),
    );
  }, []);

  const handleAddSubQuestion = useCallback(
    (parentQuestion, option) => {
      const newQuestion = {
        _id: tempId(),
        ref: null,
        title: "",
        description: "",
        nodeType: "sub_question",
        isTerminal: false,
        parentRef: parentQuestion.ref,
        orderIndex: 0,
        options: [],
        answer: undefined,
      };

      setQuestions((prev) => {
        const updated = [...prev, newQuestion];
        // Gán nextRef cho option đang chọn
        return assignRefs(
          updated.map((q) => {
            if (q._id !== parentQuestion._id) return q;
            return {
              ...q,
              options: q.options.map((o) => {
                if (o._id !== option._id) return o;
                return { ...o, nextRef: newQuestion.ref };
              }),
            };
          }),
        );
      });
    },
    [],
  );

  const handleSubmit = useCallback(
    async (andClose = false) => {
      try {
        const infoValues = await formInfo.validateFields();
        const flatQuestions = flattenTree(questions);

        const payload = {
          name: infoValues.name,
          description: infoValues.description,
          branchId: infoValues.branchId,
          questions: flatQuestions,
        };

        if (isEdit) {
          await updateFlow({ id: Number(editId), ...payload }).unwrap();
          message.success("Cập nhật thành công");
        } else {
          await createFlow(payload).unwrap();
          message.success("Tạo mới thành công");
        }

        if (andClose) {
          navigate(`/${PATH.FAQ.BASE}`);
        }
      } catch (error) {
        if (error?.errorFields) return;
        console.error(error);
        message.error(isEdit ? "Cập nhật thất bại" : "Tạo mới thất bại");
      }
    },
    [formInfo, questions, isEdit, editId, createFlow, updateFlow, message, navigate],
  );

  // Loading
  if (isEdit && isLoadingFlow) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="h-full bg-white rounded overflow-y-auto">
      <div className="sticky top-0 bg-white z-10 border-b border-gray-200 px-5 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Button
              type="text"
              icon={<IoArrowBackOutline size={18} />}
              onClick={() => navigate(`/${PATH.FAQ.BASE}`)}
            />
            <Breadcrumb
              items={[
                { title: <a onClick={() => navigate(`/${PATH.FAQ.BASE}`)}>FAQ</a> },
                { title: isEdit ? "Chỉnh sửa Flow" : "Tạo Flow mới" },
              ]}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button icon={<MdOutlineSave size={16} />} onClick={() => handleSubmit(false)}>
              Lưu
            </Button>
            <Button
              type="primary"
              icon={<MdOutlineSave size={16} />}
              onClick={() => handleSubmit(true)}
              loading={isCreating || isUpdating}
            >
              Lưu & Đóng
            </Button>
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* Flow Info */}
        <div className="border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Thông tin cơ bản
          </h3>
          <Form form={formInfo} layout="vertical">
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="name"
                label="Tên flow"
                rules={[{ required: true, message: "Vui lòng nhập tên flow" }]}
              >
                <Input placeholder="Nhập tên flow" />
              </Form.Item>
              <Form.Item
                name="branchId"
                label="Chi nhánh"
                rules={[{ required: true, message: "Vui lòng chọn chi nhánh" }]}
              >
                <Select
                  showSearch
                  placeholder="-- Chọn chi nhánh --"
                  optionFilterProp="label"
                  loading={isFetchingFlow}
                >
                  <BranchOptions />
                </Select>
              </Form.Item>
            </div>
            <Form.Item name="description" label="Mô tả">
              <Input.TextArea rows={2} placeholder="Nhập mô tả (không bắt buộc)" />
            </Form.Item>
          </Form>
        </div>

        {/* Question Tree */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Cây câu hỏi
          </h3>

          {questions.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p className="mb-2">Chưa có câu hỏi nào.</p>
              <p className="text-sm">
                Nhấn nút bên dưới để thêm câu hỏi đầu tiên.
              </p>
            </div>
          )}

          {questions.map((q) => (
            <QuestionNode
              key={q._id}
              question={q}
              allQuestions={questions}
              onUpdate={handleUpdateQuestion}
              onDelete={handleDeleteQuestion}
              onAddOption={handleAddOption}
              onDeleteOption={handleDeleteOption}
              onAddSubQuestion={handleAddSubQuestion}
            />
          ))}

          <Button
            type="dashed"
            icon={<IoAddOutline size={16} />}
            className="w-full mt-2"
            onClick={() => {
              setEditingQuestion(null);
              setModalOpen(true);
            }}
          >
            Thêm câu hỏi
          </Button>
        </div>
      </div>

      {/* Add Question Modal */}
      {modalOpen && (
        <AddQuestionModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleAddQuestion}
          questions={questions}
          initialValue={editingQuestion}
        />
      )}
    </div>
  );
}

function BranchOptions() {
  const { data: branches } = useFetchBranchesQuery({});
  const list = Array.isArray(branches)
    ? branches
    : branches?.data || [];

  return list.map((b) => (
    <Select.Option key={b.id} value={b.id}>
      {b.name}
    </Select.Option>
  ));
}

// Utilities

function assignRefs(questions) {
  let maxIndex = questions.reduce((max, q) => {
    const num = q.ref ? parseInt(q.ref.replace("q", ""), 10) : 0;
    return Math.max(max, num);
  }, 0);

  return questions.map((q) => {
    if (!q.ref) {
      maxIndex++;
      return { ...q, ref: `q${maxIndex}` };
    }
    return q;
  });
}

function buildTree(flatQuestions) {
  return (flatQuestions || []).map((q) => ({
    _id: tempId(),
    ...q,
    options: (q.options || []).map((o) => ({
      ...o,
      _id: tempId(),
    })),
  }));
}

function flattenTree(questions) {
  let index = 0;
  const result = [];

  function walk(node) {
    const ref = node.ref || `q${++index}`;
    result.push({
      ref,
      title: node.title,
      description: node.description,
      nodeType: node.nodeType,
      isTerminal: node.isTerminal,
      parentRef: node.parentRef,
      orderIndex: node.orderIndex || 0,
      options: (node.options || []).map((opt) => ({
        label: opt.label,
        nextRef: opt.nextRef || null,
        orderIndex: opt.orderIndex || 0,
      })),
      ...(node.isTerminal
        ? { answer: { content: node.answer?.content || "" } }
        : {}),
    });
  }

  questions.forEach((q) => walk(q));
  return result;
}

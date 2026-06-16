import useTable from "@core/hooks/useTable";
import {
  useDeleteQuestionFlowMutation,
  useGetQuestionFlowsQuery,
} from "@domains/faq";
import { useFetchBranchesQuery } from "@domains/system";
import DeleteButton from "@shared/components/DeleteButton";
import EditButton from "@shared/components/EditButton";
import TableShared from "@shared/components/TableShared";
import { PATH } from "@shared/constants/systemConstants";
import { App, Button, Space } from "antd";
import { useCallback } from "react";
import { IoAddOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function FlowList() {
  const navigate = useNavigate();
  const { message } = App.useApp();

  const { pagination, searchTerm, handleSearch, handleTableChange } =
    useTable();

  const { data, isLoading, isFetching } = useGetQuestionFlowsQuery({
    pagination,
    search: "name",
    keyword: searchTerm,
  });

  const [deleteQuestionFlow] = useDeleteQuestionFlowMutation();

  const handleDelete = useCallback(
    async (id) => {
      try {
        await deleteQuestionFlow(id).unwrap();
        message.success("Xóa thành công");
      } catch (error) {
        console.error(error);
        message.error("Xóa thất bại");
      }
    },
    [deleteQuestionFlow, message],
  );

  const columns = [
    {
      title: "Tên câu hỏi thường gặp",
      dataIndex: "name",
      key: "name",
      render: (value, record) => (
        <a
          className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium"
          onClick={() => navigate(`/${PATH.FAQ.BASE}/${record.id}`)}
        >
          {value}
        </a>
      ),
    },
    {
      title: "Chi nhánh",
      dataIndex: "branchId",
      key: "branch",
      render: (branchId) => <BranchName id={branchId} />,
    },
    {
      title: "Số câu hỏi",
      key: "questionCount",
      render: (_, record) => record.questions?.length || 0,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value) =>
        value ? new Date(value).toLocaleDateString("vi-VN") : "-",
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space gap={8}>
          <EditButton
            onEdit={() => navigate(`/${PATH.FAQ.BASE}/${record.id}`)}
          />
          <DeleteButton
            itemName={record.name}
            onDelete={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="h-full p-5 bg-white rounded">
      <TableShared
        isLoading={isLoading}
        isFetching={isFetching}
        dataSource={data?.data || []}
        columns={columns}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: data?.meta?.totalItems || 0,
          onChange: (page, pageSize) =>
            handleTableChange({ current: page, pageSize }),
        }}
        search={{
          useSearch: true,
          hint: "Tìm kiếm theo tên câu hỏi thường gặp...",
          handleSearch,
        }}
        topLeftComponent={
          <Button
            type="primary"
            icon={<IoAddOutline size={18} />}
            onClick={() => navigate(`/${PATH.FAQ.BASE}/${PATH.FAQ.CREATE}`)}
          >
            Thêm mới
          </Button>
        }
      />
    </div>
  );
}

function BranchName({ id }) {
  const { data: branches } = useFetchBranchesQuery({});
  const branch = Array.isArray(branches)
    ? branches.find((b) => b.id === id)
    : branches?.data?.find?.((b) => b.id === id);

  return <span>{branch?.name || id || "-"}</span>;
}

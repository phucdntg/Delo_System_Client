import { PlusOutlined } from "@ant-design/icons";
import useModal from "@core/hooks/useModal";
import useTable from "@core/hooks/useTable";
import { useTranslate } from "@core/providers/translate";
import DeleteButton from "@shared/components/DeleteButton";
import EditButton from "@shared/components/EditButton";
import ModalShared from "@shared/components/ModalShared";
import TableShared from "@shared/components/TableShared";
import { toVNTime } from "@shared/utils/formatTime";
import { App, Button, Space, Tag } from "antd";
import { useForm } from "antd/es/form/Form";
import OrganizationForm from "../components/OrganizationForm";
import {
  useCreateOrgMutation,
  useDeleteOrgMutation,
  useFetchOrgQuery,
  useUpdateOrgMutation,
} from "../services/orgService";

export default function OrgManagement() {
  const { message } = App.useApp();
  const { translate } = useTranslate();
  const translateOrgPage = translate("organization") || {};

  const [form] = useForm();
  const { open, data: dataEditing, openModal, closeModal } = useModal();
  const { pagination, handleTableChange, searchTerm, handleSearch } =
    useTable();

  const { data, isLoading, isFetching } = useFetchOrgQuery({
    search: searchTerm.length > 0 ? "name" : null,
    keyword: searchTerm,
    pagination: pagination,
  });

  const [createOrg, { isLoading: isCreating }] = useCreateOrgMutation();
  const [updateOrg, { isLoading: isUpdating }] = useUpdateOrgMutation();
  const [deleteOrg] = useDeleteOrgMutation();

  const columns = [
    // {
    //   key: "id",
    //   title: "ID",
    //   dataIndex: "id",
    //   width: 100,
    // },
    {
      key: "name",
      title: translateOrgPage?.table?.name,
      dataIndex: "name",
      textWrap: "word-break",
      width: 200,
    },
    {
      key: "subdomain",
      title: translateOrgPage?.table?.subdomain,
      dataIndex: "subdomain",
      textWrap: "word-break",
      width: 200,
    },
    {
      key: "status",
      title: translateOrgPage?.table?.isActive,
      dataIndex: "isActive",
      width: 200,
      render: (isActive) =>
        isActive ? (
          <Tag color="green">{translate("common.status.active")}</Tag>
        ) : (
          <Tag color="red">{translate("common.status.inactive")}</Tag>
        ),
    },
    {
      key: "createdAt",
      title: translateOrgPage?.table?.createdAt,
      dataIndex: "createdAt",
      width: 200,
      render: (value) => (value ? toVNTime(value) : "-"),
    },
    {
      key: "updatedAt",
      title: translateOrgPage?.table?.updatedAt,
      dataIndex: "updatedAt",
      width: 200,
      render: (value) => (value ? toVNTime(value) : "-"),
    },
    {
      key: "actions",
      title: translateOrgPage?.table?.action,
      fixed: "right",
      width: 150,
      render: (_, record) => (
        <Space style={{ display: "flex", justifyContent: "center" }}>
          <EditButton onEdit={() => openModal(record)} />
          <DeleteButton onDelete={() => deleteOrg(record?.id)} />
        </Space>
      ),
    },
  ];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        monitorUrl: "",
        kioskUrl: "",
        counterUrl: "",
      };

      if (dataEditing?.id) {
        await updateOrg({ id: dataEditing.id, body: payload }).unwrap();
        message.success(translateOrgPage?.message?.updateSuccess);
      } else {
        await createOrg(payload).unwrap();
        message.success(translateOrgPage?.message?.createSuccess);
      }

      closeModal();
      form.resetFields();
    } catch (error) {
      message.error(
        dataEditing?.id
          ? translateOrgPage?.message?.updateFailed
          : translateOrgPage?.message?.createFailed,
      );
      console.log("Failed with error:", error);
    }
  };

  return (
    <div>
      <ModalShared
        title={
          dataEditing?.id
            ? translateOrgPage?.modal?.updateTitle
            : translateOrgPage?.modal?.createTitle
        }
        open={open}
        onOk={handleSubmit}
        onCancel={closeModal}
        confirmLoading={isCreating || isUpdating}
      >
        <OrganizationForm form={form} initialValue={dataEditing} />
      </ModalShared>

      <TableShared
        isLoading={isLoading}
        isFetching={isFetching}
        dataSource={data?.data || []}
        columns={columns}
        search={{
          useSearch: true,
          hint: translateOrgPage?.search?.placeholder,
          handleSearch: (value) => handleSearch(value),
        }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: data?.meta?.totalItems || 0,
          onChange: (page, pageSize) =>
            handleTableChange({ current: page, pageSize }),
        }}
        topLeftComponent={
          <>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
            >
              {translate("common.button")?.create}
            </Button>
          </>
        }
      />
    </div>
  );
}

---
name: ant-design
description: Ant Design 6 usage patterns — shared components, form modals, table patterns, and best practices for the Delo System Client
---

# Ant Design

## When to use

Use this skill when building UI with Ant Design components, creating form modals, configuring tables, or styling with Ant Design's ConfigProvider theme.

## Key rules

### App.useApp() instead of direct imports

Ant Design 6 requires using `App.useApp()` for static methods. Never import `message`, `notification`, or `modal` directly:

```jsx
// ✅ Correct
import { App } from "antd";
function MyComponent() {
  const { message } = App.useApp();
  message.success("Done");
}

// ❌ Wrong
import { message } from "antd";
message.success("Done");
```

### Theme configuration

The theme is set in `src/main.jsx` via `<ConfigProvider theme={{ token: { colorPrimary: "#5865f2" } }}>`. Use these colors and tokens rather than overriding Ant Design's default tokens elsewhere.

### Shared wrappers

These shared components wrap Ant Design with translations and consistent behavior:

- **`ModalShared`** (`@shared/components/ModalShared`) — Wraps `Modal` with translated OK/Cancel buttons, permission-aware save button, and `forceRender` (do NOT remove `forceRender` — it ensures Form instances mount even when closed)
- **`TableShared`** (`@shared/components/TableShared`) — Wraps `Table` with shimmer loading skeleton, search toolbar, custom empty state, stable loading timer
- **`SelectShared`** (`@shared/components/SelectShared`) — Async select with infinite scroll, debounced search, default-value preload via `fetchItemById`
- **`DeleteButton`** (`@shared/components/DeleteButton`) — Danger button inside `Popconfirm` with translated text
- **`EditButton`** (`@shared/components/EditButton`) — Edit icon button

## Form modal pattern

Form modals follow a consistent pattern across the project:

```jsx
export default function XxxFormModal({ open, onClose, onSubmit, initialValue, confirmLoading }) {
  const [form] = useForm();

  useLayoutEffect(() => {
    if (initialValue) {
      form.setFieldsValue({ ...initialValue });
    } else {
      form.setFieldsValue({ isActive: true });  // defaults for create mode
    }
    return () => form.resetFields();
  }, [initialValue, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
    } catch (error) {
      if (error?.errorFields) return;  // validation error — Ant Design handles display
    }
  };

  return (
    <ModalShared
      title={initialValue ? "Edit" : "Create"}
      open={open} confirmLoading={confirmLoading}
      onOk={handleOk} onCancel={onClose}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Form>
    </ModalShared>
  );
}
```

Key conventions:
- Mount modal conditionally with `{open && <Modal />}` so `useLayoutEffect` runs fresh each time
- `useModal()` hook provides `{ open, data, openModal, closeModal }` — `data` carries the editing record, `null` means create mode
- Use `useForm` from `antd/es/form/Form` (or just `antd`)

## Table page pattern

Always use `useTable()` hook for pagination/filter/search state management. Combine with `TableShared` for consistent look:

```jsx
const { pagination, searchTerm, handleSearch, handleTableChange } = useTable();
const { data, isLoading, isFetching } = useGetXxxsQuery({
  pagination,
  search: "name",
  keyword: searchTerm,
});

return (
  <TableShared
    isLoading={isLoading} isFetching={isFetching}
    dataSource={data?.data || []} columns={columns}
    pagination={{
      current: pagination.current,
      pageSize: pagination.pageSize,
      total: data?.meta?.totalItems || 0,
      onChange: (page, pageSize) => handleTableChange({ current: page, pageSize }),
    }}
    search={{ useSearch: true, hint: "Search...", handleSearch }}
    topLeftComponent={<Button type="primary" icon={<PlusOutlined />}>Create</Button>}
  />
);
```

## Styling

- Custom Ant Design overrides go in `src/styles/table-shared.css` (currently for TableShared)
- Use Tailwind utilities for layout/spacing around Ant Design components
- The Ant Design `ConfigProvider` in `main.jsx` sets `colorPrimary: "#5865f2"` — do not duplicate theme tokens

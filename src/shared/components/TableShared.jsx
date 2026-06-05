import { useTranslate } from "@core/providers/translate";
import { Empty, Input, Table } from "antd";
import { memo, useEffect, useMemo, useState } from "react";
import "../../styles/table-shared.css";

const TableShared = ({
  dataSource,
  columns,
  pagination,
  search = { useSearch: false, hint: null, handleSearch: null },
  isLoading,
  isFetching,
  topLeftComponent,
  topRightComponent,
  ...props
}) => {
  const { translate } = useTranslate();
  const translateCommon = translate("common") || {};
  const shouldShowSearch = search.useSearch;

  // ─── Stabilize reference for inline pagination objects ─────────────────
  const stablePagination = useMemo(
    () => pagination,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pagination?.current, pagination?.pageSize, pagination?.total, pagination?.onChange],
  );

  const paginationWithDefaults = useMemo(() => ({
    ...stablePagination,
    showSizeChanger: true,
    responsive: true,
    locale: {
      items_per_page: `/ ${translateCommon?.pagination?.page}`,
    },
  }), [stablePagination, translateCommon?.pagination?.page]);

  const [stableLoading, setStableLoading] = useState(isLoading);

  useEffect(() => {
    const delay = isLoading ? 0 : 50;
    const timer = setTimeout(() => setStableLoading(isLoading), delay);
    return () => clearTimeout(timer);
  }, [isLoading]);

  const emptyDataSource = useMemo(() => {
    return new Array(pagination.pageSize).fill({}).map((_, index) => {
      return { key: `empty-${index}` };
    });
  }, [pagination.pageSize]);

  const emptyColumns = useMemo(() => {
    if (!columns || columns.length === 0) return [];

    return columns.map((column, index) => ({
      ...column,
      key: `empty-${index}`,
      /* eslint-disable no-unused-vars */
      render: (value, record, rowIndex) => (
      /* eslint-enable no-unused-vars */
        <div
          className="h-5 rounded bg-gray-100"
          style={{
            width: index % 3 === 0 ? "60%" : index % 3 === 1 ? "80%" : "100%",
          }}
        />
      ),
    }));
  }, [columns]);

  return (
    <div className="table-shared">
      <div className="table-shared__toolbar">
        {topLeftComponent}
        <div className="table-shared__actions">
          {topRightComponent}
          {shouldShowSearch && (
            <Input.Search
              className="table-shared__search"
              onSearch={search.handleSearch}
              placeholder={search.hint}
              allowClear={true}
            ></Input.Search>
          )}
        </div>
      </div>
      <Table
        {...props}
        bordered={true}
        loading={!stableLoading && isFetching}
        columns={stableLoading ? emptyColumns : columns}
        dataSource={
          stableLoading
            ? emptyDataSource
            : dataSource.map((item) => ({ ...item, key: item.id }))
        }
        locale={{
          ...(props.locale || {}),
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={translateCommon?.table?.noData}
            />
          ),
        }}
        pagination={paginationWithDefaults}
        scroll={{ x: "max-content" }}
      ></Table>
    </div>
  );
};

export default memo(TableShared);

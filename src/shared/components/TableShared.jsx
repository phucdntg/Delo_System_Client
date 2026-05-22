import { Empty, Input, Table } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslate } from "../../core/providers/TranslateProvider";
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

  const [stableLoading, setStableLoading] = useState(isLoading);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isLoading) {
      clearTimeout(timerRef.current);
      setStableLoading(true);
    } else {
      timerRef.current = setTimeout(() => setStableLoading(false), 50);
    }
    return () => clearTimeout(timerRef.current);
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
      render: (_, __, rowIndex) => (
        <div
          className="animate-shimmer h-5 rounded"
          style={{
            width: index % 3 === 0 ? "60%" : index % 3 === 1 ? "80%" : "100%",
            background:
              "linear-gradient(90deg, #e8ecf0 25%, #f5f7fa 50%, #e8ecf0 75%)",
            backgroundSize: "200% 100%",
            animationDelay: `${rowIndex * 0.08 + index * 0.05}s`,
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
        pagination={{
          ...pagination,
          showSizeChanger: true,
          responsive: true,
          locale: {
            items_per_page: `/ ${translateCommon?.pagination?.page}`,
          },
        }}
        scroll={{ x: "max-content" }}
      ></Table>
    </div>
  );
};

export default TableShared;

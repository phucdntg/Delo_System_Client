import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { useTranslate } from "@core/providers/translate";
import { Button, Empty, Input, Pagination, Select, Table } from "antd";
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "../../styles/table-shared.css";

const GAP = 12;

const TableShared = ({
  dataSource,
  columns,
  pagination,
  search = { useSearch: false, hint: null, handleSearch: null },
  isLoading,
  isFetching,
  topLeftComponent,
  topRightComponent,
  scrollY,
  onReload,
  ...props
}) => {
  const { translate } = useTranslate();
  const translateCommon = translate("common") || {};
  const shouldShowSearch = search.useSearch;
  const containerRef = useRef(null);
  const toolbarRef = useRef(null);
  const paginationRef = useRef(null);
  const [autoScrollY, setAutoScrollY] = useState(undefined);

  const measure = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerH = containerRect.height;
    const toolbarH = toolbarRef.current?.getBoundingClientRect().height ?? 0;
    const paginationH =
      paginationRef.current?.getBoundingClientRect().height ?? 0;
    const headerEl = containerRef.current.querySelector(".ant-table-header");
    const headerH = headerEl?.getBoundingClientRect().height ?? 0;
    const h = containerH - toolbarH - headerH - GAP - paginationH;
    setAutoScrollY(h > 100 ? h : undefined);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (paginationRef.current) ro.observe(paginationRef.current);
    requestAnimationFrame(measure);
    return () => ro.disconnect();
  }, [measure]);

  // Ensure measurement runs after pagination mounts and after DOM paint
  useLayoutEffect(() => {
    // run multiple times to cover timing edge-cases where ref becomes available slightly later
    requestAnimationFrame(measure);
    const t = setTimeout(measure, 50);
    const t2 = setTimeout(measure, 150);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [measure, pagination?.total, pagination?.pageSize, dataSource?.length]);

  useEffect(() => {
    measure();
  }, [dataSource, measure]);

  useEffect(() => {
    requestAnimationFrame(measure);
  }, [pagination, measure]);

  const stablePagination = useMemo(
    () => pagination,
    [
      pagination?.current,
      pagination?.pageSize,
      pagination?.total,
      pagination?.onChange,
    ],
  );

  const [internalPageSize, setInternalPageSize] = useState(
    pagination?.pageSize || 10,
  );

  useEffect(() => {
    setInternalPageSize(pagination?.pageSize || 10);
  }, [pagination?.pageSize]);

  const handlePageSizeChange = useCallback(
    (value) => {
      setInternalPageSize(value);
      stablePagination.onChange?.(1, value);
    },
    [stablePagination],
  );

  const paginationWithoutSizeChanger = useMemo(
    () => ({
      ...stablePagination,
      pageSize: internalPageSize,
      showSizeChanger: false,
      showTotal: false,
    }),
    [stablePagination, internalPageSize],
  );

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
      render: (value, record, rowIndex) => (
        <div
          className="h-5 rounded bg-gray-100"
          style={{
            width: index % 3 === 0 ? "60%" : index % 3 === 1 ? "80%" : "100%",
          }}
        />
      ),
    }));
  }, [columns]);

  const effectiveScrollY = scrollY !== undefined ? scrollY : autoScrollY;

  return (
    <div className="table-shared" ref={containerRef}>
      <div className="table-shared__toolbar" ref={toolbarRef}>
        <div className="table-shared__actions">
          {shouldShowSearch && (
            <Input
              className="table-shared__search"
              prefix={<SearchOutlined />}
              onPressEnter={(e) => search.handleSearch?.(e.target.value)}
              placeholder={search.hint}
              allowClear={true}
            />
          )}
          {topRightComponent}
        </div>
        <div className="table-shared__left-action">
          {topLeftComponent}
          {onReload && (
            <Button
              className="table-shared__reload-btn"
              icon={<ReloadOutlined />}
              onClick={onReload}
              loading={isFetching}
            />
          )}
        </div>
      </div>

      <div className="table-shared__body">
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
          pagination={false}
          scroll={{ x: "max-content", y: effectiveScrollY }}
          sticky={{ offsetHeader: 0 }}
        />
      </div>

      {pagination && (
        <div
          className="table-shared__pagination border-t border-gray-200"
          ref={paginationRef}
        >
          <div className="table-shared__pagination-left">
            <span className="table-shared__pagination-total">
              {translateCommon?.status?.total || "Tổng số"}:{" "}
              <strong>{stablePagination.total || 0}</strong>
            </span>
          </div>
          <div className="table-shared__pagination-right">
            <Select
              value={internalPageSize}
              onChange={handlePageSizeChange}
              className="table-shared__page-size-select"
              options={[10, 20, 50, 100].map((size) => ({
                value: size,
                label: `${size} ${translateCommon?.pagination?.pageSize || "/ trang"}`,
              }))}
            />
            <Pagination {...paginationWithoutSizeChanger} />
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(TableShared);

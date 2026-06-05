import { Select, Spin } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_EXTRA_OPTIONS = [];

function useEmptyQuery() {
  return { data: undefined, isFetching: false, isLoading: false, error: undefined };
}

const SelectShared = ({
  useQueryHook,
  queryParams,
  searchField,
  useItemQueryHook,
  defaultId,
  defaultValueItem,
  pageSize = 10,
  placeholder = "-- Chọn --",
  searchable = false,
  debounceMs = 500,
  resetKey,
  onChange,
  getLabel,
  getValue,
  value,
  extraOptions = DEFAULT_EXTRA_OPTIONS,
  disabled = false,
  allowClear,
  ...restProps
}) => {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [allItems, setAllItems] = useState([]);
  const [preloadedItem, setPreloadedItem] = useState(null);
  const [labelReady, setLabelReady] = useState(!defaultId || !!defaultValueItem);

  const onChangeRef = useRef(onChange);
  const getValueRef = useRef(getValue);
  const extraOptionsRef = useRef(extraOptions);
  const defaultValueItemRef = useRef(defaultValueItem ?? null);
  const debounceRef = useRef(null);

  onChangeRef.current = onChange;
  getValueRef.current = getValue;
  extraOptionsRef.current = extraOptions;
  defaultValueItemRef.current = defaultValueItem ?? null;

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPage(1);
    setQuery("");
    setAllItems([]);
    setPreloadedItem(null);
    setLabelReady(!defaultId || !!defaultValueItem);
    onChangeRef.current?.(null);
  }, [resetKey]);

  const apiParams = useMemo(
    () => ({
      ...(queryParams || {}),
      offset: (page - 1) * pageSize,
      limit: pageSize,
      ...(query && searchField ? { keyword: query, search: searchField } : {}),
    }),
    [queryParams, page, pageSize, query, searchField],
  );

  const { data, isFetching } = useQueryHook(apiParams, { skip: disabled || !useQueryHook });

  useEffect(() => {
    if (!data) return;
    const items = data?.data || [];
    setAllItems((prev) => (page === 1 ? items : [...prev, ...items]));
  }, [data, page]);

  const ItemHook = useItemQueryHook || useEmptyQuery;
  const skipItem = !defaultId || !!defaultValueItem || !useItemQueryHook;
  const { data: itemData } = ItemHook(defaultId, { skip: skipItem });

  useEffect(() => {
    if (itemData) {
      setPreloadedItem(itemData);
      setLabelReady(true);
    }
  }, [itemData]);

  // Reset preload cache khi defaultId thay đổi
  useEffect(() => {
    setPreloadedItem(null);
  }, [defaultId]);

  const options = useMemo(() => {
    const seen = new Set();
    const gv = getValueRef.current;
    const result = [];

    // Extra options (pinned)
    const eo = extraOptionsRef.current || [];
    eo.forEach((item) => {
      const v = gv(item);
      if (!seen.has(v)) {
        seen.add(v);
        result.push(item);
      }
    });

    // Default value (prefer explicit object > preloaded from API)
    const defaultItem = defaultValueItemRef.current || preloadedItem;
    if (defaultItem) {
      const v = gv(defaultItem);
      if (!seen.has(v)) {
        seen.add(v);
        result.push(defaultItem);
      }
    }

    // API items
    allItems.forEach((item) => {
      const v = gv(item);
      if (!seen.has(v)) {
        seen.add(v);
        result.push(item);
      }
    });

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allItems, preloadedItem]);

  const onPopupScroll = useCallback(
    (e) => {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      if (scrollTop + clientHeight >= scrollHeight - 20 && !isFetching && !disabled) {
        setPage((prev) => prev + 1);
      }
    },
    [isFetching, disabled],
  );

  const handleSearch = useCallback(
    (val) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setQuery(val);
        setPage(1);
      }, debounceMs);
    },
    [debounceMs],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const { style, ...selectProps } = restProps;

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        ...(style?.width === "100%" && { width: "100%" }),
      }}
    >
      <Select
        placeholder={labelReady ? placeholder : "Đang tải..."}
        showSearch={searchable}
        filterOption={false}
        value={labelReady ? value : undefined}
        suffixIcon={!labelReady ? null : undefined}
        onSearch={searchable ? handleSearch : undefined}
        onPopupScroll={onPopupScroll}
        onChange={(val, option) => onChangeRef.current?.(option?.rawData)}
        notFoundContent={isFetching ? "" : "Không có dữ liệu"}
        loading={isFetching}
        disabled={disabled}
        allowClear={allowClear}
        options={options.map((item) => ({
          label: getLabel(item),
          value: getValue(item),
          rawData: item,
        }))}
        popupRender={(menu) => (
          <>
            {menu}
            {isFetching && (
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <Spin size="small" />
              </div>
            )}
          </>
        )}
        {...selectProps}
        {...(style?.width !== "100%" && {
          style: { width: style?.width || 200 },
        })}
      />

      {!labelReady && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <Spin size="small" />
        </div>
      )}
    </div>
  );
};

export default SelectShared;

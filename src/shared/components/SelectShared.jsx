import { Select, Spin } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";

const SelectShared = ({
  fetchFn,
  fetchItemById,
  defaultId,
  pageSize = 10,
  placeholder = "-- Chọn --",
  searchable = false,
  debounceMs = 300,
  resetKey,
  onChange,
  getLabel,
  getValue,
  value,
  ...restProps
}) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [labelReady, setLabelReady] = useState(!defaultId);
  const [defaultValueItem, setDefaultValueItem] = useState(null);

  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const optionsRef = useRef([]);
  const loadingRef = useRef(false);
  const initializedRef = useRef(false);
  const debounceRef = useRef(null); // ← ref giữ timeout id

  useEffect(() => {
    if (!defaultId || !fetchItemById) {
      setLabelReady(true);
      return;
    }
    fetchItemById(defaultId)
      .then((item) => {
        if (item) {
          setDefaultValueItem(item);
          optionsRef.current = [item];
          setOptions([item]);
        }
      })
      .catch(() => {})
      .finally(() => setLabelReady(true));
  }, []);

  const load = useCallback(
    async (currentPage, currentQuery, currentOptions) => {
      if (loadingRef.current || !hasMoreRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      try {
        const res = await fetchFn(currentPage, pageSize, currentQuery);
        const existingIds = new Set(currentOptions.map((o) => getValue(o)));
        const newItems = res.data.filter((o) => !existingIds.has(getValue(o)));
        const merged = [...currentOptions, ...newItems];
        optionsRef.current = merged;
        setOptions(merged);
        hasMoreRef.current = currentPage < res.meta.totalPages;
        pageRef.current = currentPage + 1;
        initializedRef.current = true;
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [fetchFn, pageSize, getValue],
  );

  const reset = useCallback(() => {
    const seed = defaultValueItem ? [defaultValueItem] : [];
    optionsRef.current = seed;
    pageRef.current = 1;
    hasMoreRef.current = true;
    loadingRef.current = false;
    initializedRef.current = false;
    setOptions(seed);
    setQuery("");
  }, [resetKey, defaultValueItem]);

  useEffect(() => {
    reset();
  }, [resetKey]);

  useEffect(() => {
    const seed = defaultValueItem ? [defaultValueItem] : [];
    optionsRef.current = seed;
    pageRef.current = 1;
    hasMoreRef.current = true;
    initializedRef.current = false;
    load(1, query, seed);
  }, [query]);

  // Debounce handler cho onSearch
  const handleSearch = useCallback(
    (val) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setQuery(val);
      }, debounceMs);
    },
    [debounceMs],
  );

  // Cleanup timeout khi unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const onPopupScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 20) {
      load(pageRef.current, query, optionsRef.current);
    }
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <Select
        placeholder={labelReady ? placeholder : "Đang tải..."}
        showSearch={searchable}
        filterOption={false}
        value={labelReady ? value : undefined}
        suffixIcon={!labelReady ? null : undefined}
        onSearch={searchable ? handleSearch : undefined} // ← dùng handleSearch
        onPopupScroll={onPopupScroll}
        onOpenChange={(open) => {
          if (open && !initializedRef.current) {
            load(1, query, optionsRef.current);
          }
        }}
        onChange={(val, option) => onChange?.(option?.rawData)}
        notFoundContent={loading ? <Spin size="small" /> : "Không có dữ liệu"}
        options={options.map((item) => ({
          label: getLabel(item),
          value: getValue(item),
          rawData: item,
        }))}
        popupRender={(menu) => (
          <>
            {menu}
            {loading && (
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <Spin size="small" />
              </div>
            )}
          </>
        )}
        {...restProps}
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

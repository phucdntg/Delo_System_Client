import { Select, Spin } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_EXTRA_OPTIONS = [];

const SelectShared = ({
  fetchFn,
  fetchItemById,
  defaultId,
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
  ...restProps
}) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [labelReady, setLabelReady] = useState(!defaultId);

  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const optionsRef = useRef([]);
  const loadingRef = useRef(false);
  const initializedRef = useRef(false);
  const debounceRef = useRef(null);

  // Dùng ref để tránh inline functions từ cha gây unstable deps
  const getValueRef = useRef(getValue);
  const fetchFnRef = useRef(fetchFn);
  const fetchItemByIdRef = useRef(fetchItemById);
  const extraOptionsRef = useRef(extraOptions);
  const pageSizeRef = useRef(pageSize);
  const defaultValueItemRef = useRef(null);
  const onChangeRef = useRef(onChange);

  /* eslint-disable react-hooks/refs */
  getValueRef.current = getValue;
  fetchFnRef.current = fetchFn;
  fetchItemByIdRef.current = fetchItemById;
  extraOptionsRef.current = extraOptions;
  pageSizeRef.current = pageSize;
  onChangeRef.current = onChange;
  /* eslint-enable react-hooks/refs */

  // ─── Fetch defaultId (chạy lại khi defaultId thay đổi) ─────────────────────
  useEffect(() => {
    if (!defaultId || !fetchItemByIdRef.current) {
      setLabelReady(true);
      return;
    }
    fetchItemByIdRef.current(defaultId)
      .then((item) => {
        if (item) {
          defaultValueItemRef.current = item;
          // Merge item vào options nếu chưa tồn tại
          const gv = getValueRef.current;
          const exists = optionsRef.current.some((o) => gv(o) === gv(item));
          if (!exists) {
            const merged = [item, ...optionsRef.current];
            optionsRef.current = merged;
            setOptions(merged);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLabelReady(true));
  }, [defaultId]);

  // ─── Load (stable, dùng refs hoàn toàn) ──────────────────────────────────
  const load = useCallback(
    async (currentPage, currentQuery, currentOptions) => {
      if (loadingRef.current || !hasMoreRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      try {
        const gv = getValueRef.current;
        const eo = extraOptionsRef.current;
        const res = await fetchFnRef.current(
          currentPage,
          pageSizeRef.current,
          currentQuery,
        );

        const existingIds = new Set(currentOptions.map((o) => gv(o)));
        const newItems = res.data.filter((o) => !existingIds.has(gv(o)));
        const merged = [...currentOptions, ...newItems];

        const extraIds = new Set(eo.map((o) => gv(o)));
        const final = [...eo, ...merged.filter((o) => !extraIds.has(gv(o)))];

        optionsRef.current = final;
        setOptions(final);
        hasMoreRef.current = currentPage < res.meta.totalPages;
        pageRef.current = currentPage + 1;
        initializedRef.current = true;
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [],
  ); // stable - không deps nào

  // ─── Build seed (extraOptions + defaultValueItem, deduped) ────────────────
  const buildSeed = useCallback((currentQuery) => {
    const gv = getValueRef.current;
    const eo = extraOptionsRef.current;
    const dv = defaultValueItemRef.current;
    const base = !currentQuery && dv ? [dv] : [];
    const seen = new Set();
    return [...eo, ...base].filter((o) => {
      const v = gv(o);
      if (seen.has(v)) return false;
      seen.add(v);
      return true;
    });
  }, []); // stable

  // ─── Reset (được gọi khi resetKey thay đổi) ───────────────────────────────
  const reset = useCallback(() => {
    const seed = buildSeed("");
    optionsRef.current = seed;
    pageRef.current = 1;
    hasMoreRef.current = true;
    loadingRef.current = false;
    initializedRef.current = false;
    setOptions(seed);
    setQuery("");
    // setQuery("") sẽ trigger useEffect([query]) → tự load lại
  }, [buildSeed]); // stable vì buildSeed stable

  // ─── Chỉ chạy khi resetKey thay đổi, KHÔNG chạy lúc mount ────────────────
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    reset();
    onChangeRef.current?.(null);
  }, [resetKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Chạy khi query thay đổi (kể cả lúc mount với query = "") ────────────
  useEffect(() => {
    const seed = buildSeed(query);
    optionsRef.current = seed;
    pageRef.current = 1;
    hasMoreRef.current = true;
    initializedRef.current = false;
    load(1, query, seed);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // ─── Debounce search ──────────────────────────────────────────────────────
  const handleSearch = useCallback(
    (val) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => setQuery(val), debounceMs);
    },
    [debounceMs],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // ─── Infinite scroll ──────────────────────────────────────────────────────
  const onPopupScroll = useCallback(
    (e) => {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      if (scrollTop + clientHeight >= scrollHeight - 20) {
        load(pageRef.current, query, optionsRef.current);
      }
    },
    [query, load],
  );

  // ─── Chỉ load khi mở dropdown lần đầu (sau reset) ────────────────────────
  const handleOpenChange = useCallback(
    (open) => {
      if (open && !initializedRef.current) {
        load(1, query, optionsRef.current);
      }
    },
    [query, load],
  );

  const { style, ...selectProps } = restProps;

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        ...(style?.width === "100%" && {
          width: "100%",
        }),
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
        onOpenChange={handleOpenChange}
        onChange={(val, option) => onChange?.(option?.rawData)}
        notFoundContent={loading ? "" : "Không có dữ liệu"}
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

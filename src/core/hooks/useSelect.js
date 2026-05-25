import { useEffect, useRef, useState } from "react";

export default function useSelect({ data, setCurrentPage, resetKey }) {
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const prevResetKeyRef = useRef(resetKey);

  useEffect(() => {
    if (prevResetKeyRef.current !== resetKey) {
      prevResetKeyRef.current = resetKey;
      setOptions([]);
      setSelectedOption(null);
      setCurrentPage(1);
    }
  }, [resetKey]);

  useEffect(() => {
    if (!data) return;
    setOptions((prev) => {
      const newItems = data.data || [];
      const existingIds = new Set(prev.map((o) => o.value));
      const merged = [
        ...prev,
        ...newItems
          .filter((item) => !existingIds.has(item.id))
          .map((item) => ({
            label: item?.name || item?.fullName || item?.description,
            value: item?.id,
          })),
      ];
      return merged;
    });
  }, [data]);

  const updateOptions = (newData, mapFn) => {
    if (!newData?.length) return;
    setOptions((prev) => {
      const existingIds = new Set(prev.map((o) => o.value));
      const uniqueNewItems = newData.filter((item) => !existingIds.has(item?.id)).map(mapFn);
      return [...prev, ...uniqueNewItems];
    });
  };

  const onLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  return {
    options,
    setOptions,
    selectedOption,
    setSelectedOption,
    onLoadMore,
    updateOptions,
  };
}

import { useCallback, useEffect, useRef, useState } from "react";

const paginationDefault = {
  current: 1,
  pageSize: 10,
};

const useTable = ({ resetKey } = {}) => {
  const [pagination, setPagination] = useState(paginationDefault);
  const [filters, setFilters] = useState({});
  const [sorters, setSorters] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const prevResetKeyRef = useRef(resetKey);

  useEffect(() => {
    if (prevResetKeyRef.current !== resetKey) {
      prevResetKeyRef.current = resetKey;
      setPagination(paginationDefault);
      setFilters({});
      setSorters({});
      setSearchTerm("");
    }
  }, [resetKey]);

  const handleTableChange = useCallback((
    pagination = paginationDefault,
    filters = {},
    sorters = {},
  ) => {
    setPagination(pagination);
    setFilters(filters);
    setSorters(sorters);
  }, []);

  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    setPagination(paginationDefault);
  }, []);

  const resetTable = useCallback(() => {
    setPagination(paginationDefault);
    setFilters({});
    setSorters({});
  }, []);

  return {
    pagination,
    filters,
    sorters,
    searchTerm,
    setSearchTerm,
    setPagination,
    setFilters,
    setSorters,
    handleTableChange,
    resetTable,
    handleSearch,
  };
};

export default useTable;

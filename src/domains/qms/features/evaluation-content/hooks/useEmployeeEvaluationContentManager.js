import { useCallback, useMemo, useState } from "react";
import {
  useCreateEmployeeEvaluationContentMutation,
  useDeleteEmployeeEvaluationContentMutation,
  useFetchEmployeeEvaluationContentsQuery,
  useUpdateEmployeeEvaluationContentMutation,
} from "../services/employeeEvaluationContentService";

export const useEmployeeEvaluationContentManager = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchContent, setSearchContent] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);

  // Build filters
  const filters = useMemo(() => {
    const f = {};
    if (selectedBranchId) f["area.branchId"] = selectedBranchId;
    if (selectedAreaId) f.areaId = selectedAreaId;
    if (searchContent) f.content = searchContent;
    return f;
  }, [selectedBranchId, selectedAreaId, searchContent]);

  // Fetch data
  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useFetchEmployeeEvaluationContentsQuery({
    page,
    limit: pageSize,
    filters,
  });

  const dataSource = useMemo(() => response?.data ?? [], [response?.data]);
  const meta = useMemo(() => response?.meta ?? {}, [response?.meta]);

  // Mutations
  const [createContent, { isLoading: isCreating }] =
    useCreateEmployeeEvaluationContentMutation();
  const [updateContent, { isLoading: isUpdating }] =
    useUpdateEmployeeEvaluationContentMutation();
  const [deleteContent, { isLoading: isDeleting }] =
    useDeleteEmployeeEvaluationContentMutation();

  // Handlers
  const handlePageChange = useCallback((newPage, newPageSize) => {
    setPage(newPage);
    setPageSize(newPageSize);
  }, []);

  const handleSearch = useCallback((value) => {
    setSearchContent(value);
    setPage(1);
  }, []);

  const handleAreaChange = useCallback((areaId) => {
    setSelectedAreaId(areaId);
    setPage(1);
  }, []);

  const handleBranchChange = useCallback((branchId) => {
    setSelectedBranchId(branchId);
    // reset area filter when branch changes
    setSelectedAreaId(null);
    setPage(1);
  }, []);

  const handleCreate = useCallback(
    async (values) => {
      return await createContent(values).unwrap();
    },
    [createContent],
  );

  const handleUpdate = useCallback(
    async (id, values) => {
      return await updateContent({ id, ...values }).unwrap();
    },
    [updateContent],
  );

  const handleDelete = useCallback(
    async (id) => {
      return await deleteContent(id).unwrap();
    },
    [deleteContent],
  );

  const resetFilters = useCallback(() => {
    setSearchContent("");
    setSelectedAreaId(null);
    setPage(1);
  }, []);

  return {
    // Data
    dataSource,
    meta,
    isLoading,
    isFetching,

    // Filters
    searchContent,
    selectedAreaId,
    selectedBranchId,

    // Pagination
    page,
    pageSize,

    // Handlers
    handlePageChange,
    handleSearch,
    handleAreaChange,
    handleBranchChange,
    handleCreate,
    handleUpdate,
    handleDelete,
    resetFilters,
    refetch,

    // Mutation states
    isCreating,
    isUpdating,
    isDeleting,
  };
};

import { useCallback, useMemo, useState } from "react";
import {
  useCreateServiceEvaluationContentMutation,
  useDeleteServiceEvaluationContentMutation,
  useFetchServiceEvaluationContentsQuery,
  useUpdateServiceEvaluationContentMutation,
} from "../services/serviceEvaluationContentService";

export const useServiceEvaluationContentManager = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchContent, setSearchContent] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState(null);

  // Build filters
  const filters = useMemo(() => {
    const f = {};
    if (selectedBranchId) {
      f["service.branchId"] = selectedBranchId;
    }
    if (selectedServiceId) f.serviceId = selectedServiceId;
    if (searchContent) f.content = searchContent;
    return f;
  }, [selectedBranchId, selectedServiceId, searchContent]);

  // Fetch data
  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useFetchServiceEvaluationContentsQuery({
    page,
    limit: pageSize,
    filters,
  });

  const dataSource = useMemo(() => response?.data ?? [], [response?.data]);
  const meta = useMemo(() => response?.meta ?? {}, [response?.meta]);

  // Mutations
  const [createContent, { isLoading: isCreating }] =
    useCreateServiceEvaluationContentMutation();
  const [updateContent, { isLoading: isUpdating }] =
    useUpdateServiceEvaluationContentMutation();
  const [deleteContent, { isLoading: isDeleting }] =
    useDeleteServiceEvaluationContentMutation();

  // Handlers
  const handlePageChange = useCallback((newPage, newPageSize) => {
    setPage(newPage);
    setPageSize(newPageSize);
  }, []);

  const handleSearch = useCallback((value) => {
    setSearchContent(value);
    setPage(1);
  }, []);

  const handleBranchChange = useCallback((branchId) => {
    setSelectedBranchId(branchId);
    setSelectedServiceId(null); // Reset service when branch changes
    setPage(1);
  }, []);

  const handleServiceChange = useCallback((serviceId) => {
    setSelectedServiceId(serviceId);
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
    setSelectedBranchId(null);
    setSelectedServiceId(null);
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
    selectedBranchId,
    selectedServiceId,

    // Pagination
    page,
    pageSize,

    // Handlers
    handlePageChange,
    handleSearch,
    handleBranchChange,
    handleServiceChange,
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

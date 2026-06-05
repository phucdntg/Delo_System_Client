import { useMemo } from "react";
import { useFetchAreasQuery, useFetchAreaByIdQuery } from "../../area";

export function useAreaFetch({ selectedRole = null, form }) {
  const branchId = selectedRole?.branchId || form.getFieldValue("branchId");

  const queryParams = useMemo(() => {
    const params = {};
    if (branchId) params.filters = { branchId };
    return params;
  }, [branchId]);

  return {
    useQueryHook: useFetchAreasQuery,
    useItemQueryHook: useFetchAreaByIdQuery,
    queryParams,
  };
}

import { useLazyFetchAreaByIdQuery, useLazyFetchAreasQuery } from "../../area";

export function useAreaFetch({ selectedRole = null, form }) {
  const [fetchAreas] = useLazyFetchAreasQuery();
  const [fetchAreaById] = useLazyFetchAreaByIdQuery();

  const fetchAreasFn = async (page, pageSize, query) => {
    try {
      const branchId = selectedRole?.branchId || form.getFieldValue("branchId");
      return await fetchAreas({
        filters: branchId ? { branchId } : undefined,
        pagination: { current: page, pageSize },
        search: query ? "name" : null,
        keyword: query,
      }).unwrap();
    } catch (err) {
      console.error("fetchAreasFn failed", err);
      return { data: [], meta: { totalPages: 0 } };
    }
  };

  const fetchAreaByIdFn = async (id) => {
    try {
      return await fetchAreaById(id).unwrap();
    } catch (err) {
      console.error("fetchAreaById failed", err);
      return null;
    }
  };

  return { fetchAreasFn, fetchAreaByIdFn };
}

const getPaginationParams = (pagination) => {
  const current = Number(pagination?.current ?? 1);
  const pageSize = Number(pagination?.pageSize ?? 10);

  return {
    offset: Math.max(0, (current - 1) * pageSize),
    limit: Math.max(1, pageSize),
  };
};

const objectToDotQuery = (obj) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (typeof value != "object" || value === null) {
      acc[key] = value;
    } else {
      const nested = objectToDotQuery(value);
      Object.entries(nested).forEach(([nestedKey, nestedValue]) => {
        acc[`${key}.${nestedKey}`] = nestedValue;
      });
    }
    return acc;
  }, {});
};

export const buildParams = ({
  keyword,
  search,
  sort,
  order,
  filters,
  pagination,
} = {}) => {
  const params = {};

  if (pagination) {
    const { offset, limit } = getPaginationParams(pagination);
    params.offset = offset;
    params.limit = limit;
  }

  if (keyword != null && keyword !== "") params.keyword = keyword;
  if (search != null && search !== "") params.search = search;
  if (filters) {
    Object.assign(params, objectToDotQuery(filters));
  }
  if (sort) params.sort = sort;
  if (order) params.order = order;
  return params;
};

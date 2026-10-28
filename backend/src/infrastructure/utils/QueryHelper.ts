function castValue(value: any) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (typeof value === 'string' && /^\d+$/.test(value)) return parseInt(value);
  return value;
}

export function extractFilters(query: any): any {
  const filters: any = {};
  // Security-owned fields must never be accepted from query parameters.
  const excludedKeys = ['page', 'limit', 'search', 'include', 'tenantId', 'password'];

  for (const key in query) {
    if (excludedKeys.includes(key)) continue;

    const value = query[key];
    if (Array.isArray(value)) {
      filters[key] = { in: value.map((v) => castValue(v)) };
    } else {
      filters[key] = castValue(value);
    }
  }
  return filters;
}

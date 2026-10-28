export type FieldRule = {
  type: 'string' | 'number' | 'boolean' | 'date' | 'array';
  required?: boolean;
  nullable?: boolean;
  allowEmpty?: boolean;
  min?: number;
  max?: number;
  integer?: boolean;
  values?: readonly string[];
};

type ValidationOptions = {
  partial?: boolean;
  allowUnknown?: readonly string[];
};

export function validateBody(
  input: unknown,
  rules: Record<string, FieldRule>,
  options: ValidationOptions = {}
) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Request body must be an object');
  }

  const source = input as Record<string, unknown>;
  const allowed = new Set([...Object.keys(rules), ...(options.allowUnknown ?? [])]);
  const unknown = Object.keys(source).filter((key) => !allowed.has(key));
  if (unknown.length > 0) throw new Error(`Unsupported field(s): ${unknown.join(', ')}`);

  const result: Record<string, unknown> = {};
  for (const [field, rule] of Object.entries(rules)) {
    const value = source[field];
    if (value === undefined) {
      if (rule.required && !options.partial) throw new Error(`${field} is required`);
      continue;
    }
    if (value === null) {
      if (!rule.nullable) throw new Error(`${field} cannot be null`);
      result[field] = null;
      continue;
    }

    if (rule.type === 'string') {
      if (typeof value !== 'string') throw new Error(`${field} must be a string`);
      if (!rule.allowEmpty && value.trim() === '') throw new Error(`${field} cannot be empty`);
      if (rule.min !== undefined && value.length < rule.min) {
        throw new Error(`${field} must contain at least ${rule.min} characters`);
      }
      if (rule.max !== undefined && value.length > rule.max) {
        throw new Error(`${field} must contain at most ${rule.max} characters`);
      }
      if (rule.values && !rule.values.includes(value)) {
        throw new Error(`${field} must be one of: ${rule.values.join(', ')}`);
      }
      result[field] = value;
      continue;
    }

    if (rule.type === 'number') {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error(`${field} must be a finite number`);
      }
      if (rule.integer && !Number.isInteger(value)) throw new Error(`${field} must be an integer`);
      if (rule.min !== undefined && value < rule.min) throw new Error(`${field} must be at least ${rule.min}`);
      if (rule.max !== undefined && value > rule.max) throw new Error(`${field} must be at most ${rule.max}`);
      result[field] = value;
      continue;
    }

    if (rule.type === 'boolean') {
      if (typeof value !== 'boolean') throw new Error(`${field} must be a boolean`);
      result[field] = value;
      continue;
    }

    if (rule.type === 'array') {
      if (!Array.isArray(value)) throw new Error(`${field} must be an array`);
      result[field] = value;
      continue;
    }

    const parsedDate = value instanceof Date ? value : new Date(value as string);
    if ((typeof value !== 'string' && !(value instanceof Date)) || Number.isNaN(parsedDate.getTime())) {
      throw new Error(`${field} must be a valid date`);
    }
    result[field] = parsedDate;
  }

  if (options.partial && Object.keys(result).length === 0) {
    throw new Error('At least one supported field is required');
  }

  return result;
}

export function parsePagination(query: Record<string, unknown>, defaultLimit = 10) {
  const parsePositiveInteger = (value: unknown, field: string, fallback: number) => {
    if (value === undefined) return fallback;
    if (typeof value !== 'string' || !/^\d+$/.test(value)) {
      throw new Error(`${field} must be a positive integer`);
    }
    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed) || parsed < 1) {
      throw new Error(`${field} must be a positive integer`);
    }
    return parsed;
  };

  const page = parsePositiveInteger(query.page, 'page', 1);
  const limit = parsePositiveInteger(query.limit, 'limit', defaultLimit);
  if (limit > 100) throw new Error('limit must be at most 100');
  return { page, limit };
}

export function parseSearch(query: Record<string, unknown>) {
  const value = query.search;
  if (value === undefined) return undefined;
  if (typeof value !== 'string') throw new Error('search must be a string');
  const search = value.trim();
  if (search.length > 100) throw new Error('search must contain at most 100 characters');
  return search || undefined;
}

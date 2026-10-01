export type PaginationInput = { page: number; limit: number };
export type PaginationMeta = { page: number; limit: number; total: number; totalPages: number };

export function parsePagination(searchParams: URLSearchParams): PaginationInput {
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20) || 20));
  return { page, limit };
}

export function buildPaginationMeta(input: PaginationInput, total: number): PaginationMeta {
  return { ...input, total, totalPages: Math.ceil(total / input.limit) };
}

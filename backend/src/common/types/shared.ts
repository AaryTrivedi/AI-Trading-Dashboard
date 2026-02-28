/** MongoDB ObjectId as string (API representation) */
export type ObjectIdString = string;

/** Pagination params */
export interface PageParams {
  page: number;
  limit: number;
}

/** Paginated response wrapper */
export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Standard API response envelope */
export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

/** Express request with optional user (after auth middleware) */
export interface RequestWithUser {
  userId?: string;
  requestId?: string;
}

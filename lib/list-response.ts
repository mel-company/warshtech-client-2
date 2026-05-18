/** Backend list shape: `{ data, total }` or a plain array. */
export type ListResponse<T> = { data?: T[]; total?: number } | T[] | null | undefined;

export function extractListData<T>(response: ListResponse<T>): T[] {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  return [];
}

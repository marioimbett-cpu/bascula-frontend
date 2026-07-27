import { api } from "./api";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  filters?: Record<string, string | number | boolean | undefined>;
}

/**
 * Fábrica de servicios REST genéricos. Provee GET/POST/PUT/PATCH/DELETE
 * consistentes para cualquier módulo (tickets, compras, ventas, terceros, etc.),
 * evitando duplicar llamadas Axios en cada módulo.
 */
export function createResourceService<T, TCreate = Partial<T>, TUpdate = Partial<T>>(basePath: string) {
  return {
    list: async (params?: ListParams): Promise<PaginatedResponse<T>> => {
      const { data } = await api.get<PaginatedResponse<T>>(basePath, { params });
      return data;
    },
    getById: async (id: string): Promise<T> => {
      const { data } = await api.get<T>(`${basePath}/${id}`);
      return data;
    },
    create: async (payload: TCreate): Promise<T> => {
      const { data } = await api.post<T>(basePath, payload);
      return data;
    },
    update: async (id: string, payload: TUpdate): Promise<T> => {
      const { data } = await api.put<T>(`${basePath}/${id}`, payload);
      return data;
    },
    patch: async (id: string, payload: Partial<TUpdate>): Promise<T> => {
      const { data } = await api.patch<T>(`${basePath}/${id}`, payload);
      return data;
    },
    remove: async (id: string): Promise<void> => {
      await api.delete(`${basePath}/${id}`);
    },
    exportExcel: async (params?: ListParams): Promise<Blob> => {
      const { data } = await api.get(`${basePath}/export/excel`, { params, responseType: "blob" });
      return data;
    },
    exportPdf: async (params?: ListParams): Promise<Blob> => {
      const { data } = await api.get(`${basePath}/export/pdf`, { params, responseType: "blob" });
      return data;
    },
  };
}

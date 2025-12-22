import api from "@/lib/api";

export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryInput {
  name: string;
  description?: string;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  links: PaginationLinks;
}

export interface CategoryParams {
  page?: number;
  per_page?: number;
  search?: string;
}

export const getCategories = async (params?: CategoryParams) => {
  const response = await api.get<PaginatedResponse<Category>>("/categories", {
    params,
  });
  return response.data;
};

export const createCategory = async (data: CategoryInput) => {
  const response = await api.post<Category>("/categories", data);
  return response.data;
};

export const updateCategory = async (id: string, data: CategoryInput) => {
  const response = await api.put<Category>(`/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id: string) => {
  await api.delete(`/categories/${id}`);
};

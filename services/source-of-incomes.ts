import api from "@/lib/api";

export interface SourceOfIncome {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface SourceOfIncomeInput {
  name: string;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta?: PaginationMeta; // meta might be absent if we just return pure array from some endpoints, but consistent usually
}

export interface SourceOfIncomeParams {
  page?: number;
  per_page?: number;
  search?: string;
}

export const getSourceOfIncomes = async (params?: SourceOfIncomeParams) => {
  const response = await api.get<{ data: SourceOfIncome[], meta?: PaginationMeta }>("/source-of-incomes", {
    params,
  });
  return response.data;
};

export const createSourceOfIncome = async (data: SourceOfIncomeInput) => {
  const response = await api.post<SourceOfIncome>("/source-of-incomes", data);
  return response.data;
};

export const updateSourceOfIncome = async (id: string, data: SourceOfIncomeInput) => {
  const response = await api.put<SourceOfIncome>(`/source-of-incomes/${id}`, data);
  return response.data;
};

export const deleteSourceOfIncome = async (id: string) => {
  await api.delete(`/source-of-incomes/${id}`);
};

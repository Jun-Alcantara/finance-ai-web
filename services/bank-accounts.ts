import api from "@/lib/api";
import { PaginatedResponse } from "./categories";

export interface BankAccount {
  id: string;
  name: string;
  balance: string;
  account_number?: string;
  created_at: string;
  updated_at: string;
}

export interface BankAccountInput {
  name: string;
  balance: number;
  account_number?: string;
}

export interface BankAccountParams {
  page?: number;
  per_page?: number;
  search?: string;
}

export const getBankAccounts = async (params?: BankAccountParams) => {
  const response = await api.get<PaginatedResponse<BankAccount>>("/bank-accounts", {
    params,
  });
  return response.data;
};

export const createBankAccount = async (data: BankAccountInput) => {
  const response = await api.post<BankAccount>("/bank-accounts", data);
  return response.data;
};

export const updateBankAccount = async (id: string, data: BankAccountInput) => {
  const response = await api.put<BankAccount>(`/bank-accounts/${id}`, data);
  return response.data;
};

export const deleteBankAccount = async (id: string) => {
  await api.delete(`/bank-accounts/${id}`);
};

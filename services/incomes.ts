import api from "@/lib/api"

export interface Income {
  id: string
  source_of_income_id: string
  source_of_income: {
    id: string
    name: string
  }
  bank_account_id: string
  bank_account: {
    id: string
    name: string
    account_number: string | null
  }
  amount: string
  remarks: string | null
  date: string
  received: boolean
  is_recurring: boolean
  recurring_type: 'specific_date' | 'start_of_month' | 'end_of_month' | null
  recurring_day: number | null
  recurring_group_id: string | null
  recur_until: string | null
  can_edit: boolean
  can_delete: boolean
  created_at: string
  updated_at: string
}

export interface IncomeInput {
  source_of_income_id: string
  bank_account_id: string
  amount: number
  remarks?: string
  date: string
  received?: boolean
  is_recurring?: boolean
  recurring_type?: 'specific_date' | 'start_of_month' | 'end_of_month'
  recurring_day?: number
  recur_until?: string
}

export interface IncomeUpdateInput {
  source_of_income_id?: string
  bank_account_id?: string
  amount?: number
  remarks?: string
  date?: string
  received?: boolean
  is_recurring?: boolean
  recurring_type?: 'specific_date' | 'start_of_month' | 'end_of_month'
  recurring_day?: number
  recur_until?: string
  apply_to_future?: boolean
}

export interface PaginationMeta {
  current_page: number
  from: number
  last_page: number
  per_page: number
  to: number
  total: number
}

export interface PaginationLinks {
  first: string | null
  last: string | null
  prev: string | null
  next: string | null
}

export interface GetIncomesResponse {
  data: Income[]
  meta: PaginationMeta
  links: PaginationLinks
}

export interface GetIncomesParams {
  page?: number
  per_page?: number
  search?: string
  start_date?: string
  end_date?: string
  received?: boolean
  is_recurring?: boolean
}

export const getIncomes = async (params?: GetIncomesParams): Promise<GetIncomesResponse> => {
  const response = await api.get("/incomes", { params })
  return response.data
}

export const getIncome = async (id: string): Promise<Income> => {
  const response = await api.get(`/incomes/${id}`)
  return response.data
}

export const createIncome = async (data: IncomeInput): Promise<Income> => {
  const response = await api.post("/incomes", data)
  return response.data
}

export const updateIncome = async (id: string, data: IncomeUpdateInput): Promise<Income> => {
  const response = await api.put(`/incomes/${id}`, data)
  return response.data
}

export const deleteIncome = async (id: string, applyToFuture: boolean = false): Promise<void> => {
  await api.delete(`/incomes/${id}`, {
    params: { apply_to_future: applyToFuture }
  })
}

export const markIncomeAsReceived = async (id: string): Promise<Income> => {
  const response = await api.post(`/incomes/${id}/mark-as-received`)
  return response.data
}

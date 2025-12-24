import api from "@/lib/api"

export interface Expense {
  id: string
  user_id: number
  bank_account_id: string
  amount: string
  remarks: string | null
  due_date: string
  payment_date: string | null
  is_paid: boolean
  is_recurring: boolean
  recurring_type: string | null
  recurring_day: number | null
  recurring_group_id: string | null
  recur_until: string | null
  created_at: string
  updated_at: string
  bank_account: {
    id: string
    name: string
    balance: string
  }
  can_edit?: boolean
  can_delete?: boolean
}

export interface ExpenseInput {
  bank_account_id: string
  amount: number
  remarks?: string
  due_date: string
  payment_date?: string
  is_paid: boolean
  is_recurring: boolean
  recurring_type?: string
  recurring_day?: number
  recur_until?: string
  apply_to_future?: boolean
}

export interface ExpenseUpdateInput {
  bank_account_id?: string
  amount?: number
  remarks?: string
  due_date?: string
  payment_date?: string
  is_paid?: boolean
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

export interface GetExpensesResponse {
  data: Expense[]
  meta: PaginationMeta
  links: PaginationLinks
}

export interface GetExpensesParams {
  page?: number
  per_page?: number
  search?: string
  start_date?: string
  end_date?: string
  is_paid?: boolean
  is_recurring?: boolean
}

export const getExpenses = async (params?: GetExpensesParams): Promise<GetExpensesResponse> => {
  const response = await api.get("/expenses", { params })
  return response.data
}

export const getExpense = async (id: string): Promise<Expense> => {
  const response = await api.get(`/expenses/${id}`)
  return response.data
}

export const createExpense = async (data: ExpenseInput): Promise<Expense> => {
  const response = await api.post("/expenses", data)
  return response.data
}

export const updateExpense = async (id: string, data: ExpenseUpdateInput): Promise<Expense> => {
  const response = await api.put(`/expenses/${id}`, data)
  return response.data
}

export const deleteExpense = async (id: string, applyToFuture: boolean = false): Promise<void> => {
  await api.delete(`/expenses/${id}`, {
    params: { apply_to_future: applyToFuture }
  })
}

export const markExpenseAsPaid = async (id: string, payment_date?: string): Promise<Expense> => {
  const response = await api.post(`/expenses/${id}/mark-as-paid`, { payment_date })
  return response.data
}

import api from "@/lib/api"

export interface LedgerItem {
  id: string
  date: string
  description: string
  amount: string | number
  type: 'credit' | 'debit'
  status: 'completed' | 'pending'
  category: string
  account_name: string
  original_data: any
}

export interface LedgerSummary {
  total_credit: number
  total_debit: number
  net_flow: number
}

export interface LedgerMeta {
  start_date: string
  end_date: string
  count: number
}

export interface LedgerResponse {
  data: LedgerItem[]
  summary: LedgerSummary
  meta: LedgerMeta
}

export interface GetLedgerParams {
  start_date?: string
  end_date?: string
}

export const getLedger = async (params?: GetLedgerParams): Promise<LedgerResponse> => {
  const response = await api.get("/ledger", { params })
  return response.data
}

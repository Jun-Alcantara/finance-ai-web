"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  CalendarIcon, 
  Loader2, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet,
  BookOpen,
  Plus
} from "lucide-react"
import { format, subDays, addDays } from "date-fns"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { getLedger, LedgerItem, LedgerSummary } from "@/services/ledger"
import { CreateIncomeDialog } from "@/components/incomes/create-income-dialog"
import { CreateExpenseDialog } from "@/components/expenses/create-expense-dialog"

export default function LedgerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [ledgerData, setLedgerData] = useState<LedgerItem[]>([])
  const [summary, setSummary] = useState<LedgerSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<LedgerItem | null>(null)
  const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false)

  // Dialog states
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false)
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)

  // Initialize date range from URL or default to 30 days
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(() => {
    const start = searchParams.get("from")
    const end = searchParams.get("to")
    return {
      from: start ? new Date(start) : subDays(new Date(), 30),
      to: end ? new Date(end) : addDays(new Date(), 30),
    }
  })

  // Update URL when date range changes
  const updateDateRange = (range: { from: Date; to: Date }) => {
     setDateRange(range)
     const params = new URLSearchParams()
     if (range.from) params.set("from", format(range.from, "yyyy-MM-dd"))
     if (range.to) params.set("to", format(range.to, "yyyy-MM-dd"))
     router.replace(`?${params.toString()}`)
  }

  const getRunningBalance = (targetItem: LedgerItem) => {
    // Sort data chronologically (Oldest first)
    const sortedData = [...ledgerData].sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      if (dateA !== dateB) return dateA - dateB
      return a.id.localeCompare(b.id)
    })

    let credit = 0
    let debit = 0

    for (const item of sortedData) {
      if (item.type === 'credit') credit += Number(item.amount)
      if (item.type === 'debit') debit += Number(item.amount)
      
      if (item.id === targetItem.id) break
    }

    return {
        credit,
        debit,
        balance: credit - debit
    }
  }

  const handleRowClick = (item: LedgerItem) => {
    setSelectedItem(item)
    setIsBalanceDialogOpen(true)
  }

  // Fetch Ledger Data
  const fetchLedger = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getLedger({
        start_date: format(dateRange.from, "yyyy-MM-dd"),
        end_date: format(dateRange.to, "yyyy-MM-dd"),
      })
      setLedgerData(response.data)
      setSummary(response.summary)
    } catch (error) {
      console.error("Failed to fetch ledger", error)
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchLedger()
  }, [fetchLedger])

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
         <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-muted-foreground" />
            <h2 className="text-3xl font-bold tracking-tight">General Ledger</h2>
         </div>
        
         <div className="flex flex-col sm:flex-row items-center gap-2">
           {/* Date Range Picker */}
           <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[260px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range: any) => {
                      if (range?.from) {
                          updateDateRange({ from: range.from, to: range.to || range.from })
                      }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-2">
                <Button 
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700" 
                    onClick={() => setIsAddIncomeOpen(true)}
                >
                    <Plus className="h-4 w-4" />
                    Income
                </Button>
                <Button 
                    className="gap-2 bg-red-600 hover:bg-red-700" 
                    onClick={() => setIsAddExpenseOpen(true)}
                >
                    <Plus className="h-4 w-4" />
                    Expense
                </Button>
            </div>
         </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/10 border-emerald-100 dark:border-emerald-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Total Projected Income</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            {loading ? (
                <div className="h-6 w-24 bg-emerald-200/20 animate-pulse rounded" />
            ) : (
                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                    + {summary?.total_credit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
            )}
            <p className="text-xs text-emerald-600/60 dark:text-emerald-400/60 mt-1">
              Includes pending
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/10 border-red-100 dark:border-red-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">Total Projected Expenses</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
             {loading ? (
                <div className="h-6 w-24 bg-red-200/20 animate-pulse rounded" />
            ) : (
                <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                    - {summary?.total_debit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
            )}
            <p className="text-xs text-red-600/60 dark:text-red-400/60 mt-1">
              Includes pending
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-900/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Flow</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? (
                <div className="h-6 w-24 bg-slate-200/20 animate-pulse rounded" />
            ) : (
                <div className={cn(
                    "text-2xl font-bold",
                    (summary?.net_flow || 0) >= 0 ? "text-emerald-600" : "text-red-600"
                )}>
                    {(summary?.net_flow || 0) >= 0 ? '+' : ''} {(summary?.net_flow || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              For selected period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ledger Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Date</TableHead>
              <TableHead className="w-[150px]">Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[200px]">Account</TableHead>
              <TableHead className="w-[100px] text-center">Status</TableHead>
              <TableHead className="text-right w-[150px]">Debit</TableHead>
              <TableHead className="text-right w-[150px]">Credit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  </TableCell>
                </TableRow>
            ) : ledgerData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No transactions found for this period.
                  </TableCell>
                </TableRow>
            ) : (
                ledgerData.map((item) => (
                    <TableRow 
                        key={`${item.type}-${item.id}`} 
                        className="hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleRowClick(item)}
                    >
                        <TableCell className="font-medium">
                            {format(new Date(item.date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline" className="font-normal">
                                {item.category}
                            </Badge>
                        </TableCell>
                         <TableCell className="text-muted-foreground">
                            {item.description}
                        </TableCell>
                        <TableCell>{item.account_name}</TableCell>
                        <TableCell className="text-center">
                            {item.status === 'completed' ? (
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                                    Done
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30">
                                    Pending
                                </Badge>
                            )}
                        </TableCell>
                        <TableCell className="text-right font-medium text-red-600">
                            {item.type === 'debit' ? (
                                <span>- {parseFloat(item.amount as string).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            ) : (
                                <span className="text-muted-foreground/30">-</span>
                            )}
                        </TableCell>
                        <TableCell className="text-right font-medium text-emerald-600">
                             {item.type === 'credit' ? (
                                <span>+ {parseFloat(item.amount as string).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            ) : (
                                <span className="text-muted-foreground/30">-</span>
                            )}
                        </TableCell>
                    </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateIncomeDialog 
        open={isAddIncomeOpen} 
        onOpenChange={setIsAddIncomeOpen} 
        onSuccess={fetchLedger} 
      />

      <Dialog open={isBalanceDialogOpen} onOpenChange={setIsBalanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Running Balance</DialogTitle>
            <DialogDescription>
                Calculated balance up to {selectedItem ? format(new Date(selectedItem.date), "MMM d, yyyy") : ''}
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (() => {
            const stats = getRunningBalance(selectedItem)
            return (
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">Description</span>
                    <span className="text-sm text-muted-foreground">{selectedItem.description}</span>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">Total Credit</span>
                        <div className="text-lg font-bold text-emerald-600">
                            + {stats.credit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">Total Debit</span>
                        <div className="text-lg font-bold text-red-600">
                            - {stats.debit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                 </div>

                 <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold">Net Balance</span>
                        <span className={cn(
                            "text-xl font-bold",
                            stats.balance >= 0 ? "text-emerald-600" : "text-red-600"
                        )}>
                            {stats.balance >= 0 ? '+' : ''} {stats.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-right">
                        * Based on currently visible ledger data
                    </p>
                 </div>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>

      <CreateExpenseDialog 
        open={isAddExpenseOpen} 
        onOpenChange={setIsAddExpenseOpen} 
        onSuccess={fetchLedger} 
      />
    </div>  )
}

"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  Plus, 
  Search, 
  Target, // Using Target icon for Expenses/Bill-like feeling or CreditCard
  Pencil,
  Trash2, 
  Loader2,
  CheckCircle2,
  RefreshCw,
  Wallet // For expenses, maybe Banknote or CreditCard
} from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { CreateExpenseDialog } from "@/components/expenses/create-expense-dialog"
import { EditExpenseDialog } from "@/components/expenses/edit-expense-dialog"
import { DeleteExpenseDialog } from "@/components/expenses/delete-expense-dialog"
import { 
  getExpenses, 
  markExpenseAsPaid, 
  Expense, 
  PaginationMeta 
} from "@/services/expenses"

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  
  // Filters
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [statusFilter, setStatusFilter] = useState("all") // all, paid, pending
  const [recurringFilter, setRecurringFilter] = useState("all") // all, recurring, one-time

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editExpense, setEditExpense] = useState<Expense | null>(null)
  const [deleteExpense, setDeleteExpense] = useState<Expense | null>(null)
  const [itemToMarkPaid, setItemToMarkPaid] = useState<Expense | null>(null)
  const [markLoading, setMarkLoading] = useState(false)

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getExpenses({ 
        page, 
        per_page: perPage, 
        search: search || undefined,
        is_paid: statusFilter === 'all' ? undefined : statusFilter === 'paid',
        is_recurring: recurringFilter === 'all' ? undefined : recurringFilter === 'recurring'
      })
      setExpenses(response.data)
      setMeta(response.meta)
    } catch (error) {
      console.error("Failed to fetch expenses", error)
    } finally {
      setLoading(false)
    }
  }, [page, perPage, search, statusFilter, recurringFilter])

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchExpenses()
    }, 300)
    return () => clearTimeout(timeout)
  }, [fetchExpenses])

  const handleMarkAsPaid = async () => {
    if (!itemToMarkPaid) return
    setMarkLoading(true)
    try {
      await markExpenseAsPaid(itemToMarkPaid.id)
      fetchExpenses()
      setItemToMarkPaid(null)
    } catch (error) {
      console.error("Failed to mark as paid", error)
    } finally {
      setMarkLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        {/* Header Section */}
        <div className="p-6 flex flex-col xl:flex-row items-center justify-between gap-4 border-b">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-muted-foreground" />
             <h2 className="text-xl font-semibold">Expenses</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full xl:w-auto">
            <div className="relative flex-1 sm:min-w-[250px] w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search Remarks..."
                className="pl-8 bg-background"
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                }}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
                    <SelectTrigger className="w-full sm:w-[130px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={recurringFilter} onValueChange={(val) => { setRecurringFilter(val); setPage(1); }}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="recurring">Recurring</SelectItem>
                        <SelectItem value="one-time">One-time</SelectItem>
                    </SelectContent>
                </Select>

                <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 whitespace-nowrap" onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Add Expense
                </Button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 w-[120px]">Date</TableHead>
                <TableHead className="w-[150px]">Source Bank</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center w-[100px]">Status</TableHead>
                <TableHead className="text-right pr-6 w-[100px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No expense records found.
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => (
                    <TableRow key={expense.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="pl-6 font-medium">
                        <div className="flex flex-col">
                            <span>{format(new Date(expense.date), "MMM d, yyyy")}</span>
                            {expense.is_recurring && (
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                                    <RefreshCw className="h-3 w-3" />
                                    <span>Recurring</span>
                                </div>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                            <span>{expense.bank_account.name}</span>
                         </div>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate text-muted-foreground">
                        {expense.remarks || '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium text-destructive">
                        - {parseFloat(expense.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-center">
                        {expense.is_paid ? (
                            <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-200">
                                Paid
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="text-muted-foreground">
                                Pending
                            </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1">
                          
                          {!expense.is_paid && (
                             <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                onClick={() => setItemToMarkPaid(expense)}
                                title="Mark as Paid"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <span className="sr-only">Open menu</span>
                                    <Pencil className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => setEditExpense(expense)} disabled={!expense.can_edit}>
                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={() => setDeleteExpense(expense)} 
                                    className="text-destructive focus:text-destructive"
                                    disabled={!expense.can_delete}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer / Pagination Section */}
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t">
          <div className="flex items-center gap-2 order-2 sm:order-1">
            <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8" 
                disabled={!meta || meta.current_page === 1 || loading}
                onClick={() => setPage(page - 1)}
            >
              <span className="sr-only">Previous page</span>
              &lt;
            </Button>
            <div className="flex gap-1 items-center">
                <span className="text-sm font-medium">
                    Page {meta?.current_page || 1} of {meta?.last_page || 1}
                </span>
            </div>
            <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8" 
                disabled={!meta || meta.current_page === meta.last_page || loading}
                onClick={() => setPage(page + 1)}
            >
              <span className="sr-only">Next page</span>
              &gt;
            </Button>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground order-1 sm:order-2">
            <span className="hidden sm:inline-block">
                {meta ? `Showing ${meta.from || 0} to ${meta.to || 0} of ${meta.total} entries` : '...'}
            </span>
            <div className="flex items-center gap-2">
              <Select 
                value={String(perPage)} 
                onValueChange={(val) => {
                    setPerPage(Number(val))
                    setPage(1)
                }}
            >
                <SelectTrigger className="h-8 w-[70px] sm:w-[100px]">
                  <SelectValue placeholder="Show" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8 rows</SelectItem>
                  <SelectItem value="15">15 rows</SelectItem>
                  <SelectItem value="50">50 rows</SelectItem>
                  <SelectItem value="100">100 rows</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <CreateExpenseDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
        onSuccess={fetchExpenses} 
      />

      <EditExpenseDialog 
        open={!!editExpense} 
        onOpenChange={(open) => !open && setEditExpense(null)} 
        onSuccess={fetchExpenses}
        expense={editExpense}
      />

      <DeleteExpenseDialog 
        open={!!deleteExpense}
        onOpenChange={(open) => !open && setDeleteExpense(null)}
        onSuccess={fetchExpenses}
        expense={deleteExpense}
      />

      <AlertDialog open={!!itemToMarkPaid} onOpenChange={(open) => !open && setItemToMarkPaid(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Paid?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deduct the amount from the source bank account. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={markLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkAsPaid} disabled={markLoading}>
              {markLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

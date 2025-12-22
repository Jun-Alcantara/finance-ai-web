"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  Plus, 
  Search, 
  Wallet,
  Pencil,
  Trash2, 
  Loader2,
  CheckCircle2,
  RefreshCw,
  Calendar as CalendarIcon,
  X
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
  DropdownMenuSeparator,
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

import { CreateIncomeDialog } from "@/components/incomes/create-income-dialog"
import { EditIncomeDialog } from "@/components/incomes/edit-income-dialog"
import { DeleteIncomeDialog } from "@/components/incomes/delete-income-dialog"
import { 
  getIncomes, 
  markIncomeAsReceived, 
  Income, 
  PaginationMeta 
} from "@/services/incomes"

export default function IncomesPage() {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  
  // Filters
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [statusFilter, setStatusFilter] = useState("all") // all, received, pending
  const [recurringFilter, setRecurringFilter] = useState("all") // all, recurring, one-time

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editIncome, setEditIncome] = useState<Income | null>(null)
  const [deleteIncome, setDeleteIncome] = useState<Income | null>(null)
  const [itemToMarkReceived, setItemToMarkReceived] = useState<Income | null>(null)
  const [markLoading, setMarkLoading] = useState(false)

  const fetchIncomes = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getIncomes({ 
        page, 
        per_page: perPage, 
        search: search || undefined,
        received: statusFilter === 'all' ? undefined : statusFilter === 'received',
        is_recurring: recurringFilter === 'all' ? undefined : recurringFilter === 'recurring'
      })
      setIncomes(response.data)
      setMeta(response.meta)
    } catch (error) {
      console.error("Failed to fetch incomes", error)
    } finally {
      setLoading(false)
    }
  }, [page, perPage, search, statusFilter, recurringFilter])

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchIncomes()
    }, 300)
    return () => clearTimeout(timeout)
  }, [fetchIncomes])

  const handleMarkAsReceived = async () => {
    if (!itemToMarkReceived) return
    setMarkLoading(true)
    try {
      await markIncomeAsReceived(itemToMarkReceived.id)
      fetchIncomes()
      setItemToMarkReceived(null)
    } catch (error) {
      console.error("Failed to mark as received", error)
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
            <Wallet className="h-6 w-6 text-muted-foreground" />
             <h2 className="text-xl font-semibold">Income Records</h2>
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
                        <SelectItem value="received">Received</SelectItem>
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
                  Add Income
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
                <TableHead className="w-[150px]">Source</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead>Account</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center w-[100px]">Status</TableHead>
                <TableHead className="text-right pr-6 w-[100px]">Action</TableHead>
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
              ) : incomes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No income records found.
                  </TableCell>
                </TableRow>
              ) : (
                incomes.map((income) => (
                    <TableRow key={income.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="pl-6 font-medium">
                        <div className="flex flex-col">
                            <span>{format(new Date(income.date), "MMM d, yyyy")}</span>
                            {income.is_recurring && (
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                                    <RefreshCw className="h-3 w-3" />
                                    <span>Recurring</span>
                                </div>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                         <Badge variant="outline" className="font-normal">
                            {income.source_of_income.name}
                         </Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate text-muted-foreground">
                        {income.remarks || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {income.bank_account.name}
                      </TableCell>
                      <TableCell className="text-right font-medium text-emerald-600">
                        + {parseFloat(income.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-center">
                        {income.received ? (
                            <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-200">
                                Received
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="text-muted-foreground">
                                Pending
                            </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1">
                          
                          {!income.received && (
                             <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                onClick={() => setItemToMarkReceived(income)}
                                title="Mark as Received"
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
                                <DropdownMenuItem onClick={() => setEditIncome(income)} disabled={!income.can_edit || income.received}>
                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={() => setDeleteIncome(income)} 
                                    className="text-destructive focus:text-destructive"
                                    disabled={!income.can_delete || income.received}
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

      <CreateIncomeDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
        onSuccess={fetchIncomes} 
      />

      <EditIncomeDialog 
        open={!!editIncome} 
        onOpenChange={(open) => !open && setEditIncome(null)} 
        onSuccess={fetchIncomes}
        income={editIncome}
      />

      <DeleteIncomeDialog 
        open={!!deleteIncome}
        onOpenChange={(open) => !open && setDeleteIncome(null)}
        onSuccess={fetchIncomes}
        income={deleteIncome}
      />

      <AlertDialog open={!!itemToMarkReceived} onOpenChange={(open) => !open && setItemToMarkReceived(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Received?</AlertDialogTitle>
            <AlertDialogDescription>
              This will add the amount to the destination bank account. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={markLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkAsReceived} disabled={markLoading}>
              {markLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

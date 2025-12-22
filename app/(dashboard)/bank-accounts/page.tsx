"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  Plus, 
  Search, 
  Landmark,
  Pencil,
  Trash2, 
  Loader2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

import { 
  getBankAccounts, 
  createBankAccount, 
  updateBankAccount, 
  deleteBankAccount, 
  BankAccount, 
} from "@/services/bank-accounts"
import { PaginationMeta } from "@/services/categories" // Importing shared type

export default function BankAccountsPage() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [meta, setMeta] = useState<PaginationMeta | null>(null)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [currentAccount, setCurrentAccount] = useState<BankAccount | null>(null)
  
  const [formData, setFormData] = useState({ name: "", balance: "", account_number: "" })
  const [formLoading, setFormLoading] = useState(false)

  const fetchBankAccounts = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getBankAccounts({ 
        page, 
        per_page: perPage, 
        search: search || undefined 
      })
      setBankAccounts(response.data)
      setMeta(response.meta)
    } catch (error) {
      console.error("Failed to fetch bank accounts", error)
    } finally {
      setLoading(false)
    }
  }, [page, perPage, search])

  // Debounce search or just use effect
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchBankAccounts()
    }, 300)
    return () => clearTimeout(timeout)
  }, [fetchBankAccounts])

  const resetForm = () => {
    setFormData({ name: "", balance: "", account_number: "" })
    setCurrentAccount(null)
    setFormLoading(false)
  }

  const handleCreate = async () => {
    setFormLoading(true)
    try {
      await createBankAccount({
        name: formData.name,
        balance: parseFloat(formData.balance) || 0,
        account_number: formData.account_number || undefined,
      })
      setIsCreateOpen(false)
      resetForm()
      fetchBankAccounts()
    } catch (error) {
      console.error("Failed to create bank account", error)
    } finally {
      setFormLoading(false)
    }
  }

  const openEdit = (account: BankAccount) => {
    setCurrentAccount(account)
    setFormData({ 
      name: account.name, 
      balance: account.balance,
      account_number: account.account_number || "" 
    })
    setIsEditOpen(true)
  }

  const handleUpdate = async () => {
    if (!currentAccount) return
    setFormLoading(true)
    try {
      await updateBankAccount(currentAccount.id, {
        name: formData.name,
        balance: parseFloat(formData.balance) || 0,
        account_number: formData.account_number || undefined,
      })
      setIsEditOpen(false)
      resetForm()
      fetchBankAccounts()
    } catch (error) {
      console.error("Failed to update bank account", error)
    } finally {
      setFormLoading(false)
    }
  }

  const openDelete = (account: BankAccount) => {
    setCurrentAccount(account)
    setIsDeleteOpen(true)
  }

  const handleDelete = async () => {
    if (!currentAccount) return
    setFormLoading(true)
    try {
      await deleteBankAccount(currentAccount.id)
      setIsDeleteOpen(false)
      resetForm()
      fetchBankAccounts()
    } catch (error) {
      console.error("Failed to delete bank account", error)
    } finally {
      setFormLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount)
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        {/* Header Section */}
        <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b">
          <div className="flex items-center gap-2">
            <Landmark className="h-6 w-6 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Bank Accounts</h2>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:min-w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search Accounts..."
                className="pl-8 bg-background"
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1) // Reset to first page on search
                }}
              />
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={resetForm}>
                  <Plus className="h-4 w-4" />
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Bank Account</DialogTitle>
                  <DialogDescription>
                    Add a new bank account to track your finances.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="col-span-3"
                      placeholder="e.g. Main Savings"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="account_number" className="text-right">
                      Account No.
                    </Label>
                    <Input
                      id="account_number"
                      value={formData.account_number}
                      onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                      className="col-span-3"
                      placeholder="(Optional)"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="balance" className="text-right">
                      Balance
                    </Label>
                    <Input
                      id="balance"
                      type="number"
                      step="0.01"
                      value={formData.balance}
                      onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                      className="col-span-3"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={formLoading}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={formLoading}>
                    {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Table Section */}
        <div className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[40px] pl-6"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : bankAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No bank accounts found.
                  </TableCell>
                </TableRow>
              ) : (
                bankAccounts.map((account) => (
                    <TableRow key={account.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="pl-6"></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="font-medium cursor-pointer hover:underline">
                            {account.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {account.account_number || "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(parseFloat(account.balance))}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                           <Button variant="ghost" size="icon" onClick={() => openEdit(account)}>
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDelete(account)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer / Pagination Section */}
        <div className="p-4 flex items-center justify-between border-t">
          <div className="flex items-center gap-2">
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

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
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
                <SelectTrigger className="h-8 w-[100px]">
                  <SelectValue placeholder="Show" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">Show 8</SelectItem>
                  <SelectItem value="15">Show 15</SelectItem>
                  <SelectItem value="50">Show 50</SelectItem>
                  <SelectItem value="100">Show 100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Bank Account</DialogTitle>
            <DialogDescription>
              Make changes to the bank account here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-account_number" className="text-right">
                Account No.
              </Label>
              <Input
                id="edit-account_number"
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-balance" className="text-right">
                Balance
              </Label>
              <Input
                id="edit-balance"
                type="number"
                step="0.01"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={formLoading}>
                {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Bank Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-bold">{currentAccount?.name}</span>? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={formLoading}>
                {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

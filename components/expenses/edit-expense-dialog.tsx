"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format, parseISO } from "date-fns"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

import { updateExpense, Expense, ExpenseUpdateInput } from "@/services/expenses"
import { getBankAccounts, BankAccount } from "@/services/bank-accounts"

interface EditExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  expense: Expense | null
}

export function EditExpenseDialog({ open, onOpenChange, onSuccess, expense }: EditExpenseDialogProps) {
  const [loading, setLoading] = useState(false)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  
  const [formData, setFormData] = useState<Partial<ExpenseUpdateInput>>({})
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [paymentDate, setPaymentDate] = useState<Date | undefined>()
  const [recurUntilDate, setRecurUntilDate] = useState<Date | undefined>()
  const [applyToFuture, setApplyToFuture] = useState(false)

  useEffect(() => {
    if (open) {
      fetchDependencies()
      if (expense) {
        initializeForm(expense)
      }
    }
  }, [open, expense])

  useEffect(() => {
    if (dueDate) {
      setFormData(prev => ({ ...prev, due_date: format(dueDate, "yyyy-MM-dd") }))
    }
  }, [dueDate])

  useEffect(() => {
    if (paymentDate) {
      setFormData(prev => ({ ...prev, payment_date: format(paymentDate, "yyyy-MM-dd") }))
    } else {
        setFormData(prev => ({ ...prev, payment_date: undefined }))
    }
  }, [paymentDate])

  useEffect(() => {
    if (recurUntilDate) {
      setFormData(prev => ({ ...prev, recur_until: format(recurUntilDate, "yyyy-MM-dd") }))
    } else {
      setFormData(prev => ({ ...prev, recur_until: undefined }))
    }
  }, [recurUntilDate])

  const initializeForm = (expense: Expense) => {
    setFormData({
      bank_account_id: expense.bank_account_id,
      amount: parseFloat(expense.amount),
      remarks: expense.remarks || "",
      due_date: expense.due_date,
      payment_date: expense.payment_date || undefined,
      is_paid: expense.is_paid,
      is_recurring: expense.is_recurring,
      recurring_type: (expense.recurring_type as any) || undefined,
      recurring_day: expense.recurring_day || undefined,
      recur_until: expense.recur_until || undefined,
    })
    setDueDate(parseISO(expense.due_date))
    setPaymentDate(expense.payment_date ? parseISO(expense.payment_date) : undefined)
    setRecurUntilDate(expense.recur_until ? parseISO(expense.recur_until) : undefined)
    setApplyToFuture(false)
  }

  useEffect(() => {
    // When is_paid toggles, initialize paymentDate if empty
    if (formData.is_paid && !paymentDate && expense && !expense.is_paid) {
        setPaymentDate(new Date())
    }
  }, [formData.is_paid])

  const fetchDependencies = async () => {
    try {
      const bankAccountsRes = await getBankAccounts({ per_page: 100 })
      setBankAccounts(bankAccountsRes.data)
    } catch (error) {
      console.error("Failed to fetch dependencies", error)
    }
  }

  const handleSubmit = async () => {
    if (!expense) return

    if (!formData.bank_account_id || !formData.amount || !formData.due_date) {
      console.error("Missing required fields: bank account, amount, or due date.")
      return // Basic validation
    }
    
    if (formData.is_paid && !formData.payment_date) {
        console.error("Payment date is required if expense is marked as paid.")
        return // Require payment date if paid
    }

    setLoading(true)
    try {
      await updateExpense(expense.id, formData)
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update expense", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
          <DialogDescription>
            Update expense details.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Source Bank</Label>
            <Select 
              value={formData.bank_account_id} 
              onValueChange={(val) => setFormData({ ...formData, bank_account_id: val })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {bankAccounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>Pick a due date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              placeholder="Optional remarks..."
              value={formData.remarks || ''}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
          </div>

          <div className="flex flex-col space-y-4 pt-2">
             <div className="flex items-center space-x-2">
                <Switch
                    id="is_paid"
                    checked={formData.is_paid}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_paid: checked })}
                    disabled={expense?.is_paid} // If already paid, maybe we can't unpay it here? Backend restrictions.
                />
                <Label htmlFor="is_paid">Mark as Paid</Label>
              </div>

              {formData.is_paid && (
                  <div className="space-y-2 pl-6 border-l-2 border-emerald-500">
                    <Label>Date of Payment</Label>
                    <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !paymentDate && "text-muted-foreground"
                        )}
                        disabled={expense?.is_paid} // Can't change payment date if already paid?
                        >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {paymentDate ? format(paymentDate, "PPP") : <span>Pick a payment date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                        mode="single"
                        selected={paymentDate}
                        onSelect={setPaymentDate}
                        initialFocus
                        />
                    </PopoverContent>
                    </Popover>
                  </div>
              )}
          </div>

           <div className="space-y-4 border rounded-md p-4 bg-muted/20">
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-recurring"
                checked={formData.is_recurring}
                onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
              />
              <Label htmlFor="edit-recurring">Recurring Expense</Label>
            </div>

            {formData.is_recurring && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select 
                    value={formData.recurring_type || 'start_of_month'}
                    onValueChange={(val: any) => setFormData({ ...formData, recurring_type: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="start_of_month">Start of Month</SelectItem>
                      <SelectItem value="end_of_month">End of Month</SelectItem>
                      <SelectItem value="specific_date">Specific Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.recurring_type === 'specific_date' && (
                   <div className="space-y-2">
                    <Label>Day of Month</Label>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      placeholder="Day (1-31)"
                      value={formData.recurring_day || ''}
                      onChange={(e) => setFormData({ ...formData, recurring_day: parseInt(e.target.value) })}
                    />
                  </div>
                )}
              </div>
            )}

            {formData.is_recurring && (
               <div className="pt-2">
                 <Label>Recur Until</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1",
                          !recurUntilDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {recurUntilDate ? format(recurUntilDate, "PPP") : <span>Pick an end date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={recurUntilDate}
                        onSelect={setRecurUntilDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
               </div>
            )}
             
             {expense?.is_recurring && expense.recurring_group_id && (
                 <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-dashed">
                    <Checkbox 
                        id="apply-future" 
                        checked={applyToFuture}
                        onCheckedChange={(checked) => setApplyToFuture(checked as boolean)}
                    />
                    <Label htmlFor="apply-future" className="text-sm font-normal text-muted-foreground">
                        Apply changes to all future recurring expenses?
                    </Label>
                 </div>
             )}
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Expense
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

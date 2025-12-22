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
  const [date, setDate] = useState<Date | undefined>()
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
    if (date) {
      setFormData(prev => ({ ...prev, date: format(date, "yyyy-MM-dd") }))
    }
  }, [date])

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
      date: expense.date,
      is_paid: expense.is_paid,
      is_recurring: expense.is_recurring,
      recurring_type: expense.recurring_type || undefined,
      recurring_day: expense.recurring_day || undefined,
      recur_until: expense.recur_until || undefined,
    })
    setDate(parseISO(expense.date))
    setRecurUntilDate(expense.recur_until ? parseISO(expense.recur_until) : undefined)
    setApplyToFuture(false)
  }

  const fetchDependencies = async () => {
    try {
      const bankAccountsRes = await getBankAccounts({ per_page: 100 })
      setBankAccounts(bankAccountsRes.data)
    } catch (error) {
      console.error("Failed to fetch dependencies", error)
    }
  }

  const handleSubmit = async () => {
    if (!expense || !formData.date) return

    setLoading(true)
    try {
      const payload: ExpenseUpdateInput = {
        ...formData,
        apply_to_future: applyToFuture
      }
      await updateExpense(expense.id, payload)
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
           {/* Date & Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              />
            </div>
          </div>

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
            <Label htmlFor="edit-remarks">Remarks</Label>
            <Textarea
              id="edit-remarks"
              placeholder="Optional remarks..."
              value={formData.remarks || ''}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
             <Switch
              id="edit-is-paid"
              checked={formData.is_paid}
              onCheckedChange={(checked) => setFormData({ ...formData, is_paid: checked })}
              disabled={expense?.is_paid} // If already paid, disabled (though API blocks edits anyway, but UI should hint)
            />
            <Label htmlFor="edit-is-paid">Mark as Paid</Label>
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

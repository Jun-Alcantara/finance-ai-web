"use client"

import { useState } from "react"
import { Loader2, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

import { deleteExpense, Expense } from "@/services/expenses"

interface DeleteExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  expense: Expense | null
}

export function DeleteExpenseDialog({ open, onOpenChange, onSuccess, expense }: DeleteExpenseDialogProps) {
  const [loading, setLoading] = useState(false)
  const [deleteFuture, setDeleteFuture] = useState(false)

  const handleSubmit = async () => {
    if (!expense) return

    setLoading(true)
    try {
      await deleteExpense(expense.id, deleteFuture)
      onSuccess()
      onOpenChange(false)
      setDeleteFuture(false)
    } catch (error) {
      console.error("Failed to delete expense", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
             <AlertTriangle className="h-5 w-5" />
             Delete Expense
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this expense? 
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {expense?.is_recurring && expense.recurring_group_id && (
             <div className="flex items-center space-x-2 py-4">
                <Checkbox 
                    id="delete-future" 
                    checked={deleteFuture}
                    onCheckedChange={(checked) => setDeleteFuture(checked as boolean)}
                />
                <Label htmlFor="delete-future" className="font-normal">
                    Also delete all future recurring expenses?
                </Label>
             </div>
         )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

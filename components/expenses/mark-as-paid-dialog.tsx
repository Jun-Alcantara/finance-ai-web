"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
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
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

import { markExpenseAsPaid, Expense } from "@/services/expenses"
import api from "@/lib/api"

interface MarkAsPaidDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  expense: Expense | null
}

export function MarkAsPaidDialog({ open, onOpenChange, onSuccess, expense }: MarkAsPaidDialogProps) {
  const [loading, setLoading] = useState(false)
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date())

  useEffect(() => {
    if (open) {
      setPaymentDate(new Date())
    }
  }, [open])

  const handleSubmit = async () => {
    if (!expense || !paymentDate) return

    setLoading(true)
    try {
      // We need to send payment_date. 
      // The service function markExpenseAsPaid usually takes id. 
      // I need to verify if service function accepts payment_date.
      // In backend I updated it to accept payment_date.
      // In frontend I need to update the service function signature.
      // For now I'll use api directly or update service signature after this.
      await api.post(`/expenses/${expense.id}/mark-as-paid`, {
        payment_date: format(paymentDate, "yyyy-MM-dd")
      })
      
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to mark expense as paid", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mark as Paid</DialogTitle>
          <DialogDescription>
            Confirm payment for this expense. This will deduct the amount from the source bank account.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Date of Payment</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !paymentDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {paymentDate ? format(paymentDate, "PPP") : <span>Pick a date</span>}
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

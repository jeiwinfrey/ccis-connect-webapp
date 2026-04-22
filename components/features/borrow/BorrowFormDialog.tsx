"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import { useBorrowMutations } from "@/hooks/useBorrowRequests";
import { useAuth } from "@/lib/auth/context";
import { type EquipmentItem, type Unit } from "./types";

interface BorrowFormDialogProps {
  item: EquipmentItem | null;
  unit: Unit | null;
  categoryName: string;
  categoryEmoji: string;
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  onRequestComplete?: () => void;
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateValueToTime(date: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).getTime();
}

function getTodayDate(): string {
  return formatLocalDate(new Date());
}

export function BorrowFormDialog({
  item,
  unit,
  categoryName,
  categoryEmoji,
  open,
  onClose,
  onBack,
  onRequestComplete,
}: BorrowFormDialogProps) {
  const { user } = useAuth();
  const mutations = useBorrowMutations();
  const [borrowDate, setBorrowDate] = useState(getTodayDate);
  const [returnDate, setReturnDate] = useState(getTodayDate);
  const [purpose, setPurpose] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!item || !unit) return null;

  // Get today's date in YYYY-MM-DD format for min date validation
  const today = getTodayDate();

  // Validate dates - allow same day borrowing and return
  const borrowDateTime = dateValueToTime(borrowDate);
  const returnDateTime = dateValueToTime(returnDate);
  const todayTime = dateValueToTime(today);
  const isValidDates =
    borrowDateTime != null &&
    returnDateTime != null &&
    todayTime != null &&
    borrowDateTime >= todayTime &&
    returnDateTime >= borrowDateTime;
  const dateError =
    borrowDate && returnDate && returnDateTime != null && borrowDateTime != null && returnDateTime < borrowDateTime
      ? "Return date must be the same day or after the borrow date."
      : borrowDate && borrowDateTime != null && todayTime != null && borrowDateTime < todayTime
        ? "Borrow date cannot be in the past."
        : null;

  function resetForm() {
    const resetDate = getTodayDate();
    setBorrowDate(resetDate);
    setReturnDate(resetDate);
    setPurpose("");
    setSubmitted(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleDone() {
    resetForm();
    onRequestComplete?.();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidDates || !purpose.trim() || !user) return;

    try {
      await mutations.createBorrowRequest({
        userId: user.id,
        unitId: unit!.id,
        startDate: borrowDate,
        endDate: returnDate,
        purpose: purpose.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit borrow request:", err);
      toast.error(err instanceof Error ? err.message : "Failed to submit borrow request");
    }
  }

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogTitle className="sr-only">Request Submitted</DialogTitle>
          <DialogDescription className="sr-only">Your borrow request has been submitted for review.</DialogDescription>
          <div className="flex flex-col items-center text-center gap-4 py-6">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-2xl" aria-hidden="true">&#10003;</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">Request Submitted!</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Your borrow request for <span className="font-semibold">{item.model}</span> (unit {unit.unitId}) has been submitted for review.
              </p>
            </div>
            <Button className="w-full" onClick={handleDone}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40">
          <p className="text-xs text-muted-foreground">
            {categoryEmoji} {categoryName} &middot; Fill in details to submit your request
          </p>
          <DialogTitle className="text-xl">{item.model}</DialogTitle>
          <DialogDescription className="sr-only">Fill in details to submit your borrow request.</DialogDescription>
          <p className="text-xs text-muted-foreground">
            Unit: <span className="font-medium text-foreground">{unit.unitId}</span>
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Show logged-in user info (read-only) */}
          {user && (
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <p className="font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">
                {user.studentId || user.username} &middot; {user.department}
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="borrow-date" className="text-sm font-semibold">
                Borrow Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="borrow-date"
                type="date"
                value={borrowDate}
                onChange={(e) => {
                  const nextBorrowDate = e.target.value;
                  setBorrowDate(nextBorrowDate);

                  if (returnDate && returnDate < nextBorrowDate) {
                    setReturnDate(nextBorrowDate);
                  }
                }}
                min={today}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="return-date" className="text-sm font-semibold">
                Return Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="return-date"
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                min={borrowDate || today}
                required
              />
            </div>
          </div>
          {dateError && (
            <p className="text-xs font-medium text-destructive">{dateError}</p>
          )}
          {!dateError && isValidDates && !purpose.trim() && (
            <p className="text-xs text-muted-foreground">Add a purpose to submit this borrow request.</p>
          )}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="borrow-purpose" className="text-sm font-semibold">
                Purpose / Project <span className="text-destructive">*</span>
              </Label>
              <span className={`text-xs ${purpose.length === 0 ? 'text-muted-foreground' : purpose.length < 10 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                {purpose.length === 0 ? 'Required' : `${purpose.length} characters`}
              </span>
            </div>
            <Textarea
              id="borrow-purpose"
              placeholder="Briefly describe what you'll use this equipment for..."
              rows={3}
              className="resize-none"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              maxLength={500}
              required
            />
            {purpose.length > 0 && purpose.length < 10 && (
              <p className="text-xs text-amber-600">Please provide more details (at least 10 characters recommended)</p>
            )}
          </div>
        </form>

        <DialogFooter className="px-6 py-4 border-t border-border/40 bg-muted/20 sm:justify-between">
          <Button variant="outline" onClick={onBack} type="button">
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={mutations.loading || !isValidDates || !purpose.trim()}
          >
            {mutations.loading ? (
              <>
                <IconLoader2 className="size-4 animate-spin mr-1" />
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

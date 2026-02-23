"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type EquipmentItem, type Unit } from "./types";

interface BorrowFormDialogProps {
  item: EquipmentItem | null;
  unit: Unit | null;
  categoryName: string;
  categoryEmoji: string;
  open: boolean;
  onClose: () => void;
  onBack: () => void;
}

export function BorrowFormDialog({
  item,
  unit,
  categoryName,
  categoryEmoji,
  open,
  onClose,
  onBack,
}: BorrowFormDialogProps) {
  if (!item || !unit) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40">
          <p className="text-xs text-muted-foreground">
            {categoryEmoji} {categoryName} · Fill in details to submit your request
          </p>
          <DialogTitle className="text-xl">{item.model}</DialogTitle>
          <p className="text-xs text-muted-foreground">
            Unit: <span className="font-medium text-foreground">{unit.unitId}</span>
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-1.5">
            <Label htmlFor="borrow-name" className="text-sm font-semibold">Your Name</Label>
            <Input id="borrow-name" placeholder="e.g. Juan dela Cruz" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="borrow-id" className="text-sm font-semibold">Student / Employee ID</Label>
            <Input id="borrow-id" placeholder="e.g. 2024-00123" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="borrow-date" className="text-sm font-semibold">Borrow Date</Label>
              <Input id="borrow-date" type="date" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="return-date" className="text-sm font-semibold">Return Date</Label>
              <Input id="return-date" type="date" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="borrow-purpose" className="text-sm font-semibold">Purpose / Project</Label>
            <textarea
              id="borrow-purpose"
              placeholder="Briefly describe what you'll use this equipment for..."
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              required
            />
          </div>
        </form>

        <DialogFooter className="px-6 py-4 border-t border-border/40 bg-muted/20 sm:justify-between">
          <Button variant="outline" onClick={onBack} type="button">
            ← Back
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

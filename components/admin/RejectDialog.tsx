"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface RejectDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  requestLabel: string;
}

export function RejectDialog({ open, onClose, onConfirm, requestLabel }: RejectDialogProps) {
  const [reason, setReason] = useState("");

  function handleConfirm() {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
    setReason("");
    onClose();
  }

  function handleClose() {
    setReason("");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40">
          <DialogTitle className="text-xl text-rose-600">Reject Request</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Rejecting: <span className="font-semibold text-foreground">{requestLabel}</span>
          </p>
        </DialogHeader>

        <div className="px-6 py-5 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="reject-reason" className="text-sm font-semibold">
              Reason for Rejection <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="reject-reason"
              placeholder="Explain why this request is being rejected..."
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            This reason will be visible to the requester.
          </p>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border/40 bg-muted/20 sm:justify-between">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button
            variant="destructive"
            disabled={!reason.trim()}
            onClick={handleConfirm}
          >
            Confirm Rejection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

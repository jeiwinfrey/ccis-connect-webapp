import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { IconLoader2 } from "@tabler/icons-react";
import type { BorrowRequestUI } from "./types";

interface PendingDialogProps {
  open: boolean;
  onClose: () => void;
  requests: BorrowRequestUI[];
  loading?: boolean;
}

export function PendingDialog({ open, onClose, requests, loading }: PendingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40">
          <DialogTitle className="text-xl flex items-center gap-2">Pending Requests</DialogTitle>
          <DialogDescription>Awaiting admin approval — usually within 2 hours</DialogDescription>
        </DialogHeader>
        <div className="px-6 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <IconLoader2 className="size-5 animate-spin mr-2" /> Loading...
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No pending requests.
            </div>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="flex items-start gap-4 rounded-xl bg-muted/40 border border-border/40 p-4">
                <span className="text-2xl mt-0.5">{req.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{req.model}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {req.category} &middot; {req.loanDuration} &middot; {req.dates}
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-bold tracking-wide text-amber-700 bg-amber-100 dark:bg-amber-500/20 dark:text-amber-400 px-2.5 py-1 rounded-full">
                    PENDING REVIEW
                  </span>
                </div>
                <div className="text-right text-xs text-muted-foreground flex-shrink-0">
                  <p>Submitted</p>
                  <p className="font-medium text-foreground">{req.submittedDate}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

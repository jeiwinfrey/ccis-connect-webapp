import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { rejectedRequests } from "./types";

interface RejectedDialogProps {
  open: boolean;
  onClose: () => void;
}

export function RejectedDialog({ open, onClose }: RejectedDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40">
          <DialogTitle className="text-xl flex items-center gap-2">✕ Rejected Requests</DialogTitle>
          <p className="text-sm text-muted-foreground">Review the reasons and resubmit if needed</p>
        </DialogHeader>
        <div className="px-6 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {rejectedRequests.map((req) => (
            <div key={req.id} className="rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/50 dark:bg-rose-500/5 p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">{req.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{req.model}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {req.category} · Requested {req.dates}
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-bold tracking-wide text-rose-700 bg-rose-100 dark:bg-rose-500/20 dark:text-rose-400 px-2.5 py-1 rounded-full">
                    REJECTED
                  </span>
                  {req.reason && (
                    <p className="mt-2 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-1.5">
                      <span className="mt-0.5">⚠</span>
                      {req.reason}
                    </p>
                  )}
                </div>
                <div className="text-right text-xs text-muted-foreground flex-shrink-0">
                  <p>Rejected</p>
                  <p className="font-medium text-foreground">{req.rejectedDate}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

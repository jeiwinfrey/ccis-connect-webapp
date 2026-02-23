"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import { equipmentCategories, pendingRequests, rejectedRequests } from "@/components/forms/borrow/types";
import { CategoryAccordionItem } from "@/components/forms/borrow/CategoryAccordionItem";
import { PendingDialog } from "@/components/forms/borrow/PendingDialog";
import { RejectedDialog } from "@/components/forms/borrow/RejectedDialog";

export default function BorrowEquipment() {
  const [pendingOpen, setPendingOpen] = useState(false);
  const [rejectedOpen, setRejectedOpen] = useState(false);

  return (
    <div className="px-3 py-4 md:px-6 md:py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Borrow Equipment</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Browse available equipment and submit a borrow request.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPendingOpen(true)}
                className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-full transition-colors"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                <span className="text-xs font-semibold">{pendingRequests.length} Pending</span>
              </button>
              <button
                onClick={() => setRejectedOpen(true)}
                className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 px-3 py-1.5 rounded-full transition-colors"
              >
                <span className="flex h-1.5 w-1.5 rounded-full bg-rose-500" />
                <span className="text-xs font-semibold">{rejectedRequests.length} Rejected</span>
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="space-y-0" defaultValue={["category-0"]}>
            {equipmentCategories.map((category, index) => (
              <CategoryAccordionItem
                key={index}
                category={category}
                value={`category-${index}`}
              />
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <PendingDialog open={pendingOpen} onClose={() => setPendingOpen(false)} />
      <RejectedDialog open={rejectedOpen} onClose={() => setRejectedOpen(false)} />
    </div>
  );
}

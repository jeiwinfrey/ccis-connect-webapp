"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import { IconLoader2 } from "@tabler/icons-react";
import { useEquipmentCategoriesWithModels } from "@/hooks/useEquipment";
import { useBorrowRequests } from "@/hooks/useBorrowRequests";
import {
  mapCategoriesToUI,
  mapBorrowRequestToUI,
} from "@/components/features/borrow/types";
import { CategoryAccordionItem } from "@/components/features/borrow/CategoryAccordionItem";
import { PendingDialog } from "@/components/features/borrow/PendingDialog";
import { RejectedDialog } from "@/components/features/borrow/RejectedDialog";

export default function BorrowEquipment() {
  const [pendingOpen, setPendingOpen] = useState(false);
  const [rejectedOpen, setRejectedOpen] = useState(false);

  // Fetch categories with models + units from Supabase
  const { categories: rawCategories, loading: catLoading } =
    useEquipmentCategoriesWithModels();

  // Fetch accepted borrow requests (for borrower info on on-loan units)
  const { requests: acceptedBorrows } = useBorrowRequests("accepted");

  // Fetch user's pending & rejected borrow requests
  // NOTE: No auth yet, so we fetch ALL pending/rejected requests
  const { requests: pendingRaw, loading: pendingLoading } =
    useBorrowRequests("pending");
  const { requests: rejectedRaw, loading: rejectedLoading } =
    useBorrowRequests("rejected");

  // Map Supabase data → UI types
  const categories = mapCategoriesToUI(rawCategories, acceptedBorrows);
  const pendingRequests = pendingRaw.map(mapBorrowRequestToUI);
  const rejectedRequests = rejectedRaw.map(mapBorrowRequestToUI);

  return (
    <div className="px-4 py-4 md:px-10 md:py-6">
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
                <span className="text-xs font-semibold">
                  {pendingLoading ? "..." : pendingRequests.length} Pending
                </span>
              </button>
              <button
                onClick={() => setRejectedOpen(true)}
                className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 px-3 py-1.5 rounded-full transition-colors"
              >
                <span className="flex h-1.5 w-1.5 rounded-full bg-rose-500" />
                <span className="text-xs font-semibold">
                  {rejectedLoading ? "..." : rejectedRequests.length} Rejected
                </span>
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {catLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <IconLoader2 className="size-5 animate-spin mr-2" /> Loading equipment...
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No equipment categories found.
            </div>
          ) : (
            <Accordion
              type="multiple"
              className="space-y-0"
              defaultValue={categories.length > 0 ? [`category-${categories[0].id}`] : []}
            >
              {categories.map((category) => (
                <CategoryAccordionItem
                  key={category.id}
                  category={category}
                  value={`category-${category.id}`}
                />
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      <PendingDialog
        open={pendingOpen}
        onClose={() => setPendingOpen(false)}
        requests={pendingRequests}
        loading={pendingLoading}
      />
      <RejectedDialog
        open={rejectedOpen}
        onClose={() => setRejectedOpen(false)}
        requests={rejectedRequests}
        loading={rejectedLoading}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { type EquipmentItem, type Unit, conditionColor } from "./types";

interface UnitPickerDialogProps {
  item: EquipmentItem | null;
  categoryName: string;
  categoryEmoji: string;
  open: boolean;
  onClose: () => void;
  onContinue: (unit: Unit) => void;
}

export function UnitPickerDialog({
  item,
  categoryName,
  categoryEmoji,
  open,
  onClose,
  onContinue,
}: UnitPickerDialogProps) {
  const [selected, setSelected] = useState<string | null>(null);

  if (!item) return null;

  const availableUnits = item.units.filter((u) => u.status === "available");
  const loanedUnits = item.units.filter((u) => u.status !== "available");
  const selectedUnit = item.units.find((u) => u.unitId === selected) ?? null;

  function handleContinue() {
    if (selectedUnit) onContinue(selectedUnit);
  }

  function handleClose() {
    setSelected(null);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40">
          <p className="text-xs text-muted-foreground">
            {categoryEmoji} {categoryName} &middot; Pick a unit below
          </p>
          <DialogTitle className="text-xl">{item.model}</DialogTitle>
          <DialogDescription className="sr-only">Select an available unit to borrow.</DialogDescription>
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
            <span className="text-emerald-600 font-medium">{availableUnits.length} available</span>
            <span>&middot;</span>
            <span className="text-orange-500 font-medium">{loanedUnits.length} on loan</span>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 space-y-5 max-h-[60vh] overflow-y-auto">
          {availableUnits.length > 0 && (
              <div className="space-y-2" role="radiogroup" aria-label="Available units">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                  Available ({availableUnits.length})
                </p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Condition</span>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide w-[78px] text-center">Status</span>
                </div>
              </div>
              {availableUnits.map((unit) => (
                <button
                  key={unit.unitId}
                  role="radio"
                  aria-checked={selected === unit.unitId}
                  onClick={() => setSelected(unit.unitId)}
                  className={`w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                    selected === unit.unitId
                      ? "border-primary bg-primary/5"
                      : "border-border/40 hover:border-border hover:bg-muted/30"
                  }`}
                >
                  <div className={`h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                    selected === unit.unitId ? "border-primary" : "border-muted-foreground/40"
                  }`}>
                    {selected === unit.unitId && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{unit.unitId}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{unit.notes}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-semibold ${conditionColor[unit.condition] ?? ""}`}>
                      {unit.condition.toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      AVAILABLE
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {loanedUnits.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide">
                On Loan / Maintenance ({loanedUnits.length})
              </p>
              {loanedUnits.map((unit) => (
                <div
                  key={unit.unitId}
                  className="w-full flex items-center gap-3 rounded-lg border border-border/40 px-4 py-3 opacity-60"
                >
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{unit.unitId}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {unit.borrower && unit.dueBack
                        ? `${unit.borrower} · Due back ${unit.dueBack}`
                        : unit.notes}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-semibold ${conditionColor[unit.condition] ?? ""}`}>
                      {unit.condition.toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold text-orange-500 bg-orange-50 dark:bg-orange-500/10 px-2 py-0.5 rounded-full">
                      {unit.status === "maintenance" ? "MAINTENANCE" : "ON LOAN"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border/40 flex items-center justify-between bg-muted/20">
          <p className="text-xs text-muted-foreground">
            {selected ? (
              <>Selected: <span className="font-semibold text-foreground">{selected}</span></>
            ) : (
              "No unit selected"
            )}
          </p>
          <Button onClick={handleContinue} disabled={!selected} className="gap-2">
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

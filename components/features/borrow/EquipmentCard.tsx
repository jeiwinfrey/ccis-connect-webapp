"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { type EquipmentItem, type Unit } from "./types";
import { UnitPickerDialog } from "./UnitPickerDialog";
import { BorrowFormDialog } from "./BorrowFormDialog";

interface EquipmentCardProps {
  item: EquipmentItem;
  color: string;
  emoji: string;
  categoryName: string;
  categoryEmoji: string;
  onRequestComplete?: () => void;
}

export function EquipmentCard({
  item,
  color,
  emoji,
  categoryName,
  categoryEmoji,
  onRequestComplete,
}: EquipmentCardProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  const availableCount = item.units.filter((u) => u.status === "available").length;
  const totalCount = item.units.length;

  function handleContinue(unit: Unit) {
    setSelectedUnit(unit);
    setPickerOpen(false);
    setFormOpen(true);
  }

  function handleBack() {
    setFormOpen(false);
    setPickerOpen(true);
  }

  function handleFormClose() {
    setFormOpen(false);
    setSelectedUnit(null);
  }

  return (
    <>
      <div className="w-[220px] shrink-0 group border border-border/50 bg-card rounded-2xl overflow-hidden flex flex-col">
        <div className={`relative h-[130px] flex items-center justify-center ${color}`}>
          <img
            src={item.image}
            alt={item.model}
            className="w-full h-full object-cover"
          />

          <div className="absolute top-2 left-2">
            {item.available ? (
              <div className="flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-white/80 inline-block" />
                Available
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-rose-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-white/80 inline-block" />
                Unavailable
              </div>
            )}
          </div>

          <div className="absolute bottom-2 right-2 text-[10px] font-medium bg-black/30 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
            {availableCount}/{totalCount} units
          </div>
        </div>

        <div className="flex flex-col flex-1 p-3 gap-3">
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold text-sm text-foreground leading-tight">{item.model}</h3>
            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          </div>

          <Button
            className="w-full h-8 text-xs rounded-lg font-medium"
            variant={item.available && !item.currentlyBorrowed ? "default" : "secondary"}
            disabled={!item.available || item.currentlyBorrowed}
            onClick={() => setPickerOpen(true)}
          >
            {item.currentlyBorrowed ? "Borrowed" : item.available ? "Request Borrow" : "Unavailable"}
          </Button>
        </div>
      </div>

      <UnitPickerDialog
        item={item}
        categoryName={categoryName}
        categoryEmoji={categoryEmoji}
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onContinue={handleContinue}
      />
      <BorrowFormDialog
        item={item}
        unit={selectedUnit}
        categoryName={categoryName}
        categoryEmoji={categoryEmoji}
        open={formOpen}
        onClose={handleFormClose}
        onBack={handleBack}
        onRequestComplete={onRequestComplete}
      />
    </>
  );
}

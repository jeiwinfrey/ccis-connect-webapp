"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// ─── Data ────────────────────────────────────────────────────────────────────

interface Unit {
  unitId: string;
  notes: string;
  condition: "Excellent" | "Good" | "Fair";
  status: "available" | "on-loan";
  borrower?: string;
  dueBack?: string;
}

interface EquipmentItem {
  id: string;
  model: string;
  description: string;
  image: string;
  available: boolean;
  currentlyBorrowed: boolean;
  units: Unit[];
}

interface Category {
  name: string;
  emoji: string;
  description: string;
  color: string;
  items: EquipmentItem[];
}

const conditionColor: Record<Unit["condition"], string> = {
  Excellent: "text-emerald-600",
  Good: "text-sky-600",
  Fair: "text-amber-500",
};

const equipmentCategories: Category[] = [
  {
    name: "Cameras",
    emoji: "📷",
    description: "DSLRs, mirrorless, cinema & action cameras",
    color: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400",
    items: [
      {
        id: "cam-1",
        model: "Sony A7 IV",
        description: "33MP full-frame, 4K60p, 10-bit 4:2:2",
        image: "/api/placeholder/300/200",
        available: true,
        currentlyBorrowed: false,
        units: [
          { unitId: "CAM-A7IV-01", notes: "Includes 2 batteries · Last used Feb 10", condition: "Excellent", status: "available" },
          { unitId: "CAM-A7IV-02", notes: "Minor scuff on grip · Last used Feb 15", condition: "Good", status: "available" },
          { unitId: "CAM-A7IV-03", notes: "Brand new sensor clean · Last used Feb 18", condition: "Excellent", status: "available" },
          { unitId: "CAM-A7IV-04", notes: "LCD has hairline scratch · Last used Jan 30", condition: "Fair", status: "available" },
          { unitId: "CAM-A7IV-05", notes: "All accessories included · Last used Feb 12", condition: "Good", status: "available" },
          { unitId: "CAM-A7IV-06", notes: "A. Santos · Due back Mar 1", condition: "Good", status: "on-loan", borrower: "A. Santos", dueBack: "Mar 1" },
        ],
      },
      {
        id: "cam-2",
        model: "Canon EOS R5",
        description: "45MP full-frame, 8K RAW, dual card slots",
        image: "/api/placeholder/300/200",
        available: true,
        currentlyBorrowed: false,
        units: [
          { unitId: "CAM-R5-01", notes: "With RF 24-70mm f/2.8 · 1 unit", condition: "Excellent", status: "available" },
          { unitId: "CAM-R5-02", notes: "Body only · Last used Feb 8", condition: "Good", status: "available" },
        ],
      },
      {
        id: "cam-3",
        model: "BMPCC 6K Pro",
        description: "6K Super 35, Blackmagic RAW, built-in ND",
        image: "/api/placeholder/300/200",
        available: false,
        currentlyBorrowed: true,
        units: [
          { unitId: "CAM-BMPCC-01", notes: "J. Reyes · Due back Mar 2", condition: "Good", status: "on-loan", borrower: "J. Reyes", dueBack: "Mar 2" },
        ],
      },
      {
        id: "cam-4",
        model: "GoPro HERO13",
        description: "5.3K 60fps, waterproof, HyperSmooth 6.0",
        image: "/api/placeholder/300/200",
        available: true,
        currentlyBorrowed: false,
        units: [
          { unitId: "CAM-GP13-01", notes: "With accessories kit · Last used Feb 20", condition: "Excellent", status: "available" },
          { unitId: "CAM-GP13-02", notes: "Scratched lens cover · Last used Feb 1", condition: "Fair", status: "available" },
        ],
      },
      {
        id: "cam-5",
        model: "Nikon Z9",
        description: "45.7MP stacked sensor, 8K 60p, CFexpress",
        image: "/api/placeholder/300/200",
        available: true,
        currentlyBorrowed: false,
        units: [
          { unitId: "CAM-Z9-01", notes: "With 70-200mm · Last used Feb 17", condition: "Excellent", status: "available" },
        ],
      },
    ],
  },
  {
    name: "Audio Equipment",
    emoji: "🎤",
    description: "Microphones, recorders, headphones & mixers",
    color: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400",
    items: [
      {
        id: "audio-1",
        model: "Shure SM7B",
        description: "Dynamic broadcast mic, 50Hz-16kHz response",
        image: "/api/placeholder/300/200",
        available: true,
        currentlyBorrowed: false,
        units: [
          { unitId: "AUD-SM7B-01", notes: "With XLR cable · Last used Feb 19", condition: "Excellent", status: "available" },
          { unitId: "AUD-SM7B-02", notes: "No cable included · Last used Feb 5", condition: "Good", status: "available" },
        ],
      },
      {
        id: "audio-2",
        model: "Zoom H6",
        description: "6-track portable recorder, interchangeable mics",
        image: "/api/placeholder/300/200",
        available: true,
        currentlyBorrowed: false,
        units: [
          { unitId: "AUD-H6-01", notes: "Full kit · Last used Feb 14", condition: "Good", status: "available" },
        ],
      },
      {
        id: "audio-3",
        model: "Audio-Technica AT2020",
        description: "Condenser mic, cardioid, 20Hz-20kHz",
        image: "/api/placeholder/300/200",
        available: false,
        currentlyBorrowed: false,
        units: [
          { unitId: "AUD-AT2020-01", notes: "Under maintenance", condition: "Fair", status: "on-loan" },
        ],
      },
      {
        id: "audio-4",
        model: "Rode NTG3",
        description: "Shotgun mic, RF-bias, broadcast quality",
        image: "/api/placeholder/300/200",
        available: true,
        currentlyBorrowed: false,
        units: [
          { unitId: "AUD-NTG3-01", notes: "With blimp · Last used Feb 11", condition: "Excellent", status: "available" },
        ],
      },
    ],
  },
  {
    name: "Lighting",
    emoji: "💡",
    description: "LED panels, strobes, modifiers & stands",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    items: [
      {
        id: "light-1",
        model: "Aputure 600D Pro",
        description: "600W daylight LED, Bowens mount, wireless",
        image: "/api/placeholder/300/200",
        available: true,
        currentlyBorrowed: false,
        units: [
          { unitId: "LGT-600D-01", notes: "With softbox · Last used Feb 16", condition: "Good", status: "available" },
          { unitId: "LGT-600D-02", notes: "Body only · Last used Feb 9", condition: "Good", status: "available" },
        ],
      },
      {
        id: "light-2",
        model: "Godox SL-60W",
        description: "60W LED spotlight, 5600K, silent cooling",
        image: "/api/placeholder/300/200",
        available: true,
        currentlyBorrowed: false,
        units: [
          { unitId: "LGT-SL60-01", notes: "Last used Feb 21", condition: "Excellent", status: "available" },
        ],
      },
      {
        id: "light-3",
        model: "Nanlite PavoTube II",
        description: "RGB tube light, 36W, app control",
        image: "/api/placeholder/300/200",
        available: false,
        currentlyBorrowed: false,
        units: [
          { unitId: "LGT-PAVO-01", notes: "M. Cruz · Due back Mar 3", condition: "Good", status: "on-loan", borrower: "M. Cruz", dueBack: "Mar 3" },
        ],
      },
      {
        id: "light-4",
        model: "Profoto B10",
        description: "250Ws strobe, TTL, high-speed sync",
        image: "/api/placeholder/300/200",
        available: true,
        currentlyBorrowed: false,
        units: [
          { unitId: "LGT-B10-01", notes: "With battery + charger · Last used Feb 13", condition: "Excellent", status: "available" },
        ],
      },
    ],
  },
];

// ─── Unit Picker Dialog ───────────────────────────────────────────────────────

interface UnitPickerDialogProps {
  item: EquipmentItem | null;
  categoryName: string;
  categoryEmoji: string;
  open: boolean;
  onClose: () => void;
  onContinue: (unit: Unit) => void;
}

function UnitPickerDialog({ item, categoryName, categoryEmoji, open, onClose, onContinue }: UnitPickerDialogProps) {
  const [selected, setSelected] = useState<string | null>(null);

  if (!item) return null;

  const availableUnits = item.units.filter((u) => u.status === "available");
  const loanedUnits = item.units.filter((u) => u.status === "on-loan");
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
            {categoryEmoji} {categoryName} · Pick a unit below
          </p>
          <DialogTitle className="text-xl">{item.model}</DialogTitle>
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
            <span className="text-emerald-600 font-medium">{availableUnits.length} available</span>
            <span>·</span>
            <span className="text-orange-500 font-medium">{loanedUnits.length} on loan</span>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 space-y-5 max-h-[60vh] overflow-y-auto">
          {availableUnits.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                ✓ Available ({availableUnits.length})
              </p>
              {availableUnits.map((unit) => (
                <button
                  key={unit.unitId}
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
                    <span className={`text-xs font-semibold ${conditionColor[unit.condition]}`}>
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
                ⏳ On Loan ({loanedUnits.length})
              </p>
              {loanedUnits.map((unit) => (
                <div
                  key={unit.unitId}
                  className="w-full flex items-center gap-3 rounded-lg border border-border/40 px-4 py-3 opacity-60"
                >
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{unit.unitId}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{unit.notes}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-semibold ${conditionColor[unit.condition]}`}>
                      {unit.condition.toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold text-orange-500 bg-orange-50 dark:bg-orange-500/10 px-2 py-0.5 rounded-full">
                      ON LOAN
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
            Continue →
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Borrow Form Dialog ───────────────────────────────────────────────────────

interface BorrowFormDialogProps {
  item: EquipmentItem | null;
  unit: Unit | null;
  categoryName: string;
  categoryEmoji: string;
  open: boolean;
  onClose: () => void;
  onBack: () => void;
}

function BorrowFormDialog({ item, unit, categoryName, categoryEmoji, open, onClose, onBack }: BorrowFormDialogProps) {
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
          <p className="text-xs text-muted-foreground">Unit: <span className="font-medium text-foreground">{unit.unitId}</span></p>
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

// ─── Equipment Card ───────────────────────────────────────────────────────────

interface EquipmentCardProps {
  item: EquipmentItem;
  color: string;
  emoji: string;
  categoryName: string;
  categoryEmoji: string;
}

function EquipmentCard({ item, color, emoji, categoryName, categoryEmoji }: EquipmentCardProps) {
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
        {/* Image / placeholder area */}
        <div className={`relative h-[130px] flex items-center justify-center ${color}`}>
          <img
            src={item.image}
            alt={item.model}
            className="w-full h-full object-cover opacity-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <span className="absolute text-5xl select-none pointer-events-none">{emoji}</span>

          {/* Status badge */}
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

          {/* Unit count */}
          <div className="absolute bottom-2 right-2 text-[10px] font-medium bg-black/30 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
            {availableCount}/{totalCount} units
          </div>
        </div>

        {/* Body */}
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
      />
    </>
  );
}

// ─── Carousel ────────────────────────────────────────────────────────────────

interface EquipmentCarouselProps {
  items: EquipmentItem[];
  color: string;
  emoji: string;
  categoryName: string;
  categoryEmoji: string;
}

function EquipmentCarousel({ items, color, emoji, categoryName, categoryEmoji }: EquipmentCarouselProps) {
  return (
    <div className="overflow-x-auto pb-2 -mx-1 px-1">
      <div className="flex gap-3 w-max">
        {items.map((item) => (
          <EquipmentCard
            key={item.id}
            item={item}
            color={color}
            emoji={emoji}
            categoryName={categoryName}
            categoryEmoji={categoryEmoji}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Accordion Item ───────────────────────────────────────────────────────────

interface CategoryAccordionItemProps {
  category: Category;
  value: string;
}

function CategoryAccordionItem({ category, value }: CategoryAccordionItemProps) {
  const totalAvailable = category.items.filter((i) => i.available).length;

  return (
    <AccordionItem value={value} className="border-b border-border/40 last:border-0 px-0">
      <AccordionTrigger className="hover:no-underline py-4">
        <div className="flex items-center gap-3 text-left w-full pr-2">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${category.color}`}>
            {category.emoji}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{category.name}</span>
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                {totalAvailable} available
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{category.description}</div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-1 pb-6">
        <EquipmentCarousel
          items={category.items}
          color={category.color}
          emoji={category.emoji}
          categoryName={category.name}
          categoryEmoji={category.emoji}
        />
      </AccordionContent>
    </AccordionItem>
  );
}

// ─── Pending / Rejected Data ──────────────────────────────────────────────────

interface BorrowRequest {
  id: string;
  model: string;
  emoji: string;
  category: string;
  loanDuration: string;
  dates: string;
  submittedDate: string;
  rejectedDate?: string;
  reason?: string;
}

const pendingRequests: BorrowRequest[] = [
  { id: "req-1", model: "Sony A7 IV", emoji: "📷", category: "Cameras", loanDuration: "3-day loan", dates: "Feb 24 – Feb 27", submittedDate: "Feb 21" },
  { id: "req-2", model: "Rode NTG3", emoji: "🎤", category: "Audio", loanDuration: "1-day loan", dates: "Feb 25", submittedDate: "Feb 21" },
  { id: "req-3", model: "Aputure 600D Pro", emoji: "💡", category: "Lighting", loanDuration: "2-day loan", dates: "Feb 26 – Feb 28", submittedDate: "Feb 20" },
];

const rejectedRequests: BorrowRequest[] = [
  { id: "rej-1", model: "BMPCC 6K Pro", emoji: "🎥", category: "Cameras", loanDuration: "3-day loan", dates: "Feb 19 – Feb 22", submittedDate: "Feb 19", rejectedDate: "Feb 19", reason: "Item already on loan during requested period. Please choose different dates." },
];

// ─── Pending Dialog ───────────────────────────────────────────────────────────

function PendingDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40">
          <DialogTitle className="text-xl flex items-center gap-2">⏳ Pending Requests</DialogTitle>
          <p className="text-sm text-muted-foreground">Awaiting admin approval — usually within 2 hours</p>
        </DialogHeader>
        <div className="px-6 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {pendingRequests.map((req) => (
            <div key={req.id} className="flex items-start gap-4 rounded-xl bg-muted/40 border border-border/40 p-4">
              <span className="text-2xl mt-0.5">{req.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">{req.model}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {req.category} · {req.loanDuration} · {req.dates}
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
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Rejected Dialog ──────────────────────────────────────────────────────────

function RejectedDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
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

// ─── Page ─────────────────────────────────────────────────────────────────────

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

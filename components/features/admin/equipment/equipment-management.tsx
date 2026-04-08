"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconCategory, IconDevices, IconBox } from "@tabler/icons-react";
import { CategoriesSection } from "./categories-section";
import { ModelsSection } from "./models-section";
import { UnitsSection } from "./units-section";

type Tab = "categories" | "models" | "units";

export default function EquipmentManagement() {
  const [tab, setTab] = useState<Tab>("categories");

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Manage Inventory
        </h1>
        <p className="text-sm text-muted-foreground">
          Add, edit, or remove equipment categories, models, and units.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-2">
        {([
          { key: "categories" as Tab, label: "Categories", icon: IconCategory },
          { key: "models" as Tab, label: "Models", icon: IconDevices },
          { key: "units" as Tab, label: "Units", icon: IconBox },
        ]).map((t) => (
          <Button
            key={t.key}
            size="sm"
            variant={tab === t.key ? "default" : "outline"}
            onClick={() => setTab(t.key)}
          >
            <t.icon className="size-4" />
            {t.label}
          </Button>
        ))}
      </div>

      {tab === "categories" && <CategoriesSection />}
      {tab === "models" && <ModelsSection />}
      {tab === "units" && <UnitsSection />}
    </div>
  );
}

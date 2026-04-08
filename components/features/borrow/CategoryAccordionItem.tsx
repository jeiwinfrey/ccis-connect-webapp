import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { type Category } from "./types";
import { EquipmentCarousel } from "./EquipmentCarousel";

interface CategoryAccordionItemProps {
  category: Category;
  value: string;
  onRequestComplete?: () => void;
}

export function CategoryAccordionItem({ category, value, onRequestComplete }: CategoryAccordionItemProps) {
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
          onRequestComplete={onRequestComplete}
        />
      </AccordionContent>
    </AccordionItem>
  );
}

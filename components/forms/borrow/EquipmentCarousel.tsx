import { type EquipmentItem } from "./types";
import { EquipmentCard } from "./EquipmentCard";

interface EquipmentCarouselProps {
  items: EquipmentItem[];
  color: string;
  emoji: string;
  categoryName: string;
  categoryEmoji: string;
}

export function EquipmentCarousel({
  items,
  color,
  emoji,
  categoryName,
  categoryEmoji,
}: EquipmentCarouselProps) {
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

import { Button } from "@/components/ui/button";
import { type Room } from "./types";

interface RoomCellProps {
  room: Room;
  onSelect: (room: Room) => void;
}

export function RoomCell({ room, onSelect }: RoomCellProps) {
  const isVacant = room.status === "vacant";

  return (
    <div className={`flex flex-col items-center justify-center gap-2 h-32 ${isVacant ? "bg-green-50 dark:bg-green-950/30" : "bg-red-50 dark:bg-red-950/30"}`}>
      <span className="text-[10px] font-medium text-muted-foreground">{room.roomNumber}</span>
      <span className="text-sm font-medium text-foreground">{room.name}</span>
      <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
        isVacant ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isVacant ? "bg-green-500" : "bg-red-500"}`} />
        {isVacant ? "Vacant" : "Occupied"}
      </span>
      <Button size="sm" variant="outline" onClick={() => onSelect(room)}>
        Reserve
      </Button>
    </div>
  );
}

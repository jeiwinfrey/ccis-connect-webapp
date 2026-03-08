import { type Room } from "./types";
import { RoomCell } from "./RoomCell";

interface FloorMapProps {
  topRooms: Room[];
  bottomRooms: Room[];
  onSelectRoom: (room: Room) => void;
}

export function FloorMap({ topRooms, bottomRooms, onSelectRoom }: FloorMapProps) {
  // Determine grid columns based on the maximum row length
  // Responsive: cap at 2 cols on mobile, scale up on md+
  const maxCols = Math.max(topRooms.length, bottomRooms.length, 1);
  const gridCols =
    maxCols <= 2 ? "grid-cols-2" :
    maxCols <= 3 ? "grid-cols-2 md:grid-cols-3" :
    maxCols <= 4 ? "grid-cols-2 md:grid-cols-4" :
    maxCols <= 5 ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-5" :
    "grid-cols-2 md:grid-cols-3 lg:grid-cols-6";

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {topRooms.length > 0 && (
        <div className={`grid ${gridCols} divide-x divide-border`}>
          {topRooms.map((room) => (
            <RoomCell key={room.id} room={room} onSelect={onSelectRoom} />
          ))}
        </div>
      )}

      <div className="bg-muted border-y border-border flex items-center justify-center py-3">
        <span className="text-xs text-muted-foreground font-medium">Stairs / Lift</span>
      </div>

      {bottomRooms.length > 0 && (
        <div className={`grid ${gridCols} divide-x divide-border`}>
          {bottomRooms.map((room) => (
            <RoomCell key={room.id} room={room} onSelect={onSelectRoom} />
          ))}
        </div>
      )}
    </div>
  );
}

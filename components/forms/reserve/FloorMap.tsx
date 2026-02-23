import { type Room } from "./types";
import { RoomCell } from "./RoomCell";

interface FloorMapProps {
  topRooms: Room[];
  bottomRooms: Room[];
  onSelectRoom: (room: Room) => void;
}

export function FloorMap({ topRooms, bottomRooms, onSelectRoom }: FloorMapProps) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="grid grid-cols-4 divide-x divide-gray-200">
        {topRooms.map((room) => (
          <RoomCell key={room.id} room={room} onSelect={onSelectRoom} />
        ))}
      </div>

      <div className="bg-gray-100 border-y border-gray-200 flex items-center justify-center py-3">
        <span className="text-xs text-gray-400 font-medium">🏢 Stairs / Lift</span>
      </div>

      <div className="grid grid-cols-4 divide-x divide-gray-200">
        {bottomRooms.map((room) => (
          <RoomCell key={room.id} room={room} onSelect={onSelectRoom} />
        ))}
      </div>
    </div>
  );
}

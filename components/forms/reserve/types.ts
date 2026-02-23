export interface Room {
  id: string;
  name: string;
  type: string;
  capacity: string;
  floor: string;
  status: "vacant" | "occupied";
}

export const topRooms: Room[] = [
  { id: "R101", name: "Seminar Room B", type: "Seminar Room", capacity: "30 pax", floor: "1st Floor", status: "vacant" },
  { id: "R102", name: "Lab 1", type: "Computer Lab", capacity: "40 pax", floor: "1st Floor", status: "vacant" },
  { id: "R103", name: "Lab 2", type: "Computer Lab", capacity: "40 pax", floor: "1st Floor", status: "occupied" },
  { id: "R104", name: "Faculty Office", type: "Office", capacity: "10 pax", floor: "1st Floor", status: "occupied" },
];

export const bottomRooms: Room[] = [
  { id: "R105", name: "Seminar Room B", type: "Seminar Room", capacity: "30 pax", floor: "1st Floor", status: "vacant" },
  { id: "R106", name: "Lab 1", type: "Computer Lab", capacity: "40 pax", floor: "1st Floor", status: "vacant" },
  { id: "R107", name: "Lab 2", type: "Computer Lab", capacity: "40 pax", floor: "1st Floor", status: "occupied" },
  { id: "R108", name: "Faculty Office", type: "Office", capacity: "10 pax", floor: "1st Floor", status: "occupied" },
];

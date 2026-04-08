// Reservation Constants

export const BORROW_STATUSES = ["pending", "accepted", "rejected", "returned"] as const;
export type BorrowStatus = typeof BORROW_STATUSES[number];

export const ROOM_RESERVATION_STATUSES = ["pending", "accepted", "rejected"] as const;
export type RoomReservationStatus = typeof ROOM_RESERVATION_STATUSES[number];

export const BORROW_STATUS_COLORS: Record<BorrowStatus, string> = {
  pending: "text-amber-600 bg-amber-50 border-amber-200",
  accepted: "text-emerald-600 bg-emerald-50 border-emerald-200",
  rejected: "text-rose-600 bg-rose-50 border-rose-200",
  returned: "text-sky-600 bg-sky-50 border-sky-200",
};

export const ROOM_STATUS_COLORS: Record<RoomReservationStatus, string> = {
  pending: "text-amber-600 bg-amber-50 border-amber-200",
  accepted: "text-emerald-600 bg-emerald-50 border-emerald-200",
  rejected: "text-rose-600 bg-rose-50 border-rose-200",
};

export const STATUS_LABELS: Record<BorrowStatus | RoomReservationStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  returned: "Returned",
};

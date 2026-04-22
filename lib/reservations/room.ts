import type { NextResponse } from "next/server";
import { and, eq, gt, gte, inArray, lt, lte, ne } from "drizzle-orm";

import { conflictResponse, notFoundResponse } from "@/lib/api/response";
import { db, roomAvailability, roomReservations, rooms } from "@/lib/db";

type RoomSlotCheckInput = {
  roomId: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  excludeReservationId?: string;
};

type RoomSlotCheckResult =
  | { ok: true }
  | { ok: false; response: NextResponse };

function timeToDecimal(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours + minutes / 60;
}

export async function ensureRoomSlotAvailable({
  roomId,
  reservationDate,
  startTime,
  endTime,
  excludeReservationId,
}: RoomSlotCheckInput): Promise<RoomSlotCheckResult> {
  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
  });

  if (!room) {
    return { ok: false, response: notFoundResponse("Room") };
  }

  const dayOfWeek = new Date(`${reservationDate}T00:00:00`).getDay();
  const startHour = timeToDecimal(startTime);
  const endHour = timeToDecimal(endTime);

  const availableSlot = await db
    .select({ id: roomAvailability.id })
    .from(roomAvailability)
    .where(
      and(
        eq(roomAvailability.roomId, roomId),
        eq(roomAvailability.dayOfWeek, dayOfWeek),
        lte(roomAvailability.startHour, startHour),
        gte(roomAvailability.endHour, endHour),
      ),
    )
    .limit(1);

  if (availableSlot.length === 0) {
    return { ok: false, response: conflictResponse("Room is not available for the selected schedule") };
  }

  const conflictConditions = [
    eq(roomReservations.roomId, roomId),
    eq(roomReservations.reservationDate, reservationDate),
    inArray(roomReservations.status, ["accepted", "pending"]),
    lt(roomReservations.startTime, endTime),
    gt(roomReservations.endTime, startTime),
  ];

  if (excludeReservationId) {
    conflictConditions.push(ne(roomReservations.id, excludeReservationId));
  }

  const conflictingReservation = await db
    .select({ id: roomReservations.id })
    .from(roomReservations)
    .where(and(...conflictConditions))
    .limit(1);

  if (conflictingReservation.length > 0) {
    return { ok: false, response: conflictResponse("Room already has a reservation for the selected schedule") };
  }

  return { ok: true };
}

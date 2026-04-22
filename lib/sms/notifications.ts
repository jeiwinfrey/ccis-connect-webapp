import { eq, or } from "drizzle-orm";
import { db, users } from "@/lib/db";
import { sendSms } from "./service";
import {
  formatBorrowRequestAdminNotification,
  formatRoomReservationAdminNotification,
  formatBorrowDecisionNotification,
  formatRoomDecisionNotification,
} from "./formatters";

/**
 * Queries all admin and super_admin users from the database.
 */
async function getAdminPhoneNumbers(): Promise<string[]> {
  const admins = await db
    .select({ phoneNumber: users.phoneNumber })
    .from(users)
    .where(or(eq(users.role, "admin"), eq(users.role, "super_admin")));

  return admins.map((a) => a.phoneNumber);
}

/**
 * Sends SMS to all admins when a new borrow request is created.
 * Fire-and-forget — errors are logged but never thrown.
 */
export async function notifyAdminsNewBorrow(
  requesterName: string,
  modelName: string
): Promise<void> {
  try {
    const phoneNumbers = await getAdminPhoneNumbers();
    const content = formatBorrowRequestAdminNotification(requesterName, modelName);

    for (const recipient of phoneNumbers) {
      await sendSms({ recipient, content });
    }
  } catch (error) {
    console.error("[SMS] Failed to notify admins about new borrow request:", error);
  }
}

/**
 * Sends SMS to all admins when a new room reservation is created.
 * Fire-and-forget — errors are logged but never thrown.
 */
export async function notifyAdminsNewRoom(
  requesterName: string,
  roomName: string
): Promise<void> {
  try {
    const phoneNumbers = await getAdminPhoneNumbers();
    const content = formatRoomReservationAdminNotification(requesterName, roomName);

    for (const recipient of phoneNumbers) {
      await sendSms({ recipient, content });
    }
  } catch (error) {
    console.error("[SMS] Failed to notify admins about new room reservation:", error);
  }
}

/**
 * Sends SMS to the requester when their borrow request is accepted or rejected.
 * Fire-and-forget — errors are logged but never thrown.
 */
export async function notifyRequesterBorrowDecision(
  phoneNumber: string,
  status: "accepted" | "rejected",
  modelName: string,
  reason?: string | null,
): Promise<void> {
  try {
    const content = formatBorrowDecisionNotification(status, modelName, reason);
    await sendSms({ recipient: phoneNumber, content });
  } catch (error) {
    console.error("[SMS] Failed to notify requester about borrow decision:", error);
  }
}

/**
 * Sends SMS to the requester when their room reservation is accepted or rejected.
 * Fire-and-forget — errors are logged but never thrown.
 */
export async function notifyRequesterRoomDecision(
  phoneNumber: string,
  status: "accepted" | "rejected",
  roomName: string,
  reason?: string | null,
): Promise<void> {
  try {
    const content = formatRoomDecisionNotification(status, roomName, reason);
    await sendSms({ recipient: phoneNumber, content });
  } catch (error) {
    console.error("[SMS] Failed to notify requester about room decision:", error);
  }
}

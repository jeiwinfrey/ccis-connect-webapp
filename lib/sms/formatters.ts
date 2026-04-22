/**
 * Pure formatter functions for SMS notification messages.
 * Each function produces a concise SMS-friendly string.
 */

export function formatBorrowRequestAdminNotification(
  requesterName: string,
  unitId: string
): string {
  return `New borrow request from ${requesterName} for unit ${unitId}. Please review.`;
}

export function formatRoomReservationAdminNotification(
  requesterName: string,
  roomName: string
): string {
  return `New room reservation from ${requesterName} for ${roomName}. Please review.`;
}

export function formatBorrowDecisionNotification(
  status: "accepted" | "rejected",
  unitId: string
): string {
  return status === "accepted"
    ? `Your borrow request for unit ${unitId} has been accepted.`
    : `Your borrow request for unit ${unitId} has been rejected.`;
}

export function formatRoomDecisionNotification(
  status: "accepted" | "rejected",
  roomName: string
): string {
  return status === "accepted"
    ? `Your room reservation for ${roomName} has been accepted.`
    : `Your room reservation for ${roomName} has been rejected.`;
}

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
  modelName: string,
  reason?: string | null,
): string {
  if (status === "accepted") {
    return `Your borrow request for ${modelName} has been accepted.`;
  }

  const trimmedReason = reason?.trim();

  return trimmedReason
    ? `Your borrow request for ${modelName} has been rejected. Reason: ${trimmedReason}`
    : `Your borrow request for ${modelName} has been rejected.`;
}

export function formatRoomDecisionNotification(
  status: "accepted" | "rejected",
  roomName: string,
  reason?: string | null,
): string {
  if (status === "accepted") {
    return `Your room reservation for ${roomName} has been accepted.`;
  }

  const trimmedReason = reason?.trim();

  return trimmedReason
    ? `Your room reservation for ${roomName} has been rejected. Reason: ${trimmedReason}`
    : `Your room reservation for ${roomName} has been rejected.`;
}

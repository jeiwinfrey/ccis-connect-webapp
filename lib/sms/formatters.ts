/**
 * Pure formatter functions for SMS notification messages.
 * Each function produces a concise SMS-friendly string.
 */

function withSignature(message: string): string {
  return `${message}\n\n -CCIS Connect`;
}

export function formatBorrowRequestAdminNotification(
  requesterName: string,
  unitId: string
): string {
  return withSignature(`New borrow request from ${requesterName} for unit ${unitId}.\nPlease review.`);
}

export function formatRoomReservationAdminNotification(
  requesterName: string,
  roomName: string
): string {
  return withSignature(`New room reservation from ${requesterName} for ${roomName}.\nPlease review.`);
}

export function formatBorrowDecisionNotification(
  status: "accepted" | "rejected",
  modelName: string,
  reason?: string | null,
): string {
  if (status === "accepted") {
    return withSignature(`Your borrow request for ${modelName} has been accepted.`);
  }

  const trimmedReason = reason?.trim();

  const message = trimmedReason
    ? `Your borrow request for ${modelName} has been rejected.\nReason: ${trimmedReason}`
    : `Your borrow request for ${modelName} has been rejected.`;

  return withSignature(message);
}

export function formatRoomDecisionNotification(
  status: "accepted" | "rejected",
  roomName: string,
  reason?: string | null,
): string {
  if (status === "accepted") {
    return withSignature(`Your room reservation for ${roomName} has been accepted.`);
  }

  const trimmedReason = reason?.trim();

  const message = trimmedReason
    ? `Your room reservation for ${roomName} has been rejected.\nReason: ${trimmedReason}`
    : `Your room reservation for ${roomName} has been rejected.`;

  return withSignature(message);
}

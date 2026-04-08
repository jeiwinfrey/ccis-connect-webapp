import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import * as schema from "./schema";

// ---------------------------------------------------------------------------
// Row types (what you read from the database)
// ---------------------------------------------------------------------------

export type EquipmentCategory = InferSelectModel<typeof schema.equipmentCategories>;
export type EquipmentModel = InferSelectModel<typeof schema.equipmentModels>;
export type EquipmentUnit = InferSelectModel<typeof schema.equipmentUnits>;
export type Room = InferSelectModel<typeof schema.rooms>;
export type RoomAvailability = InferSelectModel<typeof schema.roomAvailability>;
export type RoomReservation = InferSelectModel<typeof schema.roomReservations>;
export type BorrowRequest = InferSelectModel<typeof schema.borrowRequests>;
export type User = InferSelectModel<typeof schema.users>;
export type ActivityLog = InferSelectModel<typeof schema.activityLog>;

// ---------------------------------------------------------------------------
// Insert types (what you send to create a new row)
// ---------------------------------------------------------------------------

export type EquipmentCategoryInsert = InferInsertModel<typeof schema.equipmentCategories>;
export type EquipmentModelInsert = InferInsertModel<typeof schema.equipmentModels>;
export type EquipmentUnitInsert = InferInsertModel<typeof schema.equipmentUnits>;
export type RoomInsert = InferInsertModel<typeof schema.rooms>;
export type RoomAvailabilityInsert = InferInsertModel<typeof schema.roomAvailability>;
export type RoomReservationInsert = InferInsertModel<typeof schema.roomReservations>;
export type BorrowRequestInsert = InferInsertModel<typeof schema.borrowRequests>;
export type UserInsert = InferInsertModel<typeof schema.users>;
export type ActivityLogInsert = InferInsertModel<typeof schema.activityLog>;

// ---------------------------------------------------------------------------
// Update types (partial, for PATCH operations)
// ---------------------------------------------------------------------------

export type EquipmentCategoryUpdate = Partial<Omit<EquipmentCategoryInsert, "id" | "createdAt">>;
export type EquipmentModelUpdate = Partial<Omit<EquipmentModelInsert, "id" | "createdAt">>;
export type EquipmentUnitUpdate = Partial<Omit<EquipmentUnitInsert, "id" | "createdAt">>;
export type RoomUpdate = Partial<Omit<RoomInsert, "id" | "createdAt">>;
export type RoomReservationUpdate = Partial<Pick<RoomReservation, "status" | "adminNotes">>;
export type BorrowRequestUpdate = Partial<Pick<BorrowRequest, "status" | "adminNotes">>;
export type UserUpdate = Partial<Omit<UserInsert, "email" | "id" | "createdAt">>;

// ---------------------------------------------------------------------------
// Safe User type (without password)
// ---------------------------------------------------------------------------

export type SafeUser = Omit<User, "passwordHash">;

// ---------------------------------------------------------------------------
// Joined / enriched types (for queries with joins)
// ---------------------------------------------------------------------------

export type EquipmentUnitWithModel = EquipmentUnit & {
  equipmentModels: EquipmentModel;
};

export type EquipmentModelWithUnits = EquipmentModel & {
  equipmentUnits: EquipmentUnit[];
};

export type EquipmentCategoryWithModels = EquipmentCategory & {
  equipmentModels: EquipmentModelWithUnits[];
};

export type BorrowRequestWithDetails = BorrowRequest & {
  users: User;
  equipmentUnits: EquipmentUnitWithModel;
};

export type RoomReservationWithDetails = RoomReservation & {
  users: User;
  rooms: Room;
};

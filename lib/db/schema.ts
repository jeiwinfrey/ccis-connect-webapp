import { pgTable, uuid, text, timestamp, integer, date, time } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Equipment Categories
export const equipmentCategories = pgTable("equipment_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  emoji: text("emoji").notNull(),
  description: text("description").notNull(),
  color: text("color").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Equipment Models
export const equipmentModels = pgTable("equipment_models", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id").notNull().references(() => equipmentCategories.id, { onDelete: "cascade" }),
  modelName: text("model_name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Equipment Units
export const equipmentUnits = pgTable("equipment_units", {
  id: uuid("id").primaryKey().defaultRandom(),
  modelId: uuid("model_id").notNull().references(() => equipmentModels.id, { onDelete: "cascade" }),
  unitId: text("unit_id").notNull().unique(),
  condition: text("condition", { enum: ["Excellent", "Good", "Fair", "Maintenance"] }).notNull(),
  status: text("status", { enum: ["available", "on-loan", "maintenance"] }).notNull(),
  notes: text("notes").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Rooms
export const rooms = pgTable("rooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomNumber: text("room_number").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  capacity: text("capacity").notNull(),
  floor: text("floor").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Room Availability
export const roomAvailability = pgTable("room_availability", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomId: uuid("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Sunday ... 6=Saturday
  startHour: integer("start_hour").notNull(),
  endHour: integer("end_hour").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Users
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  studentId: text("student_id"),
  department: text("department").notNull(),
  role: text("role", { enum: ["student", "faculty", "admin", "super_admin"] }).notNull(),
  username: text("username").unique(),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Room Reservations
export const roomReservations = pgTable("room_reservations", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomId: uuid("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reservationDate: date("reservation_date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  purpose: text("purpose").notNull(),
  status: text("status", { enum: ["pending", "accepted", "rejected"] }).notNull(),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Borrow Requests
export const borrowRequests = pgTable("borrow_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  unitId: uuid("unit_id").notNull().references(() => equipmentUnits.id, { onDelete: "cascade" }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  purpose: text("purpose").notNull(),
  status: text("status", { enum: ["pending", "accepted", "rejected", "returned"] }).notNull(),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Activity Log
export const activityLog = pgTable("activity_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  detail: text("detail").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const equipmentCategoriesRelations = relations(equipmentCategories, ({ many }) => ({
  models: many(equipmentModels),
}));

export const equipmentModelsRelations = relations(equipmentModels, ({ one, many }) => ({
  category: one(equipmentCategories, {
    fields: [equipmentModels.categoryId],
    references: [equipmentCategories.id],
  }),
  units: many(equipmentUnits),
}));

export const equipmentUnitsRelations = relations(equipmentUnits, ({ one, many }) => ({
  model: one(equipmentModels, {
    fields: [equipmentUnits.modelId],
    references: [equipmentModels.id],
  }),
  borrowRequests: many(borrowRequests),
}));

export const roomsRelations = relations(rooms, ({ many }) => ({
  availability: many(roomAvailability),
  reservations: many(roomReservations),
}));

export const roomAvailabilityRelations = relations(roomAvailability, ({ one }) => ({
  room: one(rooms, {
    fields: [roomAvailability.roomId],
    references: [rooms.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  roomReservations: many(roomReservations),
  borrowRequests: many(borrowRequests),
  activityLogs: many(activityLog),
}));

export const roomReservationsRelations = relations(roomReservations, ({ one }) => ({
  room: one(rooms, {
    fields: [roomReservations.roomId],
    references: [rooms.id],
  }),
  user: one(users, {
    fields: [roomReservations.userId],
    references: [users.id],
  }),
}));

export const borrowRequestsRelations = relations(borrowRequests, ({ one }) => ({
  user: one(users, {
    fields: [borrowRequests.userId],
    references: [users.id],
  }),
  unit: one(equipmentUnits, {
    fields: [borrowRequests.unitId],
    references: [equipmentUnits.id],
  }),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  user: one(users, {
    fields: [activityLog.userId],
    references: [users.id],
  }),
}));

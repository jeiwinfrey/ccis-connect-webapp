export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ---------------------------------------------------------------------------
// Row types (what you read from the database)
// Using `type` instead of `interface` so they satisfy Record<string, unknown>
// which is required by Supabase's GenericTable constraint.
// ---------------------------------------------------------------------------

export type EquipmentCategory = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  created_at: string;
  updated_at: string;
};

export type EquipmentModel = {
  id: string;
  category_id: string;
  model_name: string;
  description: string;
  image_url: string;
  created_at: string;
  updated_at: string;
};

export type EquipmentUnit = {
  id: string;
  model_id: string;
  unit_id: string;
  condition: "Excellent" | "Good" | "Fair" | "Maintenance";
  status: "available" | "on-loan" | "maintenance";
  notes: string;
  created_at: string;
  updated_at: string;
};

export type Room = {
  id: string;
  room_number: string;
  name: string;
  type: string;
  capacity: string;
  floor: string;
  created_at: string;
  updated_at: string;
};

export type RoomAvailability = {
  id: string;
  room_id: string;
  day_of_week: number; // 0=Sunday ... 6=Saturday
  start_hour: number;
  end_hour: number;
  created_at: string;
};

export type RoomReservation = {
  id: string;
  room_id: string;
  user_id: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  purpose: string;
  status: "pending" | "accepted" | "rejected";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type BorrowRequest = {
  id: string;
  user_id: string;
  unit_id: string;
  start_date: string;
  end_date: string;
  purpose: string;
  status: "pending" | "accepted" | "rejected" | "returned";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  student_id: string | null;
  department: string;
  role: "student" | "faculty" | "admin" | "super_admin";
  username: string | null;
  password_hash: string | null;
  created_at: string;
  updated_at: string;
};

/** User type with sensitive fields stripped — safe for client-side usage */
export type SafeUser = Omit<User, "password_hash">;

export type ActivityLog = {
  id: string;
  user_id: string | null;
  action: string;
  detail: string;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Insert types (what you send to create a new row)
// ---------------------------------------------------------------------------

export type EquipmentCategoryInsert = Omit<EquipmentCategory, "id" | "created_at" | "updated_at">;
export type EquipmentModelInsert = Omit<EquipmentModel, "id" | "created_at" | "updated_at">;
export type EquipmentUnitInsert = Omit<EquipmentUnit, "id" | "created_at" | "updated_at">;
export type RoomInsert = Omit<Room, "id" | "created_at" | "updated_at">;
export type RoomAvailabilityInsert = Omit<RoomAvailability, "id" | "created_at">;
export type RoomReservationInsert = Omit<RoomReservation, "id" | "created_at" | "updated_at">;
export type BorrowRequestInsert = Omit<BorrowRequest, "id" | "created_at" | "updated_at">;
export type UserInsert = Omit<User, "id" | "created_at" | "updated_at">;
export type ActivityLogInsert = Omit<ActivityLog, "id" | "created_at">;

// ---------------------------------------------------------------------------
// Update types (partial, for PATCH operations)
// ---------------------------------------------------------------------------

export type EquipmentCategoryUpdate = Partial<EquipmentCategoryInsert>;
export type EquipmentModelUpdate = Partial<EquipmentModelInsert>;
export type EquipmentUnitUpdate = Partial<EquipmentUnitInsert>;
export type RoomUpdate = Partial<RoomInsert>;
export type RoomReservationUpdate = Partial<Pick<RoomReservation, "status" | "admin_notes">>;
export type BorrowRequestUpdate = Partial<Pick<BorrowRequest, "status" | "admin_notes">>;
export type UserUpdate = Partial<Omit<UserInsert, "email">>;

// ---------------------------------------------------------------------------
// Joined / enriched types (for queries with joins)
// ---------------------------------------------------------------------------

export type EquipmentUnitWithModel = EquipmentUnit & {
  equipment_models: EquipmentModel;
};

export type EquipmentModelWithUnits = EquipmentModel & {
  equipment_units: EquipmentUnit[];
};

export type EquipmentCategoryWithModels = EquipmentCategory & {
  equipment_models: EquipmentModelWithUnits[];
};

export type BorrowRequestWithDetails = BorrowRequest & {
  users: User;
  equipment_units: EquipmentUnitWithModel;
};

export type RoomReservationWithDetails = RoomReservation & {
  users: User;
  rooms: Room;
};

// ---------------------------------------------------------------------------
// Database type for Supabase client generics
// ---------------------------------------------------------------------------

export type Database = {
  public: {
    Tables: {
      equipment_categories: {
        Row: EquipmentCategory;
        Insert: EquipmentCategoryInsert;
        Update: EquipmentCategoryUpdate;
        Relationships: [];
      };
      equipment_models: {
        Row: EquipmentModel;
        Insert: EquipmentModelInsert;
        Update: EquipmentModelUpdate;
        Relationships: [
          {
            foreignKeyName: "equipment_models_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "equipment_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      equipment_units: {
        Row: EquipmentUnit;
        Insert: EquipmentUnitInsert;
        Update: EquipmentUnitUpdate;
        Relationships: [
          {
            foreignKeyName: "equipment_units_model_id_fkey";
            columns: ["model_id"];
            isOneToOne: false;
            referencedRelation: "equipment_models";
            referencedColumns: ["id"];
          },
        ];
      };
      rooms: {
        Row: Room;
        Insert: RoomInsert;
        Update: RoomUpdate;
        Relationships: [];
      };
      room_availability: {
        Row: RoomAvailability;
        Insert: RoomAvailabilityInsert;
        Update: Partial<RoomAvailabilityInsert>;
        Relationships: [
          {
            foreignKeyName: "room_availability_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "rooms";
            referencedColumns: ["id"];
          },
        ];
      };
      room_reservations: {
        Row: RoomReservation;
        Insert: RoomReservationInsert;
        Update: RoomReservationUpdate;
        Relationships: [
          {
            foreignKeyName: "room_reservations_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "rooms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "room_reservations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      borrow_requests: {
        Row: BorrowRequest;
        Insert: BorrowRequestInsert;
        Update: BorrowRequestUpdate;
        Relationships: [
          {
            foreignKeyName: "borrow_requests_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "borrow_requests_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "equipment_units";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
        Relationships: [];
      };
      activity_log: {
        Row: ActivityLog;
        Insert: ActivityLogInsert;
        Update: Partial<ActivityLogInsert>;
        Relationships: [
          {
            foreignKeyName: "activity_log_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

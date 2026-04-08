// User Constants

export const USER_ROLES = ["student", "faculty", "admin", "super_admin"] as const;
export type UserRole = typeof USER_ROLES[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  student: "Student",
  faculty: "Faculty",
  admin: "Admin",
  super_admin: "Super Admin",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  student: "text-sky-600 bg-sky-50 border-sky-200",
  faculty: "text-purple-600 bg-purple-50 border-purple-200",
  admin: "text-amber-600 bg-amber-50 border-amber-200",
  super_admin: "text-rose-600 bg-rose-50 border-rose-200",
};

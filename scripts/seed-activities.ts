import { db, users, activityLog } from "../lib/db";
import { eq } from "drizzle-orm";

async function seedActivities() {
  console.log("🌱 Seeding activity logs...");

  // Clear existing activity logs
  await db.delete(activityLog);
  console.log("🗑️  Cleared existing activity logs");

  // Get admin user ID for activity logs
  const [adminUserRecord] = await db.select().from(users).where(eq(users.username, "admin")).limit(1);
  const adminUserId = adminUserRecord?.id || null;

  if (!adminUserId) {
    console.log("❌ Admin user not found. Please run the main seed script first.");
    process.exit(1);
  }

  // Create sample activity logs with different timestamps
  const now = new Date();
  
  const activities = [
    {
      userId: adminUserId,
      action: "room_created",
      detail: "Room CCIS-301 was created",
      createdAt: new Date(now.getTime() - 5 * 60 * 1000), // 5 minutes ago
    },
    {
      userId: adminUserId,
      action: "equipment_model_created",
      detail: "Equipment model Sony A7 IV was created",
      createdAt: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
    },
    {
      userId: adminUserId,
      action: "equipment_category_created",
      detail: "Category Cameras was created",
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      userId: adminUserId,
      action: "room_created",
      detail: "Room CCIS-302 was created",
      createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
    },
    {
      userId: adminUserId,
      action: "equipment_model_created",
      detail: "Equipment model MacBook Pro M3 was created",
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      userId: adminUserId,
      action: "equipment_category_created",
      detail: "Category Laptops was created",
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      userId: adminUserId,
      action: "user_created",
      detail: "User 23-14000 was created",
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
  ];

  for (const activity of activities) {
    await db.insert(activityLog).values(activity);
    console.log(`✅ Created activity: ${activity.action}`);
  }

  console.log("✨ Activity logs seeded successfully!");
  process.exit(0);
}

seedActivities().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});

import { db, users } from "../lib/db";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create test users
  const testUsers = [
    {
      name: "Student User",
      email: "student@ccis.edu",
      studentId: "2024-00001",
      department: "Computer Science",
      role: "student" as const,
      username: "student",
      passwordHash: "student", // In production, this should be hashed!
    },
    {
      name: "Faculty User",
      email: "faculty@ccis.edu",
      studentId: null,
      department: "Computer Science",
      role: "faculty" as const,
      username: "faculty",
      passwordHash: "faculty", // In production, this should be hashed!
    },
    {
      name: "Admin User",
      email: "admin@ccis.edu",
      studentId: null,
      department: "Administration",
      role: "admin" as const,
      username: "admin",
      passwordHash: "admin", // In production, this should be hashed!
    },
  ];

  for (const user of testUsers) {
    await db.insert(users).values(user);
    console.log(`✅ Created user: ${user.username} (${user.role})`);
  }

  console.log("✨ Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});

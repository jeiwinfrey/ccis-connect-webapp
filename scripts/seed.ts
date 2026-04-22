import { db, users } from "../lib/db";
import { activityLog, borrowRequests, roomReservations, roomAvailability, equipmentUnits, equipmentModels, equipmentCategories, rooms } from "../lib/db/schema";

async function seed() {
    console.log("🌱 Seeding database...");

    // Clear everything except users
    console.log("🧹 Clearing non-user data...");
    await db.delete(activityLog);
    await db.delete(borrowRequests);
    await db.delete(roomReservations);
    await db.delete(roomAvailability);
    await db.delete(equipmentUnits);
    await db.delete(equipmentModels);
    await db.delete(equipmentCategories);
    await db.delete(rooms);
    console.log("✅ Cleared");

    // Upsert users (insert or skip if username already exists)
    const testUsers = [
        {
            name: "Student User",
            phoneNumber: "+639562267208",
            studentId: "23-140000",
            department: "Computer Science",
            role: "student" as const,
            username: "23-140000",
            passwordHash: "23-140000",
        },
        {
            name: "Student User 2",
            phoneNumber: "+639562267208",
            studentId: "23-140001",
            department: "Information Technology",
            role: "student" as const,
            username: "23-140001",
            passwordHash: "23-140001",
        },
        {
            name: "Faculty User",
            phoneNumber: "+639562267208",
            studentId: null,
            department: "Computer Science",
            role: "faculty" as const,
            username: "fac-01",
            passwordHash: "fac-01",
        },
        {
            name: "Faculty User 2",
            phoneNumber: "+639562267208",
            studentId: null,
            department: "Information Technology",
            role: "faculty" as const,
            username: "fac-02",
            passwordHash: "fac-02",
        },
        {
            name: "Admin User",
            phoneNumber: "+639562267208",
            studentId: null,
            department: "Administration",
            role: "admin" as const,
            username: "admin1",
            passwordHash: "admin1",
        },
        {
            name: "Admin User 2",
            phoneNumber: "+639562267208",
            studentId: null,
            department: "Administration",
            role: "admin" as const,
            username: "admin2",
            passwordHash: "admin2",
        },
    ];

    for (const user of testUsers) {
        await db
            .insert(users)
            .values(user)
            .onConflictDoNothing({ target: users.username });
        console.log(`✅ Upserted user: ${user.username} (${user.role})`);
    }

    console.log("✨ Seeding complete!");
    process.exit(0);
}

seed().catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
});

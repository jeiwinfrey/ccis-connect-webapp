import {
    db,
    users,
    rooms,
    roomAvailability,
    equipmentCategories,
    equipmentModels,
    equipmentUnits,
    activityLog,
} from "../lib/db";
import { eq } from "drizzle-orm";

async function seed() {
    console.log("🌱 Seeding database...");

    // Create test users
    const testUsers = [
        {
            name: "Student User",
            email: "student@ccis.edu",
            studentId: "23-14000",
            department: "Computer Science",
            role: "student" as const,
            username: "23-14000",
            passwordHash: "23-14000", // In production, this should be hashed!
        },
        {
            name: "Student User 2",
            email: "student2@ccis.edu",
            studentId: "23-14001",
            department: "Information Technology",
            role: "student" as const,
            username: "23-14001",
            passwordHash: "23-14001", // In production, this should be hashed!
        },
        {
            name: "Faculty User",
            email: "faculty@ccis.edu",
            studentId: null,
            department: "Computer Science",
            role: "faculty" as const,
            username: "fac-01",
            passwordHash: "fac-01", // In production, this should be hashed!
        },
        {
            name: "Faculty User 2",
            email: "faculty2@ccis.edu",
            studentId: null,
            department: "Information Technology",
            role: "faculty" as const,
            username: "fac-02",
            passwordHash: "fac-02", // In production, this should be hashed!
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

    // Create sample rooms
    const sampleRooms = [
        {
            roomNumber: "CCIS-301",
            name: "CCIS-301",
            floor: "1st Floor",
            type: "Lecture",
            capacity: "20",
        },
        {
            roomNumber: "CCIS-302",
            name: "CCIS-302",
            floor: "2nd Floor",
            type: "Lab Room",
            capacity: "8",
        },
    ];

    const insertedRooms = [];
    for (const room of sampleRooms) {
        const [insertedRoom] = await db.insert(rooms).values(room).returning();
        insertedRooms.push(insertedRoom);
        console.log(`✅ Created room: ${room.name} (${room.roomNumber})`);
    }

    // Create room availability (Monday to Friday, 8 AM to 5 PM)
    for (const room of insertedRooms) {
        for (let day = 1; day <= 5; day++) {
            await db.insert(roomAvailability).values({
                roomId: room.id,
                dayOfWeek: day,
                startHour: 8,
                endHour: 17,
            });
        }
        console.log(`✅ Created availability for: ${room.name}`);
    }

    // Create equipment categories
    const categories = [
        {
            name: "Cameras",
            emoji: "📷",
            description: "Professional cameras and photography equipment",
            color: "bg-blue-100 dark:bg-blue-500/20",
        },
        {
            name: "Laptops",
            emoji: "💻",
            description: "High-performance laptops for development and design",
            color: "bg-purple-100 dark:bg-purple-500/20",
        },
    ];

    const insertedCategories = [];
    for (const category of categories) {
        const [insertedCategory] = await db
            .insert(equipmentCategories)
            .values(category)
            .returning();
        insertedCategories.push(insertedCategory);
        console.log(`✅ Created category: ${category.name}`);
    }

    // Create equipment models
    const models = [
        {
            categoryId: insertedCategories[0].id, // Cameras
            modelName: "Sony A7 IV",
            description: "Full-frame mirrorless camera with 33MP sensor",
            imageUrl:
                "https://images.unsplash.com/photo-1606980707986-8f6e1f0d1e1f?w=400&h=300&fit=crop",
        },
        {
            categoryId: insertedCategories[1].id, // Laptops
            modelName: "MacBook Pro M3",
            description: "16-inch MacBook Pro with M3 Max chip, 36GB RAM",
            imageUrl:
                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop",
        },
    ];

    const insertedModels = [];
    for (const model of models) {
        const [insertedModel] = await db
            .insert(equipmentModels)
            .values(model)
            .returning();
        insertedModels.push(insertedModel);
        console.log(`✅ Created model: ${model.modelName}`);
    }

    // Create equipment units
    const units = [
        {
            modelId: insertedModels[0].id, // Sony A7 IV
            unitId: "CAM-A7IV-01",
            condition: "Excellent" as const,
            status: "available" as const,
            notes: "Includes battery and charger",
        },
        {
            modelId: insertedModels[1].id, // MacBook Pro M3
            unitId: "MBP-M3-01",
            condition: "Excellent" as const,
            status: "available" as const,
            notes: "Includes charger and USB-C cable",
        },
    ];

    for (const unit of units) {
        await db.insert(equipmentUnits).values(unit);
        console.log(`✅ Created unit: ${unit.unitId}`);
    }

    // Get admin user ID for activity logs
    const [adminUserRecord] = await db
        .select()
        .from(users)
        .where(eq(users.username, "admin"))
        .limit(1);
    const adminUserId = adminUserRecord?.id || null;

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

    console.log("✨ Seeding complete!");
    process.exit(0);
}

seed().catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
});

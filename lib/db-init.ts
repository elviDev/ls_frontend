import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export async function initializeDatabase() {
  try {
    console.log("Initializing database...");

    // Check if we have any users
    const userCount = await prisma.user.count();

    if (userCount === 0) {
      console.log("No users found. Creating sample user...");

      // Create a sample admin user
      const hashedPassword = await bcrypt.hash("password123", 10);

      const admin = await prisma.user.create({
        data: {
          name: "Admin User",
          email: "admin@example.com",
          password: hashedPassword,
        },
      });

      console.log("Sample user created successfully!");
    }

    console.log("Database initialization completed.");
  } catch (error) {
    console.error("Database initialization failed:", error);
  }
}

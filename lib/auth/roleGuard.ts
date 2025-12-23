import { getCurrentUser } from "./getCurrentUser";
import { StaffRole } from "@prisma/client";

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user || user.role !== StaffRole.ADMIN) {
    throw new Error("Admin access required");
  }

  return user;
}

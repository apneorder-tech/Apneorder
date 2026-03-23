import prisma from "./prisma-new";

export enum AuditAction {
  UPDATE_UPI = "UPDATE_UPI",
  CREATE_CATEGORY = "CREATE_CATEGORY",
  UPDATE_CATEGORY = "UPDATE_CATEGORY",
  DELETE_CATEGORY = "DELETE_CATEGORY",
  CREATE_ITEM = "CREATE_ITEM",
  UPDATE_ITEM = "UPDATE_ITEM",
  DELETE_ITEM = "DELETE_ITEM",
  ADD_TABLE = "ADD_TABLE",
  DELETE_TABLE = "DELETE_TABLE",
  SAVE_ONBOARDING = "SAVE_ONBOARDING"
}

/**
 * Logs an administrative action to the database.
 * @param managerId - The ID of the authenticated manager performing the action.
 * @param action - The type of action performed (AuditAction).
 * @param resource - The type of resource affected (e.g., "Restaurant").
 * @param resourceId - The specific ID of the affected resource.
 * @param details - Optional JSON object containing change details (e.g., { oldUpi, newUpi }).
 */
export async function logAction(
  managerId: string,
  action: AuditAction,
  resource: string,
  resourceId?: string,
  details?: any
) {
  try {
    // We use a separate try-catch so that audit failures don't 
    // block the actual business logic from completing.
    await prisma.auditLog.create({
      data: {
        managerId,
        action,
        resource,
        resourceId,
        details: details ? JSON.parse(JSON.stringify(details)) : undefined,
      },
    });
  } catch (error) {
    console.error("Audit Log Failure:", error);
  }
}

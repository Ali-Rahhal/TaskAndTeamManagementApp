// utils/activityLogger.ts
import { prisma } from "../lib/prisma.js";

export const logActivity = async ({
  organizationId,
  entityType,
  entityId,
  action,
  performedBy,
  metadata,
}: {
  organizationId: number;
  entityType:
    | "TASK"
    | "PROJECT"
    | "MEMBER"
    | "INVITE"
    | "ORGANIZATION"
    | "TASKASSIGNEE"
    | "TASKCOMMENT"
    | "TASKATTACHMENT";
  entityId: number;
  action: string;
  performedBy: number;
  metadata?: string;
}) => {
  return prisma.activityLog.create({
    data: {
      organizationId,
      entityType,
      entityId,
      action,
      performedBy,
      metadata: metadata || null,
    },
  });
};

import { z } from "zod";

export const createNotificationSchema = z.object({
  userId: z.string({ message: "User ID is required" }),
  organizationId: z.string({ message: "Organization ID is required" }),
  title: z.string({ message: "Title is required" }),
  message: z.string({ message: "Message is required" }),
});

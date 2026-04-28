import { z } from "zod";

export const eventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  startDate: z.string(),
  endDate: z.string(),
});
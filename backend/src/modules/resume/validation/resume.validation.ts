import { z } from "zod";

export const updateResumeSchema = z.object({
  body: z.object({}).optional(),
});

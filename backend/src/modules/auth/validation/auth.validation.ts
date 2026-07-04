import { z } from "zod";

const strongPasswordSchema = z
  .string({ required_error: "Password is required" })
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[@$!%*?&]/, "Password must contain at least one special character (@, $, !, %, *, ?, &)");

export const registerSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Name is required" }).min(2, "Name must be at least 2 characters"),
    email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
    password: strongPasswordSchema,
    phone: z.string().optional(),
    profileImage: z.string().url("Profile image must be a valid URL").optional().or(z.literal("")),
    portfolio: z.string().url("Portfolio must be a valid URL").optional().or(z.literal("")),
    github: z.string().url("GitHub link must be a valid URL").optional().or(z.literal("")),
    linkedin: z.string().url("LinkedIn link must be a valid URL").optional().or(z.literal("")),
    role: z.enum(["USER", "ADMIN"]).optional(),
    preferredCommunication: z.enum(["email", "phone", "slack"]).optional(),
    followUpEnabled: z.boolean().optional(),
    followUpAfterDays: z.number().int().min(1, "Follow-up must be at least 1 day").optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
    password: z.string({ required_error: "Password is required" }),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    phone: z.string().optional(),
    profileImage: z.string().url("Profile image must be a valid URL").optional().or(z.literal("")),
    portfolio: z.string().url("Portfolio must be a valid URL").optional().or(z.literal("")),
    github: z.string().url("GitHub link must be a valid URL").optional().or(z.literal("")),
    linkedin: z.string().url("LinkedIn link must be a valid URL").optional().or(z.literal("")),
    preferredCommunication: z.enum(["email", "phone", "slack"]).optional(),
    followUpEnabled: z.boolean().optional(),
    followUpAfterDays: z.number().int().min(1, "Follow-up must be at least 1 day").optional(),
  }).strict("Password updates are not allowed via this endpoint"), // Strict mode ensures extra fields aren't supplied
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string({ required_error: "Current password is required" }),
    newPassword: strongPasswordSchema,
  }),
});

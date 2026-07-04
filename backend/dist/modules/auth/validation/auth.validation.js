"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.updateProfileSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const strongPasswordSchema = zod_1.z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character (@, $, !, %, *, ?, &)");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ required_error: "Name is required" }).min(2, "Name must be at least 2 characters"),
        email: zod_1.z.string({ required_error: "Email is required" }).email("Invalid email format"),
        password: strongPasswordSchema,
        phone: zod_1.z.string().optional(),
        profileImage: zod_1.z.string().url("Profile image must be a valid URL").optional().or(zod_1.z.literal("")),
        portfolio: zod_1.z.string().url("Portfolio must be a valid URL").optional().or(zod_1.z.literal("")),
        github: zod_1.z.string().url("GitHub link must be a valid URL").optional().or(zod_1.z.literal("")),
        linkedin: zod_1.z.string().url("LinkedIn link must be a valid URL").optional().or(zod_1.z.literal("")),
        role: zod_1.z.enum(["USER", "ADMIN"]).optional(),
        preferredCommunication: zod_1.z.enum(["email", "phone", "slack"]).optional(),
        followUpEnabled: zod_1.z.boolean().optional(),
        followUpAfterDays: zod_1.z.number().int().min(1, "Follow-up must be at least 1 day").optional(),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string({ required_error: "Email is required" }).email("Invalid email format"),
        password: zod_1.z.string({ required_error: "Password is required" }),
    }),
});
exports.updateProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, "Name must be at least 2 characters").optional(),
        phone: zod_1.z.string().optional(),
        profileImage: zod_1.z.string().url("Profile image must be a valid URL").optional().or(zod_1.z.literal("")),
        portfolio: zod_1.z.string().url("Portfolio must be a valid URL").optional().or(zod_1.z.literal("")),
        github: zod_1.z.string().url("GitHub link must be a valid URL").optional().or(zod_1.z.literal("")),
        linkedin: zod_1.z.string().url("LinkedIn link must be a valid URL").optional().or(zod_1.z.literal("")),
        preferredCommunication: zod_1.z.enum(["email", "phone", "slack"]).optional(),
        followUpEnabled: zod_1.z.boolean().optional(),
        followUpAfterDays: zod_1.z.number().int().min(1, "Follow-up must be at least 1 day").optional(),
    }).strict("Password updates are not allowed via this endpoint"), // Strict mode ensures extra fields aren't supplied
});
exports.changePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        currentPassword: zod_1.z.string({ required_error: "Current password is required" }),
        newPassword: strongPasswordSchema,
    }),
});

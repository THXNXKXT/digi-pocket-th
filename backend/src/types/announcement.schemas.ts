import { z } from "zod";

// Enum schemas
export const announcementTypeSchema = z.enum([
  "general",
  "promotion",
  "maintenance",
  "security",
  "product-update",
]);

export const announcementPrioritySchema = z.enum([
  "low",
  "normal",
  "high",
  "urgent",
]);

export const announcementStatusSchema = z.enum([
  "draft",
  "published",
  "archived",
  "deleted",
]);

// Request validation schemas
export const createAnnouncementSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be less than 200 characters"),
    content: z
      .string()
      .min(1, "Content is required")
      .max(10000, "Content must be less than 10,000 characters"),
    type: announcementTypeSchema.default("general"),
    priority: announcementPrioritySchema.default("normal"),
    publishAt: z
      .string()
      .datetime()
      .optional()
      .refine((date) => {
        if (!date) return true;
        return new Date(date) > new Date();
      }, "Publish date must be in the future"),
    expiresAt: z.string().datetime().optional(),
    isSticky: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.publishAt && data.expiresAt) {
        return new Date(data.publishAt) < new Date(data.expiresAt);
      }
      return true;
    },
    {
      message: "Expiry date must be after publish date",
      path: ["expiresAt"],
    }
  );

export const updateAnnouncementSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be less than 200 characters")
      .optional(),
    content: z
      .string()
      .min(1, "Content is required")
      .max(10000, "Content must be less than 10,000 characters")
      .optional(),
    type: announcementTypeSchema.optional(),
    priority: announcementPrioritySchema.optional(),
    publishAt: z
      .string()
      .datetime()
      .optional()
      .refine((date) => {
        if (!date) return true;
        return new Date(date) > new Date();
      }, "Publish date must be in the future"),
    expiresAt: z.string().datetime().optional(),
    isSticky: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.publishAt && data.expiresAt) {
        return new Date(data.publishAt) < new Date(data.expiresAt);
      }
      return true;
    },
    {
      message: "Expiry date must be after publish date",
      path: ["expiresAt"],
    }
  );

// Query parameter schemas
export const announcementFiltersSchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, "Page must be greater than 0")
    .default("1"),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100")
    .default("20"),
  priority: announcementPrioritySchema.optional(),
  type: announcementTypeSchema.optional(),
  status: announcementStatusSchema.optional(),
});

export const adminAnnouncementFiltersSchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, "Page must be greater than 0")
    .default("1"),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100")
    .default("20"),
  priority: announcementPrioritySchema.optional(),
  type: announcementTypeSchema.optional(),
  status: announcementStatusSchema.optional(),
});

// UUID parameter schema
export const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid announcement ID format"),
});

// Notification preferences schema
export const notificationPreferencesSchema = z.object({
  enableHighPriority: z.boolean().default(true),
  enableUrgent: z.boolean().default(true),
  enablePromotion: z.boolean().default(true),
  enableMaintenance: z.boolean().default(true),
});

// Export inferred types
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
export type AnnouncementFiltersInput = z.infer<
  typeof announcementFiltersSchema
>;
export type AdminAnnouncementFiltersInput = z.infer<
  typeof adminAnnouncementFiltersSchema
>;
export type UuidParamInput = z.infer<typeof uuidParamSchema>;
export type NotificationPreferencesInput = z.infer<
  typeof notificationPreferencesSchema
>;

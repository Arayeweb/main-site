import { z } from "zod";
import { canTransitionService } from "@/lib/growth-hub/services/status";
import type { GrowthHubServiceStatus } from "@/lib/growth-hub/database.types";

export const serviceStatusSchema = z.enum([
  "starting",
  "active",
  "in_progress",
  "waiting_on_client",
  "paused",
  "completed",
  "cancelled",
]);

export const milestoneStatusSchema = z.enum([
  "pending",
  "in_progress",
  "blocked",
  "completed",
  "skipped",
]);

export const createServiceFromTemplateSchema = z
  .object({
    workspace_id: z.string().uuid("شناسه فضای کاری نامعتبر است."),
    template_id: z.string().uuid("قالب خدمت نامعتبر است."),
    title: z
      .string()
      .trim()
      .min(2, "عنوان خدمت باید حداقل ۲ نویسه باشد.")
      .max(120, "عنوان خدمت بیش از حد طولانی است."),
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "تاریخ شروع نامعتبر است.")
      .optional()
      .or(z.literal("").transform(() => undefined)),
    due_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "تاریخ سررسید نامعتبر است.")
      .optional()
      .or(z.literal("").transform(() => undefined)),
  })
  .superRefine((val, ctx) => {
    if (val.start_date && val.due_date && val.due_date < val.start_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "تاریخ سررسید نمی‌تواند قبل از شروع باشد.",
        path: ["due_date"],
      });
    }
  });

export const updateServiceSchema = z
  .object({
    service_id: z.string().uuid("شناسه خدمت نامعتبر است."),
    expected_updated_at: z.string().min(1, "نسخه رکورد نامعتبر است."),
    status: serviceStatusSchema.optional(),
    latest_update: z.string().trim().max(2000).optional().nullable(),
    next_action: z.string().trim().max(500).optional().nullable(),
    waiting_reason: z.string().trim().max(500).optional().nullable(),
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .nullable()
      .or(z.literal("").transform(() => null)),
    due_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .nullable()
      .or(z.literal("").transform(() => null)),
    renewal_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .nullable()
      .or(z.literal("").transform(() => null)),
  })
  .superRefine((val, ctx) => {
    if (val.start_date && val.due_date && val.due_date < val.start_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "تاریخ سررسید نمی‌تواند قبل از شروع باشد.",
        path: ["due_date"],
      });
    }
    if (val.status === "waiting_on_client") {
      if (!val.waiting_reason || !val.waiting_reason.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "برای وضعیت «در انتظار شما» باید دلیل انتظار مشخص شود.",
          path: ["waiting_reason"],
        });
      }
      if (!val.next_action || !val.next_action.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "برای وضعیت «در انتظار شما» باید اقدام بعدی مشتری مشخص شود.",
          path: ["next_action"],
        });
      }
    }
    if (val.status === "completed" && val.next_action && val.next_action.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "خدمت تکمیل‌شده نباید اقدام آینده برای مشتری داشته باشد.",
        path: ["next_action"],
      });
    }
  });

export const updateMilestoneSchema = z.object({
  milestone_id: z.string().uuid("شناسه مرحله نامعتبر است."),
  service_id: z.string().uuid("شناسه خدمت نامعتبر است."),
  status: milestoneStatusSchema,
});

export type CreateServiceFromTemplateInput = z.infer<
  typeof createServiceFromTemplateSchema
>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;

/** Extra transition check used by mutations (after schema parse). */
export function assertServiceTransition(
  from: GrowthHubServiceStatus,
  to: GrowthHubServiceStatus,
): string | null {
  if (!canTransitionService(from, to)) {
    return "این تغییر وضعیت مجاز نیست.";
  }
  return null;
}

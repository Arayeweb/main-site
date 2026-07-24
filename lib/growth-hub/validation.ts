import { z } from "zod";
import { SLUG_PATTERN, SLUG_MIN, SLUG_MAX } from "@/lib/growth-hub/slug";
import {
  MIN_INVITE_EXPIRY_DAYS,
  MAX_INVITE_EXPIRY_DAYS,
  DEFAULT_INVITE_EXPIRY_DAYS,
} from "@/lib/growth-hub/constants";

// All mutation inputs pass through these schemas. Persian messages are safe to
// surface to users; detailed failures stay server-side.

export const uuidSchema = z.string().uuid("شناسه نامعتبر است.");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "ایمیل نامعتبر است.")
  .max(254, "ایمیل بیش از حد طولانی است.")
  .email("ایمیل نامعتبر است.");

export const workspaceNameSchema = z
  .string()
  .trim()
  .min(2, "نام فضای کاری باید حداقل ۲ نویسه باشد.")
  .max(80, "نام فضای کاری بیش از حد طولانی است.");

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(SLUG_MIN, "نشانی فضای کاری کوتاه است.")
  .max(SLUG_MAX, "نشانی فضای کاری بلند است.")
  .regex(SLUG_PATTERN, "نشانی فقط می‌تواند شامل حروف کوچک انگلیسی، عدد و خط تیره باشد.");

export const inviteRoleSchema = z.enum(["client_owner", "client_member"], {
  errorMap: () => ({ message: "نقش دعوت نامعتبر است." }),
});

export const memberRoleSchema = z.enum(
  ["client_owner", "client_member", "araaye_manager"],
  { errorMap: () => ({ message: "نقش عضو نامعتبر است." }) },
);

export const inviteExpiryDaysSchema = z.coerce
  .number()
  .int("مدت اعتبار نامعتبر است.")
  .min(MIN_INVITE_EXPIRY_DAYS, "مدت اعتبار خیلی کوتاه است.")
  .max(MAX_INVITE_EXPIRY_DAYS, "مدت اعتبار خیلی بلند است.")
  .default(DEFAULT_INVITE_EXPIRY_DAYS);

export const optionalUrlSchema = z
  .string()
  .trim()
  .max(300)
  .url("نشانی وب نامعتبر است.")
  .optional()
  .or(z.literal("").transform(() => undefined));

export const createWorkspaceSchema = z.object({
  name: workspaceNameSchema,
  slug: slugSchema,
  industry: z.string().trim().max(80).optional().or(z.literal("").transform(() => undefined)),
  website_url: optionalUrlSchema,
});

export const createInviteSchema = z.object({
  workspace_id: uuidSchema,
  phone: z
    .string()
    .trim()
    .min(10, "شماره موبایل نامعتبر است.")
    .max(20, "شماره موبایل نامعتبر است.")
    .refine((v) => /(\+98|0098|98|0)?9\d{9}/.test(v.replace(/[\s\-()]/g, "")), {
      message: "شماره موبایل نامعتبر است.",
    }),
  role: inviteRoleSchema,
  expiry_days: inviteExpiryDaysSchema,
});

export const createInviteEmailSchema = z.object({
  workspace_id: uuidSchema,
  email: emailSchema,
  role: inviteRoleSchema,
  expiry_days: inviteExpiryDaysSchema,
});

export const memberActionSchema = z.object({
  workspace_id: uuidSchema,
  member_id: uuidSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, "رمز عبور باید حداقل ۸ نویسه باشد.").max(200),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(10, "توکن دعوت نامعتبر است.").max(200),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type CreateInviteInput = z.infer<typeof createInviteSchema>;
export type CreateInviteEmailInput = z.infer<typeof createInviteEmailSchema>;
export type MemberActionInput = z.infer<typeof memberActionSchema>;
export type SignInInput = z.infer<typeof signInSchema>;

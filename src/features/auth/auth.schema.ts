import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please provide a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name must be under 50 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please provide a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
  role: z.enum(["TENANT", "LANDLORD"], {
    message: "Please select a valid role (Tenant or Landlord)",
  }),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[+0-9\s-]{7,15}$/.test(val),
      "Please enter a valid phone number"
    ),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

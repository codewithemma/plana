import { z } from "zod";

export const UserSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(30),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(3, { message: "Username must be atleast 3 characters long" }),
});

export const UserVerifySchema = z.object({
  quid: z.string().regex(/^[A-Za-z0-9+/=]*$/, "Invalid Base64 string"),
  otp: z.string().regex(/^\d{6}$/, "OTP must be a 6-digit string"),
});

export const UserForgotPassword = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

export const UserResetPassword = z.object({
  userId: z.string(),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(3, { message: "Username must be atleast 3 characters long" }),
});

export const UserLogin = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string(),
});

export const UserEmailUpdate = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

// USER VALIDATION

export const UserUpdate = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must not exceed 30 characters")
    .optional(),
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters")
    .optional(),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters")
    .optional(),
  phone: z
    .string()
    .regex(/^[0-9]{10,15}$/, "Phone must be 10 to 15 digits")
    .optional(),
  oldPassword: z
    .string()
    .min(6, "Old password must be at least 6 characters")
    .max(30, "Old password must not exceed 30 characters")
    .optional(),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters")
    .max(30, "New password must not exceed 30 characters")
    .optional(),
});

export const EmailUpdate = z.object({
  newEmail: z.string().email({ message: "Invalid email address" }),
});

// EVENT VALIDATION
export const Event = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description is too long"),
  eventType: z.string().min(1, "Event type is required"),
  location: z.string().min(1, "Location is required"),
  fee: z.string(),
  tags: z.string(),
  duration: z.string().min(1, "Duration is required"),
  date: z.string().refine((value) => !isNaN(Date.parse(value)), {
    message: "Invalid date format",
  }),
});

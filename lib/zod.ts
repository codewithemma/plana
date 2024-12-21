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
  uid: z.string().regex(/^[A-Za-z0-9+/=]*$/, "Invalid Base64 string"),
  otp: z.string().regex(/^\d{6}$/, "OTP must be a 6-digit string"),
});

export const UserForgotPassword = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

export const UserResetPassword = z.object({
  id: z.string(),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(3, { message: "Username must be atleast 3 characters long" }),
});

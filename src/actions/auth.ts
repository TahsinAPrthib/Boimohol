"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().trim().min(1, "নাম আবশ্যক।").max(80, "নাম অনেক বড়।"),
  username: z
    .string()
    .trim()
    .min(3, "ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে।")
    .max(30, "ইউজারনেম অনেক বড়।")
    .regex(/^[a-zA-Z0-9_]+$/, "ইউজারনেমে শুধু ইংরেজি অক্ষর, সংখ্যা ও আন্ডারস্কোর (_) ব্যবহার করা যাবে।"),
  email: z.string().trim().email("সঠিক ইমেইল ঠিকানা দিন।"),
  password: z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।"),
});

export type RegisterState = {
  success: boolean;
  message?: string;
  fieldErrors?: Partial<Record<"name" | "username" | "email" | "password", string>>;
};

export async function registerUser(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: RegisterState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<RegisterState["fieldErrors"]>;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { success: false, message: "ফর্মে কিছু তথ্য ঠিক নেই।", fieldErrors };
  }

  const { name, username, email, password } = parsed.data;

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    return {
      success: false,
      message: "এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট আছে।",
      fieldErrors: { email: "এই ইমেইলটি আগে থেকেই ব্যবহৃত হয়েছে।" },
    };
  }

  const existingUsername = await prisma.user.findUnique({ where: { username } });
  if (existingUsername) {
    return {
      success: false,
      message: "এই ইউজারনেমটি অন্য কেউ ব্যবহার করছে।",
      fieldErrors: { username: "এই ইউজারনেমটি আগে থেকেই নেওয়া হয়েছে।" },
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { name, username, email, passwordHash },
  });

  return { success: true, message: "অ্যাকাউন্ট তৈরি হয়েছে। এখন লগইন করুন।" };
}

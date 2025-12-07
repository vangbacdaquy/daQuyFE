"use server";

import { z } from "zod";
import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";

const FormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." })
    .trim(),
});

export type FormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string | null;
    }
  | undefined;

export async function login(prevState: FormState, formData: FormData) {
  const validatedFields = FormSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid fields. Failed to log in.",
    };
  }

  const { email, password } = validatedFields.data;

  // Here you would normally check the user's credentials against a database
  // For this example, we'll use a dummy user
  if (email === "user@example.com" && password === "password") {
    // If credentials are valid, create a session
    const userId = "dummy-user-id"; // Replace with actual user ID from your database
    await createSession(userId);
    redirect("/dashboard");
  } else {
    return { message: "Invalid email or password." };
  }
}

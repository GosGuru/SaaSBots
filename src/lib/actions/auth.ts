"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createSession, deleteSession } from "@/lib/session";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginFormData,
  type RegisterFormData,
  type ForgotPasswordFormData,
  type ResetPasswordFormData,
} from "@/lib/validations";

export type AuthState = {
  errors?: {
    email?: string[];
    password?: string[];
    full_name?: string[];
    confirmPassword?: string[];
  };
  message?: string;
  success?: boolean;
} | undefined;

/**
 * Sign up a new user
 */
export async function signup(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  // Validate form fields
  const validatedFields = registerSchema.safeParse({
    fullName: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password, fullName } = validatedFields.data;

  const supabase = await createClient();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return {
      message: error.message,
    };
  }

  if (data.user && data.session) {
    // User was created and logged in (if email confirmation is disabled)
    await createSession(data.user.id);
    redirect("/dashboard");
  }

  // Email confirmation required - redirect to verify page
  if (data.user) {
    redirect(`/verify-email?email=${encodeURIComponent(email)}`);
  }

  return {
    success: true,
    message: "Check your email to confirm your account.",
  };
}

/**
 * Sign in an existing user
 */
export async function login(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  // Validate form fields
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  const supabase = await createClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login error:", error.message, error.code);
    
    // Provide more specific error messages
    if (error.message.includes("Email not confirmed")) {
      return {
        message: "Please confirm your email before logging in. Check your inbox.",
      };
    }
    
    if (error.message.includes("Invalid login credentials")) {
      return {
        message: "Invalid email or password.",
      };
    }
    
    return {
      message: error.message,
    };
  }

  if (data.user) {
    // Create custom session
    await createSession(data.user.id);
    
    // Get redirect URL from form data or default to dashboard
    const redirectTo = formData.get("redirectTo") as string || "/dashboard";
    redirect(redirectTo);
  }

  return {
    message: "An unexpected error occurred.",
  };
}

/**
 * Sign out the current user
 */
export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await deleteSession();
  revalidatePath("/", "layout");
  redirect("/login");
}

/**
 * Request password reset email
 */
export async function forgotPassword(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const validatedFields = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email } = validatedFields.data;

  const supabase = await createClient();
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });

  if (error) {
    return {
      message: error.message,
    };
  }

  return {
    success: true,
    message: "Check your email for a password reset link.",
  };
}

/**
 * Reset password with token
 */
export async function resetPassword(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const validatedFields = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { password } = validatedFields.data;

  const supabase = await createClient();
  
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return {
      message: error.message,
    };
  }

  return {
    success: true,
    message: "Password updated successfully.",
  };
}

/**
 * Resend email confirmation (form action version)
 */
export async function resendConfirmation(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;

  if (!email) {
    return {
      message: "Email is required.",
    };
  }

  return resendConfirmationEmail(email);
}

/**
 * Resend email confirmation (direct call version)
 */
export async function resendConfirmationEmail(
  email: string
): Promise<{ success?: boolean; message?: string }> {
  if (!email) {
    return {
      message: "Email is required.",
    };
  }

  const supabase = await createClient();
  
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    console.error("Resend confirmation error:", error);
    return {
      message: error.message,
    };
  }

  return {
    success: true,
    message: "Confirmation email sent.",
  };
}

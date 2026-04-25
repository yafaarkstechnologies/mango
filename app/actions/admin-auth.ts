"use server";

import { cookies } from "next/headers";

export async function loginAdminAction(password: string) {
  const correctPassword = process.env.ADMIN_PASSWORD || "mango2026";

  if (password === correctPassword) {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "true", {
      path: "/",
      maxAge: 86400,
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    return { success: true };
  }

  return { success: false, error: "Incorrect password" };
}

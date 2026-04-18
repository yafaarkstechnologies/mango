"use server";

import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

// Initialize a server-side client
// We use the anon key here, but because it's on the server, we can verify the session ourselves
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function updateProductStockAction(id: string, updates: any) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_session")?.value === "true";

  if (!isAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  // NOTE: If RLS is still blocking this "authenticated" call from the server,
  // we would need the SERVICE_ROLE_KEY to bypass it entirely.
  // For now, we try with the standard client.
  const { error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("Server Action Error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

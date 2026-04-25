"use server";

import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAdmin() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_session")?.value === "true";
  return isAdmin;
}

export async function getAdminSettingsAction() {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

  const { data, error } = await supabase
    .from("admin_settings")
    .select("*");

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function updateAdminSettingAction(key: string, value: string) {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("admin_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() });

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin");
  return { success: true };
}

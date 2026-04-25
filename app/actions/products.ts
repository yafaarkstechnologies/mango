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

// Product Actions
export async function createProductAction(formData: any) {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

  const { data, error } = await supabase
    .from("products")
    .insert([{
      ...formData,
      is_active: formData.is_active ?? true
    }])
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  
  revalidatePath("/admin");
  return { success: true, data };
}

export async function updateProductAction(id: string, updates: any) {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin");
  return { success: true };
}

export async function deleteProductAction(id: string) {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

  // This will also delete options due to CASCADE
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin");
  return { success: true };
}

// Product Options Actions
export async function upsertProductOptionsAction(productId: string, options: any[]) {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

  // First, get existing options to see what to delete
  const { data: existing } = await supabase
    .from("product_options")
    .select("id")
    .eq("product_id", productId);

  const existingIds = existing?.map(o => o.id) || [];
  const incomingIds = options.filter(o => o.id).map(o => o.id);
  const idsToDelete = existingIds.filter(id => !incomingIds.includes(id));

  // Delete removed options
  if (idsToDelete.length > 0) {
    await supabase.from("product_options").delete().in("id", idsToDelete);
  }

  // Upsert incoming options
  const optionsToUpsert = options.map(o => ({
    ...o,
    product_id: productId
  }));

  const { error } = await supabase
    .from("product_options")
    .upsert(optionsToUpsert);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin");
  return { success: true };
}

export async function getProductWithOptionsAction(id: string) {
  const { data: product, error: pError } = await supabase
    .from("products")
    .select("*, product_options(*)")
    .eq("id", id)
    .single();

  if (pError) return { success: false, error: pError.message };
  return { success: true, data: product };
}

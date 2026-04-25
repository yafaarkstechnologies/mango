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

export async function getCouponsAction() {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function createCouponAction(formData: any) {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("coupons")
    .insert([formData]);

  if (error) return { success: false, error: error.message };
  
  revalidatePath("/admin");
  return { success: true };
}

export async function updateCouponAction(id: string, updates: any) {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("coupons")
    .update(updates)
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin");
  return { success: true };
}

export async function deleteCouponAction(id: string) {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("coupons")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin");
  return { success: true };
}

export async function toggleCouponStatusAction(id: string, field: "is_active" | "is_paused", currentVal: boolean) {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("coupons")
    .update({ [field]: !currentVal })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin");
  return { success: true };
}

export async function validateCouponAction(code: string, orderAmount: number) {
  const { data: coupon, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .eq("is_paused", false)
    .single();

  if (error || !coupon) {
    return { success: false, error: "Invalid or inactive coupon code" };
  }

  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
    return { success: false, error: "Coupon usage limit reached" };
  }

  if (orderAmount < (coupon.min_order_amount || 0)) {
    return { success: false, error: `Minimum order amount of ₹${coupon.min_order_amount} required` };
  }

  let discount = 0;
  if (coupon.discount_type === "percentage") {
    discount = (orderAmount * coupon.discount_value) / 100;
  } else {
    discount = coupon.discount_value;
  }

  return { 
    success: true, 
    data: {
      id: coupon.id,
      code: coupon.code,
      discount_amount: Math.min(discount, orderAmount),
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value
    }
  };
}

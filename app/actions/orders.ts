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

export async function getOrdersAction(limit = 100) {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function createManualOrderAction(orderData: any, items: any[]) {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

  // 1. Create the order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert([{
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      customer_phone: orderData.customer_phone,
      flat_no: orderData.flat_no,
      address_line_1: orderData.address_line_1,
      address_line_2: orderData.address_line_2,
      city: orderData.city,
      state: orderData.state,
      zip: orderData.zip,
      total_amount: orderData.total_amount,
      status: orderData.status || "paid",
      batch_id: orderData.batch_id || null,
      coupon_id: orderData.coupon_id || null,
      discount_amount: orderData.discount_amount || 0
    }])
    .select()
    .single();

  if (orderError) return { success: false, error: orderError.message };

  // 2. Create order items
  const itemsWithOrderId = items.map(item => ({
    ...item,
    order_id: order.id
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(itemsWithOrderId);

  if (itemsError) {
    // Cleanup order if items fail
    await supabase.from("orders").delete().eq("id", order.id);
    return { success: false, error: itemsError.message };
  }

  // 3. Update inventory & Coupon usage
  for (const item of items) {
    if (item.product_id) {
       const { data: product } = await supabase
        .from("products")
        .select("stock_quantity, track_inventory")
        .eq("id", item.product_id)
        .single();
       
       if (product && product.track_inventory) {
         const newStock = Math.max(0, (product.stock_quantity || 0) - item.quantity);
         await supabase
          .from("products")
          .update({ stock_quantity: newStock })
          .eq("id", item.product_id);
       }

       // Update batch stock if applicable
       if (orderData.batch_id) {
         const { data: batch } = await supabase
           .from("batches")
           .select("current_stock")
           .eq("id", orderData.batch_id)
           .single();
         
         if (batch) {
           const newBatchStock = Math.max(0, (batch.current_stock || 0) - item.quantity);
           await supabase
             .from("batches")
             .update({ current_stock: newBatchStock })
             .eq("id", orderData.batch_id);
         }
       }
    }
  }

  // 4. Increment coupon usage
  if (orderData.coupon_id) {
    const { data: coupon } = await supabase
      .from("coupons")
      .select("used_count")
      .eq("id", orderData.coupon_id)
      .single();
    
    if (coupon) {
      await supabase
        .from("coupons")
        .update({ used_count: (coupon.used_count || 0) + 1 })
        .eq("id", orderData.coupon_id);
    }
  }

  revalidatePath("/admin");
  return { success: true, data: order };
}

export async function updateOrderAction(id: string, updates: any) {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin");
  return { success: true };
}

export async function deleteOrderAction(id: string) {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin");
  return { success: true };
}

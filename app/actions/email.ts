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

async function getTransporter() {
  const nodemailer = (await import('nodemailer')).default;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function replacePlaceholders(text: string, data: any) {
  let result = text;
  const placeholders = {
    "{{customer_name}}": data.customer_name || "",
    "{{order_id}}": data.id || "",
    "{{order_id_short}}": data.id?.slice(0, 8) || "",
    "{{total_amount}}": data.total_amount?.toFixed(2) || "0.00",
    "{{order_items}}": data.order_items?.map((item: any) => `<li>${item.product_name} x ${item.quantity}</li>`).join('') || ""
  };

  for (const [key, value] of Object.entries(placeholders)) {
    result = result.replaceAll(key, value);
  }
  return result;
}

export async function sendOrderConfirmationAction(order: any) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP credentials are missing. Skipping email.");
    return;
  }

  try {
    const { data: template } = await supabase
      .from("email_templates")
      .select("*")
      .eq("name", "order_confirmation")
      .single();

    if (!template) throw new Error("Template not found");

    const subject = replacePlaceholders(template.subject, order);
    const html = replacePlaceholders(template.body, order);

    const transporter = await getTransporter();
    await transporter.sendMail({
      from: `"Mango G" <${process.env.SMTP_USER}>`,
      to: order.customer_email,
      subject,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
    return { success: false, error: "Failed to send email" };
  }
}

export async function sendShippingUpdateAction(order: any) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;

  try {
    const { data: template } = await supabase
      .from("email_templates")
      .select("*")
      .eq("name", "shipping_update")
      .single();

    if (!template) throw new Error("Template not found");

    const subject = replacePlaceholders(template.subject, order);
    const html = replacePlaceholders(template.body, order);

    const transporter = await getTransporter();
    await transporter.sendMail({
      from: `"Mango G" <${process.env.SMTP_USER}>`,
      to: order.customer_email,
      subject,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send shipping update email:", error);
    return { success: false, error: "Failed to send email" };
  }
}

// Admin Actions
export async function getEmailTemplatesAction() {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

  const { data, error } = await supabase
    .from("email_templates")
    .select("*")
    .order("name", { ascending: true });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function updateEmailTemplateAction(id: string, updates: any) {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("email_templates")
    .update({ 
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin");
  return { success: true };
}

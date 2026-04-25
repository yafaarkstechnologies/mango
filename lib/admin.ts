"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function getGlobalSettings() {
  const { data, error } = await supabase
    .from("admin_settings")
    .select("key, value");

  if (error) {
    console.error("Error fetching global settings:", error);
    return {
      harvest_year: "2026",
      shipping_rate: 45
    };
  }

  const settings: Record<string, string> = {};
  data?.forEach(s => {
    settings[s.key] = s.value;
  });

  return {
    harvest_year: settings.harvest_year || "2026",
    shipping_rate: parseFloat(settings.shipping_rate || "45")
  };
}

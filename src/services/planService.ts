import { supabase } from "../lib/supabase";

export interface FreePlan {
  id: string;
  name: string;
  description: string;
}

const FALLBACK_FREE_PLANS: FreePlan[] = [
  {
    id: "free-10",
    name: "10 Minutes",
    description: "Default session duration",
  },
  {
    id: "free-12",
    name: "12 Minutes",
    description: "I agree to share a short review video after the session",
  },
  {
    id: "free-20",
    name: "20 Minutes",
    description: "Short video review + Subscribe to YouTube channel",
  },
];

export async function fetchFreePlans(): Promise<FreePlan[]> {
  const { data, error } = await supabase
    .from("plans")
    .select("id, slug, name, tag, display_order, is_active, form_type")
    .eq("is_active", true)
    .eq("form_type", "free")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("fetchFreePlans error:", error.message, error);
    return FALLBACK_FREE_PLANS;
  }

  // Only fall back when DB returns nothing at all (e.g. table is empty / migration not run)
  if (!data || data.length === 0) {
    console.warn("No free plans found in DB — using fallback");
    return FALLBACK_FREE_PLANS;
  }

  return data.map((row: Record<string, unknown>) => ({
    id: row.slug as string,
    name: row.name as string,
    description: (row.tag as string | null) ?? "",
  }));
}

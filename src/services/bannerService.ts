import { supabase } from "../lib/supabase";

export interface BannerSettings {
  id: string;
  badge_text: string;
  headline: string;
  subtitle: string;
  pills: string[];
  image_url: string | null;
  session_note: string | null;
}

const FALLBACK: BannerSettings = {
  id: "fallback",
  badge_text: "Free 1-on-1 Session",
  headline: "Book Your Free IIT Session",
  subtitle: "Personalised guidance · Expert mentoring · Zero cost",
  pills: ["Free Session", "IIT Experts", "Personalised"],
  image_url: null,
  session_note: null,
};

export async function fetchBannerSettings(): Promise<BannerSettings> {
  const { data, error } = await supabase
    .from("banner_settings")
    .select("id, badge_text, headline, subtitle, pills, image_url, session_note")
    .limit(1)
    .maybeSingle();
  if (error || !data) return FALLBACK;
  return data as BannerSettings;
}

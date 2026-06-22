import { supabase } from "../lib/supabase";
import {
  getSessionToken,
  getStoredEnrollmentId,
  setStoredEnrollmentId,
} from "../lib/session";
import type { FreeFormData } from "../app/components/types";

function buildRemarks(form: FreeFormData): string {
  const parts: string[] = [];
  if (form.preferredTime) parts.push(`Preferred time: ${form.preferredTime}`);
  if (form.comments.trim()) parts.push(`Comments: ${form.comments.trim()}`);
  return parts.join("\n");
}

export async function saveFreeEnrollmentStep(step: number, form: FreeFormData): Promise<string> {
  const sessionToken = getSessionToken();
  const enrollmentId = getStoredEnrollmentId();

  async function call(id: string | null): Promise<string> {
    const { data, error } = await supabase.rpc("save_enrollment_step", {
      p_session_token: sessionToken,
      p_enrollment_id: id,
      p_step: step,
      p_full_name: form.fullName || null,
      p_email: form.email,
      p_whatsapp: form.whatsapp || null,
      p_plan_slug: form.planId || null,
      p_utr_number: null,
      p_target_colleges: form.colleges.length ? form.colleges : null,
      p_referral_source: form.referralSource || null,
      p_referral_other: form.referralOther || null,
      p_remarks: buildRemarks(form) || null,
    });
    if (error) throw error;
    return data as string;
  }

  try {
    const newId = await call(enrollmentId);
    setStoredEnrollmentId(newId);
    return newId;
  } catch (err) {
    const msg = typeof err === "object" && err && "message" in err
      ? String((err as Record<string, unknown>).message)
      : err instanceof Error ? err.message : JSON.stringify(err);

    console.error("[saveFreeEnrollmentStep] error:", msg);

    if (enrollmentId && (msg.toLowerCase().includes("not found") || msg.toLowerCase().includes("already submitted"))) {
      sessionStorage.removeItem("free_enroll_id");
      setStoredEnrollmentId("");
      const newId = await call(null);
      setStoredEnrollmentId(newId);
      return newId;
    }
    throw err;
  }
}

export async function submitFreeEnrollment(): Promise<void> {
  const sessionToken = getSessionToken();
  const enrollmentId = getStoredEnrollmentId();

  if (!enrollmentId) {
    const { data } = await supabase
      .from("enrollments")
      .select("id")
      .eq("session_token", sessionToken)
      .eq("status", "in_progress")
      .maybeSingle();
    if (!data?.id) throw new Error("No enrollment in progress");
    setStoredEnrollmentId(data.id);
    await submitRpc(data.id, sessionToken);
    return;
  }
  await submitRpc(enrollmentId, sessionToken);
}

async function submitRpc(enrollmentId: string, sessionToken: string) {
  const { error } = await supabase.rpc("submit_enrollment", {
    p_session_token: sessionToken,
    p_enrollment_id: enrollmentId,
  });
  if (error) {
    if (error.message?.includes("DUPLICATE_SUBMISSION")) throw new Error("DUPLICATE_SUBMISSION");
    if (error.message?.toLowerCase().includes("not found") || error.message?.toLowerCase().includes("already submitted")) {
      sessionStorage.removeItem("free_enroll_id");
      setStoredEnrollmentId("");
      throw new Error("Session expired. Please refresh and try again.");
    }
    throw error;
  }
}

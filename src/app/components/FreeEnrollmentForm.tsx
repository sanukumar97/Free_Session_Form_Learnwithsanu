import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User, Mail, Phone, ChevronLeft, Check,
  Loader2, MessageCircle, AlertCircle, Clock, Send,
} from "lucide-react";
import { toast } from "sonner";
import { FreeFormData, IIT_OPTIONS, REFERRAL_OPTIONS, TIME_SLOTS } from "./types";
import { fetchFreePlans, type FreePlan } from "../../services/planService";
import { saveFreeEnrollmentStep, submitFreeEnrollment } from "../../services/enrollmentService";
import { clearEnrollmentSession } from "../../lib/session";
import { fetchBannerSettings, type BannerSettings } from "../../services/bannerService";

const PRIMARY = "#132BFC";

const INITIAL: FreeFormData = {
  fullName: "", email: "", whatsapp: "", planId: "",
  colleges: [], referralSource: "", referralOther: "",
  preferredTime: "", comments: "",
};

const STEPS = ["Personal Details", "Session Type", "Details & Book"];

function useSaved<T>(key: string, init: T) {
  const [v, setV] = useState<T>(() => {
    try {
      const s = sessionStorage.getItem(key);
      return s ? JSON.parse(s) : init;
    } catch { return init; }
  });
  const set = (val: T | ((p: T) => T)) => {
    setV(prev => {
      const next = typeof val === "function" ? (val as (p: T) => T)(prev) : val;
      sessionStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  };
  return [v, set] as const;
}

const slide = {
  enter: (d: number) => ({ x: d > 0 ? 30 : -30, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (d: number) => ({ x: d > 0 ? -30 : 30, opacity: 0 }),
};

// ── Field wrapper ──────────────────────────────────────────────────────────────
function Field({ label, error, icon, children }: {
  label: string; error?: string; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5" style={{ color: "#0D0F2B" }}>
        {label}
      </label>
      <div className="flex items-center gap-3 px-4 rounded-xl border"
        style={{
          background: "white",
          borderColor: error ? "#EF4444" : "rgba(19,43,252,0.15)",
          boxShadow: "0 1px 4px rgba(19,43,252,0.06)",
        }}>
        <span style={{ color: error ? "#EF4444" : PRIMARY, flexShrink: 0 }}>{icon}</span>
        {children}
      </div>
      {error && (
        <p className="flex items-center gap-1 mt-1 text-xs" style={{ color: "#EF4444" }}>
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

// ── Banner (page 1) ────────────────────────────────────────────────────────────
function Banner({ banner }: { banner: BannerSettings | null }) {
  const b = banner ?? {
    badge_text: "Free 1-on-1 Session",
    headline: "Book Your Free IIT Session",
    subtitle: "Personalised guidance · Expert mentoring · Zero cost",
    pills: ["Free Session", "IIT Experts", "Personalised"],
    image_url: null,
  };
  return (
    <div className="rounded-2xl overflow-hidden mb-6"
      style={{ minHeight: "18vh", background: "linear-gradient(135deg,#0a1adc 0%,#132BFC 55%,#4f46e5 100%)", position: "relative" }}>
      {/* Decorative circles */}
      <div style={{ position:"absolute", top:-30, right:-20, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }}/>
      <div style={{ position:"absolute", bottom:-20, right:40, width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }}/>
      <div style={{ position:"absolute", top:10, left:-10, width:60, height:60, borderRadius:"50%", background:"rgba(255,255,255,0.06)" }}/>

      {/* Right-side image */}
      {b.image_url && (
        <img src={b.image_url} alt="" aria-hidden
          style={{ position:"absolute", right:16, top:"50%", transform:"translateY(-50%)", width:120, height:120, borderRadius:20, objectFit:"cover" }}
        />
      )}

      <div className="relative flex flex-col justify-center h-full px-6 py-5"
        style={{ paddingRight: b.image_url ? 152 : undefined }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🎓</span>
          <span className="text-white/80 text-sm font-medium">{b.badge_text}</span>
        </div>
        <p className="font-bold text-lg leading-snug" style={{ color: "white" }}>{b.headline}</p>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.75)" }}>{b.subtitle}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {b.pills.filter(p => p.trim()).map(p => (
            <span key={p} className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ background: "rgba(255,255,255,0.18)", color: "white" }}>{p}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step 0: Personal Details ───────────────────────────────────────────────────
function StepPersonal({ form, errors, update, banner }: {
  form: FreeFormData;
  errors: Partial<Record<keyof FreeFormData, string>>;
  update: (f: keyof FreeFormData, v: string) => void;
  banner: BannerSettings | null;
}) {
  return (
    <div>
      <Banner banner={banner} />
      <h2 className="text-2xl font-bold mb-1" style={{ color: "#0D0F2B" }}>Let's get started 👋</h2>
      <p className="text-sm mb-6" style={{ color: "#6B7280" }}>Fill in your basic details to begin.</p>
      <div className="flex flex-col gap-4">
        <Field label="Full Name" error={errors.fullName} icon={<User size={16} />}>
          <input className="fi" placeholder="Your full name"
            value={form.fullName} onChange={e => update("fullName", e.target.value)} />
        </Field>
        <Field label="Email Address" error={errors.email} icon={<Mail size={16} />}>
          <input className="fi" type="email" placeholder="you@email.com"
            value={form.email} onChange={e => update("email", e.target.value)} />
        </Field>
        <Field label="WhatsApp Number" error={errors.whatsapp} icon={<Phone size={16} />}>
          <input className="fi" type="tel" placeholder="10-digit number"
            value={form.whatsapp} onChange={e => update("whatsapp", e.target.value)} />
        </Field>
        <p className="flex items-center gap-1.5 text-xs" style={{ color: "#6B7280" }}>
          🔒 Your info is secure and never shared.
        </p>
      </div>
    </div>
  );
}

// ── Step 1: Session Type ───────────────────────────────────────────────────────
const DEFAULT_SESSION_NOTE = "Default session is 10 minutes. Extend to 12 minutes by sharing a short video review, or extend to 20 minutes by sharing a short video review & subscribing to our YouTube channel for IITJ & IITH preparation updates.";

function StepPlan({ form, errors, update, plans, sessionNote }: {
  form: FreeFormData;
  errors: Partial<Record<keyof FreeFormData, string>>;
  update: (f: keyof FreeFormData, v: string) => void;
  plans: FreePlan[];
  sessionNote?: string | null;
}) {
  const planDescriptions: Record<string, string> = {
    "free-10": "Default session duration",
    "free-12": "I agree to share a short review video after the session",
    "free-20": "Short video review + Subscribe to YouTube channel",
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1" style={{ color: "#0D0F2B" }}>Choose your session 📅</h2>
      <p className="text-sm mb-5" style={{ color: "#6B7280" }}>Select the session duration that works for you.</p>

      <div className="flex flex-col gap-3 mb-5">
        {plans.map(plan => {
          const selected = form.planId === plan.id;
          const desc = planDescriptions[plan.id] ?? plan.description;
          return (
            <button key={plan.id} type="button"
              onClick={() => update("planId", plan.id)}
              className="w-full text-left rounded-2xl border-2 px-5 py-4 transition-all"
              style={{
                borderColor: selected ? PRIMARY : "rgba(19,43,252,0.15)",
                background: selected ? "rgba(19,43,252,0.05)" : "white",
                boxShadow: selected
                  ? "0 0 0 3px rgba(19,43,252,0.12)"
                  : "0 1px 4px rgba(19,43,252,0.06)",
              }}>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                  style={{ borderColor: selected ? PRIMARY : "#D1D5DB" }}>
                  {selected && (
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: PRIMARY }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2">
                    <p className="font-bold text-base" style={{ color: "#0D0F2B" }}>{plan.name}</p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(5,150,105,0.1)", color: "#059669", border: "1px solid rgba(5,150,105,0.25)" }}>
                      {plan.id}
                    </span>
                  </div>
                  <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>{desc}</p>
                </div>
                {plan.id === "free-10" && (
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0"
                    style={{ background: "#E8FFF6", color: "#008963" }}>Default</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {errors.planId && (
        <p className="flex items-center gap-1 mb-4 text-xs" style={{ color: "#EF4444" }}>
          <AlertCircle size={11} /> Please select a session type
        </p>
      )}

      <div className="rounded-xl px-4 py-3 text-xs leading-relaxed"
        style={{ background: "#FFF8E6", color: "#92620A", border: "1px solid #FFE4A0" }}>
        <span className="font-semibold">📌 Note: </span>
        {sessionNote?.trim() || DEFAULT_SESSION_NOTE}
      </div>
    </div>
  );
}

// ── Step 2: Details + Submit ───────────────────────────────────────────────────
function StepDetails({ form, errors, update }: {
  form: FreeFormData;
  errors: Partial<Record<keyof FreeFormData, string>>;
  update: (f: keyof FreeFormData, v: string | string[]) => void;
}) {
  const toggleCollege = (id: string) => {
    const cur = form.colleges;
    if (cur.includes(id)) {
      update("colleges", cur.filter(c => c !== id));
    } else if (cur.length < 3) {
      update("colleges", [...cur, id]);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1" style={{ color: "#0D0F2B" }}>A few more details 📌</h2>
      <p className="text-sm mb-6" style={{ color: "#6B7280" }}>Help us personalise your experience.</p>

      {/* IIT Targeting */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold" style={{ color: "#0D0F2B" }}>
            Which IITs are you targeting?
          </label>
          <span className="text-xs font-medium" style={{ color: PRIMARY }}>
            {form.colleges.length}/3
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {IIT_OPTIONS.map(iit => {
            const sel = form.colleges.includes(iit.id);
            return (
              <button key={iit.id} type="button" onClick={() => toggleCollege(iit.id)}
                className="rounded-xl py-2.5 px-2 text-xs font-medium transition-all text-center"
                style={{
                  background: sel ? PRIMARY : "white",
                  color: sel ? "white" : "#374151",
                  border: `1.5px solid ${sel ? PRIMARY : "rgba(19,43,252,0.15)"}`,
                  boxShadow: sel ? "0 2px 8px rgba(19,43,252,0.2)" : "0 1px 3px rgba(0,0,0,0.05)",
                }}>
                {sel && <Check size={11} className="inline mr-1" />}{iit.label}
              </button>
            );
          })}
        </div>
        {errors.colleges && (
          <p className="flex items-center gap-1 mt-1 text-xs" style={{ color: "#EF4444" }}>
            <AlertCircle size={11} /> Select at least one IIT
          </p>
        )}
      </div>

      {/* Referral */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2" style={{ color: "#0D0F2B" }}>
          How did you find us?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {REFERRAL_OPTIONS.map(opt => {
            const sel = form.referralSource === opt.id;
            return (
              <button key={opt.id} type="button"
                onClick={() => update("referralSource", opt.id)}
                className="rounded-xl py-2.5 px-2 text-xs font-medium transition-all text-center"
                style={{
                  background: sel ? PRIMARY : "white",
                  color: sel ? "white" : "#374151",
                  border: `1.5px solid ${sel ? PRIMARY : "rgba(19,43,252,0.15)"}`,
                  boxShadow: sel ? "0 2px 8px rgba(19,43,252,0.2)" : "0 1px 3px rgba(0,0,0,0.05)",
                }}>
                {opt.emoji} {opt.label}
              </button>
            );
          })}
        </div>
        {form.referralSource === "others" && (
          <Field label="" error={undefined} icon={<MessageCircle size={16} />}>
            <input className="fi" placeholder="Please specify…"
              value={form.referralOther} onChange={e => update("referralOther", e.target.value)} />
          </Field>
        )}
      </div>

      {/* Preferred Time */}
      <div className="mb-5">
        <label className="block text-sm font-semibold mb-1.5" style={{ color: "#0D0F2B" }}>
          Preferred Session Time
        </label>
        <div className="relative">
          <Clock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: PRIMARY }} />
          <select
            value={form.preferredTime}
            onChange={e => update("preferredTime", e.target.value)}
            className="w-full rounded-xl border pl-10 pr-4 py-3 text-sm appearance-none"
            style={{
              background: "white",
              borderColor: errors.preferredTime ? "#EF4444" : "rgba(19,43,252,0.15)",
              color: form.preferredTime ? "#0D0F2B" : "#6B7280",
              boxShadow: "0 1px 4px rgba(19,43,252,0.06)",
              outline: "none",
            }}>
            <option value="">Select a time slot…</option>
            {TIME_SLOTS.map(slot => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "#6B7280" }}>▾</div>
        </div>
        {errors.preferredTime && (
          <p className="flex items-center gap-1 mt-1 text-xs" style={{ color: "#EF4444" }}>
            <AlertCircle size={11} /> Please select your preferred time slot
          </p>
        )}
      </div>

      {/* Comments */}
      <div className="mb-5">
        <label className="block text-sm font-semibold mb-1.5" style={{ color: "#0D0F2B" }}>
          Comments <span className="font-normal text-xs" style={{ color: "#6B7280" }}>(optional)</span>
        </label>
        <textarea
          rows={3}
          placeholder="Anything you'd like us to know before the session…"
          value={form.comments}
          onChange={e => update("comments", e.target.value)}
          className="w-full rounded-xl border px-4 py-3 text-sm resize-none"
          style={{
            background: "white",
            borderColor: "rgba(19,43,252,0.15)",
            color: "#0D0F2B",
            boxShadow: "0 1px 4px rgba(19,43,252,0.06)",
            outline: "none",
          }}
        />
      </div>

    </div>
  );
}

// ── Thank You ──────────────────────────────────────────────────────────────────
function ThankYou({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen px-4"
      style={{ background: "var(--background)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm rounded-3xl overflow-hidden"
        style={{ boxShadow: "0 8px 40px rgba(19,43,252,0.15)" }}>

        {/* Top gradient band */}
        <div className="px-8 pt-10 pb-8 text-center"
          style={{ background: "linear-gradient(135deg,#132BFC 0%,#3B4FE8 100%)" }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(255,255,255,0.2)" }}>
            <Check size={32} strokeWidth={2.5} style={{ color: "white" }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "white" }}>Thank You!</h2>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
            Hey {name || "there"}, your session request has been received.
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-6" style={{ background: "white" }}>
          <p className="text-sm text-center mb-6" style={{ color: "#6B7280" }}>
            We will connect back with you to confirm your session details.
          </p>

          {/* WhatsApp CTA */}
          <a href="https://wa.me/919390715011"
            target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm mb-4 transition-all active:scale-[0.98]"
            style={{ background: "#25D366", color: "white", boxShadow: "0 4px 14px rgba(37,211,102,0.35)" }}>
            <MessageCircle size={16} /> Chat on WhatsApp · 939 071 5011
          </a>

          {/* Telegram */}
          <a href="https://t.me/LearnWithSanu"
            target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-[0.98]"
            style={{ background: "#E8EDFF", color: PRIMARY }}>
            ✈️ Join Telegram · @LearnWithSanu
          </a>

        </div>
      </motion.div>
    </div>
  );
}

// ── Main Form ──────────────────────────────────────────────────────────────────
export function FreeEnrollmentForm() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [form, setForm] = useSaved<FreeFormData>("free_enroll_v1", INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FreeFormData, string>>>({});
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [plans, setPlans] = useState<FreePlan[]>([]);
  const [banner, setBanner] = useState<BannerSettings | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchFreePlans().then(setPlans).catch(() => toast.error("Could not load session options."));
    fetchBannerSettings().then(setBanner).catch(() => {});
  }, []);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const update = (field: keyof FreeFormData, value: string | string[]) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FreeFormData, string>> = {};
    if (step === 0) {
      if (!form.fullName.trim()) e.fullName = "Required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
      if (!/^\+?[\d\s\-]{8,15}$/.test(form.whatsapp)) e.whatsapp = "Enter a valid number";
    }
    if (step === 1 && !form.planId) e.planId = "Required";
    if (step === 2) {
      if (form.colleges.length === 0) e.colleges = "Required";
      if (!form.preferredTime) e.preferredTime = "Required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const go = async (d: 1 | -1) => {
    if (d === 1 && !validate()) return;
    if (d === 1) {
      setSaving(true);
      try {
        await saveFreeEnrollmentStep(step, form);
      } catch {
        toast.error("Could not save progress. Please try again.");
        setSaving(false);
        return;
      }
      setSaving(false);
    }
    setDir(d);
    setStep(s => s + d);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await saveFreeEnrollmentStep(2, form);
      await submitFreeEnrollment();
      clearEnrollmentSession();
      setDone(true);
    } catch (e) {
      const msg = e instanceof Error && e.message === "DUPLICATE_SUBMISSION"
        ? "A booking with this email already exists."
        : "Booking failed. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) return <ThankYou name={form.fullName} />;

  const isLast = step === STEPS.length - 1;

  return (
    <div className="flex flex-col" style={{ minHeight: "100dvh", background: "var(--background)" }}>

      {/* ── Header ── */}
      <header style={{
        background: "white",
        borderBottom: "1px solid rgba(19,43,252,0.1)",
        position: "sticky", top: 0, zIndex: 30,
      }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 py-3">
            <img src="/logo_for_form .png" alt="LearnWithSanu"
              style={{ height: 36, width: "auto", objectFit: "contain" }} />
            <div className="ml-auto shrink-0 text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ background: PRIMARY, color: "white" }}>
              {step + 1}/{STEPS.length}
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-1 rounded-full overflow-hidden mb-2.5"
            style={{ background: "rgba(19,43,252,0.08)" }}>
            <motion.div className="h-1 rounded-full" style={{ background: PRIMARY }}
              initial={false}
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }} />
          </div>
          {/* Step dots + label */}
          <div className="flex items-center justify-between pb-2.5">
            <span className="text-xs font-semibold" style={{ color: PRIMARY }}>{STEPS[step]}</span>
            <div className="flex items-center gap-1">
              {STEPS.map((_, i) => (
                <motion.div key={i}
                  animate={{ width: i === step ? 20 : 6, background: i <= step ? PRIMARY : "#e0e0f0" }}
                  transition={{ duration: 0.25 }}
                  style={{ height: 6, borderRadius: 999 }} />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div ref={bodyRef} className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-5 pb-32">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div key={step} custom={dir} variants={slide}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.18, ease: "easeOut" }}>
              {step === 0 && <StepPersonal form={form} errors={errors} update={update} banner={banner} />}
              {step === 1 && <StepPlan form={form} errors={errors} update={update} plans={plans} sessionNote={banner?.session_note} />}
              {step === 2 && (
                <StepDetails
                  form={form} errors={errors}
                  update={update as (f: keyof FreeFormData, v: string | string[]) => void}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Footer nav (hidden on last step — submit button is inline) ── */}
      {!isLast && (
        <div className="fixed bottom-0 left-0 right-0 z-20"
          style={{ background: "white", borderTop: "1px solid rgba(19,43,252,0.08)", padding: "12px 16px 20px" }}>
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            {step > 0 && (
              <button type="button" onClick={() => go(-1)} disabled={saving}
                className="flex items-center gap-1.5 px-5 py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-95"
                style={{
                  background: "white", color: "#374151",
                  border: "1.5px solid rgba(19,43,252,0.15)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}>
                <ChevronLeft size={15} /> Back
              </button>
            )}
            <button type="button" onClick={() => go(1)} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-[0.98]"
              style={{
                background: saving ? "#93A3FE" : PRIMARY,
                color: "white",
                boxShadow: "0 4px 16px rgba(19,43,252,0.3)",
                cursor: saving ? "not-allowed" : "pointer",
              }}>
              {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <>Continue →</>}
            </button>
          </div>
        </div>
      )}

      {/* ── Submit footer (last step) ── */}
      {isLast && (
        <div className="fixed bottom-0 left-0 right-0 z-20"
          style={{ background: "white", borderTop: "1px solid rgba(19,43,252,0.08)", padding: "12px 16px 20px" }}>
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <button type="button" onClick={() => go(-1)} disabled={submitting}
              className="flex items-center gap-1.5 px-5 py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-95"
              style={{
                background: "white", color: "#374151",
                border: "1.5px solid rgba(19,43,252,0.15)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}>
              <ChevronLeft size={15} /> Back
            </button>
            <button type="button" onClick={handleSubmit} disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-[0.98]"
              style={{
                background: submitting ? "#93A3FE" : PRIMARY,
                color: "white",
                boxShadow: "0 4px 16px rgba(19,43,252,0.3)",
                cursor: submitting ? "not-allowed" : "pointer",
              }}>
              {submitting
                ? <><Loader2 size={16} className="animate-spin" /> Booking…</>
                : <><Send size={16} /> Book My Free Session</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

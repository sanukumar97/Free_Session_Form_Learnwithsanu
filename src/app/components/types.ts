export interface FreeFormData {
  fullName: string;
  email: string;
  whatsapp: string;
  planId: string;
  colleges: string[];
  referralSource: string;
  referralOther: string;
  preferredTime: string;
  comments: string;
}

export const IIT_OPTIONS = [
  { id: "IIT-Bombay", label: "IIT Bombay" },
  { id: "IIT-Delhi", label: "IIT Delhi" },
  { id: "IIT-Hyderabad", label: "IIT Hyderabad" },
  { id: "IIT-Jodhpur", label: "IIT Jodhpur" },
  { id: "IIT-Roorkee", label: "IIT Roorkee" },
  { id: "IIT-Gandhinagar", label: "IIT Gandhinagar" },
];

export const REFERRAL_OPTIONS = [
  { id: "youtube", label: "YouTube",     emoji: "▶️" },
  { id: "ai",      label: "AI Platform", emoji: "🤖" },
  { id: "blog",    label: "Your Blog",   emoji: "✍️" },
  { id: "reddit",  label: "Reddit",      emoji: "🔴" },
  { id: "others",  label: "Others",      emoji: "💬" },
];

export const TIME_SLOTS = [
  "9:00 am – 3:00 pm",
  "5:00 pm – 10:00 pm",
];

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
  { id: "iit-bombay",     label: "IIT Bombay" },
  { id: "iit-delhi",      label: "IIT Delhi" },
  { id: "iit-hyderabad",  label: "IIT Hyderabad" },
  { id: "iit-jodhpur",    label: "IIT Jodhpur" },
  { id: "iit-roorkee",    label: "IIT Roorkee" },
  { id: "iit-gandhinagar",label: "IIT Gandhinagar" },
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

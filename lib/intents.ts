export type Intent =
  | "booking_request"
  | "pricing_query"
  | "treatment_question"
  | "emergency"
  | "post_treatment_care"
  | "hours_location"
  | "insurance_payment"
  | "general";

export const INTENT_COLORS: Record<Intent, string> = {
  booking_request: "#2563EB",     // Blue
  emergency: "#DC2626",           // Red
  pricing_query: "#059669",       // Green
  treatment_question: "#7C3AED",  // Purple
  post_treatment_care: "#D97706", // Amber/Orange
  hours_location: "#6B7280",      // Gray
  insurance_payment: "#0D9488",   // Teal
  general: "#9CA3AF"              // Light Gray
};

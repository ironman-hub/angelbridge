// Shared option lists and reference data used across forms, scoring and admin.

export const SITUATION_TYPES = [
  "Vehicle breakdown",
  "Public transport disruption",
  "Lost wallet or belongings",
  "Accommodation problem",
  "Medical appointment delay",
  "Domestic emergency",
  "Waiting for roadside recovery",
  "Waiting for family/friend",
  "Waiting for emergency accommodation",
  "Other",
] as const;

export const NEED_OPTIONS = [
  "Food",
  "Drinking Water",
  "Warm Clothing",
  "Phone Charging",
  "Transport",
  "Fuel",
  "Temporary Safe Place",
  "Emotional Support",
  "Toiletries",
  "Baby Supplies",
  "Medication Collection",
  "Information",
  "Other",
] as const;

export const HAVE_OPTIONS = [
  "Mobile Phone",
  "Phone Battery",
  "Internet",
  "Money",
  "Bank Card",
  "Food",
  "Water",
  "Warm Clothing",
  "Safe Place",
  "Transport",
] as const;

export const OTHERS_WITH_OPTIONS = [
  "Child",
  "Elderly Person",
  "Disabled Person",
  "Pregnant Woman",
  "Pet",
  "Other Adult",
] as const;

export const CONTACTED_OPTIONS = [
  "Family",
  "Friend",
  "Roadside Assistance",
  "Police",
  "NHS",
  "Local Authority",
  "Housing Service",
  "Homeless Outreach",
  "Social Worker",
  "Breakdown Company",
  "Other",
] as const;

export const WAIT_OPTIONS = [
  "Less than 30 minutes",
  "30–60 minutes",
  "1–2 hours",
  "2–6 hours",
  "More than 6 hours",
  "Unknown",
] as const;

export const MONEY_OPTIONS = [
  "None",
  "Less than £10",
  "£10–£50",
  "More than £50",
  "Prefer not to say",
] as const;

export const DONATION_TIERS = [
  { amount: 10, label: "£10", blurb: "Food and water for someone stranded" },
  { amount: 25, label: "£25", blurb: "A family emergency pack" },
  { amount: 50, label: "£50", blurb: "Keeps one response van on the road for an hour" },
  { amount: 250, label: "£250", blurb: "Equips a volunteer team for a week" },
  { amount: 1000, label: "£1,000", blurb: "Sponsors emergency supplies for an entire month" },
] as const;

export const CASE_STATUSES = [
  "Pending",
  "Approved",
  "Declined",
  "Escalated",
  "Closed",
] as const;

export const RISK_BANDS = ["Green", "Amber", "Red"] as const;

// Which needs map to which inventory SKUs (used to auto-generate the volunteer pick list).
export const NEED_TO_SKU: Record<string, string[]> = {
  Food: ["FOOD-SANDWICH", "FOOD-BAR"],
  "Drinking Water": ["WATER-500"],
  "Warm Clothing": ["CLOTH-HOODIE", "CLOTH-SOCKS"],
  "Phone Charging": ["TECH-USBC", "TECH-POWERBANK"],
  Transport: [],
  Fuel: ["VEH-FUEL"],
  "Temporary Safe Place": [],
  "Emotional Support": [],
  Toiletries: ["HYG-KIT"],
  "Baby Supplies": ["BABY-FORMULA", "BABY-NAPPY"],
  "Medication Collection": [],
  Information: [],
};

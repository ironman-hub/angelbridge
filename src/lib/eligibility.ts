// ---------------------------------------------------------------------------
// Angel Bridge eligibility + risk-scoring engine
//
// This merges the brief's "7-question gate" and the long assessment form into a
// SINGLE comprehensive assessment. The seven eligibility criteria below are the
// scored questions; the rest of the form feeds the risk / vulnerability scores.
//
// Design principle from the brief: PREVENT MISUSE WITHOUT UNFAIRLY EXCLUDING
// PEOPLE WHO GENUINELY NEED HELP. So only the four "in scope for Angel Bridge"
// criteria can make someone ineligible. Concerns about repeat use or identity
// escalate a case to a human — they do not auto-reject it.
// ---------------------------------------------------------------------------

import { isInPilotArea } from "./geo";

export type AssessmentInput = {
  situationType: string;
  description: string;
  needs: string[];
  have: string[];
  isSafe: boolean;
  isInjured: boolean;
  hasOthers: boolean;
  othersWith: string[];
  contactedHelp: boolean;
  contactedWho: string[];
  waitingFor?: string | null;
  estimatedWait?: string | null;
  moneyAvailable?: string | null;
  canBuyFood: boolean;
  safeTonight: boolean;
  previousHelp: boolean;
  currentLat?: number | null;
  currentLng?: number | null;
  gpsVerified: boolean;
  idVerified: boolean;
  emailVerified: boolean;
  // History (from previous cases for this user, computed by the caller):
  requestsLast30Days: number;
  requestsLast90Days: number;
  sameDeviceOtherAccounts: number;
};

export type CriterionResult = {
  key: string;
  question: string;
  passed: boolean;
  essential: boolean; // essential criteria can make a request ineligible
  detail: string;
};

export type Assessment = {
  eligible: boolean;
  criteria: CriterionResult[];
  fraudRiskScore: number; // 0–100, higher = more suspicious
  vulnerabilityScore: number; // 0–100, higher = more vulnerable
  priorityScore: number; // 0–100, higher = serve sooner
  riskBand: "Green" | "Amber" | "Red";
  pathway: "standard" | "enhanced" | "referral";
  recommendedStatus: "Approved" | "Pending" | "Escalated" | "Declined";
  reasons: string[];
};

const IN_SCOPE_NEEDS = new Set([
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
]);

const RECOGNISED_SITUATIONS = new Set([
  "Vehicle breakdown",
  "Public transport disruption",
  "Lost wallet or belongings",
  "Accommodation problem",
  "Medical appointment delay",
  "Domestic emergency",
  "Waiting for roadside recovery",
  "Waiting for family/friend",
  "Waiting for emergency accommodation",
]);

const VULNERABLE_COMPANIONS = new Set([
  "Child",
  "Elderly Person",
  "Disabled Person",
  "Pregnant Woman",
]);

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function assess(input: AssessmentInput): Assessment {
  const criteria: CriterionResult[] = [];

  // 1 — Genuine immediate need (essential)
  const genuineNeed =
    RECOGNISED_SITUATIONS.has(input.situationType) ||
    (input.situationType === "Other" && input.description.trim().length >= 20);
  criteria.push({
    key: "genuine_need",
    question: "Are you facing a genuine, unexpected situation you cannot resolve alone right now?",
    passed: genuineNeed,
    essential: true,
    detail: genuineNeed
      ? `Recognised situation: ${input.situationType}`
      : "Situation not recognised as an emergency and too little detail provided",
  });

  // 2 — Temporary crisis (essential): bridging a gap, not an ongoing need
  const temporary =
    Boolean(input.waitingFor && input.waitingFor.trim()) ||
    input.contactedHelp ||
    (input.estimatedWait != null && input.estimatedWait !== "");
  criteria.push({
    key: "temporary_crisis",
    question: "Is this a temporary crisis — you are waiting for help, recovery, transport or accommodation?",
    passed: temporary,
    essential: true,
    detail: temporary
      ? "Waiting on a resolving event — Angel Bridge bridges the gap"
      : "No resolving event identified; may need long-term support instead",
  });

  // 3 — Existing support contacted (NOT essential; 'where possible' per policy)
  criteria.push({
    key: "support_contacted",
    question: "Have you already contacted the appropriate service or a family member where possible?",
    passed: input.contactedHelp,
    essential: false,
    detail: input.contactedHelp
      ? `Contacted: ${input.contactedWho.join(", ") || "yes"}`
      : "No existing service contacted yet",
  });

  // 4 — Immediate need within Angel Bridge's scope (essential)
  const inScope = input.needs.some((n) => IN_SCOPE_NEEDS.has(n));
  criteria.push({
    key: "immediate_scope",
    question: "Do you need immediate practical help Angel Bridge can provide (food, water, warmth, charging, transport, hygiene, information)?",
    passed: inScope,
    essential: true,
    detail: inScope
      ? `Requested: ${input.needs.join(", ")}`
      : "No requested need falls within Angel Bridge's immediate-support scope",
  });

  // 5 — Identity (NOT essential; alternatives allowed)
  const identityOk = input.emailVerified;
  criteria.push({
    key: "identity",
    question: "Can we verify your identity (verified account, and optionally photo ID)?",
    passed: identityOk,
    essential: false,
    detail: `${input.emailVerified ? "Email verified" : "Email not verified"}${
      input.idVerified ? ", photo ID provided" : ""
    }`,
  });

  // 6 — Location verified & within the current service area (essential)
  const inArea = isInPilotArea(input.currentLat, input.currentLng);
  criteria.push({
    key: "location",
    question: "Is your location within our current service area (the Manchester pilot)?",
    passed: inArea,
    essential: true,
    detail: inArea
      ? `Inside pilot area${input.gpsVerified ? " (GPS verified)" : ""}`
      : "Outside the current pilot service area",
  });

  // 7 — Repeat-request check (NOT essential; drives the support pathway)
  const pathway: Assessment["pathway"] =
    input.requestsLast90Days > 5
      ? "referral"
      : input.requestsLast90Days >= 3
      ? "enhanced"
      : "standard";
  criteria.push({
    key: "repeat_check",
    question: "How often have you requested help recently?",
    passed: pathway !== "referral",
    essential: false,
    detail:
      `${input.requestsLast90Days} request(s) in 90 days, ${input.requestsLast30Days} in 30 days — ` +
      (pathway === "standard"
        ? "standard assessment"
        : pathway === "enhanced"
        ? "enhanced review of underlying needs"
        : "refer to partner agency while still considering a genuine immediate crisis"),
  });

  const essentialsMet = criteria.filter((c) => c.essential).every((c) => c.passed);

  // --- Vulnerability score (0–100) -----------------------------------------
  let vuln = 0;
  if (!input.isSafe) vuln += 30;
  if (input.isInjured) vuln += 20;
  if (!input.safeTonight) vuln += 15;
  if (!input.canBuyFood) vuln += 10;
  if (input.moneyAvailable === "None") vuln += 12;
  else if (input.moneyAvailable === "Less than £10") vuln += 8;
  if (input.hasOthers && input.othersWith.some((o) => VULNERABLE_COMPANIONS.has(o)))
    vuln += 18;
  if (input.needs.includes("Medication Collection")) vuln += 8;
  if (input.needs.includes("Baby Supplies")) vuln += 8;
  const vulnerabilityScore = clamp(vuln);

  // --- Fraud / misuse score (0–100) ----------------------------------------
  let fraud = 0;
  fraud += Math.min(30, input.requestsLast30Days * 12);
  fraud += Math.min(20, Math.max(0, input.requestsLast90Days - 2) * 6);
  fraud += Math.min(20, input.sameDeviceOtherAccounts * 10);
  if (!input.gpsVerified) fraud += 10;
  if (!input.emailVerified) fraud += 10;
  if (!inArea) fraud += 15;
  // Internal inconsistency: claims plenty of money/resources yet requests basics.
  if (
    input.moneyAvailable === "More than £50" &&
    input.needs.some((n) => ["Food", "Drinking Water", "Fuel"].includes(n))
  )
    fraud += 8;
  const fraudRiskScore = clamp(fraud);

  // --- Priority score (0–100): serve the vulnerable & urgent, discount risk --
  let urgency = 0;
  if (input.estimatedWait === "More than 6 hours") urgency += 20;
  else if (input.estimatedWait === "2–6 hours") urgency += 14;
  else if (input.estimatedWait === "1–2 hours") urgency += 8;
  if (!input.isSafe) urgency += 20;
  if (input.isInjured) urgency += 10;
  const priorityScore = clamp(
    0.6 * vulnerabilityScore + urgency - 0.4 * fraudRiskScore
  );

  // --- Risk band -----------------------------------------------------------
  let riskBand: Assessment["riskBand"];
  if (fraudRiskScore >= 60 || pathway === "referral") riskBand = "Red";
  else if (fraudRiskScore >= 30 || pathway === "enhanced" || !input.gpsVerified)
    riskBand = "Amber";
  else riskBand = "Green";

  // --- Recommended status --------------------------------------------------
  const reasons: string[] = [];
  let recommendedStatus: Assessment["recommendedStatus"];
  if (!essentialsMet) {
    recommendedStatus = "Declined";
    criteria
      .filter((c) => c.essential && !c.passed)
      .forEach((c) => reasons.push(c.detail));
  } else if (riskBand === "Red") {
    recommendedStatus = "Escalated";
    reasons.push(
      pathway === "referral"
        ? "Frequent requests — escalate to a caseworker / partner agency."
        : "Elevated misuse indicators — human review before dispatch."
    );
  } else if (riskBand === "Amber") {
    recommendedStatus = "Pending";
    reasons.push("Some concerns or repeat use — manual review recommended.");
  } else {
    recommendedStatus = "Approved";
    reasons.push("Low risk and clearly in scope — approve and dispatch.");
  }

  return {
    eligible: essentialsMet,
    criteria,
    fraudRiskScore,
    vulnerabilityScore,
    priorityScore,
    riskBand,
    pathway,
    recommendedStatus,
    reasons,
  };
}

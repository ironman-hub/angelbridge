import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handler, ok, fail } from "@/lib/api";
import { assess } from "@/lib/eligibility";
import { isInPilotArea } from "@/lib/validation";
import { audit } from "@/lib/audit";
import { NEED_TO_SKU } from "@/lib/constants";

const caseSchema = z.object({
  situationType: z.string().min(1),
  description: z.string().min(10, "Please describe what happened (at least 10 characters)"),
  incidentAt: z.string().min(1),
  currentAddress: z.string().min(3),
  currentPostcode: z.string().min(3),
  currentLat: z.number().nullable().optional(),
  currentLng: z.number().nullable().optional(),
  destinationAddress: z.string().min(2),
  gpsVerified: z.boolean().default(false),
  needs: z.array(z.string()).default([]),
  have: z.array(z.string()).default([]),
  isSafe: z.boolean().default(true),
  unsafeReason: z.string().optional().default(""),
  isInjured: z.boolean().default(false),
  hasOthers: z.boolean().default(false),
  othersWith: z.array(z.string()).default([]),
  contactedHelp: z.boolean().default(false),
  contactedWho: z.array(z.string()).default([]),
  waitingFor: z.string().optional().default(""),
  estimatedWait: z.string().optional().default(""),
  moneyAvailable: z.string().optional().default(""),
  canBuyFood: z.boolean().default(false),
  safeTonight: z.boolean().default(false),
  previousHelp: z.boolean().default(false),
  idVerified: z.boolean().default(false),
  declarationTrue: z.literal(true, { errorMap: () => ({ message: "You must confirm the declaration" }) }),
  consent: z.literal(true, { errorMap: () => ({ message: "Consent is required to process your request" }) }),
});

export const POST = handler(async (req: NextRequest) => {
  const sessionUser = await requireUser();
  const dbUser = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!dbUser) return fail("Account not found", 404);
  if (!dbUser.emailVerified) return fail("Please verify your email before requesting help", 403);

  const data = caseSchema.parse(await req.json());

  // Repeat-request history
  const now = Date.now();
  const d30 = new Date(now - 30 * 864e5);
  const d90 = new Date(now - 90 * 864e5);
  const [reqs30, reqs90, sameDevice] = await Promise.all([
    prisma.case.count({ where: { userId: dbUser.id, createdAt: { gte: d30 } } }),
    prisma.case.count({ where: { userId: dbUser.id, createdAt: { gte: d90 } } }),
    dbUser.deviceFingerprint
      ? prisma.user.count({
          where: { deviceFingerprint: dbUser.deviceFingerprint, id: { not: dbUser.id } },
        })
      : Promise.resolve(0),
  ]);

  const inArea = isInPilotArea(data.currentLat, data.currentLng);

  const result = assess({
    situationType: data.situationType,
    description: data.description,
    needs: data.needs,
    have: data.have,
    isSafe: data.isSafe,
    isInjured: data.isInjured,
    hasOthers: data.hasOthers,
    othersWith: data.othersWith,
    contactedHelp: data.contactedHelp,
    contactedWho: data.contactedWho,
    waitingFor: data.waitingFor,
    estimatedWait: data.estimatedWait,
    moneyAvailable: data.moneyAvailable,
    canBuyFood: data.canBuyFood,
    safeTonight: data.safeTonight,
    previousHelp: data.previousHelp,
    currentLat: data.currentLat,
    currentLng: data.currentLng,
    gpsVerified: data.gpsVerified,
    idVerified: data.idVerified,
    emailVerified: dbUser.emailVerified,
    requestsLast30Days: reqs30,
    requestsLast90Days: reqs90,
    sameDeviceOtherAccounts: sameDevice,
  });

  const count = await prisma.case.count();
  const caseNumber = `AB-${1001 + count}`;
  // Simple ETA heuristic for the "help is coming" tracker.
  const etaMinutes = result.recommendedStatus === "Approved" ? 15 + Math.round(Math.random() * 20) : null;

  const created = await prisma.case.create({
    data: {
      caseNumber,
      userId: dbUser.id,
      situationType: data.situationType,
      description: data.description,
      incidentAt: new Date(data.incidentAt),
      currentAddress: data.currentAddress,
      currentPostcode: data.currentPostcode,
      currentLat: data.currentLat ?? null,
      currentLng: data.currentLng ?? null,
      destinationAddress: data.destinationAddress,
      gpsVerified: data.gpsVerified,
      inPilotArea: inArea,
      needs: JSON.stringify(data.needs),
      have: JSON.stringify(data.have),
      isSafe: data.isSafe,
      unsafeReason: data.unsafeReason,
      isInjured: data.isInjured,
      hasOthers: data.hasOthers,
      othersWith: JSON.stringify(data.othersWith),
      contactedHelp: data.contactedHelp,
      contactedWho: JSON.stringify(data.contactedWho),
      waitingFor: data.waitingFor,
      estimatedWait: data.estimatedWait,
      moneyAvailable: data.moneyAvailable,
      canBuyFood: data.canBuyFood,
      safeTonight: data.safeTonight,
      previousHelp: data.previousHelp,
      idVerified: data.idVerified,
      eligible: result.eligible,
      eligibilityResult: JSON.stringify(result),
      fraudRiskScore: result.fraudRiskScore,
      vulnerabilityScore: result.vulnerabilityScore,
      priorityScore: result.priorityScore,
      riskBand: result.riskBand,
      pathway: result.pathway,
      status: result.recommendedStatus,
      etaMinutes,
    },
  });

  // Timeline events
  const events = [
    { type: "created", message: "Help request submitted" },
    {
      type: "assessed",
      message: `Assessed automatically: ${result.riskBand} / ${result.recommendedStatus}${
        result.pathway !== "standard" ? ` (${result.pathway} pathway)` : ""
      }`,
    },
  ];
  if (result.recommendedStatus === "Approved") {
    events.push({ type: "dispatched", message: `Nearest response van notified — estimated arrival ${etaMinutes} min` });
  }
  await prisma.caseEvent.createMany({
    data: events.map((e) => ({ ...e, caseId: created.id })),
  });

  // Generate the volunteer pick list + decrement stock for approved cases.
  if (result.recommendedStatus === "Approved") {
    const skus = Array.from(new Set(data.needs.flatMap((n) => NEED_TO_SKU[n] ?? [])));
    for (const sku of skus) {
      const item = await prisma.inventoryItem.findUnique({ where: { sku } });
      if (item && item.quantity > 0) {
        await prisma.inventoryItem.update({ where: { sku }, data: { quantity: { decrement: 1 } } });
        await prisma.inventoryMovement.create({
          data: { itemId: item.id, delta: -1, reason: `Dispatched to ${caseNumber}`, caseId: created.id },
        });
      }
    }
  }

  await audit(dbUser.email, "case_created", created.id, `${result.riskBand}/${result.recommendedStatus}`);

  return ok({ ok: true, id: created.id, caseNumber, status: created.status, riskBand: result.riskBand });
});

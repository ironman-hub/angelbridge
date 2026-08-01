import { prisma } from "./db";
import { parseArr } from "./format";

export type ImpactMetrics = {
  peopleHelped: number;
  childrenAssisted: number;
  olderPeopleSupported: number;
  averageResponseMins: number | null;
  foodPacksDistributed: number;
  blanketsProvided: number;
  chargingSessions: number;
  safeTransportArranged: number;
  referralsToPartners: number;
  volunteerHours: number;
  geographicCoverage: number;
  totalRequests: number;
};

/**
 * Impact metrics are DERIVED from real case + inventory + volunteer data so the
 * numbers on the public page and in funding reports are always evidence-backed.
 */
export async function computeImpact(): Promise<ImpactMetrics> {
  const served = await prisma.case.findMany({
    where: { status: { in: ["Approved", "Closed"] } },
  });

  let children = 0;
  let older = 0;
  let charging = 0;
  let transport = 0;
  let etaSum = 0;
  let etaCount = 0;
  const areas = new Set<string>();

  for (const c of served) {
    const others = parseArr(c.othersWith);
    if (others.includes("Child")) children += 1;
    if (others.includes("Elderly Person")) older += 1;
    const needs = parseArr(c.needs);
    if (needs.includes("Phone Charging")) charging += 1;
    if (needs.includes("Transport")) transport += 1;
    if (c.etaMinutes != null) {
      etaSum += c.etaMinutes;
      etaCount += 1;
    }
    if (c.currentPostcode) areas.add(c.currentPostcode.trim().split(" ")[0].toUpperCase());
  }

  const [foodMoves, blanketMoves, referrals, volunteerAgg, totalRequests] = await Promise.all([
    prisma.inventoryMovement.aggregate({
      _sum: { delta: true },
      where: { item: { zone: "Food & Nutrition" }, delta: { lt: 0 } },
    }),
    prisma.inventoryMovement.aggregate({
      _sum: { delta: true },
      where: { item: { sku: "WINTER-BLANKET" }, delta: { lt: 0 } },
    }),
    prisma.case.count({ where: { pathway: "referral" } }),
    prisma.volunteer.aggregate({ _sum: { hoursLogged: true } }),
    prisma.case.count(),
  ]);

  return {
    peopleHelped: served.length,
    childrenAssisted: children,
    olderPeopleSupported: older,
    averageResponseMins: etaCount ? Math.round(etaSum / etaCount) : null,
    foodPacksDistributed: Math.abs(foodMoves._sum.delta ?? 0),
    blanketsProvided: Math.abs(blanketMoves._sum.delta ?? 0),
    chargingSessions: charging,
    safeTransportArranged: transport,
    referralsToPartners: referrals,
    volunteerHours: volunteerAgg._sum.hoursLogged ?? 0,
    geographicCoverage: areas.size,
    totalRequests,
  };
}

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Angel Bridge Foundation …");

  // Clean slate (dev only)
  await prisma.caseEvent.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.case.deleteMany();
  await prisma.session.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.volunteer.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.sponsorship.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  const pw = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@angelbridge.org",
      passwordHash: pw,
      fullName: "Angel Bridge Admin",
      phone: "01612000000",
      role: "admin",
      emailVerified: true,
    },
  });

  const alex = await prisma.user.create({
    data: {
      email: "alex@example.com",
      passwordHash: pw,
      fullName: "Alex Rivers",
      phone: "07700900123",
      role: "user",
      emailVerified: true,
    },
  });

  const vol = await prisma.user.create({
    data: {
      email: "sam@angelbridge.org",
      passwordHash: pw,
      fullName: "Sam Okoro",
      phone: "07700900456",
      role: "volunteer",
      emailVerified: true,
    },
  });

  // --- Inventory (SKUs align with NEED_TO_SKU in src/lib/constants.ts) ------
  const inventory: Array<[string, string, string, string, number, number]> = [
    ["WATER-500", "Bottled Water 500ml", "Food & Nutrition", "bottle", 120, 24],
    ["FOOD-SANDWICH", "Sandwich", "Food & Nutrition", "pack", 40, 10],
    ["FOOD-BAR", "Protein Bar", "Food & Nutrition", "bar", 90, 20],
    ["HYG-KIT", "Hygiene Grab Bag", "Hygiene Kits", "kit", 35, 8],
    ["CLOTH-HOODIE", "Hoodie", "Clothing", "item", 22, 5],
    ["CLOTH-SOCKS", "Socks (pair)", "Clothing", "pair", 60, 12],
    ["WINTER-BLANKET", "Blanket", "Winter Survival", "item", 30, 6],
    ["WINTER-THERMAL", "Emergency Thermal Blanket", "Winter Survival", "item", 50, 10],
    ["BABY-FORMULA", "Infant Formula", "Baby & Family", "tin", 18, 4],
    ["BABY-NAPPY", "Nappies (pack)", "Baby & Family", "pack", 25, 5],
    ["TECH-USBC", "USB-C Charging Cable", "Phone & Technology", "cable", 40, 8],
    ["TECH-POWERBANK", "Portable Power Bank", "Phone & Technology", "item", 15, 4],
    ["VEH-FUEL", "Emergency Fuel Can", "Vehicle Assistance", "can", 8, 2],
    ["VEH-JUMP", "Jump Starter", "Vehicle Assistance", "item", 4, 1],
    ["MED-FIRSTAID", "First Aid Kit", "Medical & Wellbeing", "kit", 12, 3],
  ];
  for (const [sku, name, zone, unit, quantity, reorderLevel] of inventory) {
    await prisma.inventoryItem.create({
      data: { sku, name, zone, unit, quantity, reorderLevel },
    });
  }

  await prisma.donation.createMany({
    data: [
      { donorName: "Priya S.", donorEmail: "priya@example.com", amountPence: 2500, tier: "£25", message: "Keep up the great work!" },
      { donorName: "Anonymous", donorEmail: "anon@example.com", amountPence: 1000, tier: "£10" },
      { donorName: "Manchester Rotary", donorEmail: "rotary@example.com", amountPence: 100000, tier: "£1,000", message: "Proud to support the pilot." },
    ],
  });

  // --- Vehicles ------------------------------------------------------------
  await prisma.vehicle.createMany({
    data: [
      { name: "Response Van 1", reg: "MA24 ABF", type: "Rapid Response", status: "available", baseLat: 53.4808, baseLng: -2.2426 },
      { name: "Family Support Van", reg: "MA24 FSV", type: "Family Support", status: "maintenance", baseLat: 53.4839, baseLng: -2.2446 },
    ],
  });

  // --- Sample closed cases (fuel the impact metrics) -----------------------
  const closedCase = await prisma.case.create({
    data: {
      caseNumber: "AB-1001",
      userId: alex.id,
      situationType: "Public transport disruption",
      description: "Last train cancelled at Piccadilly with two young children, no phone battery.",
      incidentAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
      currentAddress: "Manchester Piccadilly Station",
      currentPostcode: "M1 2QF",
      currentLat: 53.4775,
      currentLng: -2.2311,
      destinationAddress: "Salford, M6",
      gpsVerified: true,
      inPilotArea: true,
      needs: JSON.stringify(["Food", "Drinking Water", "Warm Clothing", "Phone Charging", "Transport", "Baby Supplies"]),
      have: JSON.stringify(["Mobile Phone"]),
      isSafe: true,
      isInjured: false,
      hasOthers: true,
      othersWith: JSON.stringify(["Child"]),
      contactedHelp: true,
      contactedWho: JSON.stringify(["Family", "Local Authority"]),
      waitingFor: "Family member driving from Bolton",
      estimatedWait: "2–6 hours",
      moneyAvailable: "Less than £10",
      canBuyFood: false,
      safeTonight: true,
      previousHelp: false,
      idVerified: true,
      eligible: true,
      eligibilityResult: "{}",
      fraudRiskScore: 8,
      vulnerabilityScore: 61,
      priorityScore: 55,
      riskBand: "Green",
      pathway: "standard",
      status: "Closed",
      assignedVolunteerId: vol.id,
      etaMinutes: 18,
      outcome: "Provided food, water, blankets, phone charging and safe transport. Referred to housing advice.",
      caseNotes: "Mother + 2 children. All needs met on scene.",
    },
  });

  await prisma.caseEvent.createMany({
    data: [
      { caseId: closedCase.id, type: "created", message: "Help request submitted" },
      { caseId: closedCase.id, type: "assessed", message: "Assessed: Green / Approved" },
      { caseId: closedCase.id, type: "assigned", message: "Assigned to Sam Okoro (Response Van 1)" },
      { caseId: closedCase.id, type: "dispatched", message: "Van dispatched, ETA 18 min" },
      { caseId: closedCase.id, type: "arrived", message: "Volunteer arrived on scene" },
      { caseId: closedCase.id, type: "closed", message: "Case closed, all needs met" },
    ],
  });

  // Record the inventory that was used, so stock + impact reflect it.
  const usage: Array<[string, number]> = [
    ["WATER-500", -4],
    ["FOOD-SANDWICH", -2],
    ["WINTER-BLANKET", -2],
    ["TECH-USBC", -1],
    ["BABY-FORMULA", -1],
  ];
  for (const [sku, delta] of usage) {
    const item = await prisma.inventoryItem.findUnique({ where: { sku } });
    if (item) {
      await prisma.inventoryMovement.create({
        data: { itemId: item.id, delta, reason: "Dispatched to case AB-1001", caseId: closedCase.id },
      });
    }
  }

  // --- Volunteers ----------------------------------------------------------
  await prisma.volunteer.createMany({
    data: [
      { fullName: "Sam Okoro", email: "sam@angelbridge.org", phone: "07700900456", postcode: "M3 4LZ", availability: "Weekend evenings", skills: "First aid, driving", status: "active", hoursLogged: 46 },
      { fullName: "Grace Bennett", email: "grace@example.com", phone: "07700900789", postcode: "M14 6HR", availability: "Weekday evenings", skills: "Safeguarding", status: "active", hoursLogged: 32 },
    ],
  });

  // --- Testimonials --------------------------------------------------------
  await prisma.testimonial.createMany({
    data: [
      { authorName: "Alex R.", location: "Manchester Piccadilly", story: "Stranded with my two kids after the last train was cancelled. Angel Bridge arrived with food, blankets and charged my phone, then arranged safe transport. I can't thank them enough.", rating: 5, approved: true, userId: alex.id },
      { authorName: "Daniel M.", location: "Oxford Road", story: "My car broke down and recovery was hours away. A volunteer brought fuel and a hot drink and waited with me. Genuinely restored my faith in people.", rating: 5, approved: true },
      { authorName: "Fatima K.", location: "Salford", story: "Lost my wallet and phone on a night out. They helped me get home safely and gave me information for the police report.", rating: 5, approved: false },
    ],
  });

  // --- Partners ------------------------------------------------------------
  await prisma.partner.createMany({
    data: [
      { orgName: "Wood Street Mission", contactName: "J. Adams", email: "partners@example.org", phone: "01612000111", partnerType: "Referral partner", message: "Happy to take family referrals.", status: "active" },
    ],
  });

  console.log("Seed complete.");
  console.log("Admin login:     admin@angelbridge.org / password123");
  console.log("Sample user:     alex@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

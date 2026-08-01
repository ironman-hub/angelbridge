# Angel Bridge Foundation

> *Help that arrives while you wait.*

A full-stack MVP for **Angel Bridge Foundation** (working title *Stranded*) — a non-profit
community response platform that bridges the gap between a crisis and the help that's
already on its way. It provides immediate practical support (food, water, warmth, phone
charging, safe transport) to people stranded, dispatched from a mobile response unit while
longer-term services are en route. Piloting in **Manchester**.

This repository is a working, runnable web application (mobile-first, installable as a PWA)
covering the core of the product: accounts, a merged eligibility + risk-scoring assessment,
an Uber-style "help is coming" tracker, a public transparency feed, automatic impact
metrics, testimonials, donations, and a full admin portal.

---

## Tech stack

| Layer     | Choice |
| --------- | ------ |
| Framework | Next.js 14 (App Router, React 18, TypeScript) — one codebase for web + mobile web/PWA |
| Styling   | Tailwind CSS (mobile-first, responsive) |
| Database  | Prisma ORM + PostgreSQL (free tier: Neon, Supabase, or Vercel Postgres) |
| Auth      | Email/password with hashed passwords (bcrypt), DB-backed sessions, email verification |
| Validation| Zod, with UK phone + UK postcode validators and a Manchester geofence |

---

## Quick start

Requires Node.js 18+ and a free PostgreSQL database (e.g. https://neon.tech).
**To put the site online, see [`DEPLOY.md`](./DEPLOY.md).**

```bash
npm install
cp .env.example .env        # set DATABASE_URL to your Postgres connection string
npm run setup               # prisma generate + db push + seed
npm run dev                 # http://localhost:3000
```

`npm run setup` seeds demo data and prints login details:

- **Admin:** `admin@angelbridge.org` / `password123`
- **Applicant:** `alex@example.com` / `password123`

> **Email verification in dev:** there is no SMTP service wired up in the MVP. When you
> register, the verification link is printed to the server console *and* shown on the
> "check your email" screen so you can verify immediately.

Other scripts: `npm run build`, `npm run start`, `npm run typecheck`, `npm run db:reset`.

---

## What's implemented

### Applicant journey
- **Accounts** — register / log in, email-verified before requesting help, UK phone validation, device fingerprint captured for duplicate-account detection.
- **Request help** — one comprehensive assessment (situation, GPS + manual UK address, immediate needs, safety, existing help contacted, resources, previous assistance, declaration & consent) with a privacy/confidentiality reassurance and "Use my current location".
- **Eligibility + risk scoring** — see below.
- **Live tracker** — an Uber-style screen showing status, ETA and a live-updating timeline ("help is coming"), including clear messaging when a request is declined or escalated to a caseworker.
- **Dashboard** — the applicant's past requests and statuses.

### Public / donor-facing
- **Home** — mission, value proposition ("we don't replace existing services"), live headline metrics, donation tiers.
- **Transparency** — live inventory stock levels with low-stock flags, so supporters can see exactly what the van carries.
- **Impact** — twelve metrics (people helped, children assisted, older people supported, average response time, food packs, blankets, charging sessions, safe transport, referrals, volunteer hours, geographic coverage) **derived automatically** from real case/inventory/volunteer data — the evidence funders ask for.
- **Stories** — public testimonials, plus a form for helped people to submit theirs (published after a moderation check).
- **Donate** — the five donation tiers (£10 → £1,000) with tangible impact copy; records the donation. *(Payment is stubbed — see below.)*
- **Get involved** — Volunteer, Become a Partner, and Sponsor a Van / Family / supplies.

### Admin portal (`/admin`, admin role only)
- **Overview** — cases awaiting review, escalations, low-stock, stories to moderate, volunteer/partner/sponsorship counts.
- **Cases** — prioritised queue with filters; per-case detail showing the full assessment, the seven eligibility criteria, the three scores, the suggested pick list, and controls to set status (Pending/Approved/Declined/Escalated/Closed), ETA and internal notes. Status changes are reflected on the applicant's tracker.
- **Inventory** — adjust stock per item (movements are recorded).
- **Stories** — approve / hide / delete testimonials.
- **Audit log** — every significant action is recorded.

---

## The eligibility + risk-scoring engine

`src/lib/eligibility.ts` is the heart of the product and implements the brief's request to
**merge the "7-question gate" and the long form into one comprehensive assessment**. The
form collects everything once; the engine derives seven meaningful eligibility criteria
plus three scores.

**Guiding principle (from the brief):** *prevent misuse without unfairly excluding people
who genuinely need help.* So only the four **essential** criteria can make a request
ineligible; concerns about identity or repeat use **escalate to a human** rather than
auto-rejecting.

The seven criteria:

1. **Genuine immediate need** *(essential)* — a recognised, unexpected situation.
2. **Temporary crisis** *(essential)* — bridging a gap (waiting for recovery/transport/accommodation/family), not an ongoing need.
3. **Existing support contacted** — where possible (contributes to scoring, not essential).
4. **Immediate need within scope** *(essential)* — food, water, warmth, charging, transport, hygiene, information, etc.
5. **Identity** — verified account (photo ID optional; alternatives allowed).
6. **Location in service area** *(essential)* — inside the Manchester pilot geofence (GPS with consent).
7. **Repeat-request check** — drives the support pathway.

Three scores (0–100): **Vulnerability**, **Fraud/misuse risk**, and a combined **Priority**
(weights vulnerability + urgency, discounts fraud). These map to a **risk band** and a
recommended status:

| Band  | Meaning | Recommended action |
| ----- | ------- | ------------------ |
| Green | Low risk, in scope | **Approved** — dispatch |
| Amber | Some concern / repeat use / no GPS | **Pending** — manual review |
| Red   | Elevated misuse signals / frequent use | **Escalated** — caseworker / partner referral |

Support pathway by 90-day request count: **0–2** standard · **3–5** enhanced review · **>5**
referral to a partner agency (while still considering a genuine immediate crisis).

The engine is pure and independently tested — see `npm run build` for the app, and the
scenario checks described in `docs/` reasoning below.

---

## Data model

Prisma models in `prisma/schema.prisma`: `User`, `Session`, `Case`, `CaseEvent`,
`Donation`, `InventoryItem`, `InventoryMovement`, `Testimonial`,
`Volunteer`, `Partner`, `Sponsorship`, `Vehicle`, `AuditLog`. Variable-shape values
(checkbox sets, the assessment snapshot) are stored as JSON strings to stay portable across
database providers.

---

## What's stubbed / next steps (deliberately out of MVP scope)

These are wired to clear seams so they can be implemented without restructuring:

- **Payments** — `donate` records a donation but takes no real money. Integrate
  Stripe/GoCardless in `src/app/api/donations/route.ts` and only record the donation on a
  verified payment webhook.
- **Email / SMS** — verification links are logged to the console. Add a provider
  (Resend/SES/Twilio) in `src/app/api/auth/register/route.ts` and the case events.
- **Real-time dispatch & navigation** — the tracker uses an ETA heuristic and polling.
  Add live volunteer location, routing, and push notifications; compare "our ETA" vs the
  applicant's other help to decide/redirect dispatch (as described in the brief).
- **Volunteer app & QR pick-list scanning** — the pick list is generated; scanning items
  out via QR/barcode and digital signature on close are the next inventory step.
- **ID / selfie / evidence uploads & document verification** — fields exist in the model;
  add secure file storage + review.
- **Production hardening** — move to PostgreSQL, add rate limiting, CSRF protection on
  forms, a proper secrets setup, and formal GDPR data-subject workflows.

---

## Project structure

```
prisma/
  schema.prisma        # data model
  seed.ts              # demo data (admin, inventory, ledger, sample case, stories…)
src/
  app/                 # App Router pages + /api route handlers
  components/          # UI (public + admin, client components)
  lib/
    eligibility.ts     # the 7-criteria + risk-scoring engine (pure, testable)
    geo.ts             # Manchester geofence (dependency-free)
    validation.ts      # UK phone/postcode + Zod schemas
    auth.ts            # sessions, hashing, guards
    ledger.ts          # transparent money movements
    metrics.ts         # impact metrics derived from real data
    constants.ts       # option lists, donation tiers, need→SKU pick-list map
```

---

*Angel Bridge does not replace existing services — it connects people to them while
providing immediate practical support during the waiting period. In a life-threatening
emergency, always call 999.*

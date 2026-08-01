# Deploy Angel Bridge Foundation (GitHub + Vercel + Neon Postgres)

This gets the site online on a free tier. Three parts: a database, GitHub, and Vercel.
It takes about 15 minutes. You do **not** need to touch the code.

---

## 1. Create a free database (Neon)

1. Go to **https://neon.tech** and sign up (you can use your GitHub account).
2. Create a new project (any name, e.g. `angel-bridge`). Choose a region near the UK.
3. On the project dashboard, copy the **connection string** — it looks like:
   `postgresql://user:password@ep-xxxx.eu-west-2.aws.neon.tech/neondb?sslmode=require`
4. Keep this string handy — you'll paste it in two places below.

---

## 2. Put your code on GitHub

**Easiest (no command line): GitHub Desktop**

1. Install **GitHub Desktop** from https://desktop.github.com and sign in.
2. File → **Add Local Repository** → choose your `angelbridge` folder.
   (This project already has a git commit, so it will be recognised.)
3. Click **Publish repository**. Name it `angel-bridge`, choose Private or Public, Publish.

**Or with the command line** (from inside the project folder):

```bash
git remote add origin https://github.com/YOUR-USERNAME/angel-bridge.git
git branch -M main
git push -u origin main
```

(Create the empty `angel-bridge` repo first at https://github.com/new — don't add a README.)

---

## 3. Create the database tables + demo data

On your computer, in the project folder:

1. Create a file called `.env` (copy `.env.example`) and set `DATABASE_URL` to your Neon
   string from step 1, and `SESSION_SECRET` to any long random text.
2. Run:
   ```bash
   npm install
   npm run setup      # creates the tables in Neon and adds demo data
   ```
   You should see "Seed complete" and the demo logins.

---

## 4. Deploy on Vercel

1. Go to **https://vercel.com** and sign up with your GitHub account.
2. Click **Add New → Project**, and **Import** your `angel-bridge` repository.
3. Before deploying, open **Environment Variables** and add:
   | Name | Value |
   | ---- | ----- |
   | `DATABASE_URL` | your Neon connection string (same as step 1) |
   | `SESSION_SECRET` | a long random string |
   | `APP_URL` | leave blank for now, or your Vercel URL once known |
4. Click **Deploy**. Vercel installs, builds and hosts the site.
5. When it finishes you'll get a URL like `https://angel-bridge.vercel.app`.
   Copy it, go to Settings → Environment Variables, set `APP_URL` to that URL, and
   **Redeploy** so email-verification links point to the live site.

That's it — the site is live. Log in with `admin@angelbridge.org` / `password123`
(from the demo seed) to see the admin portal.

---

## Notes

- **Local development now uses the same Neon database** (via `DATABASE_URL` in `.env`),
  so `npm run dev` works exactly as before — no local database file needed.
- To wipe and re-seed the database: `npm run db:reset`.
- Custom domain, email/SMS sending, and payments are separate next steps — the code has
  clear seams for each (see `README.md` → "What's stubbed / next steps").

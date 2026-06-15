# Wedding Vendor Tracker

A fast, mobile-first app to capture wedding-show vendors — their **prices**, **food/service packages**, and **photos** of brochures — then **compare** them and track against your **budget**.

Built with Next.js (App Router) + TypeScript + Tailwind + MongoDB.

## Features
- 📷 Capture vendors with photos (snapped on your phone, compressed in-browser)
- 💰 Multiple price packages per vendor (per pax / total / per day)
- ⚖️ Side-by-side comparison of any 2–3 vendors
- 📊 Budget tracker using the classic split (Venue+Food 40–50%, Photo+Video 20–25%, etc.)
- 📞 One-tap call / email from a vendor's page

## Local setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local` (see `.env.example`):
   ```
   MONGODB_URI=
   MONGODB_DB=
   ```
   Data is stored in a **new `wedding_vendors` collection** — your other collections are untouched.
3. Run it:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000. To test the camera on your phone, open `http://<your-laptop-LAN-IP>:3000` while on the same Wi-Fi.

## Deploy to Vercel
1. Push this repo to GitHub.
2. In Vercel: **Add New → Project → Import** this repo (Next.js is auto-detected).
3. Add Environment Variables `MONGODB_URI` and `MONGODB_DB` (Production).
4. In **MongoDB Atlas → Network Access**, add `0.0.0.0/0` to the IP allowlist (Vercel uses dynamic IPs). Your DB password remains the security boundary.
5. **Deploy.** Every push to `main` redeploys automatically.

## Notes
- No login — the app is reachable by anyone with the URL.
- Photos are stored compressed (~150 KB) inside each vendor document; up to 6 per vendor.

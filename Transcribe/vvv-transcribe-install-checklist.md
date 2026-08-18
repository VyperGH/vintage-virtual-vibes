# VVV Transcribe — Install Checklist

Work through this top to bottom. Check things off as you go — if you get pulled away,
just pick back up at the first unchecked box.

## 1. Unzip the project

- [ ] Unzip `vvv-transcribe.zip` somewhere on your machine
- [ ] Open a terminal in the `vvv-transcribe` folder

## 2. Supabase project

- [ ] Go to supabase.com and create a new project (or pick an existing VVV one)
- [ ] Wait for it to finish provisioning
- [ ] Go to **SQL Editor** → paste in the full contents of `supabase/schema.sql` → run it
- [ ] Go to **Storage** → create a new bucket named exactly `meeting-audio` → make sure it's **private** (not public)
- [ ] Go to **Settings → API** → copy these three values somewhere handy:
  - [ ] Project URL
  - [ ] `anon` public key
  - [ ] `service_role` key (keep this one secret — it bypasses RLS)

## 3. Deepgram account

- [ ] Go to deepgram.com and sign up
- [ ] Create an API key
- [ ] Copy the API key somewhere handy

## 4. Pick your shared password

- [ ] Decide on a password the 5 of you will use to log into the app (doesn't need to be fancy — it's an internal gate, not a real account system)

## 5. Set up your environment file

- [ ] Copy `.env.example` to a new file named `.env.local` in the project root
- [ ] Fill in all four values:
  ```
  NEXT_PUBLIC_SUPABASE_URL=        <- Project URL from step 2
  NEXT_PUBLIC_SUPABASE_ANON_KEY=   <- anon key from step 2
  SUPABASE_SERVICE_ROLE_KEY=       <- service_role key from step 2
  DEEPGRAM_API_KEY=                <- from step 3
  APP_PASSWORD=                    <- from step 4
  ```
- [ ] Save the file

## 6. Install and run locally

- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Visit http://localhost:3000 — you should hit the login page
- [ ] Log in with your `APP_PASSWORD`
- [ ] Upload a short test audio clip and confirm it transcribes successfully
- [ ] Try the "Rename speakers" control on the test transcript to confirm it saves

## 7. Push to GitHub

- [ ] Create a new GitHub repo (or reuse an existing one you want this to live in)
- [ ] `git init` (if not already a repo)
- [ ] `git add .`
- [ ] `git commit -m "Initial scaffold for VVV Transcribe"`
- [ ] `git push origin <your-feature-branch>` — **not** `main`, per your usual workflow; you'll handle the merge yourself later

## 8. Deploy to Vercel

- [ ] Import the repo into Vercel
- [ ] Add all five env vars from step 5 in the Vercel project settings (Production + Preview)
- [ ] Deploy
- [ ] Visit the deployed URL, log in, run one more test upload to confirm it works in production too

## 9. Roll it out to the team

- [ ] Share the URL + shared password with the other 4 VVV members
- [ ] Point them to the "Rename speakers" feature so they know it exists

---

**Known limitations to keep in mind** (already documented in `README.md` in the project):
- No auto-summary/action-items yet
- Speaker labels need manual renaming per meeting (automatic labeling via Craig's multi-track mode is on the future roadmap)
- Transcription is synchronous — should be fine for 60–90 min meetings, but flag it if you ever see a timeout

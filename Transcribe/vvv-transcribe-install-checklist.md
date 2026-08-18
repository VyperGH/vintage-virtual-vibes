# VVV Transcribe — Install Checklist

Work through this top to bottom. Check things off as you go — if you get pulled away,
just pick back up at the first unchecked box.

## 1. Unzip the project

- [x] Unzip `vvv-transcribe.zip` somewhere on your machine
- [x] Open a terminal in the `vvv-transcribe` folder

## 2. Supabase project

- [x] Go to supabase.com and create a new project (or pick an existing VVV one)
- [x] Wait for it to finish provisioning
- [x] Go to **SQL Editor** → paste in the full contents of `supabase/schema.sql` → run it
- [x] Go to **Storage** → create a new bucket named exactly `meeting-audio` → make sure it's **private** (not public)
- [ ] Go to **Settings → API** → copy these three values somewhere handy:
  - [x] Project URL       https://egermcharfpdlqijlgfv.supabase.co/
  - [x] `anon` public key       eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZXJtY2hhcmZwZGxxaWpsZ2Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxODY0NDIsImV4cCI6MjEwMDc2MjQ0Mn0.D2XJmhXNcVrKsaEduc9h-xl5PqLQJQcji5BCv5_fv8c
  - [x] `service_role` key (keep this one secret — it bypasses RLS)       eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZXJtY2hhcmZwZGxxaWpsZ2Z2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTE4NjQ0MiwiZXhwIjoyMTAwNzYyNDQyfQ.cfvbEzq9pn0Gd_T2Dnbo9Ft-swtgt9cL5Gd2KubJtJ4

## 3. Deepgram account

- [x] Go to deepgram.com and sign up
- [x] Create an API key
- [x] Copy the API key somewhere handy        38f5f5731d6cf47289e6d5d629c85c460e268b44

## 4. Pick your shared password

- [x] Decide on a password the 5 of you will use to log into the app (doesn't need to be fancy — it's an internal gate, not a real account system)        BigVibes2025

## 5. Set up your environment file

- [x] Copy `.env.example` to a new file named `.env.local` in the project root
- [x] Fill in all four values:
  ```
  NEXT_PUBLIC_SUPABASE_URL=        <- Project URL from step 2
  NEXT_PUBLIC_SUPABASE_ANON_KEY=   <- anon key from step 2
  SUPABASE_SERVICE_ROLE_KEY=       <- service_role key from step 2
  DEEPGRAM_API_KEY=                <- from step 3
  APP_PASSWORD=                    <- from step 4
  ```
- [ ] Save the file

## 6. Install and run locally

- [x] Run `npm install`
- [x] Run `npm run dev`
- [x] Visit http://localhost:3000 — you should hit the login page
- [x] Log in with your `APP_PASSWORD`
- [x] Upload a short test audio clip and confirm it transcribes successfully
- [x] Try the "Rename speakers" control on the test transcript to confirm it saves

## 7. Push to GitHub

- [x] Create a new GitHub repo (or reuse an existing one you want this to live in)
- [x] `git init` (if not already a repo)
- [x] `git add .`
- [x] `git commit -m "Initial scaffold for VVV Transcribe"`
- [x] `git push origin <your-feature-branch>` — **not** `main`, per your usual workflow; you'll handle the merge yourself later

## 8. Deploy to Vercel

- [x] Import the repo into Vercel
- [x] Add all five env vars from step 5 in the Vercel project settings (Production + Preview)
- [x] Deploy
- [x] Visit the deployed URL, log in, run one more test upload to confirm it works in production too

## 9. Roll it out to the team

- [ ] Share the URL + shared password with the other 4 VVV members
- [ ] Point them to the "Rename speakers" feature so they know it exists

---

**Known limitations to keep in mind** (already documented in `README.md` in the project):
- No auto-summary/action-items yet
- Speaker labels need manual renaming per meeting (automatic labeling via Craig's multi-track mode is on the future roadmap)
- Transcription is synchronous — should be fine for 60–90 min meetings, but flag it if you ever see a timeout

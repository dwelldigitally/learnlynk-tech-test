# LearnLynk – Submission

## What I Completed
- Implemented full database schema (leads, applications, tasks) with constraints & indexes.
- Added RLS policies for select & insert based on tenant, role, and team access.
- Built the `create-task` Edge Function with validation, insertion, and realtime broadcast.
- Built `/dashboard/today` page in Next.js to fetch today's tasks and mark tasks as completed.
- Connected to Supabase using environment variables.
- Added UI improvements for a clean and simple dashboard experience.

---

## How to Test the Dashboard
1. Run the Next.js frontend:
```bash
npm install
npm run dev
```
2. Open this URL: 
```text
http://localhost:3000/dashboard/today
```

3. Make sure your `.env.local` has:
```text
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```


Tasks due today (status != completed) will appear automatically.

---

## Stripe Answer (Point-wise)
1. When user starts payment → insert a row in `payment_requests` with `application_id`, `amount`, and `status = 'pending'`.
2. Call `stripe.checkout.sessions.create()` with amount, success URL, cancel URL, customer email, and metadata.
3. Store `session_id` and `payment_intent` returned by Stripe into the same `payment_requests` row.
4. On payment completion, Stripe sends `checkout.session.completed` webhook.
5. Verify webhook signature using Stripe's signing secret.
6. Update `payment_requests.status = 'paid'` after successful webhook validation.
7. Update the related application's stage (e.g., `payment_completed`) or add to timeline.
8. This keeps Supabase in sync with Stripe and ensures reliable payment tracking.

---

## Project Structure
Backend:
- `backend/schema.sql`
- `backend/rls_policies.sql`
- `backend/edge-functions/create-task/index.ts`

Frontend:
- `frontend/pages/dashboard/today.tsx`
- `frontend/lib/supabaseClient.ts`

---

## Live Testing Notes
- Add sample leads → applications → tasks to Supabase to view working dashboard.
- Tasks inserted with `due_at` equal to today's date show on the page immediately.


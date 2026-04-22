# CCIS Connect Role-Based QA Checklist

Last updated: 2026-04-21 22:20 PST

Use this checklist for final validation before presenting or deploying the app. Test with a clean browser profile or after logging out between roles.

## Test Environment

- [x] Local app starts on `http://localhost:3000`
- [x] `.env.local` exists and points to the Railway PostgreSQL database
- [x] Production build passes with `npm run build`
- [x] TypeScript passes with `npx tsc --noEmit`
- [x] Lint passes with `npm run lint`
- [x] Production dependency audit passes with `npm audit --omit=dev`

## Seeded Test Accounts

| Role | Username | Password | Expected Home |
| --- | --- | --- | --- |
| Student | `23-14000` | `23-14000` | `/dashboard` |
| Student | `23-14001` | `23-14001` | `/dashboard` |
| Faculty | `fac-01` | `fac-01` | `/dashboard` |
| Faculty | `fac-02` | `fac-02` | `/dashboard` |
| Admin | `admin` | `admin` | `/admin` |

## Guest / Logged Out

- [x] Can open login page `/`
- [x] Can open public virtual map `/virtual-map`
- [x] Can switch/toggle virtual map mode without console errors
- [ ] Can navigate virtual map markers without console errors
- [x] Cannot open `/dashboard`; redirects to `/`
- [x] Cannot open `/borrow`; redirects to `/`
- [x] Cannot open `/reserve`; redirects to `/`
- [x] Cannot open `/admin`; redirects to `/`
- [x] Cannot read protected API data without login; protected APIs return `401`
- [x] Invalid login is rejected with `401` and stays unauthenticated

## Student

- [x] Can log in with a student account
- [x] Login redirects to `/dashboard`
- [x] Can open `/dashboard`
- [x] Can open `/borrow`
- [x] Can open `/virtual-map`
- [x] Cannot open `/reserve`; redirects to `/dashboard`
- [x] Cannot open `/admin`; redirects to `/dashboard`
- [x] Cannot call admin APIs; returns `403`
- [x] Borrow list API only returns this student's records when no `user_id` is provided
- [x] Borrow list API cannot read another user's records; returns `403`
- [ ] Can see available equipment categories/models/units on Borrow page
- [ ] Can open unit picker for an available unit
- [x] Can submit a borrow request with valid dates and purpose
- [ ] Submitted borrow request appears in student's Pending list/dashboard
- [x] Cannot submit duplicate pending borrow request for the same unit
- [ ] Can log out and return to login page

## Faculty

- [x] Can log in with a faculty account
- [x] Login redirects to `/dashboard`
- [x] Can open `/dashboard`
- [x] Can open `/borrow`
- [x] Can open `/reserve`
- [x] Can open `/virtual-map`
- [x] Cannot open `/admin`; redirects to `/dashboard`
- [x] Cannot call admin APIs; returns `403`
- [x] Borrow list API only returns this faculty user's records when no `user_id` is provided
- [x] Room reservation API only returns this faculty user's records when no `user_id` is provided
- [x] Cannot read another user's reservation records; returns `403`
- [ ] Can see available equipment categories/models/units on Borrow page
- [ ] Can submit a borrow request with valid dates and purpose
- [ ] Can see room floor map and room availability
- [x] Can submit a room reservation for an available time slot
- [ ] Submitted room reservation appears in faculty Pending list/dashboard
- [x] Cannot submit overlapping room reservation
- [x] Cannot submit reservation outside configured room availability
- [ ] Can log out and return to login page

## Admin

- [x] Can log in with admin account
- [x] Login redirects to `/admin`
- [x] Can open `/admin`
- [x] Can open `/virtual-map`
- [x] Cannot open user routes like `/dashboard`, `/borrow`, `/reserve`; redirects to `/admin`
- [x] Can call admin APIs
- [x] Can read all borrow requests
- [x] Can read all room reservations
- [x] Can read activity log
- [ ] Dashboard loads counts, recent activity, and needs-attention items
- [x] Can approve pending borrow request
- [ ] Approving borrow request changes unit status to `on-loan`
- [ ] Can reject pending borrow request with admin notes
- [x] Can mark accepted borrow request as returned
- [ ] Returning borrow request changes unit status back to `available`
- [x] Can confirm pending room reservation
- [x] Confirming room reservation is blocked if it overlaps another accepted/pending reservation
- [x] Can reject pending room reservation with admin notes
- [x] Can create, edit, and delete rooms with no future reservations
- [x] Cannot delete rooms with future pending/accepted reservations
- [x] Can update room weekly availability
- [x] Can create, edit, and delete equipment categories when no child models exist
- [ ] Cannot delete equipment categories that still have models
- [x] Can create, edit, and delete equipment models when no units exist
- [ ] Cannot delete equipment models that still have units
- [x] Can create and edit equipment units
- [ ] Cannot delete equipment units that have borrow request history
- [x] Can add and delete a temporary admin account
- [x] Cannot delete own admin account
- [ ] Cannot delete super admin account
- [ ] Can log out and return to login page

## Cross-Role Interaction Flow

- [x] Student submits borrow request
- [x] Admin can access and act on the submitted borrow request by ID
- [x] Admin approves request
- [ ] Student sees request in active/accepted borrow history
- [ ] Equipment unit appears in Admin Equipment Inventory > On Loan
- [x] Admin marks request returned
- [ ] Student sees request as returned
- [ ] Equipment unit returns to available inventory
- [x] Faculty submits room reservation
- [x] Admin can access and act on the submitted room reservation by ID
- [x] Admin confirms reservation
- [ ] Faculty sees reservation in confirmed room reservation history
- [ ] Room appears occupied only during confirmed reservation time

## Automated Checks Run

- [x] Login API with `admin/admin` returns `200`
- [ ] Browser login with `admin/admin` redirects to `/admin`
- [ ] Browser login with `23-14000/23-14000` redirects to `/dashboard`
- [ ] Browser login with `fac-01/fac-01` redirects to `/dashboard`
- [ ] Guest route redirects verified by browser
- [ ] Role route redirects verified by browser
- [x] Guest route redirects verified by curl
- [x] Role route redirects verified by curl
- [x] API guards verified by curl
- [x] Live role workflow API suite passed `30/30`
- [x] Virtual map browser smoke test passed with no console errors or Next.js error overlay

## Notes / Known Limits

- Full create/update/delete testing changes live Railway data. Use a disposable test record naming prefix like `QA-` and clean it up after each run.
- A full end-to-end interaction pass should be done on a fresh or intentionally prepared database so request/status assertions are predictable.
- `npm audit` still reports dev-only moderate advisories through Drizzle Kit's deprecated `@esbuild-kit/*` transitive chain; `npm audit --omit=dev` is clean.

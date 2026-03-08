# CCIS Connect Implementation Plan

## Project Overview
Full-stack implementation of CCIS Connect equipment borrowing and room reservation system with Supabase backend, comprehensive admin management, and unified design system.

---

## 1. Database Setup (Supabase)

### 1.1 Equipment Tables

#### `equipment_categories`
```sql
- id (uuid, primary key)
- name (text) -- e.g., "Cameras", "Audio Equipment", "Lighting"
- emoji (text)
- description (text)
- color (text) -- CSS class names for UI
- created_at (timestamp)
- updated_at (timestamp)
```

#### `equipment_models`
```sql
- id (uuid, primary key)
- category_id (uuid, foreign key -> equipment_categories)
- model_name (text) -- e.g., "Sony A7 IV"
- description (text)
- image_url (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `equipment_units`
```sql
- id (uuid, primary key)
- model_id (uuid, foreign key -> equipment_models)
- unit_id (text, unique) -- e.g., "CAM-A7IV-01"
- condition (text) -- "Excellent", "Good", "Fair", "Maintenance"
- status (text) -- "available", "on-loan", "maintenance"
- notes (text)
- created_at (timestamp)
- updated_at (timestamp)
```

### 1.2 Room Tables

#### `rooms`
```sql
- id (uuid, primary key)
- room_number (text, unique) -- e.g., "R101"
- name (text) -- e.g., "Seminar Room B"
- type (text) -- e.g., "Seminar Room", "Computer Lab", "Office"
- capacity (text) -- e.g., "30 pax"
- floor (text) -- e.g., "1st Floor"
- created_at (timestamp)
- updated_at (timestamp)
```

#### `room_availability`
```sql
- id (uuid, primary key)
- room_id (uuid, foreign key -> rooms)
- day_of_week (integer) -- 0=Sunday, 1=Monday, ..., 6=Saturday
- start_hour (integer) -- 0-23
- end_hour (integer) -- 0-23
- created_at (timestamp)
```

#### `room_reservations`
```sql
- id (uuid, primary key)
- room_id (uuid, foreign key -> rooms)
- user_id (uuid, foreign key -> users)
- reservation_date (date)
- start_time (time)
- end_time (time)
- purpose (text)
- status (text) -- "pending", "accepted", "rejected"
- admin_notes (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

### 1.3 Borrow Request Tables

#### `borrow_requests`
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key -> users)
- unit_id (uuid, foreign key -> equipment_units)
- start_date (date)
- end_date (date)
- purpose (text)
- status (text) -- "pending", "accepted", "rejected", "returned"
- admin_notes (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

### 1.4 User & Admin Tables

#### `users`
```sql
- id (uuid, primary key)
- name (text)
- email (text, unique)
- student_id (text, unique, nullable)
- department (text)
- role (text) -- "student", "faculty", "admin", "super_admin"
- created_at (timestamp)
- updated_at (timestamp)
```

#### `activity_log`
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key -> users, nullable)
- action (text) -- "borrow_approved", "room_reserved", etc.
- detail (text)
- created_at (timestamp)
```

---

## 2. Admin Page Features

### 2.1 Equipment Inventory Management

**Location:** `/app/admin/page.tsx` → Equipment Inventory → "Manage Inventory" section

#### Features:
- **Add Equipment:**
  - Select category (or create new)
  - Add model with description and image upload
  - Add units with unique IDs
  - Set condition and initial status

- **Edit Equipment:**
  - Modify model details
  - Update unit information
  - Change condition/status
  - Add notes

- **Delete Equipment:**
  - Remove units (with confirmation)
  - Archive models (if no active borrows)
  - Delete categories (if empty)

#### UI Components Needed:
- `EquipmentManagementDialog` - Add/Edit equipment
- `CategoryForm` - Create/edit categories
- `ModelForm` - Create/edit models
- `UnitForm` - Create/edit individual units
- Confirmation dialogs for deletions

### 2.2 Room Management

**Location:** `/app/admin/page.tsx` → New "Room Management" section

#### Features:
- **Add Room:**
  - Room number, name, type, capacity, floor
  - Set weekly availability schedule using calendar picker
  - Select days of week (checkboxes)
  - Set hourly blocks for each day (time range picker)

- **Edit Room:**
  - Update room details
  - Modify availability schedule
  - View reservation history

- **Delete Room:**
  - Remove room (with confirmation)
  - Only if no future reservations

#### UI Components Needed:
- `RoomManagementDialog` - Add/Edit rooms
- `AvailabilityScheduler` - Weekly calendar with hourly blocks
  - Day selector (Mon-Sun)
  - Time range picker (8:00 AM - 10:00 PM)
  - Visual calendar grid showing occupied/vacant slots
- Confirmation dialogs for deletions

### 2.3 Admin Account Management (Already exists)

**Location:** `/components/forms/admin/admin.tsx`

#### Enhancements:
- Connect to Supabase `users` table
- Add role permissions (Admin vs Super Admin)
- Add email validation

---

## 3. Design System Updates

### 3.1 Unified Design Language

**Reference Design:** Admin page styling (`/app/admin/page.tsx`)

#### Key Design Elements:
- **Card Style:** `rounded-xl border border-border bg-card`
- **Spacing:** `p-6 md:p-8` for page content, `gap-6` between sections
- **Typography:**
  - Page title: `text-2xl font-bold tracking-tight text-foreground`
  - Subtitle: `text-sm text-muted-foreground`
  - Card title: `text-sm font-semibold`
- **Badges:**
  - Status badges with color coding
  - Rounded full for counts: `rounded-full px-2 py-0.5 text-xs`
- **Icons:** Tabler Icons with `size-4` or `size-5`

### 3.2 Pages to Update

#### Dashboard (`/app/dashboard/page.tsx` & `/components/user.tsx`)
**Current:** Basic layout with cards
**Update:**
- Match admin page card styling
- Improve stat cards with icon backgrounds
- Add activity timeline similar to admin dashboard
- Update button styles and spacing

#### Borrow Page (`/app/borrow/page.tsx` & `/components/borrow-equipment.tsx`)
**Current:** Accordion-based category view
**Update:**
- Modernize card header to match admin style
- Update category accordion styling
- Improve equipment card layout
- Add loading states and empty states

#### Virtual Map (`/app/virtual-map/page.tsx` & `/components/tour.tsx`)
**Current:** 3D panorama viewer with floor plan toggle
**Update:**
- Update control styling (3D/2D switch)
- Modernize floor selector buttons
- Keep panorama functionality as-is (hardcoded)
- Update card container styling

### 3.3 Design Consistency Checklist

Apply to all user-facing pages:
- [ ] Consistent navbar styling
- [ ] Unified card/container styling
- [ ] Consistent button variants and sizes
- [ ] Unified badge styling
- [ ] Consistent spacing (px-4 py-4 md:px-10 md:py-6 for page content)
- [ ] Icon size consistency
- [ ] Color scheme consistency (use CSS variables)
- [ ] Typography scale consistency

---

## 4. API Routes & Data Integration

### 4.1 Supabase Client Setup

**Files to create:**
- `/lib/supabase/client.ts` - Client-side Supabase client
- `/lib/supabase/server.ts` - Server-side Supabase client
- `/lib/supabase/types.ts` - TypeScript types for database tables

### 4.2 API Routes

**Create `/app/api/` routes:**

#### Equipment APIs
- `POST /api/equipment/categories` - Create category
- `GET /api/equipment/categories` - List all categories
- `PUT /api/equipment/categories/[id]` - Update category
- `DELETE /api/equipment/categories/[id]` - Delete category
- `POST /api/equipment/models` - Create model
- `GET /api/equipment/models?category_id=...` - List models by category
- `PUT /api/equipment/models/[id]` - Update model
- `DELETE /api/equipment/models/[id]` - Delete model
- `POST /api/equipment/units` - Create unit
- `GET /api/equipment/units?model_id=...` - List units by model
- `PUT /api/equipment/units/[id]` - Update unit
- `DELETE /api/equipment/units/[id]` - Delete unit

#### Room APIs
- `POST /api/rooms` - Create room
- `GET /api/rooms` - List all rooms
- `PUT /api/rooms/[id]` - Update room
- `DELETE /api/rooms/[id]` - Delete room
- `POST /api/rooms/[id]/availability` - Set availability schedule
- `GET /api/rooms/[id]/availability` - Get availability schedule
- `GET /api/rooms/available?date=...&time=...` - Check available rooms

#### Reservation APIs
- `POST /api/reservations/room` - Create room reservation
- `GET /api/reservations/room` - List room reservations (with filters)
- `PUT /api/reservations/room/[id]` - Update status (approve/reject)
- `POST /api/reservations/borrow` - Create borrow request
- `GET /api/reservations/borrow` - List borrow requests (with filters)
- `PUT /api/reservations/borrow/[id]` - Update status (approve/reject/return)

#### Admin APIs
- `GET /api/admin/users` - List admin users
- `POST /api/admin/users` - Add admin
- `DELETE /api/admin/users/[id]` - Remove admin
- `GET /api/admin/activity` - Get activity log

### 4.3 Data Fetching Hooks

**Create `/hooks/` directory:**

- `useEquipment.ts` - Equipment CRUD operations
- `useRooms.ts` - Room CRUD operations
- `useBorrowRequests.ts` - Borrow request operations
- `useRoomReservations.ts` - Room reservation operations
- `useAdmin.ts` - Admin operations
- `useAuth.ts` - Authentication (for future implementation)

---

## 5. Component Updates

### 5.1 Admin Components

**Location:** `/components/forms/admin/`

#### New Components to Create:
- `equipment/equipment-management.tsx` - Equipment CRUD interface
  - Category management section
  - Model management section
  - Unit management section
  - Add/Edit dialogs for each level

- `room/room-management.tsx` - Room CRUD interface
  - Room list table
  - Add/Edit room dialog
  - Availability scheduler component

#### Components to Update:
- `dashboard.tsx` - Connect to real-time data from Supabase
- `borrow/borrow-request-*.tsx` - Connect to Supabase, add approve/reject actions
- `room/room-reservation-*.tsx` - Connect to Supabase, add approve/reject actions
- `equipment/equipment-*.tsx` - Update to fetch from Supabase
- `history.tsx` - Connect to activity log
- `admin.tsx` - Connect to users table

### 5.2 User-Facing Components

**Update existing components:**

- `components/borrow-equipment.tsx`:
  - Fetch equipment from Supabase
  - Update to match admin design
  - Add real-time availability updates

- `components/reserve-room.tsx`:
  - Fetch rooms from Supabase
  - Show real availability based on schedule
  - Update reservation form

- `components/user.tsx`:
  - Fetch user data from Supabase
  - Show real borrow/reservation history
  - Update design to match admin style

### 5.3 New Shared Components

**Create `/components/shared/`:**

- `AvailabilityCalendar.tsx` - Weekly calendar picker for room availability
  - Props: `selectedSlots`, `onSlotsChange`
  - Grid layout: Days (columns) × Hours (rows)
  - Click to toggle slot availability

- `StatusBadge.tsx` - Unified status badge component
  - Props: `status`, `variant`
  - Auto color-coding based on status

- `ConfirmDialog.tsx` - Reusable confirmation dialog
  - Props: `title`, `message`, `onConfirm`, `onCancel`

- `ImageUpload.tsx` - Image upload component for equipment
  - Props: `value`, `onChange`
  - Preview + upload to Supabase Storage

---

## 6. Authentication & Authorization (Future)

**Note:** Skipping login functionality for now, but structure for future implementation:

### Future Auth Implementation:
- Supabase Auth integration
- Email/password or MMSU email SSO
- Role-based access control (RBAC)
  - Students: Can borrow/reserve only
  - Faculty: Can borrow/reserve only
  - Admin: Full access except super admin functions
  - Super Admin: Complete access

**Files to create later:**
- `/middleware.ts` - Route protection
- `/lib/auth.ts` - Auth helpers
- `/app/login/page.tsx` - Login page (currently placeholder)

---

## 7. Additional Improvements

### 7.1 Search & Filtering
- Add search functionality to all tables
- Filter by status, category, date range
- Sort columns

### 7.2 Real-time Updates
- Use Supabase real-time subscriptions
- Live updates for equipment availability
- Live updates for room reservations
- Activity feed auto-updates

### 7.3 Notifications
- Email notifications for approved/rejected requests
- Due date reminders for equipment returns
- Upcoming reservation reminders

### 7.4 Analytics & Reporting
- Equipment utilization rates
- Popular equipment/rooms
- User activity metrics
- Export reports (CSV/PDF)

### 7.5 Image Management
- Supabase Storage integration for equipment images
- Image upload and preview
- Optimize images for web

### 7.6 Validation & Error Handling
- Form validation (Zod or similar)
- API error handling
- User-friendly error messages
- Loading states for all async operations

### 7.7 Accessibility
- ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast compliance

### 7.8 Mobile Responsiveness
- Ensure all new components are mobile-friendly
- Test on various screen sizes
- Optimize touch targets

---

## 8. Implementation Priority

### Phase 1: Foundation (Week 1-2)
1. Set up Supabase database schema
2. Create API routes for basic CRUD
3. Set up Supabase client integration
4. Create TypeScript types

### Phase 2: Admin Equipment Management (Week 2-3)
1. Build Equipment Management UI
2. Category management (Add/Edit/Delete)
3. Model management (Add/Edit/Delete)
4. Unit management (Add/Edit/Delete)
5. Connect to Supabase

### Phase 3: Admin Room Management (Week 3-4)
1. Build Room Management UI
2. Create Availability Scheduler component
3. Room CRUD operations
4. Connect to Supabase

### Phase 4: Design Updates (Week 4-5)
1. Update Dashboard page design
2. Update Borrow page design
3. Update Virtual Map page design
4. Ensure design consistency across all pages

### Phase 5: Admin Request Management (Week 5-6)
1. Update Borrow Request components with real data
2. Update Room Reservation components with real data
3. Add approve/reject functionality
4. Update History and Activity Log

### Phase 6: User-Facing Features (Week 6-7)
1. Update Borrow Equipment page with real data
2. Update Reserve Room page with real availability
3. Update User Dashboard with real history
4. Add real-time updates

### Phase 7: Polish & Testing (Week 7-8)
1. Add loading states
2. Error handling
3. Form validation
4. Testing and bug fixes
5. Performance optimization

---

## 9. Environment Variables

**Create `.env.local`:**

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 10. Dependencies to Add

```bash
npm install @supabase/supabase-js
npm install @supabase/auth-helpers-nextjs
npm install date-fns  # For date formatting
npm install zod  # For validation
npm install react-hook-form  # For forms
npm install @hookform/resolvers  # For Zod integration
npm install react-hot-toast  # For notifications
npm install recharts  # For analytics charts (future)
```

---

## 11. File Structure

```
ccis-connect-webapp/
├── app/
│   ├── admin/
│   │   └── page.tsx (existing, add new sections)
│   ├── api/
│   │   ├── equipment/
│   │   │   ├── categories/
│   │   │   ├── models/
│   │   │   └── units/
│   │   ├── rooms/
│   │   │   ├── [id]/
│   │   │   └── available/
│   │   ├── reservations/
│   │   │   ├── borrow/
│   │   │   └── room/
│   │   └── admin/
│   │       ├── users/
│   │       └── activity/
│   ├── borrow/
│   ├── dashboard/
│   ├── reserve/
│   └── virtual-map/
├── components/
│   ├── forms/
│   │   ├── admin/
│   │   │   ├── equipment/
│   │   │   │   ├── equipment-management.tsx (NEW)
│   │   │   │   └── ...existing
│   │   │   ├── room/
│   │   │   │   ├── room-management.tsx (NEW)
│   │   │   │   └── ...existing
│   │   │   └── ...existing
│   │   ├── borrow/
│   │   └── reserve/
│   ├── shared/
│   │   ├── AvailabilityCalendar.tsx (NEW)
│   │   ├── StatusBadge.tsx (NEW)
│   │   ├── ConfirmDialog.tsx (NEW)
│   │   └── ImageUpload.tsx (NEW)
│   └── ui/
├── hooks/
│   ├── useEquipment.ts (NEW)
│   ├── useRooms.ts (NEW)
│   ├── useBorrowRequests.ts (NEW)
│   ├── useRoomReservations.ts (NEW)
│   └── useAdmin.ts (NEW)
├── lib/
│   ├── supabase/
│   │   ├── client.ts (NEW)
│   │   ├── server.ts (NEW)
│   │   └── types.ts (NEW)
│   └── utils.ts
└── public/
```

---

## 12. Notes

- **Virtual Map:** Keep hardcoded, only update design styling
- **Login:** Skip for now, structure is in place for future
- **Reserve Page:** Don't change page.tsx, only update components
- **Design Reference:** Use admin page as the gold standard for all styling
- **Database:** Supabase PostgreSQL with real-time subscriptions
- **Testing:** Test admin features thoroughly before moving to user-facing features

---

## 13. Success Criteria

- [ ] Admin can add/edit/delete equipment categories, models, and units
- [ ] Admin can add/edit/delete rooms with weekly availability schedules
- [ ] Admin can approve/reject borrow and room reservation requests
- [ ] All pages follow the unified design system from admin page
- [ ] Real-time data updates from Supabase
- [ ] Mobile responsive on all pages
- [ ] No console errors or warnings
- [ ] Smooth user experience with loading states
- [ ] Proper error handling and validation

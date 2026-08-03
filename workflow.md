# Technical Stack & A-to-Z Workflow Analysis — School AIOS (ERP)

---

## 1. Technical Stack & Package Versions

| Category | Technology / Library | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `16.2.11` | React Framework for SSR, Server Components & API Route Handlers |
| **UI Library** | React & React DOM | `18.3.1` | Core UI Component Rendering |
| **Language** | TypeScript | `5.6.3` | Type Safety & Interfaces across API & UI |
| **Database ORM** | Prisma Client & CLI | `5.22.0` | Schema definition, MySQL migrations & type-safe queries |
| **State Management** | Zustand | `5.0.1` | Client-side lightweight reactive state management + persistence |
| **Styling** | Tailwind CSS | `3.4.14` | Utility-first CSS styling framework |
| **CSS Helpers** | Clsx & Tailwind-Merge | `2.1.1` / `2.5.4` | Conditional class joining and dynamic tailwind class merging |
| **Icons** | Lucide React | `0.454.0` | Modern vector icon set |
| **Animations** | Framer Motion | `11.11.11` | Micro-interactions and smooth page transitions |
| **Data Visuals** | Recharts | `2.13.3` | Interactive dashboard charts & analytics |
| **Exports** | jsPDF & XLSX | `2.5.2` / `0.18.5` | PDF & Excel report generation |
| **Tooling** | Cross-Env & PostCSS | `10.1.0` / `8.4.47` | Environment variables cross-platform script runner |

---

## 2. Project Folder Structure

```
School_AIOS/
├── prisma/
│   └── schema.prisma              # Database Models (User, Student, Staff, Attendance, Vouchers, etc.)
├── src/
│   ├── app/                       # Next.js App Router Structure
│   │   ├── (auth)/                # Route Group for Authentication (login, reset-password, otp)
│   │   ├── (dashboard)/           # Route Group for Main Admin ERP Pages
│   │   │   ├── students/          # Student Management Page
│   │   │   ├── staff/             # Staff Management Page
│   │   │   ├── finance/           # Financial Vouchers & Ledger Page
│   │   │   └── settings/          # Admin Settings & Seed Data Reset
│   │   ├── api/                   # REST API Route Handlers (Next.js Route Handlers)
│   │   │   ├── admin/             # Clear Demo Data & Administrative APIs
│   │   │   ├── students/          # GET, POST, PUT, DELETE Student Endpoints
│   │   │   └── finance/           # GET, POST, DELETE Financial Data
│   │   ├── globals.css            # Custom CSS & Tailwind Base Directives
│   │   └── layout.tsx             # Root Application Layout
│   ├── components/                # Reusable React UI Components
│   │   ├── crud/                  # Generic Master-Detail Components (DataTable, CrudModal, ConfirmDialog)
│   │   └── dashboard/             # Dashboard Widgets & KPI Cards
│   ├── lib/                       # Core Services, Helpers & Configuration
│   │   ├── db.ts                  # Prisma DB Client Connection Singleton
│   │   ├── mock-data.ts           # Fallback Initial Seed Structures
│   │   └── utils.ts               # Formatting & Export Helpers
│   ├── store/                     # Global State Management (Zustand Stores)
│   │   ├── auth-store.ts          # Auth & User Session State
│   │   └── crud-store.ts          # Business Entities State (Hybrid local persistence)
│   └── types/                     # TypeScript Domain Models & Types
├── package.json                   # Project Dependencies & Scripts
├── tailwind.config.js             # UI Design Tokens & Theme Configuration
└── next.config.mjs                # Next.js Server & Compiler Settings
```

---

## 3. Database Service Code (`src/lib/db.ts`)

The project uses a **Singleton Prisma Client** to avoid exhausting database connections in Next.js development hot-reloading:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

export const isDbConnected = (): boolean => Boolean(process.env.DATABASE_URL);
```

---

## 4. State Management Code (`src/store/crud-store.ts`)

Global state management is driven by **Zustand**. It provides local reactive state with fallback methods when the MySQL database is offline:

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useCrudStore = create<CrudState>()(
  persist(
    (set, get) => ({
      students: [],
      staff: [],
      
      permanentDeleteRecord: (module, id) => {
        set((state) => ({
          [module]: state[module].filter((item: any) => item.id !== id),
        }));
      },
    }),
    {
      name: 'abs_school_erp_crud_store_v1',
      storage: createJSONStorage(() => (typeof window !== 'undefined' && window.localStorage ? window.localStorage : dummyStorage)),
    }
  )
);
```

---

## 5. LocalStorage / SessionStorage Persistence Code

Zustand uses `createJSONStorage` wrapped with SSR guard (`typeof window !== 'undefined'`) to prevent server-side hydration mismatches:

```typescript
// Safe LocalStorage binding for SSR / Node runtime
const storage = createJSONStorage(() =>
  typeof window !== 'undefined' && window.localStorage ? window.localStorage : dummyStorage
);
```

---

## 6. Data Fetching Code (`useEffect` + Next.js `fetch`)

Data fetching is performed in client components using `useEffect` with `cache: 'no-store'` to ensure real-time fresh data retrieval:

```typescript
useEffect(() => {
  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setStudents(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  };
  fetchStudents();
}, []);
```

---

## 7. Delete API Code (`src/app/api/students/route.ts`)

The API follows a **Dual-Mode Architectural Pattern**: if the MySQL DB is connected, it uses Prisma; otherwise, it falls back to deleting from the Zustand store.

```typescript
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    if (isDbConnected()) {
      await db.student.delete({ where: { id } });
      revalidatePath('/students');
      return NextResponse.json({ success: true });
    }

    useCrudStore.getState().permanentDeleteRecord('students', id);
    revalidatePath('/students');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete student' }, { status: 500 });
  }
}
```

---

## 8. Management Page Code — Delete Icon Component Only (`src/components/crud/DataTable.tsx`)

This is the exact UI component snippet rendering the **Delete Icon Button** within the table actions:

```tsx
{/* Soft Delete Icon Button */}
{onSoftDeleteClick && !showTrash && (
  <button
    onClick={() => onSoftDeleteClick(item)}
    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
    title="Move to Trash"
  >
    <Trash2 className="w-4 h-4" />
  </button>
)}

{/* Permanent Purge Icon Button */}
{onPermanentDeleteClick && showTrash && (
  <button
    onClick={() => onPermanentDeleteClick(item)}
    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
    title="Permanently Delete"
  >
    <Trash2 className="w-4 h-4 text-rose-600" />
  </button>
)}
```

---

## 9. Settings Page Reset Demo Data Seed Button Code (`src/app/(dashboard)/settings/page.tsx`)

The UI action trigger for resetting demo transactional data:

```tsx
<button
  onClick={async () => {
    if (!confirm('Are you sure you want to execute Reset Demo Seed Data?\n\nProtected data (Students, Staff) will remain intact.')) return;

    try {
      resetToDefaultData(); // Clears Zustand client state
      const res = await fetch('/api/admin/clear-demo-data', { method: 'POST' }); // Clears DB demo tables
      const json = await res.json();
      if (json.success) setCleanupReport(json.report);
    } catch (err) {
      alert('Failed to clear demo data');
    }
  }}
  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2"
>
  <Trash2 className="w-4 h-4" /> Reset Demo Seed Data
</button>
```

---

## 10. Demo Data Initialization & Seed Data Logic (`src/app/api/admin/clear-demo-data/route.ts`)

The reset mechanism explicitly separates **Protected Master Data** (Students, Staff, Classes) from **Transactional Demo Data** (Vouchers, Purchases, Sales, Inventory):

```typescript
// Protected tables are measured & kept intact (0 deleted)
const protectedTables = ['Students', 'Staff', 'Classes', 'Users'];

// Transactional demo tables purged on seed reset
const tablesToClean = [
  { name: 'Financial Vouchers', model: db.financialTransaction },
  { name: 'Purchase Orders', model: db.purchaseOrder },
  { name: 'Sales Items', model: db.salesItem },
  { name: 'Inventory Items', model: db.inventoryItem },
];

for (const item of tablesToClean) {
  if (item.model) {
    await item.model.deleteMany({});
  }
}
```

---

## Summary of Workflow Execution (A to Z)

1. **User Action (Client)**: User clicks a UI action (e.g. Delete Icon or Reset Demo Data Button).
2. **State & UI Update**: React triggers component handlers (`DataTable.tsx` or `settings/page.tsx`).
3. **HTTP Fetch Request**: Sent to Next.js API Route Handlers via `fetch('/api/...', { method: 'DELETE' | 'POST' })`.
4. **Hybrid Persistence Layer (`isDbConnected()`)**:
   - If MySQL DB is active: Prisma ORM executes `@prisma/client` commands (`db.student.delete()`).
   - If MySQL DB is offline: Zustand Store performs mutation (`useCrudStore.getState().permanentDeleteRecord()`) and syncs with `localStorage`.
5. **Next.js Revalidation**: `revalidatePath()` refreshes server cache and delivers updated data instantly to the UI.

# ABS School Management ERP Dashboard

A **complete, enterprise-grade School Management ERP** built for **ABS School** — covering everything from LKG to 12th Standard, including student admissions, fee collection, staff payroll, attendance, examinations, inventory, purchase management, bus transportation, and financial reporting.

---

## ✨ Features

- **13-Role RBAC** — Super Admin, Principal, Vice Principal, Admin, Accountant, Teacher, HR, Receptionist, Librarian, Transport Manager, Inventory Manager, Parent, Student
- **18 KPI Dashboard Cards** — Real-time school metrics at a glance
- **8 Interactive Charts** — Admissions, Fees, Attendance, Finance, Procurement
- **20+ ERP Modules** — Students, Staff, Fees, Attendance, Exams, Purchase, Inventory, Bus, Finance, POS Sales, Suppliers, Announcements, Reports, Admin
- **Theme Engine** — Light, Dark, Corporate Blue, and Auto system themes
- **Global Search** (`Ctrl+K`) — Instant search across all modules
- **CSV Report Exports** — Download data from all 11 modules
- **Responsive Design** — Mobile, Tablet and Desktop optimized
- **Production Build** — 26 pre-rendered static pages, 0 errors

---

## 🛠 Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| Charts | Recharts v2 |
| State | Zustand |
| Icons | Lucide React |
| Build | Next.js Static Export |

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- npm 9+

### Install Dependencies
```bash
npm install
```

### Set Up Environment Variables
```bash
cp .env.example .env.local
# Fill in your values in .env.local
```

### Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the ERP dashboard.

### Build for Production
```bash
npm run build
npm start
```

---

## ☁️ Deploy to Vercel (Recommended)

### One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/abs-school-erp)

### Manual Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Configure Environment Variables in Vercel Dashboard**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.example`

### Vercel Configuration (`vercel.json`)
The project includes a pre-configured `vercel.json` for optimal deployment.

---

## 📦 Project Structure

```
abs-school-erp/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Login, OTP, Reset Password
│   │   ├── (dashboard)/     # All ERP modules
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── dashboard/       # KPI Cards, Charts, Widgets
│   │   └── layout/          # Sidebar, Header, Search, Notifications
│   ├── lib/
│   │   ├── mock-data.ts     # Sample school data
│   │   ├── permissions.ts   # RBAC module matrix
│   │   └── utils.ts
│   ├── store/
│   │   ├── auth-store.ts    # Zustand auth store
│   │   └── ui-store.ts      # Theme & UI store
│   └── types/
│       └── index.ts         # All TypeScript interfaces
├── public/
├── .env.example
├── .gitignore
├── vercel.json
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## 🏫 School ERP Modules

| Module | Features |
|---|---|
| Students | Registration, Admission, Profile, Search, Export |
| Staff | Teacher/Non-teaching, Payroll, Departments |
| Staff Allocation | Class/Subject/Route assignments |
| Attendance | Daily logs, RFID-ready, Present/Absent/Late/Leave |
| Fees | Class-wise structure, Collection, Receipts |
| Examinations | Schedule, Marks entry, Grade cards |
| Purchases | PO management, GRN, Vendor invoices |
| Suppliers | GST records, Outstanding balances |
| POS Sales | Uniforms, ID Cards, Books counter billing |
| Inventory | Warehouse stock, Low-stock alerts |
| Bus Transport | Fleet, Routes, Driver & Student allocation |
| Finance | Ledger, Profit & Loss, Cash Book |
| Announcements | Broadcast circulars with priority levels |
| Reports | CSV exports for all 11 modules |
| Admin & RBAC | Permission matrix, Audit logs |
| Settings | School identity, Theme preferences |
| Profile | Personal details, Password change |

---

## 📄 License

© 2026 ABS School. All Rights Reserved. Built for Excellence in Education.

# School.md

# ABS School Management Dashboard – Antigravity AI Build Instructions

## Project Overview

Build a modern, enterprise-grade School Management Dashboard for **ABS School**.

The dashboard should be highly professional, responsive, scalable, user-friendly, and suitable for daily school administration.

ABS School provides education from **LKG to 12th Standard** and also manages additional services including:

- Student Admissions
- School Fees
- School Uniform Distribution
- Student ID Card Management
- Bus Transportation
- Staff Management
- Academic Management

The dashboard should feel like a premium ERP used by leading educational institutions.

---

# UI / UX Requirements

Design Style

- Modern Corporate Design
- Clean Layout
- Professional School ERP
- Easy Navigation
- Responsive
- Mobile Friendly
- Tablet Friendly
- Desktop Optimized

Color Palette

Primary
- Corporate Blue

Secondary
- White

Accent
- Sky Blue
- Light Gray

Success
- Green

Warning
- Orange

Danger
- Red

Cards

- Rounded corners
- Soft shadows
- Professional icons
- Spacious layout

Typography

- Modern Sans Serif
- Excellent readability

Animations

- Smooth transitions
- Hover effects
- Loading animations
- Skeleton loaders

Theme

Include Theme Settings

Allow Admin to switch between:

- Light Theme
- Dark Theme
- Blue Theme
- Auto Theme

---

# Authentication

Create secure authentication.

Pages

- Login
- Forgot Password
- Reset Password
- OTP Verification
- Profile
- Change Password

Roles

- Super Admin
- Principal
- Vice Principal
- Admin
- Accountant
- Teacher
- HR
- Receptionist
- Librarian
- Transport Manager
- Inventory Manager
- Parent
- Student

Role-based permissions should control access to all modules.

---

# Dashboard Home

Display beautiful KPI cards.

Cards

- Total Students
- Boys
- Girls
- Total Staff
- Teaching Staff
- Non Teaching Staff
- Today's Attendance
- Fee Collection Today
- Monthly Fee Collection
- Pending Fees
- Exams Scheduled
- Buses Running
- Inventory Items
- Suppliers
- Purchase Orders
- Announcements
- Events
- Visitors Today

Charts

- Monthly Admissions
- Fee Collection
- Attendance Analytics
- Class-wise Students
- Staff Attendance
- Expense Analysis
- Revenue vs Expense
- Purchase Analytics

Widgets

- Today's Timetable
- Upcoming Exams
- Recent Payments
- Birthday List
- Notifications
- School Calendar

---

# Student Management

Features

- Student Registration
- Admission
- Student Profile
- Student Search
- Student Promotion
- Student Transfer
- Student Leaving Certificate
- Student Documents
- Parent Details
- Guardian Details
- Medical Information
- Academic History
- Class Assignment
- Section Assignment
- Roll Number Generation
- Bulk Student Import
- Export Students

Student Profile Includes

- Photo
- Name
- Admission Number
- Roll Number
- Class
- Section
- Date of Birth
- Gender
- Blood Group
- Address
- Parent Details
- Bus Route
- Fee Details
- Attendance
- Marks
- Documents

---

# Staff Management

Manage

- Teachers
- Office Staff
- Drivers
- Conductors
- Security
- Cleaning Staff

Features

- Staff Profile
- Joining Date
- Qualification
- Salary
- Department
- Leave Management
- Attendance
- Documents
- Experience
- Promotion
- Transfer
- Payroll

---

# Staff Allocation

Allocate teachers to

- Classes
- Subjects
- Sections

Allocate

- Drivers
- Bus Routes
- Lab Staff
- Office Staff

---

# Attendance Management

Student Attendance

- Daily Attendance
- Monthly Attendance
- QR Attendance (Optional)
- RFID Ready
- Attendance Reports

Staff Attendance

- Daily Attendance
- Monthly Reports
- Late Entry
- Early Exit
- Leave Tracking

Dashboard

- Present
- Absent
- Leave
- Half Day

---

# Fees Management

Features

- Fee Categories
- Fee Structure
- Installments
- Discounts
- Scholarships
- Fine Calculation
- Due Fees
- Fee Collection
- Online Payment Ready
- Offline Payment
- Receipt Printing
- Refund Management

Reports

- Daily Collection
- Monthly Collection
- Pending Fees
- Class-wise Collection

---

# Examination Management

Features

- Exam Schedule
- Internal Tests
- Unit Tests
- Mid Term
- Quarterly
- Half Yearly
- Annual Exams

Marks

- Subject-wise Marks
- Grade Calculation
- Rank
- Report Card
- Progress Card

Reports

- Student Performance
- Subject Analysis
- Pass Percentage
- Top Rankers

---

# Purchase Management

Manage

- Purchase Orders
- Purchase Bills
- Goods Received
- Vendor Payments

Workflow

Supplier

↓

Purchase Order

↓

Goods Received

↓

Inventory Updated

↓

Payment

Reports

- Purchase Summary
- Purchase History
- Pending Purchases

---

# Supplier Management

Store

- Supplier Profile
- Contact
- GST Details
- Products
- Purchase History
- Outstanding Balance

---

# Sales Management

Manage school-related sales.

Products

- School Uniforms
- ID Cards
- Books
- Stationery
- School Accessories

Features

- Billing
- Invoice
- Customer Details
- GST
- Discounts
- Barcode Support

Reports

- Daily Sales
- Monthly Sales
- Product Sales
- Profit

---

# Inventory Management

Categories

- Uniforms
- Books
- Stationery
- Furniture
- Computers
- Electronics
- Laboratory Equipment
- Sports Equipment
- Office Supplies

Features

- Stock In
- Stock Out
- Low Stock Alerts
- Barcode Ready
- Purchase Integration
- Supplier Mapping
- Warehouse
- Damaged Items

Reports

- Inventory Value
- Stock Movement
- Low Stock
- Expiry (if applicable)

---

# Finance Management

Income

- School Fees
- Uniform Sales
- ID Card Sales
- Donations
- Other Income

Expenses

- Salary
- Maintenance
- Electricity
- Water
- Transport
- Purchase
- Office Expenses

Reports

- Profit & Loss
- Cash Flow
- Balance Sheet
- Daily Cash Book
- Expense Analysis
- Income Analysis

---

# Bus Management

Features

- Bus Registration
- Driver Management
- Route Management
- Student Allocation
- Pickup Points
- Vehicle Maintenance
- Fuel Log
- Insurance Tracking

Reports

- Bus Occupancy
- Route Report
- Driver Report

---

# Announcement Management

Features

Create announcements for

- Students
- Parents
- Teachers
- Staff

Priority

- Normal
- Important
- Urgent

Scheduling

- Immediate
- Scheduled

Notifications

- Dashboard
- Email Ready
- SMS Ready

---

# Admin & Role Management

Features

- User Management
- Role Management
- Permission Matrix
- Activity Logs
- Login History
- Device History
- Password Policy

---

# Reports Module

Generate reports for every module.

Support

- PDF Export
- Excel Export
- CSV Export
- Printing

Reports Include

- Student Reports
- Staff Reports
- Attendance Reports
- Fees Reports
- Finance Reports
- Purchase Reports
- Sales Reports
- Inventory Reports
- Supplier Reports
- Bus Reports
- Examination Reports

---

# Notification Center

Notifications for

- Fee Due
- Birthdays
- Attendance
- Exams
- Inventory Alerts
- Purchase Status
- Staff Leave
- Announcements

---

# Settings Module

School Settings

- School Name
- Logo
- Address
- Contact
- Email
- Website
- Academic Year
- Session

System Settings

- Theme
- Time Zone
- Date Format
- Currency
- Language

Security

- Backup
- Restore
- Activity Logs
- Audit Logs

---

# Search

Global search should instantly search:

- Students
- Staff
- Fees
- Purchases
- Suppliers
- Inventory
- Sales
- Exams
- Attendance
- Announcements

---

# Dashboard Features

- Advanced Filters
- Pagination
- Sorting
- Bulk Actions
- Import
- Export
- Responsive Tables
- Sticky Headers
- Dark Mode
- Keyboard Shortcuts
- Notification Panel

---

# Recommended Technology Stack

Frontend

- React.js
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- React Hook Form
- TanStack Table
- Recharts

Backend

- Node.js
- NestJS

Database

- PostgreSQL

ORM

- Prisma ORM

Authentication

- JWT Authentication
- Refresh Tokens
- Role-Based Access Control (RBAC)

Storage

- Amazon S3 or Cloudinary for file uploads

Caching

- Redis

API

- REST API (with GraphQL-ready architecture)

Real-Time Features

- Socket.IO

Reporting

- PDF Generation
- Excel Export

Deployment

- Docker
- Nginx
- GitHub Actions CI/CD
- AWS / DigitalOcean / Azure

---

# Quality Requirements

The application must be:

- Enterprise-grade
- Secure
- Fast
- Responsive
- Scalable
- Modular
- Accessible
- Easy to maintain
- Production-ready

Use reusable components, clean architecture, proper validation, comprehensive error handling, audit logging, and optimized database queries throughout the application.

---

# Final Goal

Develop a complete, production-ready **ABS School Management ERP Dashboard** with a polished corporate interface that enables administrators to efficiently manage academics, admissions, staff, attendance, examinations, fees, inventory, finance, transportation, announcements, and reporting from a single centralized platform.
# Real.md

# Objective

Convert the entire **ABS School Management ERP** from a demo application into a **fully real-world production ERP**.

Currently, several modules contain **pre-defined (hardcoded) sample data** created during development. Remove all demo data and ensure that every record displayed in the application comes only from the MySQL database.

The system must behave like a real commercial ERP where administrators and authorized users manually create and manage all records.

---

# Strict Rules

Do NOT change:

- Existing UI Design
- Existing Navigation
- Existing Dashboard Layout
- Existing Workflow
- Existing Business Logic
- Existing Module Structure

Only remove demo/static data and make every module fully database-driven.

---

# Remove All Predefined Data

Search the entire project for:

- Hardcoded Arrays
- Static JSON Data
- Demo Records
- Mock Data
- Fake Dashboard Statistics
- Placeholder Tables
- Sample Charts
- Static Reports
- Dummy Cards
- Seeded UI Records
- Local Storage Data
- Session Storage Data
- Frontend Constants used as data

Remove every demo record from the application.

---

# Dashboard

Currently dashboard cards display predefined values.

Remove all static values.

Every dashboard widget must load data directly from MySQL.

Examples:

Total Students

Total Staff

Today's Attendance

Fee Collection

Inventory Count

Purchase Count

Sales

Revenue

Expenses

Bus Count

Exam Count

Announcements

Notifications

Everything must be calculated dynamically.

---

# Charts

Remove fake chart datasets.

Charts must retrieve live data from MySQL.

Examples

Admission Trend

Monthly Fee Collection

Attendance Analytics

Sales Analytics

Expense Analytics

Inventory Analytics

Student Distribution

Gender Distribution

Everything must be generated from actual records.

---

# Tables

Every table should initially display:

"No Records Found"

until users create data.

Do NOT show demo rows.

Examples

Students

Staff

Fees

Suppliers

Inventory

Sales

Purchases

Attendance

Announcements

Reports

---

# CRUD Modules

Every Create button must insert records into MySQL.

Every Edit button must update MySQL.

Every Delete button must remove or soft-delete records in MySQL.

Every View page must read directly from MySQL.

Never use local arrays.

---

# User Data Entry

The application should rely entirely on user-entered information.

Examples:

Student Registration

↓

Save into MySQL

↓

Dashboard Updates Automatically

↓

Reports Update Automatically

↓

Charts Update Automatically

Repeat this behavior for every module.

---

# Database Requirement

Use **MySQL** as the only production database.

Do not use:

- JSON Files
- Local Storage
- Session Storage
- Mock APIs
- Static Objects
- Fake Arrays
- SQLite
- Firebase
- MongoDB
- IndexedDB

All application data must come from MySQL.

---

# MySQL Integration

If the Antigravity MySQL MCP Server cannot be connected, do **not** change the database choice.

Instead, prepare the application using a standard production architecture.

Use:

Backend

- Node.js
- NestJS (Preferred) or Express.js

Database

- MySQL 8+

ORM

- Prisma ORM (Preferred)

Alternative

- TypeORM

Create a REST API layer between the frontend and MySQL.

Application Flow:

Frontend

↓

REST API

↓

Service Layer

↓

Repository / ORM

↓

MySQL Database

The frontend must never communicate directly with the database.

---

# Database Connection

Prepare secure database configuration using environment variables.

Example:

DATABASE_HOST

DATABASE_PORT

DATABASE_NAME

DATABASE_USER

DATABASE_PASSWORD

DATABASE_URL

Never hardcode database credentials.

---

# Dynamic Dashboard

Dashboard must automatically update when:

- New Student Added
- Staff Added
- Fee Collected
- Attendance Marked
- Purchase Created
- Sales Created
- Inventory Updated
- Announcement Added
- Exam Created

No manual refresh of statistics should be required.

---

# Search

Every search box should query MySQL.

Support:

Search

Filter

Sort

Pagination

Date Range

Status

Keyword

---

# Reports

Every report must retrieve live data.

If there are no records:

Display

"No Data Available"

Do not generate fake reports.

---

# Printing

Receipts

Invoices

Reports

Certificates

Attendance Sheets

Fee Receipts

ID Cards

must print only real database records.

---

# Notifications

Notifications should be generated only from real events.

Examples:

Student Added

Fee Due

Attendance Missing

Low Inventory

Exam Scheduled

New Announcement

Do not generate demo notifications.

---

# Images & Files

Student Photos

Staff Photos

Documents

Certificates

Attachments

must be uploaded by users and stored securely.

Do not use placeholder images except as temporary avatars when no image has been uploaded.

---

# User Creation

The administrator creates:

Students

Staff

Suppliers

Users

Roles

Inventory Items

Products

Routes

Everything entered by users must immediately be saved in MySQL and reflected across the system.

---

# Empty State

For every module with no records, show professional empty-state messages.

Examples:

"No Students Found"

"No Staff Records"

"No Inventory Available"

"No Purchase Records"

"No Fee Collections Yet"

Include an optional "Create New" button.

Do not display sample data.

---

# API Standards

Every module should expose REST APIs.

Examples:

GET

POST

PUT

PATCH

DELETE

All endpoints must use MySQL.

---

# MySQL First Policy

Even if Antigravity cannot directly connect to a MySQL MCP Server, **do not switch to another database**.

Instead:

- Build the backend for MySQL.
- Configure Prisma or TypeORM.
- Generate the database schema.
- Generate migration files.
- Generate seed support (only for essential system data like the default admin account).
- Keep all business data empty until entered by users.

The application must be ready to connect to any standard MySQL server by updating the `.env` file.

---

# Seed Data Rules

Allow only essential system seed data such as:

- Default Super Admin
- Default Roles
- Default Permissions
- Default System Settings

Do NOT seed:

- Students
- Staff
- Suppliers
- Purchases
- Sales
- Attendance
- Exams
- Inventory
- Reports
- Finance Records
- Announcements

These must always be created by users.

---

# Code Cleanup

Remove:

- Dummy Constants
- Fake API Responses
- Demo Arrays
- Sample JSON Files
- Mock Fetch Functions
- Static Dashboard Data
- Development Test Data

Refactor the code so every screen uses database queries.

---

# Final Validation

Verify that:

- No hardcoded business data remains.
- Every CRUD operation reads and writes to MySQL.
- Dashboard statistics are calculated from live data.
- Charts use real database values.
- Reports use real database records.
- Empty modules display appropriate empty states.
- The application is production-ready.
- The system remains compatible with MySQL.

---

# Final Goal

Transform the ABS School Management ERP into a **real-world, production-ready application** where every business record is created by users and stored in a **MySQL database**. Eliminate all predefined sample data, ensure every dashboard widget, table, chart, report, and receipt uses live database information, and prepare a clean backend architecture that works with a standard MySQL server even if direct MySQL MCP integration is unavailable.
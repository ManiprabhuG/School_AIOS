# RoleCredential.md

# Objective

Fix and improve the Role-Based Authentication System so that **every user created through the User Management module can successfully log in using their assigned User ID and Password**.

Currently, only the default admin account is authenticated correctly. Any newly created role (Principal, Vice Principal, Teacher, etc.) cannot log in even though their credentials exist in the database. This behavior must be corrected without changing the existing workflow or UI.

---

# Existing Workflow (Do NOT Change)

Maintain the following authentication flow exactly:

Login Page

↓

Enter User ID

↓

Enter Password

↓

Authenticate

↓

Load User Role

↓

Load Permissions

↓

Redirect to Dashboard

Do not modify the login page design, navigation, or user experience.

---

# Authentication Fix

The login system must authenticate **every active user stored in the MySQL database**, not only the default administrator.

The authentication process must:

1. Read the User ID entered on the login page.
2. Search the `users` table in MySQL.
3. Verify that the account exists.
4. Verify that the account status is **Active**.
5. Compare the entered password with the stored hashed password.
6. Load the assigned role.
7. Load all role permissions.
8. Create the authenticated session.
9. Redirect to the dashboard.

---

# Login Identifier

Allow login using either:

- User Login ID
OR
- Login Email Address (if configured)

Example:

User Login ID

vice

Password

vice123

OR

Email

viceprincipal@school.com

Password

vice123

The system should automatically determine whether the entered value is a Login ID or an Email Address.

---

# Database Authentication

Authenticate directly from MySQL.

Never authenticate using:

- Hardcoded arrays
- Static JSON
- Demo users
- Mock data
- Local Storage
- Session Storage

Authentication must always use the database.

---

# User Creation Rules

Whenever an administrator creates a new user, automatically save:

- Full Name
- User Login ID
- Login Email
- Password (Hashed)
- Assigned Role
- Status
- Phone Number
- Avatar
- Created Date

The new user must be immediately available for login after saving.

No restart or cache refresh should be required.

---

# Password Handling

Never store passwords in plain text.

When saving a user:

Entered Password

↓

Hash Password (bcrypt or Argon2)

↓

Save Hash into MySQL

During login:

Entered Password

↓

Compare with Stored Hash

↓

Authenticate

Do not compare plain-text passwords.

---

# User Status Validation

Allow login only if:

Status = Active

Block login if:

Inactive

Disabled

Deleted

Locked

Pending Approval

Display a generic authentication error.

Do not expose internal validation details.

---

# Role Validation

After successful authentication:

Load the assigned role.

Examples:

Super Admin

Admin

Principal

Vice Principal

Teacher

HR

Receptionist

Librarian

Transport Manager

Inventory Manager

Accountant

Parent

Student

Any Custom Role

Load permissions before redirecting.

---

# Permission Loading

After login, automatically load:

- Menu Permissions
- Dashboard Permissions
- CRUD Permissions
- Report Permissions
- Module Access
- Print Permissions
- Export Permissions

Hide unauthorized menus automatically.

---

# Default Administrator

Keep the seeded administrator account.

Login ID

admin

Password

admin123

Role

Super Admin

This account should always exist.

---

# User Login Examples

These are examples only.

Do not display them on the login page.

Admin

Login ID

admin

Password

admin123

Teacher

Login ID

teacher01

Password

teacher123

Principal

Login ID

principal01

Password

principal123

Vice Principal

Login ID

vice01

Password

vice123

These users should only exist if created by the administrator or inserted through the database seed.

---

# Database Tables

Authentication should use:

users

roles

permissions

role_permissions

user_roles

login_history

password_resets

Use proper foreign key relationships.

---

# User Management Alteration

When editing a user:

If the administrator changes:

- Login ID
- Email
- Password
- Role
- Status

The authentication system must immediately use the updated values.

No cache clearing or manual synchronization should be required.

---

# Login Validation

Validate:

User Exists

↓

Account Active

↓

Password Correct

↓

Role Exists

↓

Permissions Loaded

↓

Create Session

↓

Redirect

---

# Error Messages

Use only generic messages.

Example:

Invalid User ID or Password.

Do not reveal:

- User exists
- Password incorrect
- Role missing
- Account disabled

---

# Session Creation

After successful login:

Generate JWT or Session

Load User Profile

Load Role

Load Permissions

Update Last Login

Store Login History

Redirect Dashboard

---

# Login History

Record:

User ID

Role

Login Time

Logout Time

IP Address

Browser

Device

Operating System

Login Status

Failed Attempts

---

# API Requirements

Create secure authentication APIs.

POST /api/auth/login

POST /api/auth/logout

POST /api/auth/forgot-password

POST /api/auth/reset-password

GET /api/auth/profile

GET /api/auth/permissions

All APIs must interact with MySQL.

---

# Security

Implement:

Password Hashing

Prepared SQL Statements

SQL Injection Prevention

XSS Protection

Rate Limiting

CSRF Protection

Secure Cookies

JWT Expiration

Session Timeout

Role Validation

Audit Logs

---

# Debugging Requirement

Inspect and fix the existing authentication logic.

Ensure that:

- The login query searches the correct database fields.
- Password hashing and comparison are consistent.
- User status is checked correctly.
- Role lookup succeeds.
- Permission loading succeeds.
- Newly created users can log in immediately after being saved.

---

# Strict Rules

Do NOT change:

- Login Page UI
- Existing Dashboard
- Navigation
- Workflow
- User Management Screens
- Database Structure (unless required to fix authentication)

Only correct the authentication logic so that every valid user created by the administrator can successfully log in.

---

# Final Goal

Implement a production-ready, MySQL-backed role-based authentication system where every user created through the User Management module can log in immediately using their assigned Login ID or Email Address and Password. Authentication must securely validate credentials, load roles and permissions, create a session, and redirect users to the appropriate dashboard while preserving the existing workflow and user interface.
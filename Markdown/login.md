# Login.md

# Objective

Modify the existing School Management ERP authentication system to implement a secure, role-based login mechanism using a **single login page** for all users. After successful authentication, users must be redirected to their respective dashboards based on their assigned role and permissions.

---

# Authentication Flow

The login workflow must follow this sequence:

Login Page

↓

User enters ID and Password

↓

Validate Credentials

↓

Authenticate User

↓

Load User Role

↓

Load Role Permissions

↓

Redirect to Dashboard

---

# Login Page Requirements

Create **one common login page** for all user roles.

The login page should include:

- School Logo
- School Name
- Welcome Message
- User ID Input
- Password Input
- Show/Hide Password Toggle
- Remember Me Checkbox
- Forgot Password Link
- Secure Login Button
- Loading Indicator During Login
- Validation Messages
- Responsive Design

Do **not** display any sample usernames, IDs, passwords, hints, or demo credentials on the login screen.

---

# Login Credentials

## Default System Administrator

A default administrator account must be created during the initial database setup.

User ID

```
admin
```

Password

```
admin123
```

This account must have:

- Super Administrator privileges
- Full access to every module
- Permission to create, edit, and delete users
- Permission to create roles
- Permission to assign permissions

This default administrator account should be inserted automatically through the database seed or initialization process.

---

# Other User Roles

All other users must be created manually by an authorized administrator.

The administrator should be able to create login accounts for roles such as:

- Principal
- Vice Principal
- Admin
- Teacher
- Accountant
- HR
- Receptionist
- Librarian
- Inventory Manager
- Transport Manager
- Parent
- Student
- Any future custom role

Each newly created user must have:

- Unique User ID
- Password
- Assigned Role
- Status (Active / Inactive)
- Profile Information

Do not create default passwords for these roles unless specified by the administrator.

---

# Authentication Rules

Validate:

- User ID exists
- Password is correct
- Account is Active
- User Role exists
- Permissions are assigned

Reject login if:

- Invalid User ID
- Invalid Password
- Inactive Account
- Locked Account
- Deleted User

Display generic error messages such as:

"Invalid User ID or Password."

Do not reveal which field is incorrect.

---

# Password Security

Passwords must:

- Never be stored as plain text
- Be securely hashed using bcrypt or Argon2
- Be verified securely during login

Do not expose passwords through:

- API responses
- Logs
- Browser storage
- Source code

---

# Session Management

After successful login:

- Generate a secure JWT or session token
- Store the authentication token securely
- Load user permissions
- Redirect to the authorized dashboard

Support:

- Remember Me
- Automatic Session Expiry
- Secure Logout
- Token Refresh
- Session Timeout

---

# Dashboard Redirection

Redirect users according to their assigned role.

Examples:

Super Admin → Full Dashboard

Principal → Principal Dashboard

Teacher → Teacher Dashboard

Accountant → Finance Dashboard

Receptionist → Reception Dashboard

Parent → Parent Portal

Student → Student Portal

If multiple dashboards are not implemented, redirect all users to the main dashboard while displaying only the modules they are authorized to access.

---

# Role-Based Access Control (RBAC)

Every menu, page, button, and API endpoint must be protected using role-based permissions.

Users should only see modules they have permission to access.

Unauthorized users must not be able to access restricted pages through direct URLs.

---

# User Management

The administrator must be able to:

- Create Users
- Edit Users
- Delete Users
- Reset Passwords
- Activate/Deactivate Users
- Assign Roles
- Change User Passwords
- View Login History
- Unlock Accounts

---

# Login Audit

Record every login attempt in the database.

Store:

- User ID
- Login Time
- Logout Time
- IP Address (if available)
- Browser Information
- Device Information
- Login Status
- Failed Attempts

---

# Failed Login Protection

Implement:

- Failed Login Counter
- Temporary Account Lock after repeated failed attempts
- Password Reset Option
- Secure Recovery Process

---

# Forgot Password

Provide a secure password recovery workflow.

Support:

- Email-based reset (preferred)
- Administrator password reset
- Secure reset token
- Token expiration

---

# Database Integration

Store authentication data in the MySQL database.

Suggested tables include:

- users
- roles
- permissions
- role_permissions
- user_roles
- login_history
- password_resets

All authentication operations must interact directly with the database.

---

# Security Requirements

Implement:

- HTTPS-ready authentication
- CSRF protection
- SQL Injection prevention
- XSS protection
- Input validation
- Secure cookies (if applicable)
- Rate limiting
- Account lockout protection
- Audit logging

---

# UI Design

Use the existing school branding.

Theme:

- Corporate Blue
- White
- Clean Professional Layout
- Responsive Design
- Modern Login Card
- Rounded Corners
- Smooth Animations

---

# Strict Requirements

Maintain the existing application workflow.

Do not change:

- Existing modules
- Existing navigation
- Existing dashboard layout
- Existing role structure

Only enhance the authentication system according to these instructions.

Do not display any default credentials on the login page.

Only the seeded administrator account should use:

User ID: **admin**

Password: **admin123**

All other user accounts must be created manually by the administrator through the User Management module.

---

# Final Goal

Build a secure, enterprise-grade, single-login authentication system that supports all user roles, uses role-based access control, stores authentication data securely in MySQL, and redirects authenticated users to the appropriate dashboard while preserving the existing application workflow.
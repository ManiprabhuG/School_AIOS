# Secure.md

# Objective

Perform a comprehensive security hardening of the entire **ABS School Management ERP** without changing the existing workflow, UI, database structure, business logic, or module functionality.

The objective is to make the application production-ready by implementing enterprise-grade security best practices across the frontend, backend, APIs, authentication, file handling, database access, and infrastructure.

---

# Strict Rules

Do NOT change:

- Existing UI
- Existing Navigation
- Existing Workflow
- Existing CRUD Operations
- Existing Database Structure
- Existing Business Logic
- Existing APIs (except for security improvements)

Only improve the security of the application.

---

# 1. Rate Limiting

Implement configurable rate limiting for every API endpoint.

Never hardcode thresholds.

Store limits in environment variables or configuration files.

### Authentication APIs

Apply stricter protection for:

- Login
- Forgot Password
- Reset Password
- OTP Verification
- Account Activation

Implement:

- Per-IP Rate Limiting
- Per-Account Rate Limiting
- Sliding Window Algorithm
- Exponential Backoff
- Retry Delay
- Automatic Cooldown

Do NOT permanently lock user accounts after failed attempts.

---

### Public APIs

Apply moderate rate limits for:

- Public Announcements
- Public School Information
- Contact Forms
- Search APIs

---

### Authenticated APIs

Apply higher rate limits for authenticated users.

Examples:

- Student CRUD
- Staff CRUD
- Inventory CRUD
- Reports
- Dashboard
- Attendance
- Finance
- Purchases

Authenticated users should not experience unnecessary blocking during normal usage.

---

### Configuration

Rate limits must be configurable.

Example configuration values:

AUTH_RATE_LIMIT

PUBLIC_RATE_LIMIT

USER_RATE_LIMIT

RATE_LIMIT_WINDOW

EXPONENTIAL_BACKOFF

Never hardcode values.

---

# 2. Input Validation

Validate every input before processing.

Validation must occur on:

- Frontend
- Backend
- API Layer
- Database Layer

Never rely only on escaping or sanitizing.

Reject invalid input immediately.

---

## Validate

Type

Length

Format

Range

Required Fields

Allowed Characters

Enums

Email Format

Phone Number

Date Format

UUID

URL

Numbers

Currency

Password Strength

---

## Prevent

SQL Injection

Cross Site Scripting (XSS)

Command Injection

Path Traversal

NoSQL Injection

Header Injection

Mass Assignment

Prototype Pollution

Parameter Tampering

---

## Validation Rules

Every API request must use a validation schema.

Examples:

- Zod
- Joi
- Yup
- class-validator

Validation should happen before any business logic executes.

---

# 3. Secrets Management

Perform a complete security scan across the project.

Search for:

API Keys

Passwords

Tokens

JWT Secrets

Database Credentials

SMTP Credentials

Cloud Storage Keys

OAuth Secrets

Encryption Keys

Private Certificates

Webhook Secrets

---

## Replace

Move every secret into environment variables.

Use:

.env

.env.local

Environment Variables

Secret Managers

Never hardcode secrets anywhere.

---

## Verify

Ensure secrets never appear inside:

Frontend Bundle

Git Repository

Console Logs

Source Code

Public Assets

API Responses

Error Messages

Documentation

---

## Git Security

Verify:

.gitignore

.env

.env.local

Secrets

Certificates

Private Keys

Database Dumps

Log Files

Upload Folders

must never be committed.

---

# 4. Dependency Vulnerability Audit

Run a complete dependency security audit.

Inspect:

Node Packages

NPM Dependencies

Frontend Packages

Backend Packages

Development Dependencies

---

## Identify

Package Name

Installed Version

Safe Version

Severity

CVE

Risk Description

---

## Severity Levels

Critical

High

Medium

Low

Informational

---

## Remediation

Update packages safely.

Replace abandoned packages.

Remove unused packages.

Avoid breaking changes whenever possible.

Generate a dependency audit report.

---

# 5. Error Handling & Information Leakage

Review every error response.

Never expose:

Stack Traces

Database Errors

SQL Queries

Prisma Errors

File Paths

Server Paths

Framework Errors

Environment Variables

Secrets

Token Values

Internal URLs

Exception Messages

---

## User Messages

Return generic messages such as:

"Something went wrong."

"Unable to process your request."

"Invalid request."

"Authentication failed."

Do not expose technical details.

---

## Server Logging

Log internally:

Timestamp

Endpoint

User ID

IP Address

Error Code

Stack Trace

Request ID

Exception Details

Database Query

Store logs securely.

---

## Logging

Support:

Application Logs

Authentication Logs

Audit Logs

Security Logs

API Logs

Database Logs

System Logs

---

# 6. File Upload Security

Review every upload module.

Examples:

Student Photo

Staff Photo

Documents

Certificates

ID Cards

Reports

Attachments

Excel Imports

CSV Imports

PDF Uploads

---

## Validate

Actual MIME Type

File Signature (Magic Number)

Maximum File Size

Minimum File Size

Allowed Extensions

Content Validation

Image Dimensions

PDF Integrity

Virus Scan Hook

---

## Reject

Executable Files

Scripts

Double Extensions

Corrupted Files

Unknown MIME Types

Encrypted Dangerous Files

Oversized Files

---

## Storage

Store uploads:

Outside Web Root

Private Storage

Cloud Storage

Protected Directories

Never allow uploaded files to execute as code.

---

## File Naming

Generate unique random filenames.

Never use original filenames directly.

Prevent filename collisions.

---

# API Security

Review every API.

Implement:

Authentication

Authorization

RBAC

JWT Validation

CSRF Protection

CORS Configuration

Request Validation

Response Validation

Secure Headers

Rate Limiting

Audit Logging

---

# Authentication Security

Review:

Login

Logout

Session

JWT

Password Reset

Remember Me

Token Refresh

Session Timeout

Implement:

Secure Password Hashing

bcrypt or Argon2

Secure Cookies

Refresh Tokens

Token Rotation

Session Expiration

Account Status Verification

---

# Database Security

Review all database access.

Use:

Prepared Statements

Parameterized Queries

ORM Protection

Transactions

Connection Pooling

Encrypted Connections

Least Privilege Database User

---

# HTTP Security Headers

Implement:

Content Security Policy (CSP)

Strict Transport Security (HSTS)

X-Frame-Options

X-Content-Type-Options

Referrer Policy

Permissions Policy

Cross-Origin Policies

---

# CORS

Configure CORS securely.

Allow only trusted origins.

Restrict:

Methods

Headers

Credentials

Origins

---

# Session Security

Implement:

Secure Cookies

HttpOnly Cookies

SameSite Cookies

Session Expiration

Idle Timeout

Session Regeneration

Logout Cleanup

---

# Audit Logging

Log security events.

Examples:

Login

Logout

Password Change

Role Change

Permission Change

User Creation

Delete Operations

Export Operations

Failed Login

Rate Limit Triggered

Suspicious Activity

---

# Monitoring

Generate security monitoring for:

Authentication Failures

Repeated Login Attempts

Privilege Escalation

Large File Uploads

Large Exports

Unexpected API Usage

Database Errors

Server Errors

---

# Security Report

After completing the security review, generate a report containing:

## Security Summary

Overall Security Score

Risk Level

Critical Issues

High Issues

Medium Issues

Low Issues

Resolved Issues

Pending Issues

---

## Dependency Report

Package

Current Version

Updated Version

Severity

Status

---

## Secrets Report

Secrets Found

Secrets Removed

Environment Variables Created

Frontend Exposure Check

Git Exposure Check

---

## API Report

Endpoints Reviewed

Endpoints Protected

Rate Limiting Applied

Validation Added

Authorization Verified

---

## File Upload Report

Upload Modules Reviewed

Validation Added

Storage Verified

Blocked File Types

Maximum Upload Size

---

## Final Validation

Verify that:

- No hardcoded secrets remain.
- All API endpoints are protected.
- All user inputs are strictly validated.
- File uploads are secure.
- Sensitive errors are hidden from users.
- Dependencies are updated where safe.
- Rate limiting is enabled and configurable.
- Authentication is secure.
- MySQL queries are protected.
- Existing application workflow remains unchanged.

---

# Final Goal

Transform the ABS School Management ERP into a production-ready, enterprise-grade secure application by implementing comprehensive security hardening across authentication, APIs, input validation, dependency management, secrets management, file uploads, database access, logging, and error handling while preserving all existing functionality and workflows.
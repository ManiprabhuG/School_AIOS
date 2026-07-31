# BankFeature.md

# Objective

Analyze, design, and safely integrate a new **Fund Account Management System** into the existing ABS School Management ERP.

The purpose of this feature is to maintain accurate financial control by tracking all available school funds from a centralized account ledger.

This feature must integrate with:

- Fees Management
- Finance Management
- Purchase Management
- Expense Management
- Sales Management
- Payroll
- Other Income
- Pending Income Collection
- Refunds
- Dashboard
- Reports

without changing the existing workflow.

---

# Important Business Rule

The school should maintain a central fund balance.

The school may receive money through:

- Cash
- UPI
- Bank Transfer
- Cheque
- Online Payment Gateway

However:

UPI should NOT be treated as a separate bank account.

UPI is only a payment channel.

Similarly:

Cash should NOT be treated as a separate bank account.

Cash is only a transaction mode.

The actual money should always be recorded against a School Fund Account.

---

# Settings Module Addition

Add a new menu inside:

Settings

↓

Financial Accounts

This page will manage all school fund accounts.

---

# Account Types

Allow creation of:

### School Bank Account

Examples

- Main School Account
- SBI School Account
- HDFC School Account
- Indian Bank School Account

---

### Cash Fund Account

Example

- Cash In Hand

This represents physical cash available in school.

---

# Account Creation Form

Fields

Account Name

Account Code

Account Type

Bank Name

Branch

Account Number

IFSC Code

Opening Balance

Opening Date

Status

Description

---

# Default Accounts

Allow administrator to create:

1. Main School Account

2. Cash In Hand

These accounts will become available throughout the ERP.

Do not create unnecessary default accounts.

---

# Central Fund Logic

Every income transaction should increase account balance.

Examples

- Student Fee Collection
- Uniform Sales
- Book Sales
- Other Income
- Donations
- Pending Fee Recovery
- Scholarship Reimbursement
- Transport Fee Collection

Flow

Income Recorded

↓

Selected Account

↓

Account Balance Increased

---

# Expense Logic

Every expense transaction should reduce account balance.

Examples

- Purchases
- Salary Payments
- Maintenance
- Fuel Expenses
- Electricity Bills
- Water Bills
- Office Expenses
- Refunds

Flow

Expense Recorded

↓

Selected Account

↓

Account Balance Reduced

---

# Mandatory Account Selection

Whenever money enters or leaves the organization:

Require

Account Selection

Examples

Fees Collection

Purchase Payment

Salary Payment

Expense Entry

Refund

Sales Collection

Other Income

Donation

Transport Collection

The system must know which account is affected.

---

# Payment Method Tracking

For every transaction store:

Payment Method

Examples

Cash

UPI

Bank Transfer

Cheque

Card

Online Payment

---

# Important Rule

Payment Method and Account are different.

Example

Account

Main School Account

Payment Method

UPI

Meaning:

Money was received into Main School Account through UPI.

---

# UPI Handling

Do NOT create a separate UPI account.

Instead:

Store UPI as Transaction Method.

Track:

UPI Collections

UPI Expenses

UPI Refunds

UPI Transfers

inside reports.

---

# Cash Handling

Do NOT create multiple cash accounts automatically.

Use:

Cash In Hand

as the main cash fund account.

Track:

Cash Collections

Cash Expenses

Cash Payments

Cash Receipts

through transaction history.

---

# Transaction Ledger

Create a ledger for every account.

Show:

Date

Reference Number

Module

Transaction Type

Description

Payment Method

Debit

Credit

Balance

Created By

---

# Example Ledger Flow

Opening Balance

↓

Student Fee Received

↓

Balance Increased

↓

Purchase Payment

↓

Balance Reduced

↓

Salary Payment

↓

Balance Reduced

↓

Donation Received

↓

Balance Increased

---

# Account Dashboard

Create account summary cards.

Examples

Total Available Funds

Cash In Hand

Bank Account Balance

Today's Income

Today's Expense

Pending Income

Expected Collections

Net Available Balance

---

# Pending Income Integration

Pending Fee Collection

↓

Collected Later

↓

Selected Account

↓

Balance Increased

The account balance must update automatically.

---

# Other Income Integration

Examples

Donation

Interest

Rental Income

Miscellaneous Income

Whenever recorded:

Selected Account Balance

↓

Increase Automatically

---

# Purchase Integration

Whenever a purchase payment is completed:

Selected Account

↓

Balance Reduced

↓

Ledger Entry Created

---

# Expense Integration

Whenever an expense is recorded:

Selected Account

↓

Balance Reduced

↓

Ledger Entry Created

---

# Payroll Integration

Salary Payment

↓

Selected Account

↓

Balance Reduced

↓

Ledger Entry Created

---

# Finance Reports

Create new reports.

---

## Fund Summary Report

Display

Opening Balance

Total Income

Total Expense

Closing Balance

---

## Account Wise Report

Display

Account Name

Opening Balance

Income

Expense

Closing Balance

---

## Payment Method Analysis

Use a better business term instead of:

Total UPI Amount

Use:

Digital Collections

Digital Transactions

Electronic Payments

Online Collections

Administrator can choose preferred wording.

Display:

Cash Transactions

Digital Transactions

Bank Transfers

Cheque Transactions

---

# Transaction History

Provide filters:

Date

Account

Module

Payment Method

Income

Expense

Reference Number

User

---

# Dashboard Integration

Dashboard must display:

Available School Funds

Cash In Hand

Bank Funds

Today's Collection

Today's Expense

Pending Collections

Expected Income

Net Position

---

# Validation Rules

Prevent:

Negative Balances (Optional Setting)

Invalid Transactions

Duplicate Transactions

Invalid References

Unauthorized Modifications

---

# Audit Logging

Track:

Account Creation

Account Modification

Balance Adjustment

Income Entry

Expense Entry

Transfer

Deletion

User

Timestamp

IP Address

---

# Database Design

Create tables similar to:

financial_accounts

account_transactions

account_balances

account_adjustments

payment_methods

transaction_references

Use proper foreign keys.

---

# Security

Restrict account access.

Only authorized roles may:

Create Accounts

Edit Accounts

Adjust Balances

Delete Accounts

View Financial Reports

---

# Migration Requirement

Existing income and expense modules must integrate with this feature.

Do NOT create duplicate finance workflows.

Only extend the current system.

---

# Reporting Requirement

Every report must clearly distinguish:

Transaction Account

and

Payment Method

Example

Account:

Main School Account

Payment Method:

UPI

This avoids treating UPI as a separate bank account.

---

# Strict Rules

Do NOT change:

- Existing UI Theme
- Existing Navigation
- Existing Workflow
- Existing Finance Logic
- Existing CRUD Structure

Only extend the system with centralized account management.

---

# Final Goal

Implement a professional School Fund & Account Management System where all income and expenses affect a selected school account balance. Bank Accounts and Cash In Hand are treated as actual fund accounts, while Cash, UPI, Bank Transfer, Card, and Cheque are treated as payment methods. The system must maintain real-time balances, transaction ledgers, account-wise reports, payment method analytics, audit trails, and full integration with every financial module in the ERP.
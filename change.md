# Change.md

# Objective

Perform a controlled redesign of the **Finance & Account** module only.

After reviewing the current Finance & Account page, the existing workflow allows users to manually create Finance Vouchers which directly affect account balances. This creates duplicate financial entries because actual financial transactions are already being created from other ERP modules such as Fees, Purchase, Sales, Inventory, Transport, and Finance Management.

The goal is to convert the Finance & Account page into a **Central Ledger Book & Account Monitoring Module**.

All existing modules should continue working exactly as they are now.

Only the Finance & Account page should be modified.

---

# Strict Rules

Do NOT change:

- Student Management
- Staff Management
- Staff Allocation
- Attendance
- Fees Management
- Examination
- Purchase ERP
- Supplier Directory
- Uniform & POS Sales
- Inventory Stock
- Bus Transportation
- Announcements
- Reports
- Notifications
- Roles & Permissions
- Existing CRUD Workflows
- Existing UI Theme
- Existing Database Structure (except required ledger tables)
- Existing Business Logic

Only modify:

Finance & Account Page

---

# Current Problem

Currently:

Finance Voucher

↓

Creates Financial Entries

↓

Updates Account Balances

However,

Actual transactions already originate from:

- Fees Management
- Purchase ERP
- Uniform & POS Sales
- Inventory
- Finance
- Transport
- Other Income

This can cause:

- Duplicate Entries
- Duplicate Accounting
- Incorrect Balances
- Manual Errors

---

# Required Change 1

## Remove Finance Voucher Creation

Remove:

Create Financial Voucher Button

Current Button:

"Create Financial Voucher"

The button should no longer appear on the Finance & Account page.

Users should not manually create ledger transactions.

---

# Required Change 2

## Remove View Account Ledger Button

Remove:

"View Account Ledger"

Button

Reason:

The entire page itself will become the Ledger Book.

No separate ledger view is required.

---

# Required Change 3

## Convert Finance Table Into Central Ledger Book

Replace the existing Finance Voucher table.

Current Table

Voucher No

Type

Category

Party

Amount

Date

Description

Payment Mode

Approved By

---

Replace with:

Central School Ledger Book

---

# Ledger Book Purpose

The Ledger Book should automatically display every financial transaction generated anywhere in the ERP.

No manual entry.

No voucher creation.

No duplicate records.

---

# Modules Feeding Ledger

Automatically pull records from:

### Fees Management

Student Fee Collection

Late Fee

Fine Collection

Transport Fee

Admission Fee

Any Fee Payment

---

### Purchase ERP

Purchase Orders

Purchase Payments

Supplier Payments

Purchase Returns

---

### Uniform & POS Sales

Uniform Sales

Book Sales

POS Sales

Sales Returns

---

### Inventory

Stock Purchase

Inventory Adjustments

Inventory Consumption

---

### Finance

Expense Entries

Income Entries

Salary Payments

Refunds

---

### Bus Transportation

Transport Fee Collection

Vehicle Expense

Fuel Expense

Maintenance Expense

---

### Other Income

Donation

Interest

Rental Income

Miscellaneous Income

---

# Ledger Book Columns

Display:

Transaction ID

Transaction Date

Module

Transaction Type

Description

Reference Number

Payment Method

Account Affected

Debit

Credit

Running Balance

Created By

Status

---

# Running Balance Logic

Every row must calculate balance.

Example

Opening Balance

₹50,000

↓

Fee Collection

+₹5,000

↓

Balance

₹55,000

↓

Purchase Expense

-₹10,000

↓

Balance

₹45,000

The ledger should always show the live running balance.

---

# Required Change 4

## Auto Account Balance Calculation

Current balance cards:

Total Central School Funds

Total Income

Total Expense

School Fund Accounts

must be calculated directly from Ledger Book transactions.

No manual update.

No Finance Voucher dependency.

---

# Required Change 5

## Account Selection Logic

Transaction destination depends on Payment Method.

---

### Cash Transactions

If:

Payment Method = Cash

Then:

Affected Account

↓

Cash In Hand

---

### Digital Transactions

If:

Payment Method = UPI

QR Payment

Online Payment

Digital Collection

Electronic Transfer

Then:

Affected Account

↓

School Bank Account

---

### Bank Transfer

If:

Payment Method = Bank Transfer

Cheque

NEFT

RTGS

IMPS

Then:

Affected Account

↓

Selected School Bank Account

---

# Important Rule

UPI is NOT a separate account.

UPI is only a transaction channel.

Money must go into:

School Bank Account

---

# Example

Student Fee

₹5,000

Payment Method

UPI

Ledger Entry

Debit/Credit

↓

School Bank Account

Balance Increased

---

# Example

Purchase Expense

₹2,000

Payment Method

Cash

Ledger Entry

↓

Cash In Hand

Balance Reduced

---

# Required Change 6

## Account Summary Cards

Top cards must become fully ledger-driven.

Display:

### Total School Funds

Cash In Hand + Bank Accounts

---

### Total Income Collections

All Credits

---

### Total Expense Disbursements

All Debits

---

### Active School Accounts

Account Count

---

### Available Cash Balance

Cash In Hand

---

### Available Bank Balance

All Bank Accounts Combined

---

# Required Change 7

## Ledger Filters

Add filters.

Filter By:

Date Range

Module

Transaction Type

Payment Method

Account

Reference Number

User

Income

Expense

---

# Required Change 8

## Drill Down

Clicking any ledger record should open:

Transaction Details

Showing:

Original Module

Reference Record

Amount

Payment Method

Account Impact

Created User

Audit History

---

# Required Change 9

## No Duplicate Accounting

Before creating ledger entries:

Check:

Reference ID

Module ID

Transaction Type

The same transaction should never appear twice.

---

# Required Change 10

## TiDB Cloud Database

Create required database structure inside TiDB Cloud.

Create tables:

financial_accounts

ledger_book

ledger_transactions

account_balances

payment_methods

transaction_sources

account_audit_logs

---

# Database Relationship

Source Module

↓

Transaction Event

↓

Ledger Entry

↓

Account Balance Update

↓

Dashboard Update

---

# Required Change 11

## Automatic Ledger Posting

Whenever any module performs a financial transaction:

Automatically create a ledger entry.

Examples:

Fee Collected

Purchase Paid

Expense Recorded

Salary Paid

Sale Completed

Transport Fee Collected

Donation Received

Refund Processed

No manual finance voucher creation required.

---

# Audit Logging

Log:

Transaction ID

Module

Reference ID

Amount

Payment Method

Account

User

Timestamp

Balance Before

Balance After

---

# Reporting

Generate:

Ledger Report

Cash Book

Bank Book

Income Summary

Expense Summary

Fund Flow Statement

Account Statement

Payment Method Analysis

---

# Final Validation

Verify:

✓ Finance Voucher button removed

✓ View Account Ledger button removed

✓ Finance page converted into Central Ledger Book

✓ All financial modules automatically post ledger entries

✓ No duplicate accounting entries

✓ Cash transactions affect Cash In Hand

✓ Digital transactions affect School Bank Account

✓ Bank transfers affect Bank Accounts

✓ Running balance calculated correctly

✓ Dashboard balances update automatically

✓ TiDB Cloud stores all ledger records

✓ Existing modules remain unchanged

✓ Existing UI theme remains unchanged

✓ Existing workflows remain unchanged

---

# Final Goal

Transform the Finance & Account page into the school's centralized accounting ledger system. Remove manual voucher creation, automatically collect transactions from all ERP modules, maintain real-time account balances, correctly route transactions based on payment method, synchronize with TiDB Cloud, and provide a complete ledger-based financial monitoring system without affecting any existing module or workflow.
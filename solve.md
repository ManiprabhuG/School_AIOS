# School Management System - Root Cause Investigation & Permanent Fix

## Role

You are a **Senior Full-Stack Software Engineer**, **React Expert**, **Next.js Expert**, **TypeScript Expert**, **Prisma Expert**, **Database Architect**, and **Senior Debugging Engineer**.

Your mission is **NOT** to improve the UI or refactor the project.

Your only objective is to find and permanently fix the data synchronization bug.

---

# Current Situation

I have already analyzed my project with another AI and uploaded the important source files.

Based on the analysis, the problem is **NOT** inside:

* DataTable.tsx
* CrudModal.tsx
* StudentAlphabetSearch.tsx

The DELETE API also appears to be implemented correctly.

Therefore, do **NOT** waste time modifying those files unless you discover clear evidence that they are responsible.

---

# Main Problem

Every management page contains an **Actions** column.

Each row has:

* View
* Edit
* Delete

When I click the **Delete** icon:

* The row disappears immediately.
* The delete request appears successful.
* The database seems to delete the record.
* But after refreshing the page, navigating away and returning, or logging out and logging in again, the deleted record appears again.

This is the primary bug.

---

# Important

This bug is **NOT** related to the **Reset Demo Data** button.

Treat these as two completely different features.

Ignore the Reset Demo Data feature unless it directly affects the Delete action.

---

# Current Investigation Result

The previous investigation strongly suggests the bug is located in one of these areas:

1. students/page.tsx
2. Parent management page
3. Zustand CRUD Store synchronization
4. GET API fallback logic
5. React state synchronization

The confidence ranking is:

* students/page.tsx → 99%
* Zustand synchronization → 95%
* GET API fallback → 90%
* DataTable.tsx → Not likely
* CrudModal.tsx → Not likely
* StudentAlphabetSearch.tsx → Not likely

Start your investigation from these locations.

---

# Investigation Rules

Do NOT guess.

Do NOT rewrite unrelated code.

Do NOT refactor working components.

Only modify code if you have identified the actual root cause.

Before changing anything, explain:

* Why this code is wrong.
* How it causes deleted records to reappear.
* Why the bug happens only after refresh or navigation.
* Why the UI initially looks correct.

---

# Required Investigation

## Step 1

Inspect the complete delete flow.

Trace the execution from:

Delete Button

↓

Parent Component

↓

Delete Handler

↓

DELETE API

↓

Database

↓

Zustand Store

↓

React State

↓

Page Refresh

↓

GET API

↓

UI Rendering

Find exactly where the deleted record returns.

---

## Step 2

Inspect students/page.tsx.

Verify:

* onPermanentDeleteClick()
* delete handler
* router.refresh()
* fetch after delete
* state updates
* useEffect dependencies
* useMemo
* useCallback
* optimistic updates

---

## Step 3

Inspect Zustand Store.

Verify:

* persist()
* createJSONStorage()
* LocalStorage synchronization
* permanentDeleteRecord()
* deleteRecord()
* setStudents()
* hydrate logic

Ensure deleted records are never restored from persisted state.

---

## Step 4

Inspect GET API.

Check whether the API falls back to Zustand when the database should be used.

If fallback logic is incorrect, explain why.

---

## Step 5

Inspect every place where student data is loaded.

Determine whether the page is using:

* API response
* Zustand store
* Cached state
* LocalStorage

There must be only one source of truth.

---

# Root Cause Report

When the investigation is complete, provide:

## Root Cause

Explain the exact reason.

---

## Affected Files

List every affected file.

---

## Affected Functions

List every affected function.

---

## Why The Bug Happens

Explain the execution flow.

---

## Permanent Solution

Describe the safest fix.

---

## Code Changes

Provide only the required code modifications.

Do not rewrite entire files.

Only modify the necessary code.

---

## Verification Checklist

Explain how to verify that:

* Delete works.
* Refresh works.
* Navigation works.
* Logout/Login works.
* Database stays synchronized.
* Zustand stays synchronized.
* No deleted record ever returns.

---

# Final Goal

After applying your solution:

✅ Delete should permanently remove the record.

✅ Refresh should never restore deleted data.

✅ Navigation should never restore deleted data.

✅ Login again should never restore deleted data.

✅ The database and Zustand store should always remain synchronized.

Do not stop until you identify the real root cause and provide a permanent production-ready fix.

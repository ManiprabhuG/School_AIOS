# Bug: Deleted Data Reappears After Navigating Away and Back

## Confirmed Root Cause
This is a **Next.js caching issue**, NOT a database issue.

Confirmed by testing: after deleting a row, the data still appears when navigating back
to the management page. But doing a **hard refresh (Ctrl+Shift+R)** on that same page
shows the correct data (item is actually deleted). This proves:

- The DELETE operation IS working correctly in the database.
- The DB (TiDB Cloud + Prisma) is NOT the problem.
- Next.js is serving a **stale cached version** of the page/route instead of
  fetching fresh data after the delete happens.

Do NOT change the database, do NOT change the DB provider. Do NOT touch Prisma schema.
The fix is 100% on the Next.js data-fetching / caching layer.

---

## What Needs to Be Fixed

### 1. Force revalidation after delete
Find the delete logic (Server Action or API route handler that performs
`prisma.<model>.delete(...)`). Immediately after the delete succeeds, call:

```ts
import { revalidatePath } from 'next/cache';

// after successful delete
revalidatePath('/management'); // replace with the actual page route path
```

If there are multiple pages/routes that display this same data (e.g. a list page
and a detail page), call `revalidatePath` for each of them, or use `revalidateTag`
if the data fetching uses tags.

### 2. Force client refresh after delete (if using a Client Component)
If the delete button/action is triggered from a Client Component, after the delete
call completes, run:

```ts
'use client';
import { useRouter } from 'next/navigation';

const router = useRouter();

async function handleDelete(id: string) {
  await deleteItem(id); // server action / API call
  router.refresh(); // forces re-fetch of server data for current route
}
```

### 3. Disable static caching on the management page
At the top of the page file (e.g. `app/management/page.tsx`), add:

```ts
export const dynamic = 'force-dynamic';
```

This prevents Next.js from serving a statically cached version of this route.

### 4. Disable fetch-level caching (if using fetch() directly instead of Prisma in a route handler)
If any data fetching uses the native `fetch()` API (not Prisma directly), make sure
to disable caching explicitly:

```ts
fetch(url, { cache: 'no-store' });
```

---

## Verification Steps (Do This After Applying the Fix)

1. Go to the management page, delete an item.
2. Navigate to a completely different page (do NOT hard refresh).
3. Navigate back to the management page.
4. Confirm the deleted item does NOT reappear.
5. Repeat this 3–4 times with different items to be sure it's consistent.

If the item still reappears after applying all 4 steps above, check the following
before assuming it's a DB issue:

- Confirm `revalidatePath` argument matches the EXACT route path used in the app
  (typos or wrong dynamic segment cause silent failures).
- Confirm the delete server action is not wrapped in a try-catch that silently
  swallows errors (add `console.log`/`console.error` inside the catch block).
- Confirm there is only ONE Prisma Client instance being used (check for a
  singleton pattern using `globalThis` in `lib/prisma.ts` or similar) — multiple
  instances during Next.js dev hot-reload can cause stale connections.
- Open browser DevTools → Network tab, delete an item, go back to the page, and
  check whether the request shows "(from disk cache)" — if so, this is a browser-level
  cache issue, not a Next.js one, and needs `no-store` fetch options or cache-control
  headers set explicitly on the API route response.

---

## Summary for the Agent
- Problem: stale cached page data after DB delete, not an actual DB failure.
- Fix: `revalidatePath()` + `router.refresh()` + `export const dynamic = 'force-dynamic'`
  + `cache: 'no-store'` on any raw fetch calls.
- Do not modify the database, Prisma schema, or switch database providers to fix this.
- Verify by testing navigation flow (not hard refresh) after applying fixes.

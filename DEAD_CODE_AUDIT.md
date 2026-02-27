# Dead Code Audit

This file records dead/unused code found in the current codebase.

## Confirmed unused symbols

1. `onOpenChange` is destructured but never used in `Dialog`.
   - File: `src/components/ui/dialog.tsx`
   - Evidence: ESLint reports `onOpenChange` is defined but never used.

2. `phoneNumber` parameter is never used in `updateSubmissionAuth`.
   - File: `src/lib/airtable.ts`
   - Evidence: ESLint reports `phoneNumber` is defined but never used.

3. `textOverlay` is assigned but never used in image transformation flow.
   - File: `src/lib/imagekit.ts`
   - Evidence: ESLint reports `textOverlay` is assigned a value but never used.

## Likely dead files/modules

1. `src/components/LoginDialog.tsx`
   - Declares and exports `LoginDialog`, but there are no imports/usages of this component in `src/`.

2. `demo-data.js`
   - No references/imports in application code or scripts.

## Potentially dead/debug-only route

1. `src/app/test-celebration/page.tsx`
   - Standalone test page likely for manual QA. It is routable but not linked/used by core user flows.

## Commands used

- `npm run -s lint`
- `rg -n "LoginDialog|test-celebration|demo-data|socket-cleanup|useSocket|textOverlay|onOpenChange|phoneNumber" src server.js README.md package.json`


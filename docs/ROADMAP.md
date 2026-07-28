# BA Platform Roadmap

## Completed

- **Portal v0.2.1** — Firebase Authentication
- **Console v0.2.0** — Firebase Authentication
- **Console v0.2.1** — Live Customers
- **Console v0.2.2** — Live Projects
- **Console v0.2.3** — Live Resources
- **Console v0.2.4** — Identity & Library Foundations
- **Console v0.2.5** — Console Identity & Library Polish
- **Console v0.2.6** — Portal Library Connection
- **Console v0.2.6a** — Customer Portal Invites
- **Console v0.2.6b** — Customer Edit and Archive
- **Console v0.2.6c** — Archived Customers Lose Library Access
- **Console v0.2.6d** — Project Edit and Archive
- **Console v0.2.6e** — Library Edit, Archive and Delete
- **Console v0.2.6f** — Dialog Dropdown Padding Fix
- **Console v0.2.6g** — File/Link Field Toggle Fix
- **Console v0.2.6h** — Retire Link as a Category
- **Console v0.2.6i** — Console Bookings Goes Live
- **Portal v0.2.6a** — Updated Booking Link
- **Portal v0.2.6b** — My Meetings
- **Portal v0.2.6c** — Personalised Navigation Labels
- **Console v0.2.8** — Library Bulk Upload
- **Console v0.2.8a** — Library Collections
- **Portal v0.2.6d** — Library Collections (grouping and card tag)
- **Portal v0.2.6e** — Collection Boundary Fix (bordered box around each collection group)
- **Portal v0.2.6f** — Collection Box Colour
- **Portal v0.2.6g** — Collection Box Colour Revert
- **Portal v0.2.7** — Customer Uploads
- **Console v0.2.8b** — Customer Upload Management
- **Console v0.2.8c** — Storage Rules Quota Fix
- **Console v0.2.8d** — Backfill Upload Quota Field
- **Console v0.2.8e** — Simplify Storage Quota Rule
- **Portal v0.2.7a** — Storage SDK Fix
- **Portal v0.2.7b** — Quota Increment Fix
- **Console v0.2.10** — Time Tracker Foundations (budgetHours field, timeSessions collection)
- **Console v0.2.10a** — Project Time Totals (Time column + detail panel figures)
- **Console v0.2.10b** — Time Tracker: Log Session (new nav page + Log Session dialog)
- **Console v0.2.10c** — Time Tracker: History & Totals (project overview table + session history with Edit/Delete)
- **Console v0.2.10d** — Session History Overflow Fix
- **Console v0.2.10e** — Hours Per Billing Day Setting (Time Tracker feature complete)
- **Console v0.2.10f** — Settings Panel Padding Fix
- **Console v0.2.11** — Leads Pipeline (Cold/Warm/Hot/Won/Lost, projected income, promote to real Customer/Project)
- **Platform v0.2.12** — Mobile Navigation (Console v0.2.12 / Portal v0.2.8) — collapsible hamburger nav for both apps below their mobile breakpoints, first item of the v0.2.9 UI Polish release
- **Console v0.2.13** — Admin Invites — self-serve "Add Admin" in Settings, replacing manual Firestore Console edits for every admin after the first
- **Platform v0.3.0** — V1 Readiness (Console v0.3.0 / Portal v0.2.9) — admin list date fix, "Internal preview" customer flag, and genuinely-empty vs. filtered-empty states across both apps

## Backlog (not yet scheduled)

- Improve Library/Customer/Project search and filtering beyond basic text match
- Confirm migration of any still-useful v0.2.3 `resources` collection records (never automatically migrated when `library` was introduced in v0.2.4 — see `docs/FIREBASE.md`)
- Calendly webhook + Cloud Function to auto-sync real bookings into the `bookings` collection, instead of the current admin-maintained manual log — a backend infrastructure decision, deliberately deferred
- Visually flag "internal preview" customer records (e.g. Paul's own account, added as a customer so he can preview the Portal with his existing login) so they're clearly distinct from real customers in the Console table
- Restore a hard, Storage-rules-enforced 500 MB per-customer total limit (currently only tracked/visible, not blocked — see v0.2.8e) — likely needs Firebase's Rules Playground to diagnose properly
- Console: a Library filter/tab for "Uploaded Docs" so customer submissions awaiting review are easy to find at a glance, instead of relying on typing "Customer" into search
- Email alert (e.g. via EmailJS or similar client-side email service, to avoid needing a backend) when a customer uploads a document
- Per-customer toggle to enable/disable the Customer Upload feature — on by default for new customers, with an admin switch to turn it off for a specific customer if needed
- **Backup and restore for Firestore/Storage data** (requested 2026-07-17) — real customer, project, library, booking and time-tracking data now lives here, with no backup story yet. Options to weigh when scoping this properly:
  - Google Cloud's own Firestore export/import (via the Cloud Console or `gcloud` CLI) — covers all Firestore data, no custom code needed, but is a Google Cloud Console task rather than something inside the Console app, and needs the Blaze (pay-as-you-go) billing plan enabled.
  - A custom "Export data" button in the Console that downloads a JSON snapshot of the Firestore collections — simple, no backend, fits the existing architecture, but Firestore-only (wouldn't include uploaded files in Storage, and a matching "Import/restore" flow needs care to avoid silently overwriting live data).
  - Uploaded files (Library, customer uploads) live in Storage separately from Firestore and would need their own backup approach regardless of which option above is chosen.
  - True scheduled/automatic backups likely need a Cloud Function — the same "add a backend" decision already deferred elsewhere on this list.

## Next releases

### Platform v0.2.9 — UI Polish

- Final consistency review
- ~~Mobile and accessibility checks~~ — collapsible nav shipped as v0.2.12; remaining accessibility checks (focus states, contrast, screen-reader labelling) still open
- ~~Empty states and helpful messages~~ — shipped as part of v0.3.0
- Imagery/visual polish (requested 2026-07-17) — icons, illustrations, hero images or similar to make the Console and Portal feel more designed rather than purely functional. Not yet scoped: what kind of imagery, which pages, original artwork vs. stock/AI-generated — needs a proper conversation before building, same as everything else on this list.

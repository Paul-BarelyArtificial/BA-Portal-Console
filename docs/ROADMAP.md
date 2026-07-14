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

## Backlog (not yet scheduled)

- Improve Library/Customer/Project search and filtering beyond basic text match
- Confirm migration of any still-useful v0.2.3 `resources` collection records (never automatically migrated when `library` was introduced in v0.2.4 — see `docs/FIREBASE.md`)
- Calendly webhook + Cloud Function to auto-sync real bookings into the `bookings` collection, instead of the current admin-maintained manual log — a backend infrastructure decision, deliberately deferred

## Next releases

### Portal v0.2.7 — Customer Uploads

- Controlled customer uploads
- Customer source marker
- Internal review state

### Console v0.2.8 — Bulk Upload

- Add multiple files efficiently
- Apply shared metadata and visibility

### Platform v0.2.9 — UI Polish

- Final consistency review
- Mobile and accessibility checks
- Empty states and helpful messages

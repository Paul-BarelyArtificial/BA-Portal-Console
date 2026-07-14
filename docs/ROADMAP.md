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

## Backlog (not yet scheduled)

- Improve Library/Customer/Project search and filtering beyond basic text match
- Confirm migration of any still-useful v0.2.3 `resources` collection records (never automatically migrated when `library` was introduced in v0.2.4 — see `docs/FIREBASE.md`)
- Make Bookings a real, live Firestore feature (currently sample data only) — needed before Bookings can get its own Edit/Archive/Delete

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

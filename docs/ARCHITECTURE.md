# Architecture

## Applications

The BA Platform has two plain HTML, CSS and JavaScript applications:

1. **Admin Console** — operational management.
2. **Customer Portal** — customer access to approved content and services.

Both applications use one Firebase project.

## Firebase services

- **Authentication:** user sign-in and session persistence.
- **Firestore:** structured application data.
- **Storage:** uploaded Library files.

## Firestore collections

- `admins`
- `leads` — admin-only lead pipeline (Cold/Warm/Hot/Won/Lost); prospective customers/projects are described inline until a Won lead is promoted into real `customers`/`projects` records (v0.2.11+)
- `customers`
- `projects` — includes a `budgetHours` field (v0.2.10+) used by Time Tracker
- `library`
- `bookings` — live, admin-maintained log (not yet auto-synced from Calendly)
- `timeSessions` — admin-only time-tracking entries against existing customers/projects (v0.2.10+)
- `settings` — `settings/timeTracker` is live (hours-per-billing-day); otherwise planned

The previous `resources` collection belongs to the v0.2.3 model. It is not deleted automatically by v0.2.4.

## Library storage path

`library/{libraryItemId}/{timestamp}-{safeFileName}`

Library files are independent of customers and projects. Access is controlled by Library metadata rather than duplicated folders or files.

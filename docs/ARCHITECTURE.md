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
- `customers`
- `projects`
- `library`
- `bookings` — planned live implementation
- `settings` — planned live implementation

The previous `resources` collection belongs to the v0.2.3 model. It is not deleted automatically by v0.2.5.

## Library storage path

`library/{libraryItemId}/{timestamp}-{safeFileName}`

Library files are independent of customers and projects. Access is controlled by Library metadata rather than duplicated folders or files.

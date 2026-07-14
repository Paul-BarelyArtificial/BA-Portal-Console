# Barely Artificial Admin Console

Internal management application for the Barely Artificial Customer Portal.

**Current version:** v0.2.6c – Archived Customers Lose Library Access

## Current features

- Firebase email/password authentication
- Administrator authorisation using the Firestore `admins` collection
- Live Dashboard metrics
- Live Customers, with edit and archive/reactivate
- Send Portal invites to customers, creating their Firebase Authentication account and emailing them a password-set link
- Live Projects
- Live Library foundations with file uploads and useful links
- Internal, All Customers and Selected Customers visibility
- Sample Bookings
- Placeholder Reports and Settings

## Technology

- Plain HTML, CSS and JavaScript
- Firebase Authentication
- Cloud Firestore
- Firebase Storage

## Documentation

Project documentation is in the `docs` folder. Start with:

1. `docs/PROJECT.md`
2. `docs/ROADMAP.md`
3. `docs/TESTING.md`
4. `docs/FIREBASE.md`

## Important v0.2.4 note

The previous `resources` collection is not automatically deleted or migrated. New items are written to `library`. Review `docs/FIREBASE.md` and `docs/releases/v0.2.4.md` before deciding how to handle existing Resource records.

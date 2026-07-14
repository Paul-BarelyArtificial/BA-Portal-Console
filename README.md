# Barely Artificial Admin Console

Internal management application for the Barely Artificial Customer Portal.

**Current version:** v0.2.8a – Library Collections

## Current features

- Firebase email/password authentication
- Administrator authorisation using the Firestore `admins` collection
- Live Dashboard metrics
- Live Customers, with edit and archive/reactivate (archiving also removes their Library access, without disabling their Portal login)
- Send Portal invites to customers, creating their Firebase Authentication account and emailing them a password-set link
- Live Projects, with edit and archive/reactivate
- Live Library, with metadata edit, archive/reactivate, and permanent delete (removes the uploaded file from Storage too)
- Library bulk upload — add several files at once with shared category, source, visibility and status; each item's title is taken from its filename
- Library Collections — tag related items (e.g. all parts of a training course) so they're grouped together in the Portal, with autocomplete suggestions from existing collection names
- Internal, All Customers and Selected Customers visibility
- Live Bookings — an admin-maintained log (create/edit/delete) of sessions arranged in Calendly or another way; not yet auto-synced from Calendly itself
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

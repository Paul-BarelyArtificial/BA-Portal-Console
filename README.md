# Barely Artificial Console

Internal management console for Barely Artificial customer portal operations.

Current version: **v0.2.3 – Live Resources

## Current features
- Dashboard
- Customer management screen
- Project management screen
- Resources placeholder
- Bookings placeholder
- Reports placeholder
- Settings configuration screen

## Notes
This is a static front-end foundation. No authentication, backend or Firebase data is connected yet.


## v0.1.3
Resources management screen added with search, filters, detail rows and a placeholder new resource dialog.


## v0.1.4 – Bookings

Adds the Bookings management screen with sample data, search, filters, inline details and a placeholder new booking dialog.


## v0.2.1 – Settings

Adds a structured settings screen covering account details, branding, booking, Firebase, notifications and application version information. Settings are placeholders until Firebase is connected.


## v0.2.1
The Console now requires Firebase Authentication and verifies access using the signed-in user UID in the Firestore `admins` collection.


## v0.2.1

The Customers screen now reads live records from Firestore and the New Customer form creates customer documents.


## v0.2.3

Projects now load from Firestore. The New Project form creates a project linked to a live customer and updates the customer project count.


## v0.2.3 – Live Resources

Resources are stored in Firestore. Uploaded files are stored under `resources/{customerId}/{projectId}/` in Firebase Storage. Useful links are stored as Firestore metadata without a file upload.

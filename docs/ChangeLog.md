# v0.2.3 – Live Resources

- Replaced sample resources with the live Firestore `resources` collection.
- Added a working New Resource form.
- Added customer-aware project selection.
- Added Firebase Storage uploads for documents and training guides.
- Added useful-link resources without file uploads.
- Added title, description, status, visibility and version metadata.
- Project resource totals now update when a resource is created.
- Dashboard resource count now uses live data.

## v0.2.2 – Live Projects

- Replaced sample project data with the live Firestore `projects` collection.
- Added a working New Project form with live customer selection.
- Linked projects to customers using `customerId` and `customerName`.
- Updated customer project counts when projects are created.
- Added live project loading, empty and error states.
- Updated dashboard project count to use live data.

# Change Log

## v0.2.0 – Firebase Authentication
- Added real Firebase email/password login.
- Added persistent administrator sessions and sign out.
- Added Firestore admin check using `admins/{uid}`.
- Added access-denied handling for valid non-admin accounts.
- Protected the Console until authentication and authorisation complete.

# Barely Artificial Console – Changelog

## v0.1.6 – Settings
- Replaced the Settings placeholder with a structured Console settings screen.
- Added account, branding, booking, Firebase, notifications and about sections.
- Added placeholder Save Settings action.
- Updated version to v0.1.6 – Settings.

## v0.1.4 – Bookings
- Added Bookings management screen.
- Added booking search and status filters.
- Added sample booking data and inline detail panels.
- Added placeholder New Booking dialog.
- Updated dashboard booking metric.


## v0.1.0 – Foundation

Initial Console foundation release.

### Added
- Application shell
- Sidebar navigation
- Dashboard
- Customers page
- Projects page
- Resources page
- Bookings page
- Reports page
- Settings page
- Version footer
- Responsive layout
- Sample placeholder data

### Notes
- No backend is connected yet.
- No authentication is connected yet.
- All data is placeholder data for layout and testing.

## v0.1.1 – Customers

- Added customer management screen.
- Added searchable customer table.
- Added status filters for All, Active, Trial and Paused.
- Added sample customer records.
- Added customer detail panel.
- Added placeholder New Customer dialog.
- Updated dashboard metrics from customer sample data.
- Updated version to v0.1.1 – Customers.

## v0.1.2a – Projects Detail Fix

- Fixed project View behaviour so the detail card opens directly beneath the selected project.
- Added close buttons to project and customer detail cards.
- Updated customer detail behaviour to match the project detail pattern.
- Updated version to v0.1.2a – Projects Detail Fix.

## v0.1.2 – Projects

- Added project management screen.
- Added searchable project table.
- Added status filters for All, Planning, Active, Completed and Archived.
- Added sample project records.
- Added project detail panel.
- Added placeholder New Project dialog.
- Updated dashboard project metric from project sample data.
- Updated version to v0.1.2 – Projects.


## v0.1.3 – Resources
- Added Resources management screen.
- Added resource search and filters.
- Added resource detail panel with close control.
- Added placeholder New Resource dialog.
- Updated dashboard resource metric.


## v0.1.5
- Reports screen enhanced.


## v0.2.1 – Live Customers
- Replaced sample customer data with Firestore records.
- Added working New Customer form.
- Added live customer counts and filtering.
- Added loading and error states.

## v0.2.4 — Identity & Library Foundations

- Replaced the project-bound Resources workflow with an independent Library model.
- Added visibility for Internal, All Customers and Selected Customers.
- Added multiple customer assignment, source, category, version, status and file/link type.
- Moved new uploads to Library item-based Storage paths.
- Added living project documentation and architectural decision records.
- Left existing `resources` data untouched for deliberate migration in v0.2.5.

## v0.2.5 — Console Identity & Library Polish
- Changed the Admin Console background and panels to a clearly blue-toned dark navy theme.
- Increased the New Library Item dialog width.
- Increased dropdown, input and textarea height and padding.
- Increased spacing between form fields.
- No Firebase schema or functional changes.

## v0.2.6 — Portal Library Connection
- Automatically maintains `customerAccess` mappings from customer contact email addresses, so a Portal sign-in email can be resolved to a Console customer record.
- Prepares customer identity for Portal permissions ahead of Library visibility checks.

## v0.2.6a — Customer Portal Invites
- Added a "Send Portal Invite" action to the customer detail panel in the Console.
- The Console creates the customer's Firebase Authentication account (via a secondary, isolated Firebase app instance so the signed-in administrator's session is unaffected) and Firebase emails the customer a link to set their own password.
- Added `portalAccountCreated` and `portalInviteSentAt` fields to `customers` records, and the invite status is shown in the customer detail panel.
- Added the customer's contact name and contact email to the customer detail panel — previously neither was shown there.
- Fixed stale `?v=0.2.5`/`?v=0.2.3` cache-busting query strings on `css/styles.css`, `js/firebase-config.js`, `js/app.js` and `js/auth.js` that meant browsers with a previously cached Console could keep serving pre-v0.2.6 code after the v0.2.6 release.

## v0.2.6b — Customer Edit and Archive
- Added a working "Edit customer" action that reopens the New Customer dialog pre-filled, and saves changes to the existing record instead of creating a new one.
- Added an "Archive customer" / "Reactivate customer" action (with a confirmation prompt) that sets the customer's status to Archived instead of permanently deleting the record — Projects and Library items already assigned to that customer are unaffected.
- Added "Archived" as a customer status option and filter.
- First of three planned releases (Customers, then Projects, then Library) adding Edit and Archive to the Console's core record types. Bookings is deliberately excluded — it is still sample data, not a live Firestore feature yet.

## v0.2.6c — Archived Customers Lose Library Access
- Clarified and implemented what "Archive customer" actually does: the customer keeps their Portal login (there is no way to disable a Firebase Authentication account from client-side code without adding backend/Admin SDK infrastructure), but their `customerAccess` mapping is now removed while archived, so the Portal shows them an empty Library — both "All Customers" and "Selected Customers" items disappear, not just the ones assigned specifically to them.
- Reactivating a customer automatically restores their `customerAccess` mapping and Library visibility on the next Console sync — no separate action needed.
- The customer detail panel now shows a note when a customer is archived, explaining they can still sign in but see no Library content.

## v0.2.6d — Project Edit and Archive
- Added a working "Edit project" action that reopens the New Project dialog pre-filled, and saves changes to the existing record instead of creating a new one.
- The customer a project belongs to cannot be changed via Edit — the customer field is shown but locked, since reassigning a project would need to adjust project counts on two different customer records. Create a new project if a project needs to move to a different customer.
- Added an "Archive project" / "Reactivate project" action with a confirmation prompt, using the Archived status Projects already had. Library items are never tied to projects (see decision 001), so archiving a project has no effect on Library visibility.

## v0.2.6e — Library Edit, Archive and Delete
- Added a working "Edit item" action that reopens the New Library Item dialog pre-filled with the item's metadata (title, description, source, category, version, status, visibility, selected customers). Saving updates the existing record.
- The uploaded file or link itself is locked during edit — the dialog shows the current file name or link as read-only text. Replacing the actual file/link requires delete-and-recreate rather than in-place edit, to avoid the added complexity of cleaning up a replaced Storage file mid-edit.
- Added "Archive item" / "Reactivate item", reusing the Archived status Library already had.
- Added a genuine, permanent "Delete permanently" action — unlike Customers and Projects, Library items aren't referenced by any other collection (decision 001), so a hard delete is safe. It removes both the Firestore record and, for File items, the uploaded file in Firebase Storage, so it actually frees up storage space. Requires confirmation; cannot be undone.

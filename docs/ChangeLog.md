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

## v0.2.6f — Dialog Dropdown Padding Fix
- Fixed cramped-looking padding on every dropdown (`<select>`) across all four dialogs (New Customer, New Project, New/Edit Library Item, New Booking). The dropdowns already had the same declared padding as the text fields next to them, but browsers ignore custom padding on `<select>` elements by default and fall back to native OS rendering unless `appearance: none` is set — which it wasn't, so selects always looked tighter than inputs even though the CSS was identical.
- Replaced the native dropdown arrow with a custom SVG chevron matching the Console's colour palette, since removing native styling also removes the native arrow.

## v0.2.6g — File/Link Field Toggle Fix
- Fixed a longstanding bug (present since the original v0.2.4 Library build, not introduced by recent changes) where switching the New/Edit Library Item "Item type" between File and Link did not actually hide the field that no longer applied — both the File upload field and the Website address field stayed visible together regardless of which was selected.
- Root cause: `.form-preview label { display: grid; }` in the stylesheet unconditionally forced both label-wrapped fields to display, silently overriding the JavaScript's use of the `hidden` attribute to toggle them (a plain CSS rule always wins over the browser's default `hidden` behaviour unless the CSS accounts for it). Added `.form-preview label[hidden] { display: none; }` to fix it.
- The "Selected customers" checkbox group was not affected — it uses a `<fieldset>`, not a `<label>`, so it was already toggling correctly.

## v0.2.6h — Retire Link as a Category
- Removed "Link" as a Library Category option. Category (Training/Document/Template/Download) and Item Type (File/Link) were overlapping in a confusing way — Item Type already fully captures whether something is delivered as a file or a link, so Category didn't need its own separate "Link" value duplicating that.
- The Console's "Links" filter button still works exactly as before — it now matches on Item Type instead of Category, so it continues to show every link-delivered item regardless of what Category they're filed under. This is a small improvement: a Training resource delivered as a link can now show under both "Training" and "Links" at once, instead of being forced to choose one or the other.
- Added a safety net for any existing item that was already saved with Category "Link": editing it still shows and preserves that value (labelled "Link (retired category)") rather than silently changing it to "Training" on save. New items simply don't offer "Link" as a choice going forward.

## v0.2.6i — Console Bookings Goes Live
- Bookings is no longer sample data. The Console now reads and writes a live `bookings` Firestore collection, matching how Customers, Projects and Library already work.
- Added a real "New Booking" form (title, customer, type, status, date, time, duration, internal notes), replacing the non-functional placeholder dialog.
- Added "Edit booking" and a genuine permanent "Delete booking" (bookings aren't referenced by any other collection, so a hard delete is safe, same reasoning as Library).
- The customer a booking belongs to is locked during Edit, for the same reason as Projects — reassigning it would need extra bookkeeping this release doesn't attempt.
- Date is now a real date field (not free text), so bookings sort chronologically instead of alphabetically; it's displayed to the admin in a friendly format (e.g. "21 Jul 2026") while stored in a sortable form underneath.
- Added a `customerNotes` field to the booking record — not yet writable from anywhere (the Portal doesn't have a "My Meetings" view yet), but the Console detail panel already displays it if present, ready for the next release.
- This is a deliberately manual, admin-maintained log for now: creating a booking here does not create or modify anything in Calendly, and Calendly bookings don't appear here automatically. Automatic two-way sync would require adding backend infrastructure (a Calendly webhook + Cloud Function) — a bigger decision, not part of this release.
- Fixed stale "Sample data" labels on the Dashboard for Projects and Library, which have actually been live since earlier releases.

## Portal v0.2.6a — Updated Booking Link
- Updated the Calendly booking link across the Portal (session cards and the Training page button) to the current real link.
- Updated the same URL in the Console's Settings page placeholder field for consistency (display only, no functional change, so the Console version was not bumped for this).

## Portal v0.2.6b — My Meetings
- Added a "Your Meetings" section to the Portal's Book a Session page: customers now see their own bookings (Upcoming and Past), and can add notes visible to the admin in the Console's booking detail panel.
- **Requires a Firestore rules update.** Updated `docs/firestore.rules.txt` — the `bookings` section now allows a signed-in customer to read their own bookings (matched via `customerAccess`, same pattern as Library) and to update only the `customerNotes` field, nothing else. This must be pasted into the Firebase Console's Firestore Rules editor and published before the Portal feature will work; until then customers will see a permissions error trying to load their meetings.

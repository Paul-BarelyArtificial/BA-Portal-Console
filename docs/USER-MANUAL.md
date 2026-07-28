# Admin Console — User Manual

This is a working guide to everything the Console can do today, for anyone with an admin login (currently Paul and one colleague). It's written for people using the Console, not developers — for the technical/data-model side, see `ARCHITECTURE.md`, `FIREBASE.md` and `ChangeLog.md` in this same folder.

Keep this updated as features change — when in doubt, check `ChangeLog.md` for the most recent changes and update the relevant section here.

## Signing in

Go to the Console's web address and sign in with your email and password. Only accounts that also have a matching record in the `admins` collection (set up manually in Firebase, not from inside the Console) can get past the sign-in screen — a valid Firebase login alone isn't enough. If you see "This account is not authorised," the Firebase account exists but hasn't been added as an admin yet.

On narrow/mobile screens, the sidebar navigation collapses behind a ☰ button next to the Console logo — tap it to open the menu, tap any section to jump there (the menu closes itself automatically). On wider screens the sidebar is always visible as before.

There's no self-service "forgot password" in the Console yet. If you need a password reset, it has to be done for you in Firebase Console → Authentication → Users → (that user) → Reset password.

## Dashboard

A quick-glance summary: live counts for Customers, Projects, Library items and Bookings, plus a couple of shortcut cards to jump straight into Resources or Booking a session (these mirror what the Console can do, not customer-facing content).

## Leads

Track prospects before they become real customers, and promote them once a deal is won.

- **Pipeline**: every lead has a status of Cold, Warm, Hot, Won or Lost.
- **Projected income**: a plain number (in £) for how much you expect the deal to be worth.
- **Linking a lead to a Customer and Project**: for each of Customer and Project, you choose either:
  - **Existing** — pick a real Customer/Project you already have.
  - **New (prospective)** — just type a name; nothing real gets created yet.
  - If you pick a *new, prospective* customer, the project side automatically locks to "new" too — a customer that doesn't exist yet can't already have a real project.
- **Promote to Customer/Project**: only available once a lead's status is **Won**, and only once per lead. This creates real Customer/Project records for whichever side was prospective (if the lead already pointed at real, existing records, promotion just uses those — nothing is duplicated). The lead itself isn't deleted; its detail panel will show "Promoted: Yes" afterwards.
- **Editing a lead**: you can change its name, status, projected income and notes. You can't change which Customer/Project it's linked to once created — if you got that wrong, delete the lead and create a new one.
- **Deleting a lead**: permanent, and safe to do any time — it never affects a Customer/Project that's already been promoted from it.

## Customers

Your live list of real customer organisations.

- **New Customer**: set a company name, status (Trial/Active/Paused/Archived), contact name/email and notes. Tick **Internal preview** for accounts that aren't a real customer (e.g. your own test/preview account) — it shows an "Internal Preview" badge in the table so it's never mistaken for a real one.
- **Editing**: same dialog, reopens pre-filled.
- **Archiving a customer**: sets their status to Archived. This is a soft delete — nothing is ever removed. Two things happen:
  - They keep their Portal login (there's no way to disable a Firebase login from the Console without adding backend infrastructure), but
  - Their Library access is fully cut off — the Portal will show them "not linked to a customer" and an empty library until you reactivate them.
  - Reactivating undoes this automatically the next time the Customers list refreshes.
- **Portal invite**: if a customer has a contact email set, you can click "Send Portal invite" to create their Firebase login and email them a link to set their own password. You never see or set their password yourself. If they already have an account, this just resends the password-set email.
- **Uploads used**: shows how much of their 500 MB document-upload allowance (see Library below) they've used.

## Projects

Live projects, each belonging to one customer.

- **New Project**: name, customer, status (Planning/Active/Completed/Archived), type, and an optional **budgeted hours** figure — leave blank if you don't know it yet.
- **Time column**: shows hours logged so far (in hours and billable days — see Time Tracker), and either "X remaining" or "X over budget" if a budget is set, or "No budget set" if not.
- **Editing**: the customer a project belongs to is locked once created — to move a project to a different customer, archive the old one and create a new one against the right customer.
- **Archiving**: soft delete, same reasoning as Customers — nothing is removed, just marked Archived. Has no effect on Library, since Library items are never tied to projects.

## Library

Every document, template, download and link you make available — to your team internally, to all customers, or to specific customers only.

- **Visibility**: Internal (nobody but admins see it), All Customers, or Selected Customers (you pick who).
- **Status**: Draft, Published or Archived — only Published items are ever visible to customers.
- **New Library Item**: upload a file or add a link, with a title, category, source, version and description.
- **Collection**: an optional free-text tag for grouping related items — e.g. every part of a training course. Items sharing a Collection cluster together in the Portal under a labelled, coloured box, and each shows a "Part of {collection}" tag. Leave it blank for a standalone item. The field autocompletes from names you've already used, to avoid accidental typos splitting one collection into two.
- **Bulk Upload**: add several files at once with one shared set of Category/Source/Visibility/Status/Collection/Version — each file's title is taken automatically from its filename. Files-only (no Links) — use New Library Item for a single link.
- **Editing**: metadata only (title, description, category, etc.) — the actual uploaded file or link is locked; delete and re-create if you need to replace it.
- **Archive vs Delete**: Archiving just hides an item (e.g. an outdated screenshot guide you might reuse later); Delete is permanent and also removes the file from Storage — use it to actually reclaim storage space. Nothing else references a Library item, so deleting is always safe.
- **Customer uploads**: documents customers submit from the Portal land here automatically as Draft/Internal items — search "Customer" in the Library search box to find them awaiting your review. Use the normal Edit action to publish/reassign visibility once you're happy with one. Deleting a customer's upload also refunds their storage quota.
- **Download file / Open link**: the action button on an item's detail panel — for files, this is also how you get a local copy for yourself.

## Bookings

A manual log of sessions arranged in Calendly (or however else) — logging a booking here does **not** create anything in Calendly, and a real Calendly booking doesn't appear here automatically. It's purely a record for your own reference and so the customer can see it in the Portal.

- **New Booking**: title, customer, type, status (Upcoming/Completed/Cancelled), date, time, duration, and internal notes.
- **Editing**: the customer a booking belongs to is locked once created, same reasoning as Projects.
- **Customer's notes**: if the customer has added their own note on a booking (from the Portal's "Your Bookings" page), it shows in the detail panel alongside your own notes.
- **Deleting**: permanent.

## Time Tracker

Log how much time you (or your colleague) spend on each customer's projects, and see logged/budgeted/remaining time at a glance.

- **Log Session**: pick a Customer, then a Project (only that customer's own projects are offered), a session number (auto-fills to the next number for that project, but you can override it), a date, time spent in hours, and a reason/description.
- **Project overview**: every project with its logged time (in hours and billable days), and either remaining time, over-budget, or "no budget set" — the same figures also show on the Projects page, since both read the same underlying data.
- **Session history**: click "View" on a project to see every session logged against it, with Edit and Delete per session. Editing a session locks the Customer/Project (only the session number, date, hours and reason can change) — delete and re-log if you got the project wrong.
- **Billing day length**: a small setting at the top of the Time Tracker page — change "Hours per billing day" (defaults to 8) to control how hours convert into the "billable days" figure shown everywhere.

## Reports

Currently a placeholder — no live reporting yet.

## Settings

Mostly placeholders for now (branding, notifications) except:
- **Admin access**: add a new admin by entering their email and clicking "Add Admin" — this creates their Firebase login, grants them admin rights, and emails them a password-set link, all in one step. No more manually creating a document in Firebase Console. Only works for a brand-new email address that's never had a Firebase account before (e.g. an existing customer's email can't be reused this way) — in that case, add them manually in Firebase Console instead. The very first admin ever (you) still had to be set up manually, since nobody existed yet to grant that permission.
- **Firebase** panel shows live connection status for Authentication/Firestore/Storage.
- **Data Backup**: click "Export Data" to download a full snapshot of your live data — see "Backing Up Your Data" below.
- The rest (Portal branding, notification preferences, etc.) don't yet save anywhere — changing them has no effect.

## Backing Up Your Data

There are two backup methods available — use both together for the best protection, since each covers something the other doesn't.

### Method 1: Export Data button (Settings → Data Backup)

The quickest option, built into the Console itself:

1. Go to **Settings → Data Backup**.
2. Click **Export Data**.
3. A file named something like `barely-artificial-backup-2026-07-28.json` downloads to your computer automatically.

This file contains every record from Customers, Projects, Leads, Bookings, Library, Time Sessions, Admins and Settings, as plain readable JSON. Save it somewhere safe (a cloud drive, an external disk) — since it's a normal file, it's protected even if something ever went wrong with the Firebase project itself.

**What this does *not* include:**
- The actual uploaded files (Library documents, customer uploads in Storage) — only their metadata (title, description, etc.) is included, not the files themselves.
- There is currently no "Import" button to restore from this file automatically — if you ever genuinely needed to restore from it, the data would need to be re-entered via Firebase Console by hand. This is deliberate for now, to avoid a rushed restore flow accidentally overwriting live data.

**How often**: there's no automatic schedule — it's a manual action. Get in the habit of running it every so often (e.g. monthly, or before making any bulk changes you're unsure about).

### Method 2: Firestore's own export (a "backup to the backup")

Since the project is on Firebase's Blaze (pay-as-you-go) plan, you also have access to Google's own official Firestore backup tool. This is more complete (it covers literally all Firestore data, not just the collections listed above) and is entirely separate from the Console app — worth running occasionally as a second safety net.

**Steps (via Firebase Console, no command line needed):**
1. Go to [console.firebase.google.com](https://console.firebase.google.com) and open the Barely Artificial project.
2. In the left-hand menu, go to **Firestore Database**.
3. Click the **Import/Export** tab (near the top, alongside "Data" and "Rules").
4. Click **Export**.
5. Leave "Export entire database" selected (unless you specifically want only certain collections).
6. Choose or create a Cloud Storage bucket to export into (the default one Firebase suggests is fine).
7. Click **Export**. This runs in the background — it'll show as a completed operation after a short while.

The exported data lands in that Cloud Storage bucket as a set of files — it isn't something you'd casually open and read (unlike the Console's own JSON export), but it's the most complete, official backup available, and Google also supports importing it straight back in from the same screen if ever needed.

**Cost note**: this uses a small amount of Cloud Storage and a per-operation charge, both minimal for a project this size, but worth knowing it's not entirely free the way the in-app export is.

## A note on Firestore rules

Several features (Customer uploads, My Meetings notes, Leads, Time Tracker) rely on Firestore/Storage security rules that live in `docs/firestore.rules.txt` and `docs/storage.rules.txt` in this repo. These are **not automatically applied** — they must be manually pasted into Firebase Console → Firestore/Storage → Rules → Publish whenever they change. If a feature suddenly stops working with a permissions error, check whether the rules file in the repo has changed since you last published it.

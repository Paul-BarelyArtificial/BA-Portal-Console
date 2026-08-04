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
- **Portal v0.2.6c** — Personalised Navigation Labels
- **Console v0.2.8** — Library Bulk Upload
- **Console v0.2.8a** — Library Collections
- **Portal v0.2.6d** — Library Collections (grouping and card tag)
- **Portal v0.2.6e** — Collection Boundary Fix (bordered box around each collection group)
- **Portal v0.2.6f** — Collection Box Colour
- **Portal v0.2.6g** — Collection Box Colour Revert
- **Portal v0.2.7** — Customer Uploads
- **Console v0.2.8b** — Customer Upload Management
- **Console v0.2.8c** — Storage Rules Quota Fix
- **Console v0.2.8d** — Backfill Upload Quota Field
- **Console v0.2.8e** — Simplify Storage Quota Rule
- **Portal v0.2.7a** — Storage SDK Fix
- **Portal v0.2.7b** — Quota Increment Fix
- **Console v0.2.10** — Time Tracker Foundations (budgetHours field, timeSessions collection)
- **Console v0.2.10a** — Project Time Totals (Time column + detail panel figures)
- **Console v0.2.10b** — Time Tracker: Log Session (new nav page + Log Session dialog)
- **Console v0.2.10c** — Time Tracker: History & Totals (project overview table + session history with Edit/Delete)
- **Console v0.2.10d** — Session History Overflow Fix
- **Console v0.2.10e** — Hours Per Billing Day Setting (Time Tracker feature complete)
- **Console v0.2.10f** — Settings Panel Padding Fix
- **Console v0.2.11** — Leads Pipeline (Cold/Warm/Hot/Won/Lost, projected income, promote to real Customer/Project)
- **Platform v0.2.12** — Mobile Navigation (Console v0.2.12 / Portal v0.2.8) — collapsible hamburger nav for both apps below their mobile breakpoints, first item of the v0.2.9 UI Polish release
- **Console v0.2.13** — Admin Invites — self-serve "Add Admin" in Settings, replacing manual Firestore Console edits for every admin after the first
- **Platform v0.3.0** — V1 Readiness (Console v0.3.0 / Portal v0.2.9) — admin list date fix, "Internal preview" customer flag, and genuinely-empty vs. filtered-empty states across both apps
- **Console v0.3.1** — Data Export — manual "Export Data" button in Settings, downloading a full Firestore-data JSON snapshot; restore/import deliberately deferred
- **Console v0.4.0** — Marketing Opportunities — new nav section tracking recurring promotion opportunities (Facebook groups, networking breakfasts, meetups) with smart recurrence ("First Wednesday of the month") and a 14-day upcoming callout
- **Console v0.4.1** — Customer/Project Delete — permanent delete for Customers and Projects (guarded against orphaning linked records), to clean out testing/demo data before going live
- **Console v0.4.2** — Customer Library Access — Customer detail panel now shows every Library item that customer can actually see, matching what they'd see in their own Portal
- **Console v0.4.3** — UI Tidy — fixed misplaced close button on New Library Item/Bulk Upload dialogs (a `modal-heading`/`modal-header` class typo), and clarified/spaced the Customer detail panel's Portal invite status line
- **Console v0.4.4** — Collapsible Library Access — the Customer detail panel's Library access list is now collapsed by default with a "Show library" toggle, and scrolls internally (capped at 260px) instead of stretching the whole panel
- **Platform v0.5.0** — Welcome Messages (Console v0.5.0 / Portal v0.3.0) — per-customer personal welcome message, written free-text in the Console, shown as a highlighted card on that customer's Portal Dashboard. First piece of the "make more use of the Dashboard" initiative (requested 2026-08-04)
- **Platform v0.6.0** — Dashboard Widgets (Console v0.6.0 / Portal v0.4.0) — "Coming Soon" announcements (Console → Portal) and "Have an idea?" customer suggestions (Portal → Console), replacing the Console Dashboard's old hardcoded placeholder panels
- **Portal v0.4.1** — Suggestion Form Fix — the "Have an idea?" form's label/textarea were unstyled (CSS was scoped only to `#upload-form`'s ID); fixed to match the Share a Document form's styling

## Backlog (not yet scheduled)

- Improve Library/Customer/Project search and filtering beyond basic text match
- Confirm migration of any still-useful v0.2.3 `resources` collection records (never automatically migrated when `library` was introduced in v0.2.4 — see `docs/FIREBASE.md`)
- Calendly webhook + Cloud Function to auto-sync real bookings into the `bookings` collection, instead of the current admin-maintained manual log — a backend infrastructure decision, deliberately deferred
- Restore a hard, Storage-rules-enforced 500 MB per-customer total limit (currently only tracked/visible, not blocked — see v0.2.8e) — likely needs Firebase's Rules Playground to diagnose properly
- Console: a Library filter/tab for "Uploaded Docs" so customer submissions awaiting review are easy to find at a glance, instead of relying on typing "Customer" into search
- Email alert (e.g. via EmailJS or similar client-side email service, to avoid needing a backend) when a customer uploads a document
- Per-customer toggle to enable/disable the Customer Upload feature — on by default for new customers, with an admin switch to turn it off for a specific customer if needed
- **Backup/restore, remaining half** (requested 2026-07-17) — the export side shipped as Console v0.3.1 (Firestore data only, manual, on-demand). Still open:
  - A matching "Import/restore" flow — deliberately deferred since it needs careful design (merge vs. overwrite behaviour, avoiding silently clobbering live data with a stale backup).
  - Backing up uploaded files in Storage (Library items, customer uploads) — the v0.3.1 export is Firestore-only by design; Storage files would need a separate approach.
  - True scheduled/automatic backups would need a Cloud Function — now technically possible since the project is on the Blaze plan, but still a real architecture addition, not a small one.
  - In the meantime, Google Cloud's own managed Firestore export (Firestore → Import/Export in Firebase Console, or `gcloud firestore export`) is available as a zero-code, complete backup covering literally everything — see the "Firestore backups" section of `docs/USER-MANUAL.md` for the manual steps.
- **Real data for the Portal's Training and Support pages** (requested 2026-08-04) — both are still placeholder/hardcoded:
  - **Training**: the three course cards ("AI Basics for Business", "Getting Started with ChatGPT", "Prompt Writing") are static HTML with non-functional "Start Course"/"Open Course" buttons — no real content behind them. **Decided (2026-08-04): courses will be a series of online courses hosted on GitHub** — so this reuses the existing Library model rather than needing a new `courses` collection: each course is a Link-type Library item (category Training), with multi-part courses grouped via the existing Collections feature. Remaining work is mostly on the Portal side — replace the three static Training cards with a live render of published Training-category Library items (same pattern already used for "Your Library"), rather than any new admin-side feature.
  - **Support**: "Book a Session" already works (real Calendly link). The "Contact Barely Artificial" card has a disabled "Contact Details Coming Soon" button — needs real contact details (email/phone) wired in, likely via the Console's Settings page (which already has placeholder branding/contact fields that don't currently save anywhere).
- **Further Dashboard improvements** (requested 2026-08-04, alongside Welcome Messages above) — Paul wants to make "more use of the Dashboard" in both apps and is open to ideas. Not yet scoped, candidates worth a proper conversation:
  - Console: an "upcoming" widget reusing the Marketing Opportunities 14-day logic, a recent-activity feed backed by real data (currently hardcoded placeholder text), a Time Tracker summary (hours logged this week), or a "needs attention" list (customers near their upload quota, no Portal invite sent yet, etc.)
  - Portal: the Dashboard/Account pages still show some hardcoded placeholder profile data (`customerProfile` object in `js/main.js`) rather than fully live Firestore data — worth fixing as part of any further Dashboard work. Also candidates: next upcoming booking countdown, a real "what's new" feed, quota/usage summary.
- **Light/dark theme toggle** (parked 2026-08-04) — both apps already use CSS custom properties for their core palette (`--bg`, `--panel`, `--text`, `--accent`, etc. in Console; `--bg-main`, `--bg-panel`, `--text-main`, etc. in Portal), which would make a `[data-theme="light"]` override plus a saved toggle fairly mechanical. The complication: each app also has 15-20 hardcoded colours (status badges, card shadows, sidebar backgrounds) that bypass the variables and would need converting first, or they'd stay dark in "light mode". Estimated at roughly an afternoon of work per app, plus real visual QA across every page — not started.

## Next releases

### Platform v0.2.9 — UI Polish

- Final consistency review
- ~~Mobile and accessibility checks~~ — collapsible nav shipped as v0.2.12; remaining accessibility checks (focus states, contrast, screen-reader labelling) still open
- ~~Empty states and helpful messages~~ — shipped as part of v0.3.0
- Imagery/visual polish (requested 2026-07-17) — icons, illustrations, hero images or similar to make the Console and Portal feel more designed rather than purely functional. Not yet scoped: what kind of imagery, which pages, original artwork vs. stock/AI-generated — needs a proper conversation before building, same as everything else on this list.

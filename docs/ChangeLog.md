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

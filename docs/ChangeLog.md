# BA Portal Change Log

## v0.2.0 – Customer Access Foundations
**Date:** 08 July 2026

### Added
- Added a front-end customer access screen before the portal loads.
- Added an **Enter Portal** action for controlled testing.
- Added a basic sign out action on the **My Account** page.
- Added a customer profile object in `js/main.js` to drive customer, project and access details from one place.
- Added customer/project/access placeholders across Dashboard and My Account.

### Changed
- Updated the displayed portal version to **v0.2.0 – Customer Access Foundations**.
- Improved **My Account** so it now shows customer details, portal access and a security notice.

### Notes
- This is not real authentication yet. It is a front-end foundation so the portal behaves like a customer portal while Firebase authentication is planned.
- Real email/password authentication, permissions and customer-specific resources should follow in later releases.

## v0.1.9 – Dashboard Improvements
**Date:** 08 July 2026

### Added
- Added a more customer-facing dashboard hero area.
- Added a portal access summary card.
- Added project, next step and support status cards.
- Added a clearer **Start Here** section with priority dashboard actions.
- Added a **What’s New** panel for recent portal updates.
- Added quick link buttons for faster navigation.
- Improved the **My Account** page with static access detail placeholders.

### Changed
- Updated the displayed portal version to **v0.1.9 – Dashboard Improvements**.
- Tidied old Library CSS references left after the Resources rename.

### Notes
- Dashboard and account details are still static placeholders until customer authentication and permissions are connected.
- This release prepares the dashboard to become data-driven later.

## v0.1.8 – Resources
**Date:** 08 July 2026

### Added
- Replaced the old Library placeholder with a proper **Resources** page.
- Added customer-friendly resource sections:
  - Recently Added
  - Training Guides
  - Project Documents
  - Useful Links
- Added instant resource search.
- Added data-driven resource cards in `js/main.js`.
- Added resource cards with icons, descriptions, update text, type labels and action buttons.
- Added useful link cards for ChatGPT, Claude and Barely Artificial.
- Added Coming Soon placeholders for Video Library and Customer Uploads.

### Changed
- Renamed **Library** to **Resources** in the navigation and dashboard.
- Updated the displayed portal version to **v0.1.8 – Resources**.
- Added CSS for resource search, resource cards and responsive layouts.

### Notes
- Document resources currently use placeholder links. Real file URLs can be added later without changing the page layout.
- The Resources structure is ready to be connected to Firebase or another content source later.

## v0.1.7 – Book a Session
**Date:** 08 July 2026

### Added
- Added a proper **Book a Session** page.
- Added three customer-facing session cards:
  - Training Session
  - AI Advice
  - Project / Strategy Session
- All session cards currently open the same free Calendly booking URL.
- Added data-driven session configuration in `js/main.js`, so separate Calendly URLs can be added later.
- Added a basic Support page card that links customers to the booking page.
- Added a simple My Account placeholder for future account details.

### Changed
- Updated the displayed portal version to **v0.1.7 – Book a Session**.
- Improved card grid styling for dashboard, support and booking sections.

### Notes
- Calendly Free currently supports one booking type, so all visible session types point to the same booking calendar.

## v0.2.1 – Firebase Authentication (13 July 2026)
- Replaced the demonstration access button with real Firebase email/password authentication.
- Added remembered sign-in sessions and Firebase sign-out.
- Protected portal content using Firebase authentication state.
- Added clear, customer-friendly login error messages.
- Added the signed-in email address to My Account.
- Removed decorative dashboard icons while keeping navigation and meaningful resource icons.

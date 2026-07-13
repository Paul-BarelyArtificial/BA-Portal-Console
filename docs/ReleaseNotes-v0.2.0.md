# BA Portal v0.2.0 – Customer Access Foundations

## Objective
Add the first customer access structure so the portal starts behaving like a customer portal, without introducing real authentication before we are ready.

## What Changed
- Added a customer access screen.
- Added an Enter Portal action.
- Added sign out from My Account.
- Added customer profile data in one place.
- Updated Dashboard and My Account to use the customer profile.

## Important Note
This release is a front-end foundation only. It is not secure authentication. Real customer login will be added later with Firebase or another proper authentication service.

## Test Plan
1. Open `index.html`.
2. Confirm the access screen appears first.
3. Click **Enter Portal**.
4. Confirm the dashboard appears.
5. Open **My Account**.
6. Confirm customer/access details are visible.
7. Click **Sign Out**.
8. Confirm the access screen returns.
9. Re-open the page and confirm remembered access behaves as expected.

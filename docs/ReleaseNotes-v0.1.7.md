# BA Portal v0.1.7 – Book a Session

## What changed
This release adds a proper Book a Session page with three clear customer-facing options:

- Training Session
- AI Advice
- Project / Strategy Session

All three currently point to the same Calendly booking URL because the project is using the free Calendly plan.

## What to test
1. Open the portal locally.
2. Confirm the footer shows `v0.1.7 – Book a Session`.
3. Click **Book a Session** in the sidebar.
4. Confirm all three cards appear.
5. Click **Book Session** on each card.
6. Confirm the Calendly popup opens.
7. From Dashboard, click the Book a Session card and confirm it opens the page.
8. Check the page on mobile width.

## Known note
When paid Calendly is added later, update each card's `calendlyUrl` in `js/main.js`.

# Release Testing

## v0.2.5 test plan

1. Sign in with an authorised administrator account.
2. Confirm Dashboard, Customers and Projects still load.
3. Open Library and confirm an empty state or existing `library` records appear.
4. Create an Internal file item.
5. Create an All Customers link item.
6. Create a Selected Customers item and select two customers.
7. Confirm each new item appears with the correct category, source, visibility and status.
8. Open the item detail and test its file or link.
9. Sign out and confirm protected Console content is hidden.
10. Check desktop and mobile layouts.

## Firebase checks

- Confirm records are written to `library`, not `resources`.
- Confirm uploaded files use `library/{libraryItemId}/...`.
- Confirm no project record is required or updated when a Library item is created.

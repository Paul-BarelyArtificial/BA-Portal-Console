# Coding and Release Standards

- Plain HTML, CSS and JavaScript; do not introduce a framework without an explicit decision.
- Keep Firebase configuration separate in `js/firebase-config.js`.
- Escape data before inserting it into HTML.
- Use Firestore server timestamps for created and updated dates.
- Validate files before upload.
- Delete an uploaded file when the related Firestore write fails.
- Display the release version in the Console footer.
- Update cache-busting query strings with every release.
- Update the changelog, release note and relevant documentation in every release.
- Test before committing and pushing.

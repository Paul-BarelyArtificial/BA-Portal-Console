# Firebase rules required for v0.2.6

Add this Firestore access model while retaining the existing admin rules.

```javascript
match /customerAccess/{email} {
  allow read: if isSignedIn() && request.auth.token.email == email;
  allow write: if isAdmin();
}

match /library/{libraryItemId} {
  allow write: if isAdmin();
  allow read: if isAdmin() || (
    isSignedIn()
    && resource.data.status == "Published"
    && (
      resource.data.visibility == "All Customers"
      || (
        resource.data.visibility == "Selected Customers"
        && get(/databases/$(database)/documents/customerAccess/$(request.auth.token.email)).data.customerId in resource.data.customerIds
      )
    )
  );
}
```

The Portal queries may prompt Firebase to create indexes. Follow the link in the browser console once for each required index.

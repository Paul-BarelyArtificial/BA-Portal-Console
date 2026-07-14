# Firebase Structure

## Administrator access

A signed-in user is permitted to open the Console only when a document exists at:

`admins/{uid}`

## Library collection

Collection: `library`

| Field | Type | Purpose |
|---|---|---|
| `title` | string | Customer-facing item title |
| `description` | string | Plain-English description |
| `source` | string | `Barely Artificial` or `Customer` |
| `visibility` | string | `Internal`, `All Customers`, or `Selected Customers` |
| `customerIds` | array | Customer document IDs when selected visibility is used |
| `customerNames` | array | Display names retained for Console usability |
| `category` | string | Training, Document, Template, Download, or Link |
| `version` | string | Human-readable content version |
| `status` | string | Draft, Published, or Archived |
| `itemType` | string | File or Link |
| `fileName` | string | Original uploaded filename |
| `filePath` | string | Firebase Storage path |
| `downloadUrl` | string | Current download URL |
| `externalUrl` | string | Link destination for Link items |
| `size` | number | Uploaded file size in bytes |
| `contentType` | string | Uploaded MIME type |
| `owner` | string | Console user display identity |
| `collection` | string | Optional free-text tag grouping related items (e.g. every part of a course) |
| `uploadedByCustomerId` | string | Set only on customer uploads — the customer document ID that submitted it, permanent even if `customerIds`/visibility change later |
| `createdAt` | timestamp | Creation time |
| `updatedAt` | timestamp | Last update time |

Customer-submitted uploads (`source: "Customer"`) are always created with `status: "Draft"` and `visibility: "Internal"`, enforced by the Firestore rules — a customer cannot publish their own upload or change its visibility. An admin reviews and republishes it like any other Library item.

## Customer document fields (upload quota)

| Field | Type | Purpose |
|---|---|---|
| `uploadStorageUsedBytes` | number | Running total of bytes this customer has uploaded via the Portal. Customers may only increase this by at most one file's worth (20 MB) per write, via a narrowly-scoped Firestore rule — they cannot decrease it or touch any other field. Admins decrease it automatically when deleting a customer-uploaded Library item. |

## Customer upload limits

- 20 MB per file, 500 MB total per customer, enforced in both Firestore rules (`library` create) and Storage rules (`customerUploads/{customerId}/...` write) — not just client-side validation.
- Storage path: `customerUploads/{customerId}/{libraryItemId}/{fileName}`, separate from the admin-managed `library/{libraryItemId}/{fileName}` path.
- See `docs/firestore.rules.txt` and `docs/storage.rules.txt` for the exact rules.

## Legacy Resources

v0.2.3 stored records in `resources` and required `customerId` and `projectId`. v0.2.4 does not delete or silently migrate those records. Migration should be reviewed because the new visibility decision cannot always be inferred safely from the old data.

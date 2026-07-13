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
| `createdAt` | timestamp | Creation time |
| `updatedAt` | timestamp | Last update time |

## Legacy Resources

v0.2.3 stored records in `resources` and required `customerId` and `projectId`. v0.2.4 does not delete or silently migrate those records. Migration should be reviewed because the new visibility decision cannot always be inferred safely from the old data.

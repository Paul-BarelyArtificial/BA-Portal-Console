# Decision 001 — Library items are independent of projects

**Status:** Accepted  
**Introduced:** v0.2.5

## Decision

Library items are stored independently of customer projects.

## Reason

The same guide, template or link may be useful to several customers and projects. Attaching the file to one project encourages duplication and makes version control harder.

## Outcome

Each item is stored once. Its visibility determines whether it is internal, available to all customers, or available to selected customers.

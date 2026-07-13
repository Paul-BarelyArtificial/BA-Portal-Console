# BA Platform — Admin Console

**Current version:** v0.2.5 — Identity & Library Foundations  
**Status:** Active development

## Purpose

The Barely Artificial Admin Console is the operational side of the BA Platform. It manages customers, projects, Library items, bookings and platform settings. It shares one Firebase backend with the Customer Portal.

## Product principles

- **Grandma Test:** every screen must be clear to a busy, non-technical user.
- **One source of truth:** files and records are stored once and shared through permissions.
- **Small releases:** build, test, commit and push one release at a time.
- **Customer-first language:** use plain English and avoid unnecessary technical terms.
- **No surprise redesigns:** retain agreed decisions unless a change is explicitly requested.

## Current scope

- Firebase email/password authentication
- Administrator authorisation through `admins/{uid}`
- Live customers
- Live projects
- Live Library foundations
- Sample bookings
- Placeholder reports and settings

## Related application

The Customer Portal is a separate front end using the same Firebase project. Portal v0.2.1 currently provides authentication and protected pages. Portal Library integration is planned for v0.2.6.

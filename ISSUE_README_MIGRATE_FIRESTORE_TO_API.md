# ISSUE: Migrate All Client-Side Firestore Operations to Secure API Routes

## Background
Currently, several components in the codebase perform direct Firestore operations (read/write) from the client. This exposes sensitive queries, business logic, and increases the risk of security vulnerabilities such as data leakage, privilege escalation, and bypassing authentication/authorization.

## Problem
- Direct Firestore access from the client is insecure, even with Firestore rules.
- Sensitive queries and logic are visible in the client bundle.
- No server-side validation, rate limiting, or business logic enforcement.

## Scope
**Affected files/components:**
- `src/contexts/AuthContext.tsx` (user profile management)
- `src/components/Profile.tsx` (user settings)
- `src/components/Dashboard.tsx` (resource management)
- `src/components/AddResource.tsx` (resource creation)
- `src/components/EditResource.tsx` (resource editing)
- `src/components/SharedDump.tsx` (public resource discovery)

## Tasks
- [x] Migrate user profile creation/check (AuthContext.tsx) to API routes
- [x] Migrate user profile update/statistics (Profile.tsx) to API routes
- [x] Migrate resource CRUD (Dashboard.tsx, AddResource.tsx, EditResource.tsx) to API routes
- [x] Migrate public resource discovery (SharedDump.tsx) to API routes
- [x] Remove all direct Firestore imports from client code
- [ ] Update Firestore security rules to restrict client access
- [ ] Update documentation and environment files as needed

## Acceptance Criteria
- No client-side Firestore queries remain in the codebase
- All database operations are performed via secure server-side API routes
- Firestore security rules are updated to block direct client access
- All features (auth, profile, resources, public discovery) work as before

## References
- [Security Audit Summary](#)
- [Best Practices: Firebase Admin SDK & Next.js API Routes](https://firebase.google.com/docs/admin/setup)

---

**This issue tracks the migration of all client-side Firestore operations to secure API routes. Use the checklist above to track progress.**

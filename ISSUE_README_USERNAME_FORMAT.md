# Issue: Enforce Unique, Space-Free Usernames

## Problem
Currently, usernames in the app can contain spaces (e.g., "Mohammed Rayan A"). For consistency and to avoid future issues, usernames should:
- Not contain spaces
- Be unique (no duplicates)
- Be checked against the database before account creation
- Suggest alternatives if the username is taken

## Proposed Solution

### 1. **Username Format Enforcement**
- Only allow usernames with:
  - Lowercase letters
  - Numbers
  - Underscores or hyphens (optional)
- Disallow spaces and special characters
- Example valid usernames: `rayan9064`, `john_doe`, `user123`

### 2. **Uniqueness Check**
- When a user enters a username during signup:
  - Query the `users` collection in Firestore to check if the username already exists
  - If taken, show an error and suggest alternatives (e.g., `rayan9064_1`, `rayan9064_2`)

### 3. **Signup Flow Update**
- Add username validation logic to the signup form
- Add Firestore query to check for existing usernames
- Show error and suggestions if the username is not available

### 4. **Migration**
- Optionally, migrate existing usernames to the new format (replace spaces with underscores, lowercase all letters)
- Notify users to update their usernames if needed

## Example Validation (Regex)
```js
const usernameRegex = /^[a-z0-9_-]{3,20}$/;
```
- 3-20 characters, lowercase, numbers, underscores, hyphens

## Example Firestore Query
```js
const usersRef = collection(db, 'users');
const q = query(usersRef, where('username', '==', desiredUsername));
const snapshot = await getDocs(q);
if (!snapshot.empty) {
  // Username taken
}
```

## Acceptance Criteria
- [ ] Usernames cannot contain spaces or special characters
- [ ] Usernames are unique across all users
- [ ] Signup form checks username availability before account creation
- [ ] Suggestions are shown if the username is taken
- [ ] Existing usernames are migrated or users are prompted to update

---

**Related Feature:** User registration and profile management

**Priority:** High (prevents future conflicts and improves UX)

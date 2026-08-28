# Security Spec for Discussions

## Data Invariants
- A discussion must have a valid `userId` matching `request.auth.uid`.
- A discussion must have valid sizes for its strings (`content`, `author`).
- A discussion's `createdAt` must match the server timestamp on creation.
- A discussion cannot be updated or deleted by anyone other than the author (if updating is allowed, but let's say updates aren't needed or only the author can delete).
- `isModerated` must be false by default on creation and cannot be changed by the user.

## The Dirty Dozen Payloads
1. Create discussion with missing `userId`.
2. Create discussion with `userId` of another user.
3. Create discussion with huge `content` (over 5000 chars).
4. Create discussion with missing `content`.
5. Create discussion where `createdAt` is a past date instead of server time.
6. Create discussion where `isModerated` is set to `true`.
7. Update discussion (attempt to modify `userId`).
8. Update discussion to change `isModerated`.
9. Delete someone else's discussion.
10. Create discussion with invalid `ayahRef` types.
11. Read a discussion (should be public).
12. Create discussion with huge `author` name.

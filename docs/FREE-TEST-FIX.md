# Free-test question-count migration

1. Deploy this version.
2. Log in as an admin.
3. POST `/api/admin/free-tests/_fix-counts` once.
4. Verify in `/admin/free-tests` that each card shows the correct pool count.
5. Delete the `_fix-counts` route after the migration has completed.

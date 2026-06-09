# Stashbox Radio Production Rollback Notes

This document defines a text-only rollback checkpoint for Stashbox Radio production promotion planning. It does not create backup folders, copy production files, copy development files, or modify deployed infrastructure.

## Primary Rollback Source

Git history is the primary rollback source for production files. Future rollback work should restore production paths from the previous known-good commit rather than committing binary backup folders or copied media assets into the repository.

## Restore `/radio/` From the Previous Commit

If a future promotion changes `/radio/` and rollback is required, restore the production player path from the previous known-good commit:

```bash
git checkout HEAD~1 -- radio/
```

Then review the diff, test the restored production player, and commit the rollback with a clear message.

## Restore `/radio/dashboard/` From the Previous Commit

If a future promotion changes `/radio/dashboard/` and rollback is required, restore the production dashboard path from the previous known-good commit:

```bash
git checkout HEAD~1 -- radio/dashboard/
```

Then review the diff, test the restored public dashboard, and commit the rollback with a clear message.

## Restore `/radio-admin/` From the Previous Commit

If a future promotion changes `/radio-admin/` and rollback is required, restore the production admin path from the previous known-good commit:

```bash
git checkout HEAD~1 -- radio-admin/
```

Then review the diff, test the restored admin area, and commit the rollback with a clear message.

## GitHub Pages Verification

After any rollback commit is deployed, verify GitHub Pages manually to confirm the restored production paths load correctly:

- `/radio/`
- `/radio/dashboard/`
- `/radio-admin/`

Confirm that browser cache, CDN behavior, and GitHub Pages deployment timing do not mask the rollback result.

## Backup Folder Policy

Do not commit binary backup folders into PRs. Do not commit copied images, audio, video, media assets, ZIP archives, or other binary backup artifacts. Keep any optional full backups outside the PR and outside repository history.

# Stashbox Radio Production Backup Manifest — Phase 0

This manifest is a text-only planning checkpoint for protecting Stashbox Radio production paths before a future production promotion. It does not create physical backup folders, copy development paths, copy production paths, or add binary/media assets.

## Current Production Folders to Protect

The production folders to protect before any future promotion are:

- `/radio/`
- `/radio/dashboard/`
- `/radio-admin/`

## Stable Development Folders to Promote Later

The stable development folders intended for later promotion are:

- `/radio/dev/`
- `/radio/dashboard/dev/`
- `/radio-admin/dev/`

No promotion is performed in this Phase 0 checkpoint.

## Primary Backup Source

Git history is the primary backup and rollback source for repository-tracked production files. Future promotion work should rely on the previous known-good commit for rollback instead of committing duplicated backup folders.

## Optional External ZIP Backups

Optional full ZIP backups may be created before production promotion, but they should be stored outside the PR and outside repository history. Do not commit ZIP files or extracted backup folders to this repository.

Recommended S3 backup target:

```text
s3://stashbox-media-656260749296-us-east-2-an/backups/radio-production-promotion/
```

Suggested ZIP names:

- `radio-prod-before-dev-promotion.zip`
- `radio-dashboard-prod-before-dev-promotion.zip`
- `radio-admin-prod-before-dev-promotion.zip`

## Do Not Commit Backup Artifacts

Do not commit binary/media backup folders into the repo. Do not commit copied images, audio, video, media assets, ZIP archives, or other generated backup artifacts as part of this or any related PR.

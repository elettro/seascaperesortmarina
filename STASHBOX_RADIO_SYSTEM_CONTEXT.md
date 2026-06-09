# Stashbox Radio System Context — Phase 0 Checkpoint

This document is a text-only milestone checkpoint for Stashbox Radio before any production promotion. It does not promote development files to production and does not change AWS resources, runtime code, media, or binary assets.

## Current Stable Development URLs

The currently stable development surfaces are:

- `/radio/dev/`
- `/radio/dashboard/dev/`
- `/radio-admin/dev/`

## Planned Production URLs

The planned production surfaces are:

- `/radio/`
- `/radio/dashboard/`
- `/radio-admin/`

## AWS and Backend Context

- AWS Lambda endpoint currently used: `https://fmexmp5o52.execute-api.us-east-1.amazonaws.com/default/stashbox-radio-api-dev`
- Working public dashboard endpoint: `/dashboard/summary`
- S3 bucket: `stashbox-media-656260749296-us-east-2-an`
- RDS/PostgreSQL note: Stashbox Radio backend state is expected to be persisted through the existing RDS/PostgreSQL-backed API path. No RDS schema, data, credentials, connection settings, or database resources are changed as part of this Phase 0 checkpoint.

## Current `/radio/dev/` Player Features

The stable development player is the source intended for later promotion to `/radio/`. Its current feature set should be preserved during any future production promotion and treated as the baseline for verification:

- Public Stashbox Radio player experience.
- Audio playback controls and listener-facing playback state.
- Track or station metadata display where supplied by the backend.
- Integration with the current Lambda API endpoint for runtime data.
- Compatibility with the current media assets hosted outside this text-only checkpoint.

## Current `/radio/dashboard/dev/` Dashboard Features

The stable development public dashboard is the source intended for later promotion to `/radio/dashboard/`. Its current feature set should be preserved during any future production promotion and treated as the baseline for verification:

- Public dashboard summary view.
- Working Today Stats backed by `/dashboard/summary`.
- Listener/activity summary metrics exposed by the backend.
- Simplified public dashboard scope after removing or shelving nonessential sections listed below.

## Current `/radio-admin/dev/` Admin Features

The stable development admin area is the source intended for later promotion to `/radio-admin/`. Its current feature set should be preserved during any future production promotion and treated as the baseline for verification:

- Admin-facing Stashbox Radio controls and operational views.
- Integration with the current Lambda API endpoint for admin data and actions.
- Operational management flows that remain active after shelving the removed features listed below.
- No production admin files are changed as part of this Phase 0 checkpoint.

## Public Today Stats Backend Fix Summary

The public dashboard Today Stats flow has been stabilized around the working `/dashboard/summary` backend endpoint. Future promotion validation should confirm that the production dashboard can read the same summary data path and render Today Stats without reintroducing removed dashboard sections or changing backend infrastructure.

## Removed or Shelved Features

The following features are intentionally removed or shelved from the current promotion baseline and should not be reintroduced during Phase 0 or production promotion unless explicitly approved later:

- Ads Manager
- Branding interlude video manifest playback
- Public dashboard Events section
- Public dashboard Referrers section
- Public dashboard Devices section

## Known Fragile Files

Treat the following files as fragile during any later implementation or promotion work:

- `radio/dev/app.js`
- `radio/dashboard/dev/app.js`
- `radio-admin/dev/app.js`

This Phase 0 checkpoint does not modify those files.

## Production Promotion Order

When promotion is approved in a later phase, use the following order:

1. `/radio/dashboard/dev/` -> `/radio/dashboard/`
2. `/radio/dev/` -> `/radio/`
3. `/radio-admin/dev/` -> `/radio-admin/`

Do not perform this promotion as part of Phase 0.

## Security Follow-Up Reminder

Any exposed Lambda secrets, credentials, tokens, or other sensitive values discovered during or after production promotion should be rotated after production promotion is complete. This checkpoint does not rotate secrets or modify AWS resources.

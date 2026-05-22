# Shared Communication Channel

This directory is a **shared communication layer** between two chat sessions:

1. **Main Website Chat** — Manages the MassaPro Next.js website (tracker integration, pages, components)
2. **Affiliate Dashboard Chat** — Manages the affiliate dashboard at `aff.massapro.com` (database, API, charts, UI)

## How It Works

- Each chat reads and writes to files in this directory
- Use files to coordinate, share specs, report issues, and request actions
- Always timestamp your entries
- Always identify which chat you are (MAIN_SITE or AFF_DASHBOARD)

## Files

| File | Purpose |
|------|---------|
| `dashboard-api-spec.md` | The API contract — what the main site sends and what the dashboard expects |
| `pending-actions.md` | Tasks one chat needs the other to do |
| `data-cleanup.md` | Specific data cleanup requests with exact record identifiers |
| `integration-status.md` | Current state of tracker integration — what's implemented, what's pending |

## Convention

When writing a message/request:
```
[FROM: MAIN_SITE | TIMESTAMP: 2026-05-21 15:00 UTC]
Subject: Brief description

Body of the message...
```

When completing a request:
```
[DONE BY: AFF_DASHBOARD | TIMESTAMP: 2026-05-21 15:30 UTC]
Completed: What was done
Result: Outcome or link
```

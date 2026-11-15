# Portal presentation layer

Current release: **1.1.0**, applied to the development portal on 15 November 2026.

`assets/portal-mobile.css` is a screen-only CSS overlay for the native Operations app. It is appended to the existing active WordPress Additional CSS post (376) between labelled version markers. Prior styles and business logic are retained. No theme or plugin files were edited.

The overlay improves type, touch targets, forms, navigation, job headings, cards, document links, responsive Factory layouts and the external phone toolbar. Focus, hover and reduced-motion rules are scoped to the app. Print styling remains supplied by the existing app.

## Validation

Local browser checks used native Factory rendering and modal code with synthetic data at 320, 390, 768, 844, 1024, 1440 and 1920px. Checks passed for page overflow, edit-dialog opening/fit/closing and print-media isolation. Native source copies and synthetic test fixtures are kept outside this public repository. Source reads can redact sensitive patterns; only unredacted rendering sections were used.

The complete saved Additional CSS was read back and matched the original plus the overlay exactly. The active theme's CSS-post association and the workspace's call to `wp_head()` were verified. A signed-in live browser visual test and end-to-end business-workflow tests were not available in this session.

## Rollback and release tracking

WordPress option `pw_portal_ui_css_backup_v100` contains the pre-refresh Additional CSS (autoload disabled). Restore its `content` to CSS post 376 to revert. This is a CSS backup only.

The private WordPress release register and private history page record this release. They remain outside the public repository. Public development files use the `feat/portal-mobile-ui` branch and the `v1.1.0-dev.1` and `v1.1.0` tags. This repository contains the presentation layer, not the complete WordPress application or database.

See [versioning](docs/versioning.md) for future release rules and [the release template](templates/release.json) for recording a module or feature change.

## Review artifacts

The [desktop screenshot](preview/screenshots/desktop.png) and [phone screenshot](preview/screenshots/mobile.png) use synthetic data with the native Factory markup. They do not show the signed-in live portal. The [validation report](validation/native-checks.json) records the checked viewport sizes and scope.

## Original design concept

Run `python3 -m http.server 8765 --bind 0.0.0.0` and open `http://127.0.0.1:8765/preview/` to review the original synthetic concept. It uses `preview/concept.css`; it is not the exact live DOM or a live-data app.

# Portal presentation layer

Current applied release: **1.2.0**.

The **Performance Windows Portal UI** extension is installed and active on the development portal. Its PHP bootstrap matches the published source, and the CSS/JavaScript hashes from its authenticated status endpoint match the tested package. The earlier v1.1.2 Operations form correction remains applied.

## Catalogue browser and responsive forms

The custom **Performance Windows Portal UI** extension loads `assets/portal-catalog.js` and `assets/portal-forms.css` on the standalone QR manager. It also supports the native WordPress QR admin screen and loads the shared Operations form styles for signed-in users.

- Parts: multi-term search, supplier/status/unit filters, natural column sorting, 10/25/50-row pages, bounded scrolling and labelled phone cards.
- Suppliers: independent search, sorting and pagination.
- Label printing: original checkboxes, names, values, nonces, individual QR/Edit links and submit handlers are retained. Checked parts persist across sorting, filters and pages. The existing all-enabled behaviour when none are selected is stated beside the selection controls.
- The browser uses only authorized DOM rows, with no network calls, local storage or catalogue writes. Installation adds no records, migrations, approvals or role changes.

For a new installation, use **Plugins → Add New → Upload Plugin** with [pw-portal-ui-1.2.0.zip](packages/pw-portal-ui-1.2.0.zip), then activate the extension. See [module instructions](module-readme.txt) and the package checksum. Deactivation removes the extension's asset hooks without deleting data.

## Existing presentation layer

`assets/portal-mobile.css` is a screen-only CSS overlay for the native Operations app. It is appended to the existing active WordPress Additional CSS post (376) between labelled version markers. Prior styles and business logic are retained. No theme or plugin files were edited.

`assets/portal-header.css` loads after that overlay. Version 1.1.1 gives the global header an explicit grid so the QR Ordering plugin's existing padding and stacking rules cannot create an oversized header. The desktop logo and account controls share a row; tablet and phone layouts adapt without fixed heights. Keep the two stylesheet files in that order.

`assets/portal-forms.css` follows both stylesheets. Version 1.1.2 corrects the Operations search field, label spacing, borders and checkbox alignment, including stock filters and dialogs. Its catalogue rules are also available for the standalone QR manager, which requires an asset-loading extension because it does not call the theme's head/footer hooks.

The overlay improves type, touch targets, forms, navigation, job headings, cards, document links, responsive Factory layouts and the external phone toolbar. Focus, hover and reduced-motion rules are scoped to the app. Print styling remains supplied by the existing app.

## Validation

Local browser checks used native Factory rendering and modal code with synthetic data at 320, 390, 768, 844, 1024, 1440 and 1920px. Checks passed for page overflow, edit-dialog opening/fit/closing and print-media isolation. Native source copies and synthetic test fixtures are kept outside this public repository. Source reads can redact sensitive patterns; only unredacted rendering sections were used.

The complete saved Additional CSS was read back and matched the original plus the overlay exactly. The active theme's CSS-post association and the workspace's call to `wp_head()` were verified. A signed-in live browser visual test and end-to-end business-workflow tests were not available in this session.

Six browser regression tests cover the 120-item synthetic catalogue, combined filters, empty results, natural sorting, page limits, selection/FormData preservation, focus retention, phone/table containment and checkbox alignment. Viewport checks cover 320–1920px. Additional local checks included the native manager and Operations CSS at five widths. Run `python3 -m pip install -r requirements-dev.txt`, `python3 -m playwright install chromium`, then `python3 -m unittest discover -s tests -v`. PHP syntax was parsed locally; the PR workflow additionally runs native PHP lint and JavaScript syntax checks.

The header correction additionally passed 32 local viewport/role combinations from 320–1920px, including the QR plugin's inline header styles and the 1040px/1100px breakpoints. Checks cover horizontal overflow, header containment, 44px touch controls, and side-by-side desktop alignment. Desktop header height measured about 109px. The fixture uses synthetic controls and a placeholder logo with the native logo's aspect ratio; see [header validation](validation/header-checks.json).

## Rollback and release tracking

WordPress option `pw_portal_ui_css_backup_v100` contains the pre-refresh Additional CSS (autoload disabled). Restore its `content` to CSS post 376 to revert. This is a CSS backup only.

For the header correction alone, `pw_portal_ui_css_backup_v110` contains the CSS immediately before v1.1.1. Restore its `content` to CSS post 376 to retain the v1.1.0 design while reverting the header patch.

`pw_portal_ui_css_backup_v111` contains the CSS before the v1.1.2 form correction.

The private WordPress release register and private history page record this release. They remain outside the public repository. Public development files use the `feat/portal-mobile-ui` branch and version tags, including `v1.2.0`. This repository contains the presentation layer, not the complete WordPress application or database.

See [versioning](docs/versioning.md) for future release rules and [the release template](templates/release.json) for recording a module or feature change.

## Review artifacts

The [desktop screenshot](preview/screenshots/desktop.png) and [phone screenshot](preview/screenshots/mobile.png) use synthetic data with the native Factory markup. They do not show the signed-in live portal. The [validation report](validation/native-checks.json) records the checked viewport sizes and scope.

The header correction has separate [desktop](preview/screenshots/header-desktop.png) and [phone](preview/screenshots/header-mobile.png) previews. Open `/preview/header.html` on the local preview server for its standalone layout fixture.

## Original design concept

Run `python3 -m http.server 8765 --bind 0.0.0.0` and open `http://127.0.0.1:8765/preview/` to review the original synthetic concept. It uses `preview/concept.css`; it is not the exact live DOM or a live-data app.

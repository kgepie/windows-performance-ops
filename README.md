# Portal presentation layer

Mobile-first CSS and a synthetic local preview for the staff portal.

**Status: 1.1.0-dev.1, prepared only.** The live portal's recorded release remains 1.0.0. This branch has not been deployed or pushed to GitHub. It contains a presentation candidate, not a copy of the portal application or a database backup.

- `assets/portal-mobile.css`: scoped design tokens, typography, controls, responsive cards/navigation, dialog sizing, phone-toolbar spacing and reduced-motion rules.
- `preview/index.html`: synthetic Factory view for visual review. It makes no live API requests and changes no records. The `pwui-*` classes are preview hooks, pending mapping to the live app's actual markup.

## Preview

Run `python3 -m http.server 8765 --bind 0.0.0.0` from this directory and open `http://127.0.0.1:8765/preview/`.

## Deployment checklist

1. Inspect the current portal plugin CSS/JS after WPVibe supports source reads. Version 1.16.4 requires one manual update through WordPress before it can self-update.
2. Map the preview layout hooks to observed live selectors. Keep all rules scoped to the operations root, with explicit scope for its external phone toolbar. Preserve data visibility, action permissions, hidden states and business logic.
3. Export and retain the current custom CSS and its theme association. The observed active Additional CSS is post 376. Confirm its binding again before writing; do not edit plugin files or replace unrelated CSS.
4. Preview the mapped CSS against real markup. Check phone/tablet/desktop widths, 200% text, menus, input focus, dialogs, long content and QR printing. Verify how the custom workspace includes Additional CSS before claiming the stylesheet is active.
5. Apply the mapped, verified CSS. Verify the live portal, then record 1.1.0 in the private release register and mirror page. Preserve prior records. Do not mark the release as deployed based only on these synthetic-preview checks.

## Validation to date

The synthetic preview was checked at widths 320, 375, 390, 768, 844, 1024, 1440 and 1920: no page-level horizontal overflow, visible button targets at least 44px, dialog fit and Frames/Screens switching. These results do not establish compatibility with the live portal.

The private portal inventory and release register remain outside this public repository.

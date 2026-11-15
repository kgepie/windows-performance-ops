# Changelog

## 1.1.0 — 2026-11-15

Applied mobile-first presentation overlay to the existing development portal through Additional CSS.

- Increased text and touch-control sizes; improved inputs, navigation and status readability.
- Added navy job headings, clearer cards and document links; stacked Factory details on smaller devices.
- Adjusted phone install/QR toolbar spacing and safe-area padding.
- Added scoped hover/focus feedback and reduced-motion support; print styles remain native.
- Preserved original CSS, verified the saved overlay, and recorded the release privately with a CSS rollback reference.

Checks: native rendering fixture at seven viewport widths, dialog fit and print-media isolation. No signed-in live visual or end-to-end workflow test was performed. Business logic and custom-plugin versions remain independent.

## 1.1.0-dev.1 — prepared concept

Original mobile-first visual prototype, saved under `preview/`.

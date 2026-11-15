=== Performance Windows Portal UI ===
Requires at least: 6.6
Requires PHP: 8.1
Stable tag: 1.2.0
License: MIT

Responsive Operations form controls and a browser for the existing QR Ordering catalogue.

== Installation ==
1. In the portal's WordPress admin, open Plugins > Add New > Upload Plugin.
2. Choose pw-portal-ui-1.2.0.zip, click Install Now, then Activate Plugin.
3. Open the existing Simple QR Ordering manager and refresh the page.

This extension requires the existing PW QR Ordering / Operations application for its UI. It adds no catalogue records and changes no existing role, approval or form handlers.

== Catalogue browsing ==
Search parts by code, name, supplier or shelf. Filter by supplier, status and order unit. Sort using a column heading or the Sort by selector. Choose 10, 25 or 50 entries per page; phones start at 10.

Native label checkboxes stay selected across pages, sorting and filters. Select this page affects only the current page; Select matching parts affects every current result. Clear selection clears all checked parts. With no parts selected, the original print form's all-enabled behaviour still applies. Individual QR and Edit links remain native.

On phones, rows display as labelled cards inside a bounded scroll region. The supplier table has its own search, sorting and pagination controls.

== Privacy and data ==
The browser operates on the already-authorized rows in the page. It makes no network calls and uses no browser storage. Existing server authentication, capabilities, nonces, approval rules and print handlers are retained.

== Reverting ==
Deactivate the extension to remove its asset loader and table browser. It has no database migrations and deletes no records. The separately applied Operations Additional CSS correction is reverted through its recorded CSS backup, if required.

== Verification ==
Authorized administrator REST endpoint: /wp-json/pw-portal-ui/v1/status. Reports the loaded module version and CSS/JavaScript hashes, without catalogue data.

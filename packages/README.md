# Portal UI extension

The versioned ZIP contains only the custom extension, its CSS/JavaScript, readme and license. Its root directory is always `pw-portal-ui`, so future uploads can replace the same module without creating a second plugin.

Upload `pw-portal-ui-1.2.0.zip` through the portal's **Plugins → Add New → Upload Plugin**, then activate **Performance Windows Portal UI**. Refresh the existing QR manager.

The package is prepared and tested; installation on the live portal is pending. The MCP installer currently supports WordPress.org slugs, not custom ZIP upload, so it cannot perform this one step.

Run `python3 scripts/package_ui.py` to rebuild the package. The matching `.sha256` file records its checksum. No private inventory, credentials, backup or native application source is included.

# Portal UI extension

The versioned ZIP contains only the custom extension, its CSS/JavaScript, readme and license. Its root directory is always `pw-portal-ui`, so future uploads can replace the same module without creating a second plugin.

Upload `pw-portal-ui-1.2.0.zip` through the portal's **Plugins → Add New → Upload Plugin**, then activate **Performance Windows Portal UI**. Refresh the existing QR manager.

The package is installed and active on the development portal. Its server-reported version, asset hashes and installed PHP source match the tested package. Signed-in visual and end-to-end business-write testing remain separate checks.

Run `python3 scripts/package_ui.py` to rebuild the package. The matching `.sha256` file records its checksum. No private inventory, credentials, backup or native application source is included.

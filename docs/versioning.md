# Portal development releases

Portal releases use semantic versioning, independently of WordPress and individual plugin versions.

| Change | Example after 1.1.0 |
| --- | --- |
| Compatible bug fix | 1.1.1 |
| New compatible module or feature | 1.2.0 |
| Breaking workflow, API or data change | 2.0.0 |
| Development or testing build | 1.2.0-dev.1, 1.2.0-beta.1, 1.2.0-rc.1 |

The 1.0.0 record established a metadata baseline of the existing portal on 15 November 2026. It was not a source-code snapshot or database backup, so there is no source tag for that baseline. The first presentation code is tagged `v1.1.0-dev.1`; the applied CSS release is tagged `v1.1.0`.

## Record the next change

1. Start from the current development branch and read `VERSION`, `CHANGELOG.md` and the private WordPress release register. Preserve earlier records.
2. Choose a version using the rules above. Use a prerelease version while developing. A new module needs its own unique ID, name and owning component version.
3. Complete `templates/release.json`, describe the change in `CHANGELOG.md`, and record relevant validation and limits. Keep credentials, staff/customer records, internal environment inventories and private backups outside this public repository.
4. Verify changes on the intended development site before marking them as applied. Record a verified backup or rollback reference for code/data deployments. A Git tag does not back up the WordPress database or untracked server files.
5. Update `VERSION` and commit the reviewed source. Create an annotated tag `vX.Y.Z` for the release. Push the development branch and explicit release tag, then open a pull request.
6. Update the private WordPress release register and its private history page with the applied version, affected modules, verification results, limitations and rollback reference. Include the Git commit/tag URL once it exists. Do not mark an undeployed prerelease as the current applied version.

Documentation-only repository publication does not change the applied portal version. Never move an existing published version tag to a different commit.

"""Build the custom WordPress extension with a stable plugin directory name."""
from hashlib import sha256
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parents[1]
VERSION = '1.2.0'
FILES = {
    'portal-ui-enhancements.php': 'portal-ui-enhancements.php',
    'assets/portal-forms.css': 'assets/portal-forms.css',
    'assets/portal-catalog.js': 'assets/portal-catalog.js',
    'readme.txt': 'module-readme.txt',
    'LICENSE': 'LICENSE',
}
target = ROOT / 'packages' / f'pw-portal-ui-{VERSION}.zip'
target.parent.mkdir(exist_ok=True)
with ZipFile(target, 'w', ZIP_DEFLATED) as archive:
    for name, source in FILES.items():
        entry = ZipInfo(f'pw-portal-ui/{name}', date_time=(2026, 11, 15, 0, 0, 0))
        entry.compress_type = ZIP_DEFLATED
        entry.external_attr = 0o100644 << 16
        archive.writestr(entry, (ROOT / source).read_bytes())
with ZipFile(target) as archive:
    assert archive.testzip() is None
digest = sha256(target.read_bytes()).hexdigest()
target.with_suffix('.zip.sha256').write_text(f'{digest}  {target.name}\n')
print(f'{target}\nSHA256 {digest}')

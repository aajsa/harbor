import os
import re

# 1. Get all translation keys from ar files
ar_files = [
    "src/lib/i18n/locales/ar/settings.ts",
    "src/lib/i18n/locales/ar/library.ts",
    "src/lib/i18n/locales/ar/live.ts",
    "src/lib/i18n/locales/ar/misc.ts",
]

translated_keys = set()
for fpath in ar_files:
    if os.path.exists(fpath):
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
            # simple regex to find keys in objects
            keys = re.findall(r'^\s*["\']?(.*?)["\']?\s*:', content, re.MULTILINE)
            for k in keys:
                translated_keys.add(k)

# 2. Find all t("...") or t('...') in src/**/*.tsx and src/**/*.ts
used_keys = set()
for root, _, files in os.walk("src"):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            with open(os.path.join(root, file), "r", encoding="utf-8") as f:
                content = f.read()
                # matches t("key") or t('key') or t(`key`)
                matches = re.findall(r't\(\s*["\'`](.*?)["\'`]', content)
                for m in matches:
                    used_keys.add(m)

missing = used_keys - translated_keys
print("Total missing:", len(missing))
for m in sorted(list(missing)):
    if m:
        print(f'"{m}": "",')

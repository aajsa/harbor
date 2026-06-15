import os
import re

def process_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Add const t = useT(); if not present
    if 'useT()' not in content and 'export function ' in content:
        content = re.sub(r'(export function \w+\([^)]*\)\s*\{\s*)', r'\1const t = useT();\n  ', content)
        if 'import { useT }' not in content:
            content = 'import { useT } from "@/lib/i18n";\n' + content

    # Replace title="Text" with title={t("Text")}
    content = re.sub(r'title="([^"]+)"', r'title={t("\1")}', content)
    # Replace subtitle="Text"
    content = re.sub(r'subtitle="([^"]+)"', r'subtitle={t("\1")}', content)
    # Replace label="Text"
    content = re.sub(r'label="([^"]+)"', r'label={t("\1")}', content)
    # Replace sub="Text"
    content = re.sub(r'sub="([^"]+)"', r'sub={t("\1")}', content)

    # Some hardcoded texts
    content = content.replace('>Sources<', '>{t("Sources")}<')
    content = content.replace('>Types<', '>{t("Types")}<')
    content = content.replace('>Get beta updates<', '>{t("Get beta updates")}<')

    if content != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {path}")

# Panels user mentioned
files = [
    "src/views/settings/advanced-panel.tsx",
    "src/views/settings/webhooks-panel.tsx",
    "src/views/settings/relay-panel.tsx",
    "src/views/settings/quality-panel.tsx",
]

# Player panel has multiple files
player_panel_dir = "src/views/settings/player-panel"
if os.path.exists(player_panel_dir):
    for f in os.listdir(player_panel_dir):
        if f.endswith(".tsx"):
            files.append(os.path.join(player_panel_dir, f))

# Player layout panel
layout_panel_dir = "src/views/settings/player-layout-panel"
if os.path.exists(layout_panel_dir):
    for f in os.listdir(layout_panel_dir):
        if f.endswith(".tsx"):
            files.append(os.path.join(layout_panel_dir, f))

for f in files:
    if os.path.exists(f):
        process_file(f)


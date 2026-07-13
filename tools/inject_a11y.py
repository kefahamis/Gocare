#!/usr/bin/env python3
"""Insert the accessibility.js script tag before </body> on every .html page (idempotent)."""
import os
SITE = r"C:\Users\ADMIN\.gemini\antigravity\scratch\Gocare-institute"
MARKER = "accessibility.js"

def main():
    added = skipped = 0
    for root, _, files in os.walk(SITE):
        rel_root = os.path.relpath(root, SITE)
        if any(seg in (".git", "images", "docs", "node_modules", "tools") for seg in rel_root.split(os.sep)):
            continue
        for fn in files:
            if not fn.lower().endswith(".html"):
                continue
            fp = os.path.join(root, fn)
            rel = os.path.relpath(fp, SITE).replace(os.sep, "/")
            prefix = "../" * rel.count("/")
            with open(fp, "r", encoding="utf-8", errors="ignore") as f:
                txt = f.read()
            if MARKER in txt:
                skipped += 1
                continue
            tag = '  <script src="{p}accessibility.js" defer></script>\n'.format(p=prefix)
            low = txt.lower()
            idx = low.rfind("</body>")
            if idx == -1:
                idx = low.rfind("</html>")
            txt = (txt + "\n" + tag) if idx == -1 else (txt[:idx] + tag + txt[idx:])
            with open(fp, "w", encoding="utf-8") as f:
                f.write(txt)
            added += 1
    print(f"Injected accessibility.js into {added} files, skipped {skipped}.")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Insert the search script tags before </body> on every .html page (idempotent),
using a path prefix that matches each file's depth under the site root."""
import os

SITE = r"C:\Users\ADMIN\.gemini\antigravity\scratch\Gocare-institute"
MARKER = "gc-search-js"

def main():
    added = skipped = 0
    for root, _, files in os.walk(SITE):
        rel_root = os.path.relpath(root, SITE)
        if any(seg in (".git", "images", "docs", "node_modules") for seg in rel_root.split(os.sep)):
            continue
        for fn in files:
            if not fn.lower().endswith(".html"):
                continue
            fp = os.path.join(root, fn)
            rel = os.path.relpath(fp, SITE).replace(os.sep, "/")
            depth = rel.count("/")            # 0 for root pages, 1 for courses/… etc.
            prefix = "../" * depth
            with open(fp, "r", encoding="utf-8", errors="ignore") as f:
                txt = f.read()
            if MARKER in txt:
                skipped += 1
                continue
            snippet = (
                '  <script src="{p}search-index.js" defer></script>\n'
                '  <script id="{m}" src="{p}search.js" defer></script>\n'
            ).format(p=prefix, m=MARKER)
            low = txt.lower()
            idx = low.rfind("</body>")
            if idx == -1:
                # no </body>; append before </html> or at end
                idx = low.rfind("</html>")
            if idx == -1:
                new = txt + "\n" + snippet
            else:
                new = txt[:idx] + snippet + txt[idx:]
            with open(fp, "w", encoding="utf-8") as f:
                f.write(new)
            added += 1
    print(f"Injected into {added} files, skipped {skipped} (already had it).")

if __name__ == "__main__":
    main()

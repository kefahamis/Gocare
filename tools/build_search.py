#!/usr/bin/env python3
"""Crawl every .html page in the GoCare site and emit a client-side search index
as a JS file (window.__GOCARE_SEARCH__). Boilerplate (nav, footer, cookie banner,
sub-bar, scripts, styles, svg) is stripped so results are page-specific."""
import os, re, json, html
from html.parser import HTMLParser

SITE = r"C:\Users\ADMIN\.gemini\antigravity\scratch\Gocare-institute"
# Tags whose text content must never be indexed.
SKIP_TAGS = {"script", "style", "svg", "nav", "footer", "noscript", "head"}
# Element class substrings that mark boilerplate blocks to skip entirely.
SKIP_CLASSES = ("subbar", "cookie-banner", "ck-inner", "footer", "site-footer",
                "whatsapp", "back-to-top", "scroll-top")
BLOCK_TAGS = {"p","div","section","h1","h2","h3","h4","h5","h6","li","br","td","tr","article"}
MAX_TEXT = 3200   # cap main-content chars per page to keep the index lean

VOID = {"meta","link","img","br","input","hr","source","area","base","col","embed","param","track","wbr"}

class Extractor(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title = ""
        self.desc = ""
        self.headings = []
        self.parts = []
        self._stack = []           # list of (tag, skipflag) — skipflag true if this or any ancestor is boilerplate
        self._in_title = False
        self._cur_heading = None

    def _skipping(self):
        return bool(self._stack) and self._stack[-1][1]

    def handle_starttag(self, tag, attrs):
        ad = dict(attrs)
        cls = ad.get("class", "") or ""
        if tag == "meta" and ad.get("name", "").lower() == "description":
            self.desc = (ad.get("content", "") or "").strip()
        if tag == "title":
            self._in_title = True
        parent_skip = self._stack[-1][1] if self._stack else False
        is_skip = parent_skip or tag in SKIP_TAGS or any(k in cls for k in SKIP_CLASSES)
        if tag not in VOID:
            self._stack.append((tag, is_skip))
        if tag in ("h1","h2","h3") and not is_skip:
            self._cur_heading = []

    def handle_startendtag(self, tag, attrs):
        # self-closing element: process start, no push
        self.handle_starttag(tag, attrs)
        if not self._stack or self._stack[-1][0] != tag:
            return

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        if tag in ("h1","h2","h3") and self._cur_heading is not None:
            h = " ".join("".join(self._cur_heading).split())
            if h:
                self.headings.append(h)
            self._cur_heading = None
        skipping = self._skipping()
        # pop back to and including the matching open tag
        for i in range(len(self._stack) - 1, -1, -1):
            if self._stack[i][0] == tag:
                del self._stack[i:]
                break
        if tag in BLOCK_TAGS and not skipping:
            self.parts.append(" ")

    def handle_data(self, data):
        if self._in_title:
            self.title += data
            return
        if self._skipping():
            return
        if self._cur_heading is not None:
            self._cur_heading.append(data)
        self.parts.append(data)

def clean(txt):
    txt = html.unescape(txt).replace("﻿", "")
    txt = re.sub(r"\s+", " ", txt)
    return txt.strip()

def main():
    index = []
    for root, _, files in os.walk(SITE):
        # skip asset/vendor dirs
        rel_root = os.path.relpath(root, SITE)
        if any(seg in (".git", "images", "docs", "node_modules") for seg in rel_root.split(os.sep)):
            continue
        for fn in files:
            if not fn.lower().endswith(".html"):
                continue
            fp = os.path.join(root, fn)
            url = os.path.relpath(fp, SITE).replace(os.sep, "/")
            try:
                with open(fp, "r", encoding="utf-8", errors="ignore") as f:
                    raw = f.read()
            except Exception as e:
                print("skip", url, e); continue
            ex = Extractor()
            try:
                ex.feed(raw)
            except Exception as e:
                print("parse-warn", url, e)
            title = clean(ex.title).replace(" | GoCare Training Institute", "").strip() or url
            desc = clean(ex.desc)
            headings = " · ".join(dict.fromkeys(ex.headings))  # de-dup, keep order
            body = clean("".join(ex.parts))
            if len(body) > MAX_TEXT:
                body = body[:MAX_TEXT]
            # facet category
            if url.startswith("courses/") or url == "course-details.html":
                cat = "Courses"
            elif url.startswith("schools/"):
                cat = "Schools"
            elif (url.startswith("admissions") or url == "apply.html"
                  or url.startswith("application-form")):
                cat = "Admissions"
            elif url.startswith("about"):
                cat = "About"
            elif url.startswith("blog"):
                cat = "Blog"
            else:
                cat = "Other"
            index.append({"u":url,"t":title,"d":desc,"h":headings,"b":body,"c":cat})
    index.sort(key=lambda r: r["u"])
    out = "window.__GOCARE_SEARCH__=" + json.dumps(index, ensure_ascii=False, separators=(",",":")) + ";"
    outpath = os.path.join(SITE, "search-index.js")
    with open(outpath, "w", encoding="utf-8") as f:
        f.write(out)
    size = os.path.getsize(outpath)
    print(f"Indexed {len(index)} pages -> search-index.js ({size/1024:.1f} KB)")

if __name__ == "__main__":
    main()

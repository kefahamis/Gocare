/* GoCare sitewide search — client-side, uses the prebuilt window.__GOCARE_SEARCH__ index.
   Self-injects a search box into the sub-bar and renders a ranked results dropdown.
   Works on file:// and http(s); auto-detects the path prefix for sub-folder pages. */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  // Path prefix so root-relative index URLs resolve from sub-folders (courses/, schools/, …).
  function basePrefix() {
    var s = document.getElementById("gc-search-js") ||
            document.querySelector('script[src$="search.js"]');
    if (s) {
      var src = s.getAttribute("src") || "";
      return src.replace(/search\.js.*$/, ""); // "" or "../" (or deeper)
    }
    // Fallback: derive from current path depth under the site root is unknown, assume same dir.
    return "";
  }

  var CSS = "" +
    ".gc-search{position:relative;flex:1 1 auto;max-width:440px;margin:0 18px;font-family:'Inter',sans-serif;}" +
    ".gc-search-box{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #e6ddf0;border-radius:50px;padding:7px 14px;transition:border-color .2s,box-shadow .2s;}" +
    ".gc-search-box:focus-within{border-color:#642a7e;box-shadow:0 0 0 3px rgba(100,42,126,.12);}" +
    ".gc-search-box svg{width:16px;height:16px;flex-shrink:0;color:#9b8bb0;}" +
    ".gc-search-input{border:0;outline:0;background:transparent;font-size:.86rem;color:#3a2b4d;width:100%;font-family:inherit;}" +
    ".gc-search-input::placeholder{color:#a99bbd;}" +
    ".gc-search-clear{border:0;background:transparent;color:#b3a6c6;cursor:pointer;font-size:1rem;line-height:1;padding:0 2px;display:none;}" +
    ".gc-search.has-text .gc-search-clear{display:block;}" +
    ".gc-panel{position:absolute;top:calc(100% + 8px);left:0;right:0;background:#fff;border:1px solid #ece4f5;border-radius:14px;box-shadow:0 20px 48px rgba(74,26,109,.18);max-height:70vh;overflow-y:auto;z-index:2000;display:none;}" +
    ".gc-panel.open{display:block;}" +
    ".gc-facets{display:flex;flex-wrap:wrap;gap:6px;padding:11px 14px;border-bottom:1px solid #f2ecf8;position:sticky;top:0;background:#fff;z-index:2;}" +
    ".gc-facet{border:1px solid #ece4f5;background:#faf7fd;color:#6b6478;font-size:.72rem;font-weight:700;border-radius:50px;padding:4px 11px;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:6px;transition:.15s;}" +
    ".gc-facet:hover{border-color:#c9a0e9;color:#4a1a6d;}" +
    ".gc-facet.active{background:#642a7e;border-color:#642a7e;color:#fff;}" +
    ".gc-facet span{font-size:.66rem;background:rgba(0,0,0,.06);border-radius:50px;padding:0 6px;min-width:16px;text-align:center;}" +
    ".gc-facet.active span{background:rgba(255,255,255,.25);}" +
    ".gc-panel-head{padding:9px 16px;font-size:.7rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#9b8bb0;border-bottom:1px solid #f2ecf8;}" +
    ".gc-res{display:block;padding:11px 16px;border-bottom:1px solid #f6f1fb;text-decoration:none;color:inherit;}" +
    ".gc-res:last-child{border-bottom:0;}" +
    ".gc-res:hover,.gc-res.active{background:#faf6ff;}" +
    ".gc-res-top{display:flex;align-items:center;gap:8px;margin-bottom:3px;}" +
    ".gc-res-title{font-family:'Outfit','Inter',sans-serif;font-weight:700;font-size:.9rem;color:#2a1740;line-height:1.3;}" +
    ".gc-res-chip{flex-shrink:0;font-size:.6rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#642a7e;background:#f3e8ff;border-radius:50px;padding:2px 9px;}" +
    ".gc-res-snip{font-size:.78rem;color:#6b6478;line-height:1.5;}" +
    ".gc-res mark,.gc-res-title mark{background:#ffe9b0;color:inherit;padding:0 1px;border-radius:2px;}" +
    ".gc-empty{padding:18px 16px;font-size:.85rem;color:#8a7f9c;text-align:center;}" +
    "@media(max-width:900px){.gc-search{max-width:none;margin:8px 0 0;flex-basis:100%;order:3;}}";

  function injectCSS() {
    var st = document.createElement("style");
    st.id = "gc-search-css";
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  var SEARCH_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>';

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  function highlight(escaped, terms) {
    if (!terms.length) return escaped;
    var re = new RegExp("(" + terms.map(escRe).join("|") + ")", "gi");
    return escaped.replace(re, "<mark>$1</mark>");
  }

  function snippet(body, terms, len) {
    var lb = body.toLowerCase(), pos = -1;
    for (var i = 0; i < terms.length; i++) {
      var p = lb.indexOf(terms[i]);
      if (p !== -1 && (pos === -1 || p < pos)) pos = p;
    }
    if (pos === -1) return body.slice(0, len);
    var start = Math.max(0, pos - 45);
    var out = body.slice(start, start + len);
    if (start > 0) out = "… " + out;
    if (start + len < body.length) out = out + " …";
    return out;
  }

  ready(function () {
    var DATA = window.__GOCARE_SEARCH__;
    if (!DATA || !DATA.length) return;
    var inner = document.querySelector(".subbar-inner");
    if (!inner) return; // no sub-bar on this page

    injectCSS();
    var PREFIX = basePrefix();

    // Precompute lowercase fields once.
    DATA.forEach(function (r) {
      r._t = (r.t || "").toLowerCase();
      r._h = (r.h || "").toLowerCase();
      r._b = (r.b || "").toLowerCase();
      r._d = (r.d || "").toLowerCase();
    });

    // Build UI
    var wrap = document.createElement("div");
    wrap.className = "gc-search";
    wrap.setAttribute("role", "search");
    wrap.innerHTML =
      '<div class="gc-search-box">' + SEARCH_SVG +
      '<input type="text" class="gc-search-input" placeholder="Search courses, admissions, resources…" ' +
      'autocomplete="off" aria-label="Search the site"/>' +
      '<button type="button" class="gc-search-clear" aria-label="Clear">&times;</button>' +
      '</div><div class="gc-panel" role="listbox"></div>';

    var portals = inner.querySelector(".subbar-portals");
    if (portals) inner.insertBefore(wrap, portals);
    else inner.appendChild(wrap);

    var input = wrap.querySelector(".gc-search-input");
    var panel = wrap.querySelector(".gc-panel");
    var clear = wrap.querySelector(".gc-search-clear");
    var active = -1, current = [];
    var FACET_ORDER = ["Courses", "Blog", "Admissions", "Schools", "About", "Other"];
    var allResults = [], activeFacet = "all", lastTerms = [];

    function search(q) {
      var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      if (!terms.length) return [];
      function scoreRec(r, requireAll) {
        var score = 0, matchedAll = true;
        for (var i = 0; i < terms.length; i++) {
          var t = terms[i], hit = 0;
          if (r._t.indexOf(t) !== -1) { hit += 8; if (r._t.split(/\W+/).indexOf(t) !== -1) hit += 4; }
          if (r._h.indexOf(t) !== -1) hit += 4;
          if (r._d.indexOf(t) !== -1) hit += 2;
          if (r._b.indexOf(t) !== -1) hit += 1;
          if (!hit) matchedAll = false;
          score += hit;
        }
        if (requireAll && !matchedAll) return 0;
        return score;
      }
      function collect(requireAll) {
        var out = [];
        for (var i = 0; i < DATA.length; i++) {
          var s = scoreRec(DATA[i], requireAll);
          if (s > 0) out.push({ r: DATA[i], s: s });
        }
        return out;
      }
      var res = collect(true);            // AND match first (precise)
      if (!res.length) res = collect(false); // fall back to OR
      res.sort(function (a, b) { return b.s - a.s || a.r.t.localeCompare(b.r.t); });
      return res.slice(0, 60).map(function (x) { return x.r; });
    }

    function runSearch(q) {
      lastTerms = q.toLowerCase().split(/\s+/).filter(Boolean);
      activeFacet = "all";                 // reset facet on a new query
      if (!q.trim()) { allResults = []; panel.classList.remove("open"); panel.innerHTML = ""; return; }
      allResults = search(q);
      paint();
    }

    function facetPill(key, label, n) {
      return '<button type="button" class="gc-facet' + (activeFacet === key ? " active" : "") +
        '" data-facet="' + esc(key) + '">' + esc(label) + ' <span>' + n + "</span></button>";
    }

    function paint() {
      active = -1;
      if (!allResults.length) {
        panel.innerHTML = '<div class="gc-empty">No results for “' + esc(input.value) + '”.</div>';
        panel.classList.add("open");
        return;
      }
      // Facet counts across the full result set.
      var counts = {};
      allResults.forEach(function (r) { counts[r.c] = (counts[r.c] || 0) + 1; });
      var present = FACET_ORDER.filter(function (f) { return counts[f]; });

      var displayed = (activeFacet === "all")
        ? allResults : allResults.filter(function (r) { return r.c === activeFacet; });
      displayed = displayed.slice(0, 25);
      current = displayed;

      var html = '<div class="gc-facets">' + facetPill("all", "All", allResults.length);
      present.forEach(function (f) { html += facetPill(f, f, counts[f]); });
      html += "</div>";
      html += '<div class="gc-panel-head">' + displayed.length + " result" + (displayed.length > 1 ? "s" : "") +
        (activeFacet !== "all" ? " in " + esc(activeFacet) : "") + "</div>";
      displayed.forEach(function (r, i) {
        var title = highlight(esc(r.t), lastTerms);
        var snip = highlight(esc(snippet(r.b || r.d || "", lastTerms, 150)), lastTerms);
        html += '<a class="gc-res" href="' + PREFIX + esc(r.u) + '" data-i="' + i + '">' +
          '<div class="gc-res-top"><span class="gc-res-title">' + title + '</span>' +
          '<span class="gc-res-chip">' + esc(r.c) + '</span></div>' +
          '<div class="gc-res-snip">' + snip + "</div></a>";
      });
      panel.innerHTML = html;
      panel.classList.add("open");
    }

    function setActive(n) {
      var items = panel.querySelectorAll(".gc-res");
      if (!items.length) return;
      active = (n + items.length) % items.length;
      items.forEach(function (el, i) { el.classList.toggle("active", i === active); });
      items[active].scrollIntoView({ block: "nearest" });
    }

    var t;
    input.addEventListener("input", function () {
      wrap.classList.toggle("has-text", !!input.value);
      clearTimeout(t);
      t = setTimeout(function () { runSearch(input.value); }, 110);
    });
    input.addEventListener("focus", function () { if (input.value) runSearch(input.value); });

    // Facet chip clicks filter the current results without re-searching.
    panel.addEventListener("click", function (e) {
      var f = e.target.closest && e.target.closest(".gc-facet");
      if (!f) return;
      e.preventDefault();
      activeFacet = f.getAttribute("data-facet");
      paint();
      input.focus();
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); setActive(active + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive(active - 1); }
      else if (e.key === "Enter") {
        var items = panel.querySelectorAll(".gc-res");
        var go = active >= 0 ? items[active] : items[0];
        if (go) window.location.href = go.getAttribute("href");
      } else if (e.key === "Escape") { input.blur(); panel.classList.remove("open"); }
    });
    clear.addEventListener("click", function () {
      input.value = ""; wrap.classList.remove("has-text");
      panel.classList.remove("open"); panel.innerHTML = ""; input.focus();
    });
    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target)) panel.classList.remove("open");
    });
  });
})();

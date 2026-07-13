/* GoCare accessibility toolbar — self-contained, no dependencies.
   Floating trigger + panel with text sizing, contrast/colour modes, readable font,
   spacing, link underline, big cursor, focus highlight, pause animations, reading
   guide, read-aloud, mute media, click sounds, solid backgrounds. Settings persist
   across pages via localStorage. */
(function () {
  "use strict";
  var LS = "gc_a11y_v1";
  var DEFAULTS = {
    font: 0, contrast: false, negative: false, grayscale: false, readable: false,
    spacing: false, links: false, cursor: false, focus: false, noanim: false,
    guide: false, mute: false, click: false, solid: false, rate: 1
  };
  var state = load();

  function load() {
    try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(LS) || "{}")); }
    catch (e) { return Object.assign({}, DEFAULTS); }
  }
  function save() { try { localStorage.setItem(LS, JSON.stringify(state)); } catch (e) {} }

  /* ---------- styles ---------- */
  var BIGCUR = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'%3E%3Cpath d='M4 2l6 16 2.5-6.5L19 9z' fill='%23fff' stroke='%23000' stroke-width='1.2'/%3E%3C/svg%3E\") 4 2, auto";
  var CSS = "" +
    ".gc-a11y-btn{position:fixed;left:22px;bottom:22px;z-index:99998;width:56px;height:56px;border:0;border-radius:50%;background:radial-gradient(circle at 32% 26%,#8348a8,#4a1a6d 78%);color:#fff;cursor:pointer;box-shadow:0 10px 28px rgba(74,26,109,.5),0 2px 6px rgba(0,0,0,.22),inset 0 1px 1px rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;padding:0;transition:transform .2s cubic-bezier(.16,1,.3,1),box-shadow .2s;}" +
    ".gc-a11y-btn:hover{transform:scale(1.08);box-shadow:0 16px 34px rgba(74,26,109,.62),0 2px 6px rgba(0,0,0,.22);}" +
    ".gc-a11y-btn:active{transform:scale(.96);}" +
    ".gc-a11y-btn:focus-visible{outline:3px solid #ffb454;outline-offset:3px;}" +
    ".gc-a11y-btn svg{width:32px;height:32px;position:relative;z-index:1;}" +
    ".gc-a11y-btn::after{content:'';position:absolute;inset:0;border-radius:50%;box-shadow:0 0 0 2px rgba(131,72,168,.55);animation:gcPulse 2.6s cubic-bezier(.16,1,.3,1) infinite;pointer-events:none;}" +
    ".gc-a11y-btn.seen::after{display:none;}" +
    "@keyframes gcPulse{0%{transform:scale(1);opacity:.8;}70%{transform:scale(1.55);opacity:0;}100%{opacity:0;}}" +
    ".gc-a11y-pop{position:fixed;left:88px;bottom:24px;z-index:99998;width:236px;background:#fff;border:1px solid #ece4f5;border-radius:15px;box-shadow:0 18px 44px rgba(74,26,109,.24);padding:14px 30px 14px 14px;display:flex;gap:11px;align-items:flex-start;opacity:0;transform:translateX(-10px) scale(.94);transform-origin:left bottom;pointer-events:none;transition:opacity .24s cubic-bezier(.16,1,.3,1),transform .24s cubic-bezier(.16,1,.3,1);font-family:'Inter',system-ui,sans-serif;}" +
    ".gc-a11y-pop.show{opacity:1;transform:none;pointer-events:auto;}" +
    ".gc-a11y-pop::before{content:'';position:absolute;left:-7px;bottom:20px;width:13px;height:13px;background:#fff;border-left:1px solid #ece4f5;border-bottom:1px solid #ece4f5;transform:rotate(45deg);}" +
    ".gc-a11y-pop-ic{flex-shrink:0;width:36px;height:36px;border-radius:10px;background:radial-gradient(circle at 32% 26%,#8348a8,#4a1a6d);color:#fff;display:flex;align-items:center;justify-content:center;}" +
    ".gc-a11y-pop-ic svg{width:21px;height:21px;}" +
    ".gc-a11y-pop h4{margin:1px 0 3px;font-family:'Outfit','Inter',sans-serif;font-size:.87rem;font-weight:800;color:#2a1740;line-height:1.1;}" +
    ".gc-a11y-pop p{margin:0;font-size:.73rem;line-height:1.45;color:#6b6478;}" +
    ".gc-a11y-pop-x{position:absolute;top:7px;right:9px;border:0;background:transparent;color:#b3a6c6;font-size:1.05rem;line-height:1;cursor:pointer;padding:2px;}" +
    ".gc-a11y-pop-x:hover{color:#642a7e;}" +
    "@media(max-width:520px){.gc-a11y-pop{display:none;}}" +
    ".gc-a11y-ov{position:fixed;inset:0;background:rgba(20,8,32,.35);z-index:99998;opacity:0;pointer-events:none;transition:opacity .2s;}" +
    ".gc-a11y-ov.open{opacity:1;pointer-events:auto;}" +
    ".gc-a11y-panel{position:fixed;left:0;top:0;bottom:0;width:340px;max-width:88vw;background:#fff;z-index:99999;box-shadow:6px 0 40px rgba(20,8,32,.3);transform:translateX(-105%);transition:transform .28s cubic-bezier(.16,1,.3,1);display:flex;flex-direction:column;font-family:'Inter',system-ui,sans-serif;color:#2a1740;}" +
    ".gc-a11y-panel.open{transform:none;}" +
    ".gc-a11y-hd{display:flex;align-items:center;gap:12px;padding:20px 20px 16px;background:linear-gradient(135deg,#4a1a6d,#2c0f44);color:#fff;}" +
    ".gc-a11y-hd svg{width:30px;height:30px;flex-shrink:0;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4));}" +
    ".gc-a11y-hd h2{font-family:'Outfit','Inter',sans-serif;font-size:1.12rem;font-weight:800;margin:0;line-height:1.1;color:#fff;}" +
    ".gc-a11y-hd p{margin:3px 0 0;font-size:.75rem;font-weight:500;color:#efe4f9;opacity:1;}" +
    ".gc-a11y-x{margin-left:auto;background:#fff;border:0;color:#4a1a6d;width:32px;height:32px;border-radius:9px;cursor:pointer;font-size:1.25rem;font-weight:700;line-height:1;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.2);transition:background .15s,transform .15s;}" +
    ".gc-a11y-x:hover{background:#f0e6f8;transform:scale(1.06);}" +
    ".gc-a11y-body{overflow-y:auto;padding:16px;flex:1;}" +
    ".gc-a11y-sec{font-size:.66rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#9b8bb0;margin:14px 4px 8px;}" +
    ".gc-a11y-sec:first-child{margin-top:0;}" +
    ".gc-a11y-size{display:flex;align-items:center;gap:10px;}" +
    ".gc-a11y-size button{flex:1;border:1px solid #e6ddf0;background:#faf7fd;border-radius:10px;padding:10px;font-size:1rem;font-weight:800;color:#4a1a6d;cursor:pointer;}" +
    ".gc-a11y-size button:hover{border-color:#642a7e;}" +
    ".gc-a11y-size span{min-width:48px;text-align:center;font-size:.8rem;font-weight:700;color:#6b6478;}" +
    ".gc-a11y-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}" +
    ".gc-a11y-t{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;border:1px solid #ece4f5;background:#fff;border-radius:12px;padding:12px 6px;font-size:.74rem;font-weight:700;color:#4a3560;cursor:pointer;transition:.15s;}" +
    ".gc-a11y-t:hover{border-color:#c9a0e9;background:#faf6ff;}" +
    ".gc-a11y-t.on{background:#642a7e;border-color:#642a7e;color:#fff;}" +
    ".gc-a11y-t svg{width:20px;height:20px;}" +
    ".gc-a11y-rate{display:flex;gap:6px;margin-top:8px;}" +
    ".gc-a11y-rate button{flex:1;border:1px solid #e6ddf0;background:#faf7fd;border-radius:8px;padding:7px;font-size:.72rem;font-weight:700;color:#6b6478;cursor:pointer;}" +
    ".gc-a11y-rate button.on{background:#642a7e;border-color:#642a7e;color:#fff;}" +
    ".gc-a11y-panel [hidden]{display:none !important;}" +
    ".gc-a11y-play{width:100%;display:flex;align-items:center;justify-content:center;gap:9px;border:0;border-radius:12px;padding:14px;font-family:'Outfit','Inter',sans-serif;font-size:.92rem;font-weight:800;cursor:pointer;background:linear-gradient(135deg,#642a7e,#4a1a6d);color:#fff;box-shadow:0 6px 16px rgba(74,26,109,.3);transition:filter .18s,background .18s;}" +
    ".gc-a11y-play:hover{filter:brightness(1.09);}" +
    ".gc-a11y-play .gc-a11y-play-ic{display:inline-flex;}" +
    ".gc-a11y-play svg{width:20px;height:20px;}" +
    ".gc-a11y-play.playing{background:linear-gradient(135deg,#e8543c,#c2410c);box-shadow:0 6px 16px rgba(194,65,12,.35);}" +
    ".gc-a11y-tts-status{display:flex;align-items:center;gap:8px;justify-content:center;margin-top:10px;font-size:.78rem;font-weight:700;color:#642a7e;}" +
    ".gc-a11y-dot{width:9px;height:9px;border-radius:50%;background:#e8543c;flex-shrink:0;animation:gcBlink 1s ease-in-out infinite;}" +
    "@keyframes gcBlink{0%,100%{opacity:1;}50%{opacity:.2;}}" +
    ".gc-a11y-mini{margin-top:9px;width:100%;border:1px solid #e6ddf0;background:#faf7fd;border-radius:10px;padding:10px;font-weight:700;font-size:.82rem;color:#4a1a6d;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;}" +
    ".gc-a11y-mini:hover{border-color:#642a7e;background:#f3ecfa;}" +
    ".gc-a11y-mini svg{width:16px;height:16px;}" +
    ".gc-a11y-reset{width:100%;margin-top:14px;border:1px solid #f0c9b3;background:#fff5ef;color:#c2410c;border-radius:10px;padding:11px;font-weight:800;font-size:.82rem;cursor:pointer;}" +
    ".gc-a11y-reset:hover{background:#ffe9dc;}" +
    ".gc-a11y-guide{position:fixed;left:0;right:0;height:44px;background:rgba(100,42,126,.14);border-top:2px solid #642a7e;border-bottom:2px solid #642a7e;z-index:99997;pointer-events:none;display:none;}" +
    /* effect classes */
    "html.a11y-readable *:not(i):not(.fa):not([class*=fa-]){font-family:Verdana,Tahoma,Arial,sans-serif !important;}" +
    "html.a11y-spacing *{letter-spacing:.06em !important;word-spacing:.16em !important;line-height:1.8 !important;}" +
    "html.a11y-links a{text-decoration:underline !important;}" +
    "html.a11y-cursor,html.a11y-cursor *{cursor:" + BIGCUR + " !important;}" +
    "html.a11y-focus a:focus,html.a11y-focus button:focus,html.a11y-focus input:focus,html.a11y-focus select:focus,html.a11y-focus textarea:focus,html.a11y-focus [tabindex]:focus{outline:3px solid #f39c12 !important;outline-offset:2px !important;}" +
    "html.a11y-noanim *,html.a11y-noanim *::before,html.a11y-noanim *::after{animation:none !important;transition:none !important;scroll-behavior:auto !important;}" +
    "html.a11y-contrast,html.a11y-contrast body{background:#000 !important;}" +
    "html.a11y-contrast *:not(svg):not(path):not(circle):not(line):not(polyline):not(polygon){background-color:transparent !important;color:#fff !important;border-color:#fff !important;box-shadow:none !important;}" +
    "html.a11y-contrast a,html.a11y-contrast a *{color:#ffdf00 !important;}" +
    "html.a11y-contrast button,html.a11y-contrast .btn,html.a11y-contrast input,html.a11y-contrast select,html.a11y-contrast textarea{border:1px solid #fff !important;}" +
    "html.a11y-contrast .gc-a11y-panel,html.a11y-contrast .gc-a11y-panel *{color:#fff !important;}" +
    "@media(max-width:520px){.gc-a11y-grid{grid-template-columns:1fr 1fr;}}";

  function icon(name) {
    var p = {
      access: '<circle cx="12" cy="3.6" r="2.1" fill="currentColor" stroke="none"/><path d="M4.5 8.6c2.3.9 4.7 1.4 7.5 1.4s5.2-.5 7.5-1.4M12 9.4v6.2M12 15.6L8.4 21.4M12 15.6L15.6 21.4"/>',
      minus: '<path d="M5 12h14"/>', plus: '<path d="M12 5v14M5 12h14"/>',
      contrast: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18" fill="currentColor"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>',
      negative: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor"/>',
      gray: '<circle cx="12" cy="12" r="9"/>',
      font: '<path d="M4 20l6-16 6 16M6.5 14h7"/>',
      spacing: '<path d="M3 8h18M3 16h18M7 4v16"/>',
      link: '<path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/>',
      cursor: '<path d="M4 2l6 16 2.5-6.5L19 9z"/>',
      focus: '<circle cx="12" cy="12" r="3"/><path d="M3 3h4M17 3h4M3 21h4M17 21h4M3 3v4M21 3v4M3 17v4M21 17v4"/>',
      anim: '<circle cx="12" cy="12" r="9"/><path d="M10 8l6 4-6 4z" fill="currentColor"/>',
      guide: '<path d="M3 12h18M3 8h18M3 16h18"/>',
      speak: '<path d="M11 5L6 9H2v6h4l5 4zM15 9a5 5 0 0 1 0 6M18 7a8 8 0 0 1 0 10"/>',
      mute: '<path d="M11 5L6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6"/>',
      sound: '<path d="M9 18V5l12-2v13M9 13l12-2"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
      solid: '<rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor"/>',
      play: '<path d="M7 4.5v15l12-7.5z" fill="currentColor" stroke="none"/>',
      stop: '<rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor" stroke="none"/>',
      pause: '<rect x="7" y="5" width="3.6" height="14" rx="1.3" fill="currentColor" stroke="none"/><rect x="13.4" y="5" width="3.6" height="14" rx="1.3" fill="currentColor" stroke="none"/>'
    }[name] || "";
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + "</svg>";
  }

  /* ---------- effects that need JS ---------- */
  var guideEl = null, mediaObs = null, clickHandler = null, audioCtx = null, solidTouched = [];

  function fontPct() { return Math.min(160, Math.max(80, 100 + state.font * 10)); }

  function applyFilters() {
    var f = [];
    if (state.negative) f.push("invert(1) hue-rotate(180deg)");
    if (state.grayscale) f.push("grayscale(1)");
    document.documentElement.style.filter = f.join(" ");
    // keep media natural under negative
    var id = "gc-a11y-medfix";
    var ex = document.getElementById(id);
    if (state.negative) {
      if (!ex) { ex = document.createElement("style"); ex.id = id; document.head.appendChild(ex); }
      ex.textContent = "html[style*=invert] img,html[style*=invert] video,html[style*=invert] picture{filter:invert(1) hue-rotate(180deg) !important;}";
    } else if (ex) { ex.remove(); }
  }

  function toggleClass(cls, on) { document.documentElement.classList.toggle(cls, !!on); }

  function applyGuide() {
    if (state.guide) {
      if (!guideEl) {
        guideEl = document.createElement("div");
        guideEl.className = "gc-a11y-guide";
        document.documentElement.appendChild(guideEl);
        document.addEventListener("mousemove", moveGuide);
      }
      guideEl.style.display = "block";
    } else if (guideEl) {
      guideEl.style.display = "none";
      document.removeEventListener("mousemove", moveGuide);
    }
  }
  function moveGuide(e) { if (guideEl) guideEl.style.top = (e.clientY - 22) + "px"; }

  function applyMute() {
    function muteAll() { document.querySelectorAll("audio,video").forEach(function (m) { m.muted = state.mute; }); }
    muteAll();
    if (state.mute && !mediaObs) {
      mediaObs = new MutationObserver(muteAll);
      mediaObs.observe(document.documentElement, { childList: true, subtree: true });
    } else if (!state.mute && mediaObs) { mediaObs.disconnect(); mediaObs = null; }
  }

  function beep() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      var o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = "sine"; o.frequency.value = 660;
      g.gain.value = 0.05; o.connect(g); g.connect(audioCtx.destination);
      o.start(); g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);
      o.stop(audioCtx.currentTime + 0.13);
    } catch (e) {}
  }
  function applyClick() {
    if (state.click && !clickHandler) {
      clickHandler = function (e) { if (e.target.closest("a,button,[role=button],input,select")) beep(); };
      document.addEventListener("click", clickHandler, true);
    } else if (!state.click && clickHandler) {
      document.removeEventListener("click", clickHandler, true); clickHandler = null;
    }
  }

  function applySolid() {
    // restore previous pass
    solidTouched.forEach(function (o) { o.el.style.backgroundColor = o.bg; o.el.style.backdropFilter = o.bd; });
    solidTouched = [];
    if (!state.solid) return;
    var all = document.querySelectorAll("body *:not(.gc-a11y-panel):not(.gc-a11y-panel *)");
    for (var i = 0; i < all.length; i++) {
      var el = all[i], cs = getComputedStyle(el), bg = cs.backgroundColor;
      var m = bg.match(/rgba?\(([^)]+)\)/);
      if (m) {
        var parts = m[1].split(",").map(function (s) { return s.trim(); });
        if (parts.length === 4 && +parts[3] > 0 && +parts[3] < 1) {
          solidTouched.push({ el: el, bg: el.style.backgroundColor, bd: el.style.backdropFilter });
          el.style.backgroundColor = "rgb(" + parts[0] + "," + parts[1] + "," + parts[2] + ")";
          el.style.backdropFilter = "none";
        }
      }
    }
  }

  // Read aloud — state machine: "idle" | "playing" | "paused"
  var tts = "idle", ttsKeepAlive = null;
  function ttsSupported() { return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window; }

  function ttsUI() {
    if (!panel) return;
    var b = panel.querySelector("#gcRead"); if (!b) return;
    var ic = b.querySelector(".gc-a11y-play-ic"), tx = b.querySelector(".gc-a11y-play-tx");
    var status = panel.querySelector("#gcTtsStatus"), pauseBtn = panel.querySelector("#gcPause");
    if (tts === "idle") {
      b.classList.remove("playing");
      if (ic) ic.innerHTML = icon("play");
      if (tx) tx.textContent = "Read Page Aloud";
      if (status) status.hidden = true;
      if (pauseBtn) pauseBtn.hidden = true;
    } else {
      b.classList.add("playing");
      if (ic) ic.innerHTML = icon("stop");
      if (tx) tx.textContent = "Stop Reading";
      if (status) { status.hidden = false; status.innerHTML = '<span class="gc-a11y-dot"></span> ' + (tts === "paused" ? "Paused" : "Reading page aloud…"); }
      if (pauseBtn) { pauseBtn.hidden = false; pauseBtn.innerHTML = (tts === "paused" ? icon("play") + "<span>Resume</span>" : icon("pause") + "<span>Pause</span>"); }
    }
  }

  function ttsStop() {
    try { window.speechSynthesis.cancel(); } catch (e) {}
    clearInterval(ttsKeepAlive); ttsKeepAlive = null;
    tts = "idle"; ttsUI();
  }
  function ttsStart() {
    if (!ttsSupported()) { alert("Sorry — read-aloud isn't supported by this browser."); return; }
    var src = document.querySelector("main") || document.querySelector(".ph-content") || document.body;
    var text = (src.innerText || "").replace(/\s+/g, " ").trim().slice(0, 16000);
    if (!text) return;
    try { window.speechSynthesis.cancel(); } catch (e) {}
    var u = new SpeechSynthesisUtterance(text);
    u.rate = state.rate;
    u.onend = u.onerror = function () {
      if (tts !== "idle") { clearInterval(ttsKeepAlive); ttsKeepAlive = null; tts = "idle"; ttsUI(); }
    };
    try { window.speechSynthesis.speak(u); }
    catch (e) { tts = "idle"; ttsUI(); return; }
    tts = "playing"; ttsUI();
    // Browsers cut off long utterances (~15s); a periodic pause/resume keeps it going.
    clearInterval(ttsKeepAlive);
    ttsKeepAlive = setInterval(function () {
      if (tts === "playing") { try { window.speechSynthesis.pause(); window.speechSynthesis.resume(); } catch (e) {} }
    }, 9000);
  }
  function ttsToggle() { if (tts === "idle") ttsStart(); else ttsStop(); }
  function ttsPauseResume() {
    if (tts === "playing") { try { window.speechSynthesis.pause(); } catch (e) {} tts = "paused"; ttsUI(); }
    else if (tts === "paused") { try { window.speechSynthesis.resume(); } catch (e) {} tts = "playing"; ttsUI(); }
  }

  /* ---------- apply everything from state ---------- */
  function applyAll() {
    document.documentElement.style.fontSize = state.font ? fontPct() + "%" : "";
    applyFilters();
    toggleClass("a11y-contrast", state.contrast);
    toggleClass("a11y-readable", state.readable);
    toggleClass("a11y-spacing", state.spacing);
    toggleClass("a11y-links", state.links);
    toggleClass("a11y-cursor", state.cursor);
    toggleClass("a11y-focus", state.focus);
    toggleClass("a11y-noanim", state.noanim);
    applyGuide(); applyMute(); applyClick(); applySolid();
    save(); syncBtns();
  }

  /* ---------- build UI ---------- */
  var panel, btnMap = {};
  var TOGGLES = [
    ["contrast", "High Contrast", "contrast"], ["negative", "Negative Contrast", "negative"],
    ["grayscale", "Grayscale", "gray"], ["readable", "Readable Font", "font"],
    ["spacing", "Text Spacing", "spacing"], ["links", "Underline Links", "link"],
    ["cursor", "Large Cursor", "cursor"], ["focus", "Focus Highlight", "focus"],
    ["noanim", "Pause Animations", "anim"], ["guide", "Reading Guide", "guide"],
    ["mute", "Mute Media", "mute"], ["click", "Click Sounds", "sound"],
    ["solid", "Solid Backgrounds", "solid"]
  ];

  function syncBtns() {
    TOGGLES.forEach(function (t) { if (btnMap[t[0]]) btnMap[t[0]].classList.toggle("on", !!state[t[0]]); });
    if (btnMap._size) btnMap._size.textContent = fontPct() + "%";
    ttsUI();
    ["0.7", "1", "1.4"].forEach(function (r, i) {
      var b = btnMap["_rate" + i]; if (b) b.classList.toggle("on", state.rate === +r);
    });
  }

  function build() {
    var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);

    var trigger = document.createElement("button");
    trigger.className = "gc-a11y-btn";
    trigger.setAttribute("aria-label", "Open accessibility menu");
    trigger.innerHTML = icon("access");
    document.documentElement.appendChild(trigger);

    // Intro popover — labels the button, shows on hover / first visit, dismissible.
    var pop = document.createElement("div");
    pop.className = "gc-a11y-pop"; pop.setAttribute("role", "note");
    pop.innerHTML = '<div class="gc-a11y-pop-ic">' + icon("access") + "</div>" +
      "<div><h4>Accessibility Tools</h4><p>Adjust text size, contrast, reading &amp; more to suit you.</p></div>" +
      '<button class="gc-a11y-pop-x" aria-label="Dismiss">&times;</button>';
    document.documentElement.appendChild(pop);

    var seen = false, popPinned = false, hovering = false, popDismissed = false;
    try {
      seen = localStorage.getItem("gc_a11y_seen") === "1";
      popDismissed = localStorage.getItem("gc_a11y_pop") === "1";
    } catch (e) {}
    if (seen) trigger.classList.add("seen");

    function markSeen() {
      if (seen) return;
      seen = true; trigger.classList.add("seen");
      try { localStorage.setItem("gc_a11y_seen", "1"); } catch (e) {}
    }
    function showPop() { pop.classList.add("show"); }
    function dismissPop(persist) {
      popPinned = false; pop.classList.remove("show");
      if (persist) { popDismissed = true; try { localStorage.setItem("gc_a11y_pop", "1"); } catch (e) {} }
    }

    trigger.addEventListener("mouseenter", function () { hovering = true; markSeen(); showPop(); });
    trigger.addEventListener("mouseleave", function () { hovering = false; if (!popPinned) pop.classList.remove("show"); });
    trigger.addEventListener("focus", showPop);
    trigger.addEventListener("blur", function () { if (!popPinned && !hovering) pop.classList.remove("show"); });
    pop.querySelector(".gc-a11y-pop-x").addEventListener("click", function (e) {
      e.stopPropagation(); markSeen(); dismissPop(true);
    });
    // First-visit nudge (once, until dismissed)
    if (!popDismissed && !seen) {
      setTimeout(function () { if (!panel.classList.contains("open")) { popPinned = true; showPop(); } }, 900);
      setTimeout(function () { popPinned = false; if (!hovering) pop.classList.remove("show"); }, 7000);
    }

    var ov = document.createElement("div"); ov.className = "gc-a11y-ov";
    panel = document.createElement("div");
    panel.className = "gc-a11y-panel"; panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Accessibility settings");

    var h = '<div class="gc-a11y-hd">' + icon("access") +
      '<div><h2>Accessibility</h2><p>Customise your experience</p></div>' +
      '<button class="gc-a11y-x" aria-label="Close">&times;</button></div><div class="gc-a11y-body">';
    h += '<div class="gc-a11y-sec">Text Size</div><div class="gc-a11y-size">' +
      '<button data-size="-1" aria-label="Decrease text size">A' + "−" + '</button>' +
      '<span id="gcSizeVal">100%</span>' +
      '<button data-size="1" aria-label="Increase text size">A+</button></div>';
    h += '<div class="gc-a11y-sec">Display & Colour</div><div class="gc-a11y-grid">';
    TOGGLES.forEach(function (t) {
      h += '<button class="gc-a11y-t" data-tog="' + t[0] + '">' + icon(t[2]) + "<span>" + t[1] + "</span></button>";
    });
    h += "</div>";
    h += '<div class="gc-a11y-sec">Read Aloud</div>' +
      '<button class="gc-a11y-play" id="gcRead" aria-label="Read this page aloud">' +
      '<span class="gc-a11y-play-ic">' + icon("play") + '</span>' +
      '<span class="gc-a11y-play-tx">Read Page Aloud</span></button>' +
      '<div class="gc-a11y-tts-status" id="gcTtsStatus" hidden></div>' +
      '<button class="gc-a11y-mini" id="gcPause" aria-label="Pause or resume reading" hidden></button>' +
      '<div class="gc-a11y-sec">Reading Speed</div>' +
      '<div class="gc-a11y-rate"><button data-rate="0.7">Slow</button>' +
      '<button data-rate="1">Normal</button><button data-rate="1.4">Fast</button></div>';
    h += '<button class="gc-a11y-reset">Reset All Settings</button></div>';
    panel.innerHTML = h;
    document.documentElement.appendChild(ov);
    document.documentElement.appendChild(panel);

    // refs
    btnMap._size = panel.querySelector("#gcSizeVal");
    btnMap._read = panel.querySelector("#gcRead");
    panel.querySelectorAll("[data-tog]").forEach(function (b) { btnMap[b.getAttribute("data-tog")] = b; });
    panel.querySelectorAll("[data-rate]").forEach(function (b, i) { btnMap["_rate" + i] = b; });

    function open() { markSeen(); dismissPop(false); ov.classList.add("open"); panel.classList.add("open"); }
    function close() { ov.classList.remove("open"); panel.classList.remove("open"); }
    trigger.addEventListener("click", open);
    ov.addEventListener("click", close);
    panel.querySelector(".gc-a11y-x").addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });

    panel.querySelectorAll("[data-size]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.font = Math.min(6, Math.max(-2, state.font + (+b.getAttribute("data-size")))); applyAll();
      });
    });
    panel.querySelectorAll("[data-tog]").forEach(function (b) {
      b.addEventListener("click", function () { var k = b.getAttribute("data-tog"); state[k] = !state[k]; applyAll(); });
    });
    panel.querySelector("#gcRead").addEventListener("click", ttsToggle);
    panel.querySelector("#gcPause").addEventListener("click", ttsPauseResume);
    panel.querySelectorAll("[data-rate]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.rate = +b.getAttribute("data-rate"); save(); syncBtns();
        if (tts !== "idle") { ttsStop(); ttsStart(); }   // restart at new speed
      });
    });
    panel.querySelector(".gc-a11y-reset").addEventListener("click", function () {
      ttsStop();
      state = Object.assign({}, DEFAULTS); applyAll();
    });
  }

  function init() { build(); applyAll(); }
  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
  window.addEventListener("beforeunload", function () { try { window.speechSynthesis.cancel(); } catch (e) {} });
})();

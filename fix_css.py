import re

with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# 1. We know the exact structure from the diff. Let's find the start of the corruption
# The corruption started at `  .sticky-cta-bar { flex-direction: column; padding: 10px 20px; gap: 10px; @keyframes marquee-scroll {`
# Let's use a regex to slice off everything from that point.

start_idx = css.find('.sticky-cta-bar { flex-direction: column; padding: 10px 20px; gap: 10px; @keyframes marquee-scroll {')

if start_idx != -1:
    good_css = css[:start_idx]
else:
    good_css = css # Fallback, maybe it's not corrupt there? Let's be careful.
    
    # Wait, let's just find the last valid `  .sticky-cta-bar { flex-direction: column; padding: 10px 20px; gap: 10px; }` from the original.
    
# Actually, I can just restore from the end of .browse-grid { grid-template-columns: 1fr; } 
# Let's restore the end manually.

restore_css = """  .sticky-cta-bar { flex-direction: column; padding: 10px 20px; gap: 10px; }
  .sticky-cta-bar .btn { min-width: 100%; }

  .testi-hero { padding: 60px 0 100px; }
  .testi-hero-grid { grid-template-columns: 1fr; text-align: center; gap: 40px; }
  .testi-hero-content h2 { font-size: 3rem; }
  .testi-hero-visuals img { max-width: 400px; margin: 0 auto; }
  .testi-slider-container { margin-top: -50px; }
}
@media (max-width: 600px) {
  .courses-cat-grid { grid-template-columns: 1fr; }
  .testi-hero-content h2 { font-size: 2.5rem; }
  .testi-hero { border-radius: 0; margin-left: -20px; margin-right: -20px; }
}

/* -------------------------------------------------------------------------- */
/* Footer: enforce true 5-column grid (avoid later 4-col overrides)            */
/* -------------------------------------------------------------------------- */
.footer-top > * {
  min-width: 0;
}

.footer-top.footer-top--five {
  grid-template-columns: 1.4fr 1.2fr 1fr 1fr 0.9fr;
  gap: 36px;
}

@media (max-width: 1100px) {
  .footer-top.footer-top--five {
    grid-template-columns: 1.6fr 1fr 1fr;
  }
}

@media (max-width: 820px) {
  .footer-top.footer-top--five {
    grid-template-columns: 1fr;
  }
}

/* ─── HOME CTA MARQUEE ────────────────────────────────────────── */
.hm-cta-sec {
  background-color: #0f172a;
  color: #fff;
  min-height: 80vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding: 100px 0;
}

.hm-cta-wrap {
  max-width: var(--r);
  margin: 0 auto;
  padding: 0 32px;
  width: 100%;
}

.hm-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 60px;
  align-items: center;
}

@media(min-width: 992px) {
  .hm-grid {
    grid-template-columns: 1fr 1fr;
    gap: 80px;
  }
}

.hm-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hm-content h1 {
  font-family: 'Outfit', 'Inter', sans-serif;
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -1px;
}

@media(min-width: 768px) {
  .hm-content h1 {
    font-size: 4rem;
  }
}

.hm-meta {
  font-size: 1.1rem;
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hm-btn-scramble {
  align-self: flex-start;
  padding: 16px 40px;
  background-color: var(--o);
  color: #fff;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s var(--ease);
  font-family: 'Inter', monospace;
  min-width: 160px;
  text-align: center;
}
.hm-btn-scramble:hover {
  background-color: var(--od);
}

.hm-marquees {
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
}

.hm-marquee-row {
  display: flex;
  gap: 16px;
  --gap: 16px;
}

.hm-marquee-track {
  display: flex;
  min-width: 100%;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-around;
  gap: var(--gap);
  animation: marquee-scroll 30s linear infinite;
}

.hm-marquee-row:hover .hm-marquee-track {
  animation-play-state: paused;
}

.hm-marquee-row.reverse .hm-marquee-track {
  animation-direction: reverse;
}

.hm-img-box {
  position: relative;
  width: 192px;
  height: 192px;
  border-radius: 16px;
  overflow: hidden;
  flex-shrink: 0;
}

.hm-img-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@keyframes marquee-scroll {
  from { transform: translateX(0); }
  to { transform: translateX(calc(-100% - var(--gap))); }
}

/* ─── NEWS DESTINATION CARD ──────────────────────────────── */
.news-dest-card {
  --tc: 272 61% 35%;
  position: relative;
  display: block;
  width: 100%;
  height: 420px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 0 40px -15px hsl(var(--tc) / 0.5);
  transition: all 0.5s ease-in-out;
  text-decoration: none;
}

.news-dest-card:hover {
  transform: scale(1.05);
  box-shadow: 0 0 60px -15px hsl(var(--tc) / 0.6);
  z-index: 10;
}

.ndc-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transition: transform 0.5s ease-in-out;
  z-index: 1;
}

.news-dest-card:hover .ndc-bg {
  transform: scale(1.1);
}

.ndc-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, hsl(var(--tc) / 0.95), hsl(var(--tc) / 0.6) 40%, transparent 80%);
  z-index: 2;
}

.ndc-content {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  padding: 24px;
  color: #fff;
}

.ndc-content h3 {
  font-family: 'Outfit', 'Inter', sans-serif;
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.ndc-stats {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
  margin-bottom: 24px;
}

.ndc-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: hsl(var(--tc) / 0.2);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid hsl(var(--tc) / 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  transition: all 0.3s ease;
}

.news-dest-card:hover .ndc-btn {
  background: hsl(var(--tc) / 0.4);
  border-color: hsl(var(--tc) / 0.5);
}

.ndc-btn span {
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.ndc-btn i, .ndc-btn svg {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

.news-dest-card:hover .ndc-btn i,
.news-dest-card:hover .ndc-btn svg {
  transform: translateX(4px);
}
"""

with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# find .browse-grid { grid-template-columns: 1fr; }
idx = css.find('.browse-grid { grid-template-columns: 1fr; }')
if idx != -1:
    good_part = css[:idx + len('.browse-grid { grid-template-columns: 1fr; }\n')]
    with open('style.css', 'w', encoding='utf-8') as f:
        f.write(good_part + restore_css)
    print("Fixed style.css")
else:
    print("Could not find anchor in style.css")

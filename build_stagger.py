import re
import json

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

testi_cards = re.findall(r'<div class="testi-card-inner">.*?<blockquote>(.*?)</blockquote>.*?<img class="testi-avatar" src="(.*?)".*?<strong>(.*?)</strong><span>(.*?)</span>', html, re.DOTALL)

testimonials_list = []
for i, (quote, img, name, role) in enumerate(testi_cards):
    testimonials_list.append({
        'tempId': i,
        'testimonial': quote.strip().replace('"', ''),
        'by': f'{name.strip()}, {role.strip()}',
        'imgSrc': img.strip()
    })

print(f'Extracted {len(testimonials_list)} testimonials')

# Replace the HTML block
start_idx = html.find('<div class="testi-slider-container reveal">')
end_idx = html.find('</div>\n    </div>\n  </section>\n\n  <!-- ── SUCCESS STORIES STATS')

if start_idx != -1 and end_idx != -1:
    # Need to correctly find the closing tags of the slider container.
    # The end marker I chose is a bit brittle, let's use a regex or just exact string from diff.
    pass

# Instead of rewriting HTML via script, I'll just write the JSON out to a file so I can use it in my JS.
with open('testimonials_data.json', 'w', encoding='utf-8') as f:
    json.dump(testimonials_list, f, indent=2)

print("Wrote testimonials_data.json")

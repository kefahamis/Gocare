import os, re

BASE = r'C:\Users\Hamisi\.gemini\antigravity\scratch\Gocare'
SCHOOLS_DIR = os.path.join(BASE, 'schools')

# Extract header/footer templates
# Extract header/footer templates
with open(os.path.join(BASE, 'index.html'), 'r', encoding='utf-8', errors='replace') as f:
    cc = f.read()

# Capture from <!DOCTYPE to the start of the Hero section
header_match = re.search(r'(<!DOCTYPE.*?)<!-- -- HERO SLIDER', cc, re.DOTALL)
header_tmpl = header_match.group(1) if header_match else ''

with open(os.path.join(BASE, 'index.html'), 'r', encoding='utf-8', errors='replace') as f:
    fc = f.read()
footer_match = re.search(r'(<footer.*)', fc, re.DOTALL)
footer_tmpl = footer_match.group(1) if footer_match else ''

def fix_paths(html_str):
    h = html_str
    # Replace root-relative links with parent-relative links
    h = re.sub(r'href="(?!http|mailto|tel|#)([^"]+)"', r'href="../\1"', h)
    h = re.sub(r'src="(?!http)([^"]+)"', r'src="../\1"', h)
    # Fix double-dots if any (e.g., ../../)
    h = h.replace('../../', '../')
    return h

def make_school_header(title_text):
    h = fix_paths(header_tmpl)
    h = re.sub(r'<title>.*?</title>', f'<title>{title_text} | GoCare Training Institute</title>', h)
    return h

def make_school_footer():
    return fix_paths(footer_tmpl)

schools = {
    'medical-health-sciences': {
        'name': 'School of Medical &amp; Health Sciences',
        'icon': 'stethoscope',
        'hero_img': '../images/female-nurse-portrait-with-older-patient.jpg',
        'programs': {
            'Certificate Courses': [
                ('Healthcare Support (CNA)', 'Level 5', '../courses/certificate-in-healthcare-support-services-level-5-certified-nursing-assistant.html', '../images/Nursing-Assistant.jpg'),
                ('Caregiving L4', 'Level 4', '../courses/certificate-in-caregiving-level-4.html', '../images/caregiving.jpg'),
                ('Caregiver Course L2', 'Level II', '../courses/caregiver-course-level-ii.html', '../images/female-nurse-portrait-with-older-patient.jpg'),
                ('Home-Based Care L3', 'Level 3', '../courses/certificate-in-home-based-care-support-level-3.html', '../images/caregiving.jpg'),
                ('Health Care Assistant', 'Certificate', '../courses/certificate-in-health-care-assistant-hca.html', '../images/health-nurse.jpg'),
                ('Perioperative L5', 'Level 5', '../courses/certificate-in-perioperative-theatre-technology-level-5.html', '../images/Health-Support.jpg'),
                ('Mortuary Science L5', 'Level 5', '../courses/certificate-in-mortuary-science-level-5.html', '../images/Orthopaedic-Trauma Medicine.jpg'),
                ('Orthopaedic L5', 'Level 5', '../courses/certificate-in-orthopaedic-and-trauma-medicine-level-5.html', '../images/Orthopaedic-Trauma Medicine.jpg'),
                ('Community Health L5', 'Level 5', '../courses/certificate-in-community-health-assistant-level-5.html', '../images/certificate-community-health.jpg'),
            ],
            'Diploma Programs': [
                ('Perioperative L6', 'Level 6', '../courses/diploma-in-perioperative-theatre-technology-level-6.html', '../images/Perioperative-Theatre-Technology.jpg'),
                ('Mortuary Science L6', 'Level 6', '../courses/diploma-in-mortuary-science-level-6.html', '../images/slider-four.jpg'),
                ('Orthopaedic L6', 'Level 6', '../courses/diploma-in-orthopaedic-and-trauma-medicine-level-6.html', '../images/Orthopaedic-Trauma Medicine.jpg'),
                ('Community Health L6', 'Level 6', '../courses/diploma-in-community-health-assistant-level-6.html', '../images/Diploma-Health.jpg'),
            ],
            'Specialized Training': [
                ('CNA Options', 'Certification', '../courses/certified-nursing-assistant-cna-options.html', '../images/Nursing-Assistant.jpg'),
            ]
        },
        'featured': [
            ('Nursing Assistant (CNA)', '../courses/certificate-in-healthcare-support-services-level-5-certified-nursing-assistant.html', '../images/Nursing-Assistant.jpg', 'award'),
            ('Caregiving Programs', '../courses/certificate-in-caregiving-level-4.html', '../images/caregiving.jpg', 'heart-pulse'),
            ('Perioperative Theatre', '../courses/diploma-in-perioperative-theatre-technology-level-6.html', '../images/Perioperative-Theatre-Technology.jpg', 'activity'),
            ('Community Health', '../courses/diploma-in-community-health-assistant-level-6.html', '../images/Diploma-Health.jpg', 'users')
        ]
    },
    'hospitality-management': {
        'name': 'School of Hospitality Management',
        'icon': 'utensils',
        'hero_img': '../images/Certificate-culinary-arts.jpg',
        'programs': {
            'Certificate Courses': [
                ('Food &amp; Beverage Prod.', 'Level 3', '../courses/certificate-in-food-and-beverage-production-culinary-arts-level-3.html', '../images/Certificate-culinary-arts.jpg'),
                ('Front Office Ops.', 'Level 3', '../courses/certificate-in-front-office-operations-level-3.html', '../images/Front-office.jpg'),
                ('Housekeeping', 'Level 3', '../courses/certificate-in-housekeeping-and-accommodation-level-3.html', '../images/Housekeeping-Accomodation.jpg'),
                ('Homecare Mgt L4', 'Level 4', '../courses/certificate-in-homecare-management-level-4.html', '../images/Homecare-Management-4.jpg'),
                ('Homecare Mgt L3', 'Level 3', '../courses/certificate-in-homecare-management-level-3.html', '../images/Homecare-Management.jpg'),
            ],
            'Diploma Programs': [],
            'Specialized Training': []
        },
        'featured': [
            ('Food &amp; Beverage', '../courses/certificate-in-food-and-beverage-production-culinary-arts-level-3.html', '../images/Certificate-culinary-arts.jpg', 'utensils'),
            ('Front Office Ops', '../courses/certificate-in-front-office-operations-level-3.html', '../images/Front-office.jpg', 'bell'),
            ('Housekeeping', '../courses/certificate-in-housekeeping-and-accommodation-level-3.html', '../images/Housekeeping-Accomodation.jpg', 'home'),
            ('Homecare Mgt', '../courses/certificate-in-homecare-management-level-4.html', '../images/Homecare-Management-4.jpg', 'heart')
        ]
    },
    'social-sciences-business': {
        'name': 'School of Social Sciences &amp; Business Management',
        'icon': 'users',
        'hero_img': '../images/Social Work-Community-Development.jpg',
        'programs': {
            'Certificate Courses': [
                ('Office Administrator L5', 'Level 5', '../courses/certificate-in-office-administrator-level-5.html', '../images/Certificate-culinary-arts.jpg'),
                ('Office Assistant L4', 'Level 4', '../courses/certificate-in-office-assistant-customer-service-level-4.html', '../images/Certificate-culinary-arts.jpg'),
            ],
            'Diploma Programs': [
                ('Social Work &amp; Comm Dev L6', 'Level 6', '../courses/diploma-in-social-work-and-community-development-level-6.html', '../images/Social Work-Community-Development.jpg'),
            ],
            'Specialized Training': []
        },
        'featured': [
            ('Social Work Diploma', '../courses/diploma-in-social-work-and-community-development-level-6.html', '../images/Social Work-Community-Development.jpg', 'users'),
            ('Office Administrator', '../courses/certificate-in-office-administrator-level-5.html', '../images/Certificate-culinary-arts.jpg', 'briefcase'),
            ('Office Assistant', '../courses/certificate-in-office-assistant-customer-service-level-4.html', '../images/Certificate-culinary-arts.jpg', 'user-check'),
            ('Customer Service', '../courses/certificate-in-office-assistant-customer-service-level-4.html', '../images/Certificate-culinary-arts.jpg', 'message-square')
        ]
    },
    'international-certifications': {
        'name': 'International Certifications',
        'icon': 'globe',
        'hero_img': '../images/slider-four.jpg',
        'programs': {
            'Certificate Courses': [
                ('AMCA (USA) Cert.', 'International', '../courses/amca-usa-certification.html', '../images/Nursing-Assistant.jpg'),
                ('SDC Canada Cert.', 'International', '../courses/sdc-canada-certification.html', '../images/Nursing-Assistant.jpg'),
            ],
            'Diploma Programs': [],
            'Specialized Training': [
                ('Second Course Sponsorship', 'Offer', '../courses/second-course-sponsorship.html', '../images/slider-four.jpg'),
            ]
        },
        'featured': [
            ('AMCA (USA)', '../courses/amca-usa-certification.html', '../images/Nursing-Assistant.jpg', 'globe'),
            ('SDC Canada', '../courses/sdc-canada-certification.html', '../images/Nursing-Assistant.jpg', 'map-pin'),
            ('Global Caregiving', '../courses/certificate-in-healthcare-support-services-level-5-certified-nursing-assistant.html', '../images/Nursing-Assistant.jpg', 'heart'),
            ('Second Course Free', '../courses/second-course-sponsorship.html', '../images/slider-four.jpg', 'gift')
        ]
    }
}

css = """
<style>
  .sch-page { background: #fdfdfd; }
  .sch-header { padding: 50px 0; border-bottom: 3px solid var(--o); }
  .sch-title-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 30px; }
  .sch-title-bar h1 { font-family: 'Bebas Neue', sans-serif; font-size: 2.5rem; color: var(--dark); margin: 0; line-height: 1.1; }
  .sch-title-icon { width: 48px; height: 48px; background: #fff4ec; color: var(--o); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
  
  .sch-hero-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 30px; align-items: stretch; }
  .sch-hero-img { border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); height: 100%; min-height: 350px; }
  .sch-hero-img img { width: 100%; height: 100%; object-fit: cover; }
  
  .sch-form-card { background: #fdfdfd; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #f0f0f0; border-top: 5px solid var(--o); }
  .sch-form-card h3 { color: var(--dark); font-size: 1.4rem; margin-bottom: 20px; font-family: 'Bebas Neue', sans-serif; }
  .sch-form-card input, .sch-form-card select { width: 100%; padding: 12px 16px; margin-bottom: 15px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.95rem; }
  .sch-form-card input:focus, .sch-form-card select:focus { outline: none; border-color: var(--o); box-shadow: 0 0 0 3px rgba(237,116,37,0.1); }
  .sch-form-card button { width: 100%; padding: 14px; font-weight: 700; font-size: 1rem; }
  
  .sch-ribbon { background: linear-gradient(135deg, var(--dark) 0%, #3a1a5e 100%); color: #F5F0E8; padding: 25px 0; text-align: center; }
  .sch-ribbon h2 { font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; margin: 0; font-style: italic; }
  
  .sch-featured { padding: 50px 0; background: #F5F0E8; }
  .sch-feat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
  .sch-feat-card { background: #F5F0E8; border: 1px solid #f0f0f0; border-radius: 12px; overflow: hidden; transition: transform .3s, box-shadow .3s; }
  .sch-feat-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
  .sch-feat-img { height: 140px; overflow: hidden; position: relative; }
  .sch-feat-img img { width: 100%; height: 100%; object-fit: cover; }
  .sch-feat-content { padding: 16px; border-top: 3px solid var(--o); background: #fdfdfd; }
  .sch-feat-title { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; font-weight: 700; color: var(--dark); font-size: 0.95rem; line-height: 1.4; }
  .sch-feat-btn { display: inline-flex; align-items: center; gap: 4px; font-size: 0.85rem; color: var(--o); font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
  
  .sch-programs-sec { padding: 60px 0; background: #f9fafb; }
  .sch-sec-title { text-align: center; margin-bottom: 40px; position: relative; }
  .sch-sec-title h2 { font-family: 'Bebas Neue', sans-serif; font-size: 2.2rem; color: var(--dark); display: inline-block; position: relative; padding: 0 40px; }
  .sch-sec-title h2::before, .sch-sec-title h2::after { content: ''; position: absolute; top: 50%; width: 30px; height: 2px; background: var(--o); }
  .sch-sec-title h2::before { left: 0; }
  .sch-sec-title h2::after { right: 0; }
  
  .sch-layout { display: grid; grid-template-columns: 3fr 1fr; gap: 40px; align-items: start; }
  .sch-cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; align-items: start; }
  
  .sch-col-header { background: var(--dark); color: #F5F0E8; padding: 12px 20px; border-radius: 8px 8px 0 0; font-weight: 700; font-size: 1.1rem; text-align: center; margin-bottom: 16px; }
  .sch-col-header.orange { background: var(--o); }
  
  .sch-program-card { background: #F5F0E8; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; transition: box-shadow .2s; }
  .sch-program-card:hover { box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
  .sch-prog-img { height: 100px; border-radius: 6px; overflow: hidden; margin-bottom: 12px; }
  .sch-prog-img img { width: 100%; height: 100%; object-fit: cover; }
  .sch-prog-title { font-size: 0.95rem; font-weight: 700; color: var(--dark); line-height: 1.3; margin-bottom: 8px; }
  .sch-prog-level { font-size: 0.8rem; color: #6b7280; margin-bottom: 12px; display: block; }
  .sch-prog-btn { display: inline-block; background: var(--o); color: #F5F0E8; font-size: 0.8rem; font-weight: 700; padding: 6px 12px; border-radius: 4px; text-transform: uppercase; }
  .sch-prog-btn:hover { background: #d05d15; color: #F5F0E8; }
  
  .sch-sidebar { background: #F5F0E8; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; }
  .sch-sidebar-header { background: var(--dark); color: #F5F0E8; padding: 16px 20px; font-weight: 700; font-size: 1.2rem; }
  .sch-sidebar-links { display: flex; flex-direction: column; }
  .sch-sl { padding: 16px 20px; display: flex; align-items: center; gap: 12px; font-weight: 600; color: #4b5563; border-bottom: 1px solid #e5e7eb; transition: all .2s; }
  .sch-sl:last-child { border-bottom: none; }
  .sch-sl:hover { background: #fff4ec; color: var(--o); padding-left: 25px; }
  .sch-sl-icon { width: 32px; height: 32px; background: #f3f4f6; color: var(--dark); border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all .2s; }
  .sch-sl:hover .sch-sl-icon { background: var(--o); color: #F5F0E8; }
  
  .sch-footer-ribbon { background: linear-gradient(135deg, var(--dark) 0%, #3a1a5e 100%); padding: 40px 0; text-align: center; }
  
  @media (max-width: 992px) {
    .sch-hero-grid { grid-template-columns: 1fr; }
    .sch-layout { grid-template-columns: 1fr; }
    .sch-feat-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 600px) {
    .sch-feat-grid { grid-template-columns: 1fr; }
  }
</style>
"""

for slug, data in schools.items():
    # Build Featured Cards
    feat_html = ""
    for f_title, f_link, f_img, f_icon in data['featured']:
        feat_html += f"""
        <a href="{f_link}" class="sch-feat-card" style="text-decoration:none;">
          <div class="sch-feat-img"><img src="{f_img}" alt="{f_title}"></div>
          <div class="sch-feat-content">
            <div class="sch-feat-title"><i data-lucide="{f_icon}" style="color:var(--o);width:20px;flex-shrink:0;"></i> {f_title}</div>
            <div class="sch-feat-btn">Explore Course <i data-lucide="chevron-right" style="width:14px;"></i></div>
          </div>
        </a>"""
        
    # Build Program Columns dynamically
    cols_html = ""
    for cat_name, cat_list in data['programs'].items():
        if not cat_list:
            continue
        
        # Alternate header colors
        color_class = "orange" if cat_name == "Diploma Programs" else ""
        
        cards_html = ""
        for c_title, c_level, c_link, c_img in cat_list:
            cards_html += f"""
            <div class="sch-program-card">
              <div class="sch-prog-img"><img src="{c_img}" alt="{c_title}"></div>
              <div class="sch-prog-title">{c_title}</div>
              <div class="sch-prog-level">{c_level}</div>
              <a href="{c_link}" class="sch-prog-btn">Apply Now <i data-lucide="chevron-right" style="width:12px;vertical-align:-2px;"></i></a>
            </div>"""
            
        cols_html += f"""
          <div class="sch-col">
            <div class="sch-col-header {color_class}">{cat_name}</div>
            <div class="sch-col-cards">{cards_html}</div>
          </div>"""

    # Assemble Page
    body = f"""{make_school_header(data["name"].replace("&amp;", "&"))}
  <!-- ── PAGE TITLE HERO ──────────────────────────────── -->
  <section class="page-title-hero">
    <div class="page-title-orb page-title-orb--1" aria-hidden="true"></div>
    <div class="page-title-orb page-title-orb--2" aria-hidden="true"></div>
    <div class="page-title-orb page-title-orb--3" aria-hidden="true"></div>

    <div class="page-title-content">
      <span class="page-title-badge"><i data-lucide="book-open"></i> Academic Programs</span>
      <h1>{data['name']}</h1>
      <div class="page-title-accent"></div>
      <nav class="page-breadcrumb" aria-label="Breadcrumb">
        <a href="../index.html">Home</a>
        <span class="bc-separator"><i data-lucide="chevron-right"></i></span>
        <a href="../courses.html">Schools & Programs</a>
        <span class="bc-separator"><i data-lucide="chevron-right"></i></span>
        <span class="bc-current">{data['name'].replace("&amp;", "&")}</span>
      </nav>
    </div>
  </section>

{css}
<div class="sch-page">
  
  <header class="sch-header">
    <div class="wrap">
      <div class="sch-title-bar">
        <div class="sch-title-icon"><i data-lucide="{data['icon']}"></i></div>
        <h1>{data['name']}</h1>
      </div>
      
      <div class="sch-hero-grid">
        <div class="sch-hero-img">
          <img src="{data['hero_img']}" alt="{data['name']}">
        </div>
        <div class="sch-form-card">
          <h3>Start Your Career Today.</h3>
          <form onsubmit="event.preventDefault();alert('Application submitted successfully!');">
            <input type="text" placeholder="Full Name" required>
            <input type="email" placeholder="Email Address" required>
            <input type="tel" placeholder="Phone Number" required>
            <select required>
              <option value="">Select Program</option>
              <option>Certificate Program</option>
              <option>Diploma Program</option>
              <option>Short Course</option>
            </select>
            <button type="submit" class="btn btn-primary" style="background:var(--o);border-color:var(--o);color:#F5F0E8;border-radius:50px;">Apply Now <i data-lucide="arrow-right"></i></button>
          </form>
          <a href="../downloads.html" class="btn btn-outline" style="display:block;text-align:center;margin-top:12px;border-color:var(--dark);color:var(--dark);border-radius:50px;">Download Prospectus</a>
        </div>
      </div>
    </div>
  </header>

  <div class="sch-ribbon">
    <div class="wrap">
      <h2>Train with the Experts... Become an Expert!</h2>
    </div>
  </div>

  <section class="sch-featured">
    <div class="wrap">
      <div class="sch-feat-grid">
        {feat_html}
      </div>
    </div>
  </section>

  <section class="sch-programs-sec">
    <div class="wrap">
      <div class="sch-sec-title">
        <h2>Our Programs</h2>
      </div>
      
      <div class="sch-layout">
        <!-- Programs Area -->
        <div class="sch-cols">
          {cols_html}
        </div>
        
        <!-- Sidebar Area -->
        <aside>
          <div class="sch-sidebar">
            <div class="sch-sidebar-header">Quick Links</div>
            <div class="sch-sidebar-links">
              <a href="../downloads.html" class="sch-sl" style="text-decoration:none;"><div class="sch-sl-icon"><i data-lucide="download"></i></div> Download Prospectus</a>
              <a href="../index.html#" class="sch-sl" style="text-decoration:none;"><div class="sch-sl-icon"><i data-lucide="user"></i></div> Student Portal</a>
              <a href="../contact.html" class="sch-sl" style="text-decoration:none;"><div class="sch-sl-icon"><i data-lucide="mail"></i></div> Faculty Contacts</a>
              <a href="../careers.html" class="sch-sl" style="text-decoration:none;"><div class="sch-sl-icon"><i data-lucide="compass"></i></div> Career Pathways</a>
            </div>
          </div>
          
          <div style="margin-top:30px;background:var(--o);color:#F5F0E8;padding:24px;border-radius:12px;text-align:center;">
            <h4 style="margin-bottom:12px;font-size:1.2rem;">Need Assistance?</h4>
            <p style="font-size:0.95rem;margin-bottom:16px;">Speak with our admissions team today.</p>
            <a href="tel:+254703115502" style="display:inline-block;background:#F5F0E8;color:var(--o);font-weight:700;padding:10px 20px;border-radius:6px;text-decoration:none;"><i data-lucide="phone-call" style="width:16px;vertical-align:-2px;"></i> 0703 115 502</a>
          </div>
        </aside>
      </div>
    </div>
  </section>

  <div class="sch-footer-ribbon">
    <div class="wrap">
      <h2 style="color:#F5F0E8;font-family:'Bebas Neue', sans-serif;font-size:1.8rem;margin-bottom:24px;font-style:italic;">Train with the Experts... Become an Expert!</h2>
      <div style="display:flex;gap:16px;justify-content:center;">
        <a href="../apply.html" class="btn btn-primary" style="background:var(--o);border-color:var(--o);color:#F5F0E8;padding:12px 24px;border-radius:50px;">Apply Now <i data-lucide="chevron-right"></i></a>
        <a href="../downloads.html" class="btn btn-outline" style="border-color:rgba(255,255,255,0.3);color:#F5F0E8;padding:12px 24px;border-radius:50px;">Download Prospectus <i data-lucide="download"></i></a>
      </div>
    </div>
  </div>

</div>
{make_school_footer()}"""

    filepath = os.path.join(SCHOOLS_DIR, f'{slug}.html')
    with open(filepath, 'w', encoding='utf-8') as fh:
        fh.write(body)
    print(f"Created redesigned {slug}.html")

print("All school pages successfully redesigned to match the new mockup structure.")

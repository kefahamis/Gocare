/*
 * Mobile navigation drawer.
 * Builds the mobile menu (with collapsible sub-menus) directly from the
 * desktop .nav-links markup, so the items, sub-items and links always match
 * the desktop nav on every page. Supersedes any older inline drawer scripts.
 */
(function () {
  'use strict';

  function build() {
    var navLinks = document.querySelector('.nav-links');
    var ham = document.getElementById('hamBtn');
    var mob = document.getElementById('mobMenu');
    if (!navLinks || !ham || !mob) return;

    // Remove any drawer artifacts left by older inline scripts
    var stale = document.querySelectorAll('.mob-overlay');
    for (var i = 0; i < stale.length; i++) stale[i].parentNode.removeChild(stale[i]);

    // Drop old listeners on the hamburger by replacing it with a clone
    var freshHam = ham.cloneNode(true);
    ham.parentNode.replaceChild(freshHam, ham);
    ham = freshHam;

    var logoImg = document.querySelector('.logo img');
    var logoSrc = logoImg ? logoImg.getAttribute('src') : '';

    // Rebuild drawer contents
    mob.innerHTML = '';

    var head = document.createElement('div');
    head.className = 'mob-drawer-head';
    head.innerHTML =
      '<img src="' + logoSrc + '" alt="GoCare">' +
      '<button class="mob-drawer-close" id="mobClose" type="button" aria-label="Close menu">' +
      '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '</button>';
    mob.appendChild(head);

    var list = document.createElement('div');
    list.className = 'mob-nav';

    var items = navLinks.querySelectorAll(':scope > .nav-item');
    Array.prototype.forEach.call(items, function (item) {
      var topA = item.querySelector(':scope > a');
      if (!topA) return;
      var label = (topA.textContent || '').replace(/\s+/g, ' ').trim();
      var dd = item.querySelector(':scope > .dropdown');
      var subAnchors = dd ? dd.querySelectorAll('.res-body a') : [];

      if (dd && subAnchors.length) {
        var group = document.createElement('div');
        group.className = 'mob-group';

        var toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'mob-group-toggle';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML =
          '<span>' + label + '</span>' +
          '<svg class="mob-caret" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>';

        var sub = document.createElement('div');
        sub.className = 'mob-subnav';

        Array.prototype.forEach.call(subAnchors, function (a) {
          var strong = a.querySelector('.rm-text strong');
          var t = (strong ? strong.textContent : a.textContent || '').replace(/\s+/g, ' ').trim();
          if (!t) return;
          var link = document.createElement('a');
          link.href = a.getAttribute('href') || '#';
          link.textContent = t;
          sub.appendChild(link);
        });

        toggle.addEventListener('click', function () {
          var willOpen = !group.classList.contains('open');
          // accordion: close other open groups
          var openGroups = list.querySelectorAll('.mob-group.open');
          for (var j = 0; j < openGroups.length; j++) {
            if (openGroups[j] !== group) {
              openGroups[j].classList.remove('open');
              var t2 = openGroups[j].querySelector('.mob-group-toggle');
              if (t2) t2.setAttribute('aria-expanded', 'false');
            }
          }
          group.classList.toggle('open', willOpen);
          toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        });

        group.appendChild(toggle);
        group.appendChild(sub);
        list.appendChild(group);
      } else {
        var direct = document.createElement('a');
        direct.className = 'mob-link';
        direct.href = topA.getAttribute('href') || '#';
        direct.textContent = label;
        list.appendChild(direct);
      }
    });

    mob.appendChild(list);

    // "Start Your Journey" CTA mirrored from the desktop apply button
    var apply = document.querySelector('.nav-apply-btn');
    var cta = document.createElement('a');
    cta.className = 'mob-cta';
    cta.href = apply ? (apply.getAttribute('href') || 'apply.html') : 'apply.html';
    cta.innerHTML =
      'Start Your Journey ' +
      '<svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
    mob.appendChild(cta);

    // Move the drawer to <body> so it isn't trapped inside the sticky
    // .nav stacking context (z-index:200). As a body child its z-index:999
    // sits above the overlay (998); otherwise the overlay dims the drawer.
    if (mob.parentNode !== document.body) document.body.appendChild(mob);

    // Backdrop
    var overlay = document.createElement('div');
    overlay.className = 'mob-overlay';
    document.body.appendChild(overlay);

    function openDrawer() {
      ham.classList.add('open');
      overlay.style.display = 'block';
      // Force a reflow on BOTH the overlay (opacity) and the drawer (transform)
      // so each transition runs from its start value instead of snapping/stalling.
      void overlay.offsetWidth;
      void mob.offsetWidth;
      overlay.style.opacity = '1';
      mob.classList.add('is-open');           // CSS transition slides it in
      document.body.style.overflow = 'hidden';
    }
    function closeDrawer() {
      ham.classList.remove('open');
      document.body.style.overflow = '';
      mob.classList.remove('is-open');
      overlay.style.opacity = '0';
      var hide = function () { overlay.style.display = 'none'; overlay.removeEventListener('transitionend', hide); };
      overlay.addEventListener('transitionend', hide);
    }

    ham.addEventListener('click', function () {
      if (ham.classList.contains('open')) closeDrawer(); else openDrawer();
    });
    overlay.addEventListener('click', closeDrawer);
    head.querySelector('#mobClose').addEventListener('click', closeDrawer);

    // Close the drawer when an actual navigation link is tapped
    var navAnchors = mob.querySelectorAll('a');
    for (var k = 0; k < navAnchors.length; k++) {
      navAnchors[k].addEventListener('click', closeDrawer);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();

/* Floating WhatsApp button — injected on every page that loads this script */
(function () {
  'use strict';

  var WA_URL = 'https://api.whatsapp.com/message/MAADYYTB3IPHG1?autoload=1&app_absent=0';

  function addWhatsApp() {
    if (document.querySelector('.wa-float')) return; // avoid duplicates
    var a = document.createElement('a');
    a.className = 'wa-float';
    a.href = WA_URL;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', 'Chat with us on WhatsApp');
    a.title = 'Chat with us on WhatsApp';
    a.innerHTML =
      '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.043zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>' +
      '</svg>';
    document.body.appendChild(a);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addWhatsApp);
  } else {
    addWhatsApp();
  }
})();

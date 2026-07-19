// FreelanceDesk shared front-end: privacy-first analytics + lead capture.
// Reads config from window.SITE (see site-config.js).
(function () {
  var S = window.SITE || {};

  // ---- GoatCounter analytics (no cookies, GDPR-friendly, free) ----
  // Create a free site at https://www.goatcounter.com and set GOATCOUNTER below.
  if (S.GOATCOUNTER) {
    var g = document.createElement('script');
    g.async = true;
    g.src = 'https://gc.zgo.at/count.js';
    g.dataset.goatcounter = 'https://' + S.GOATCOUNTER + '.goatcounter.com/count';
    document.head.appendChild(g);
  }

  // ---- Lead capture (posts to a free Formspree form) ----
  // Create a free form at https://formspree.io and set LEAD_ENDPOINT below.
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.classList || !form.classList.contains('lead-form')) return;
    e.preventDefault();
    var end = S.LEAD_ENDPOINT;
    var input = form.querySelector('input[type=email]');
    var msg = form.querySelector('.lead-msg');
    if (!input || !msg) return;
    var email = input.value.trim();
    if (!email) { msg.textContent = 'Enter your email.'; msg.style.color = '#f87171'; return; }

    if (!end) {
      msg.textContent = 'Newsletter setup pending — grab the kit on Gumroad in the meantime.';
      msg.style.color = '#fbbf24';
      return;
    }
    msg.textContent = 'Sending…';
    msg.style.color = '#94a3b8';
    fetch(end, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email: email, _subject: 'FreelanceDesk newsletter signup' })
    }).then(function (r) {
      if (r.ok) {
        msg.textContent = "Thanks! Check your inbox to confirm.";
        msg.style.color = '#22c55e';
        form.reset();
      } else {
        msg.textContent = 'Could not subscribe — try again.';
        msg.style.color = '#f87171';
      }
    }).catch(function () {
      msg.textContent = 'Network error — email us directly.';
      msg.style.color = '#f87171';
    });
  });
})();

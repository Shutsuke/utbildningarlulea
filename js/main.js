(function () {
  'use strict';

  /* ===== Mobilmeny ===== */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    Array.prototype.forEach.call(nav.querySelectorAll('a'), function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ===== Bokning: platsräknaren minskar automatiskt =====
     I skissen sker det bara i webbläsaren. I en färdig version skriver
     bokningen till samma lista som Lennart ser i adminpanelen. */
  var modal = document.getElementById('modal');
  var form = document.getElementById('bokform');
  var klar = document.getElementById('modalKlar');
  var rubrik = document.getElementById('modalRubrik');
  var kvarText = document.getElementById('modalKvar');
  var aktivRad = null;

  function oppna(rad) {
    aktivRad = rad;
    rubrik.textContent = rad.getAttribute('data-namn');
    kvarText.textContent = plural(Number(rad.getAttribute('data-platser'))) + ' kvar av ' + rad.getAttribute('data-tak');
    form.hidden = false;
    klar.hidden = true;
    form.reset();
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    var first = form.querySelector('input');
    if (first) first.focus();
  }

  function stang() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (aktivRad) {
      var btn = aktivRad.querySelector('.boka, .btn--full');
      if (btn && !btn.disabled) btn.focus();
    }
    aktivRad = null;
  }

  function plural(n) {
    return n + (n === 1 ? ' plats' : ' platser');
  }

  function uppdateraRad(rad) {
    var kvar = Number(rad.getAttribute('data-platser'));
    var tak = Number(rad.getAttribute('data-tak'));
    rad.querySelector('.rad__tal').textContent = kvar;
    rad.classList.remove('rad--ledig', 'rad--fa', 'rad--full');

    if (kvar === 0) {
      rad.classList.add('rad--full');
      var ruta = rad.querySelector('.rad__knapp');
      ruta.innerHTML = '<button class="btn btn--full btn--block" disabled>Fullbokat</button>';
    } else if (kvar <= Math.max(2, Math.round(tak * 0.45))) {
      rad.classList.add('rad--fa');
    } else {
      rad.classList.add('rad--ledig');
    }
    uppdateraHero();
  }

  /* Prisrutan i hero speglar alltid första teoritillfället med lediga platser */
  function uppdateraHero() {
    var ruta = document.querySelector('.prisruta');
    if (!ruta) return;
    var rader = ruta.querySelectorAll('.prisruta__rad');
    if (rader.length < 2) return;

    var nasta = null;
    Array.prototype.forEach.call(document.querySelectorAll('#tillfallen .rad'), function (r) {
      if (!nasta && Number(r.getAttribute('data-platser')) > 0) nasta = r;
    });

    if (!nasta) {
      rader[0].querySelector('strong').textContent = '–';
      rader[1].querySelector('strong').textContent = 'Alla fulla';
      return;
    }
    var d = nasta.querySelector('.rad__datum');
    rader[0].querySelector('strong').textContent =
      d.querySelector('strong').textContent + ' ' + d.querySelector('span').textContent.toLowerCase();
    rader[1].querySelector('strong').textContent =
      nasta.getAttribute('data-platser') + ' av ' + nasta.getAttribute('data-tak');
  }

  document.addEventListener('click', function (e) {
    var boka = e.target.closest ? e.target.closest('.boka') : null;
    if (boka) {
      oppna(boka.closest('.rad'));
      return;
    }
    if (e.target.hasAttribute && e.target.hasAttribute('data-stang')) stang();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && !modal.hidden) stang();
  });

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (!aktivRad) return;
      var kvar = Number(aktivRad.getAttribute('data-platser')) - 1;
      aktivRad.setAttribute('data-platser', kvar < 0 ? 0 : kvar);
      uppdateraRad(aktivRad);
      form.hidden = true;
      klar.hidden = false;
      klar.querySelector('button').focus();
    });
  }

  uppdateraHero();
})();

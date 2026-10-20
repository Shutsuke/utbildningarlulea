(function () {
  'use strict';

  /* ===== Flikar – en skärm, ett jobb ===== */
  var flikar = document.querySelectorAll('.flik');
  var skarmar = document.querySelectorAll('.skarm');

  function visaSkarm(namn) {
    Array.prototype.forEach.call(flikar, function (f) {
      f.classList.toggle('is-aktiv', f.getAttribute('data-skarm') === namn);
    });
    Array.prototype.forEach.call(skarmar, function (s) {
      s.classList.toggle('is-aktiv', s.id === 'skarm-' + namn);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  Array.prototype.forEach.call(flikar, function (f) {
    f.addEventListener('click', function () { visaSkarm(f.getAttribute('data-skarm')); });
  });

  /* ===== Snölägesväljaren – signaturelementet ===== */
  var LAGEN = {
    vantar: { klass: '', status: 'Väntar på snö',
      text: 'Teorin rullar som planerat. Uppkörningsplats meddelas när snön tillåter – du bokar din dag redan nu.' },
    snon: { klass: 'forhands--snon', status: 'Snön är här',
      text: 'Uppkörning och prov körs som planerat. Plats och tid står på ditt bokade datum.' },
    slut: { klass: 'forhands--slut', status: 'Säsongen är slut',
      text: 'Inga fler skotertillfällen den här vintern. Nya datum läggs upp i oktober.' }
  };

  var remsa = document.getElementById('forhands');
  var rStatus = document.getElementById('forhandsStatus');
  var rText = document.getElementById('forhandsText');
  var egen = document.getElementById('egenText');
  var sparatSno = document.getElementById('sparatSno');
  var valtLage = 'vantar';

  function ritaRemsa() {
    var l = LAGEN[valtLage];
    remsa.className = 'forhands__remsa ' + l.klass;
    rStatus.textContent = l.status;
    rText.textContent = (egen && egen.value.trim()) ? egen.value.trim() : l.text;
  }

  function kvittera(el) {
    if (!el) return;
    el.hidden = false;
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.hidden = true; }, 2600);
  }

  Array.prototype.forEach.call(document.querySelectorAll('.snoval__knapp'), function (k) {
    k.addEventListener('click', function () {
      Array.prototype.forEach.call(document.querySelectorAll('.snoval__knapp'), function (x) {
        x.classList.remove('is-vald');
      });
      k.classList.add('is-vald');
      valtLage = k.getAttribute('data-lage');
      ritaRemsa();
      kvittera(sparatSno);
    });
  });
  if (egen) egen.addEventListener('input', function () { ritaRemsa(); kvittera(sparatSno); });
  ritaRemsa();

  /* ===== Platsstepper på tillfällekorten ===== */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.stepper__btn') : null;
    if (!btn) return;

    var stor = btn.closest('.stepper--stor');
    if (stor) {
      var fl = document.getElementById('nyaPlatser');
      var n = Number(fl.textContent) + (btn.hasAttribute('data-plus') ? 1 : -1);
      fl.textContent = Math.max(1, Math.min(40, n));
      return;
    }

    var kort = btn.closest('.tkort');
    if (!kort) return;
    var bokade = Number(kort.getAttribute('data-bokade'));
    var tak = Number(kort.getAttribute('data-tak')) + (btn.hasAttribute('data-plus') ? 1 : -1);
    tak = Math.max(bokade, Math.min(40, tak));   // går inte under antalet redan bokade
    kort.setAttribute('data-tak', tak);
    kort.querySelector('.stepper__tal strong').textContent = tak;

    var kvar = tak - bokade;
    var status = kort.querySelector('.tkort__status');
    if (kvar === 0) {
      kort.classList.add('tkort--full');
      status.className = 'tkort__status tkort__status--full';
      status.textContent = 'FULLBOKAT på hemsidan';
    } else {
      kort.classList.remove('tkort--full');
      status.className = 'tkort__status';
      status.innerHTML = bokade + ' bokade · <b>' + kvar + ' kvar</b>';
    }
  });

  /* Hoppa till rätt skärm */
  document.addEventListener('click', function (e) {
    var ga = e.target.closest ? e.target.closest('[data-ga]') : null;
    if (ga) visaSkarm(ga.getAttribute('data-ga'));

    var visa = e.target.closest ? e.target.closest('[data-visa]') : null;
    if (visa) {
      var val = document.getElementById('valjTillfalle');
      var id = visa.getAttribute('data-visa');
      if (val && val.querySelector('option[value="' + id + '"]')) val.value = id;
      visaSkarm('anmalda');
      ritaElever();
    }

    var stall = e.target.closest ? e.target.closest('[data-stall]') : null;
    if (stall) {
      var k = stall.closest('.tkort');
      var av = k.classList.toggle('tkort--instalt');
      stall.textContent = av ? 'Ångra' : 'Ställ in';
    }
  });

  /* ===== Anmälda + fakturor (påhittade exempelelever) ===== */
  var ELEVER = {
    t1: [
      { namn: 'Elin Nordvall',   pnr: '100412-XXXX', tel: '070-123 45 67', malsman: 'Karin Nordvall, 070-987 65 43', faktura: 'betald' },
      { namn: 'Oskar Lantto',    pnr: '100228-XXXX', tel: '072-234 56 78', malsman: 'Per Lantto, 070-222 11 00',     faktura: 'skickad' },
      { namn: 'Moa Bergkvist',   pnr: '100907-XXXX', tel: '073-345 67 89', malsman: 'Anna Bergkvist, 070-333 22 11', faktura: 'skickad' },
      { namn: 'Viktor Öhman',    pnr: '091130-XXXX', tel: '070-456 78 90', malsman: 'Lena Öhman, 070-444 33 22',      faktura: 'betald' },
      { namn: 'Hanna Wikström',  pnr: '880615-XXXX', tel: '076-567 89 01', malsman: '',                               faktura: 'ingen' },
      { namn: 'Jonas Hedman',    pnr: '751002-XXXX', tel: '070-678 90 12', malsman: '',                               faktura: 'skickad' },
      { namn: 'Felix Rönnbäck',  pnr: '100318-XXXX', tel: '079-789 01 23', malsman: 'Sara Rönnbäck, 070-555 44 33',   faktura: 'ingen' }
    ],
    t2: [
      { namn: 'Sanna Lundkvist', pnr: '920121-XXXX', tel: '070-890 12 34', malsman: '',                               faktura: 'betald' },
      { namn: 'Emil Grahn',      pnr: '100725-XXXX', tel: '073-901 23 45', malsman: 'Maria Grahn, 070-666 55 44',     faktura: 'skickad' },
      { namn: 'Tobias Rutfjäll', pnr: '680504-XXXX', tel: '070-012 34 56', malsman: '',                               faktura: 'ingen' }
    ],
    t3: [],
    u1: [],
    u3: [],
    u4: [],
    u2: [
      { namn: 'Elin Nordvall',   pnr: '100412-XXXX', tel: '070-123 45 67', malsman: 'Karin Nordvall, 070-987 65 43', faktura: 'betald' },
      { namn: 'Viktor Öhman',    pnr: '091130-XXXX', tel: '070-456 78 90', malsman: 'Lena Öhman, 070-444 33 22',      faktura: 'betald' },
      { namn: 'Jonas Hedman',    pnr: '751002-XXXX', tel: '070-678 90 12', malsman: '',                               faktura: 'skickad' },
      { namn: 'Moa Bergkvist',   pnr: '100907-XXXX', tel: '073-345 67 89', malsman: 'Anna Bergkvist, 070-333 22 11', faktura: 'skickad' },
      { namn: 'Emil Grahn',      pnr: '100725-XXXX', tel: '073-901 23 45', malsman: 'Maria Grahn, 070-666 55 44',     faktura: 'ingen' }
    ]
  };
  // t3 är fullbokad med 12 – fyll på med exempelrader så listan speglar kortet
  (function () {
    var namn = ['Alva Sundqvist','Noah Pajala','Isak Lehto','Wilma Stenberg','Liam Mickelsson','Ebba Holmlund',
                'Theo Granström','Alice Niemi','Oliver Backlund','Maja Henriksson','Elias Sundström','Nora Isaksson'];
    var fakt = ['betald','betald','skickad','betald','skickad','ingen','betald','skickad','betald','betald','skickad','betald'];
    ELEVER.t3 = namn.map(function (n, i) {
      return { namn: n, pnr: '10' + ('0' + (i + 1)).slice(-2) + '14-XXXX', tel: '070-' + (100 + i) + ' 00 ' + (10 + i),
               malsman: i % 3 === 0 ? 'Målsman, 070-000 00 0' + i : '', faktura: fakt[i] };
    });
  })();

  var tbody = document.getElementById('elever');
  var valjare = document.getElementById('valjTillfalle');

  var LAPPAR = {
    ingen:   '<span class="lapp lapp--ingen">Ej skickad</span>',
    skickad: '<span class="lapp lapp--skickad">Skickad</span>',
    betald:  '<span class="lapp lapp--betald">Betald</span>'
  };

  function ritaElever() {
    if (!tbody || !valjare) return;
    var lista = ELEVER[valjare.value] || [];
    tbody.innerHTML = '';

    if (!lista.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="tom">Inga anmälda än på det här tillfället.</td></tr>';
    }

    lista.forEach(function (e, i) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td class="namn">' + e.namn + '</td>' +
        '<td>' + e.pnr + '</td>' +
        '<td>' + e.tel + '</td>' +
        '<td>' + (e.malsman || '<span style="color:#5A6872">–</span>') + '</td>' +
        '<td class="fakt">' + LAPPAR[e.faktura] + '</td>' +
        '<td class="bet"></td>' +
        '<td class="gor"></td>';

      var bet = tr.querySelector('.bet');
      var gor = tr.querySelector('.gor');

      var granska = document.createElement('button');
      granska.className = 'btn btn--liten';
      granska.textContent = 'Visa faktura';
      granska.addEventListener('click', function () { oppnaFaktura(e, valjare.value, i); });
      gor.appendChild(granska);

      if (e.faktura === 'ingen') {
        var skicka = document.createElement('button');
        skicka.className = 'btn btn--liten btn--accent';
        skicka.textContent = 'Skicka faktura';
        skicka.addEventListener('click', function () { e.faktura = 'skickad'; ritaElever(); });
        gor.appendChild(skicka);
        bet.innerHTML = '<span style="color:#5A6872">–</span>';
      } else {
        var lbl = document.createElement('label');
        lbl.className = 'bock';
        var box = document.createElement('input');
        box.type = 'checkbox';
        box.checked = e.faktura === 'betald';
        box.addEventListener('change', function () { e.faktura = box.checked ? 'betald' : 'skickad'; ritaElever(); });
        lbl.appendChild(box);
        lbl.appendChild(document.createTextNode(box.checked ? 'Betald' : 'Markera betald'));
        bet.appendChild(lbl);

        if (e.faktura === 'skickad') {
          var igen = document.createElement('button');
          igen.className = 'btn btn--liten btn--tyst';
          igen.textContent = 'Skicka igen';
          igen.addEventListener('click', function () { igen.textContent = 'Skickad ✓'; });
          gor.appendChild(igen);
        }
      }
      tbody.appendChild(tr);
      if (i === lista.length - 1) tr.classList.add('sist');
    });

    document.getElementById('sumAnmalda').textContent = lista.length;
    document.getElementById('sumFaktura').textContent = lista.filter(function (e) { return e.faktura === 'ingen'; }).length;
    document.getElementById('sumObetald').textContent = lista.filter(function (e) { return e.faktura !== 'betald'; }).length;

    var totalt = Object.keys(ELEVER).reduce(function (s, k) { return s + ELEVER[k].length; }, 0);
    var r = document.getElementById('antalAnmalda');
    if (r) r.textContent = totalt;
  }

  if (valjare) valjare.addEventListener('change', ritaElever);
  ritaElever();

  /* ===== Nytt tillfälle ===== */
  var nytt = document.getElementById('nyttForm');
  if (nytt) {
    var hur = document.getElementById('formHur');
    var faltSlut = document.getElementById('faltSlut');
    Array.prototype.forEach.call(nytt.querySelectorAll('input[name=typ]'), function (r) {
      r.addEventListener('change', function () {
        var teori = nytt.querySelector('input[name=typ]:checked').value === 'teori';
        hur.hidden = !teori;
        faltSlut.hidden = !teori;
        document.getElementById('nyaPlatser').textContent = teori ? 12 : 8;
      });
    });
    nytt.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!nytt.checkValidity()) { nytt.reportValidity(); return; }
      kvittera(document.getElementById('sparatNytt'));
    });
  }

  /* ===== Fakturaförhandsvisning – granska, inte redigera ===== */
  var fmodal = document.getElementById('fakturaModal');
  var aktivElev = null;

  function datum(d) {
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }

  /* Samma elev ska få samma fakturanummer varje gång dialogen öppnas */
  function fakturanummer(tillfalleId, index) {
    var bas = 0;
    for (var i = 0; i < tillfalleId.length; i++) bas += tillfalleId.charCodeAt(i);
    return '2026-' + (1000 + (bas % 90) * 10 + index + 1);
  }

  function oppnaFaktura(elev, tillfalleId, index) {
    if (!fmodal) return;
    aktivElev = elev;

    var idag = new Date();
    var forfall = new Date(idag.getTime() + 14 * 864e5);
    document.getElementById('fNr').textContent = fakturanummer(tillfalleId, index);
    document.getElementById('fDatum').textContent = datum(idag);
    document.getElementById('fForfall').textContent = datum(forfall);
    document.getElementById('fForfall2').textContent = datum(forfall);

    var malsman = (elev.malsman || '').split(',')[0].trim();
    document.getElementById('fMottagare').textContent = malsman || elev.namn;
    document.getElementById('fMottagarNot').textContent = malsman
      ? 'Målsman för ' + elev.namn + ' (' + elev.pnr + '). Skickas till e-postadressen från bokningen.'
      : elev.pnr + ' · skickas till e-postadressen från bokningen.';

    var vald = valjare.options[valjare.selectedIndex];
    document.getElementById('fTillfalle').textContent = vald ? vald.text.split(' · ').slice(0, 2).join(' · ') : '';

    var skicka = document.getElementById('fSkicka');
    skicka.textContent = elev.faktura === 'ingen' ? 'Skicka fakturan' : 'Skicka igen';

    fmodal.hidden = false;
    document.body.style.overflow = 'hidden';
    fmodal.scrollTop = 0;
    // Fokusera stängknappen högst upp – att fokusera skicka-knappen skulle
    // scrolla förbi hela fakturan, som ju är det man kom hit för att läsa.
    fmodal.querySelector('.fmodal__x').focus({ preventScroll: true });
  }

  function stangFaktura() {
    if (!fmodal) return;
    fmodal.hidden = true;
    document.body.style.overflow = '';
    aktivElev = null;
  }

  if (fmodal) {
    fmodal.addEventListener('click', function (e) {
      if (e.target.hasAttribute && e.target.hasAttribute('data-fstang')) stangFaktura();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !fmodal.hidden) stangFaktura();
    });
    document.getElementById('fSkicka').addEventListener('click', function () {
      if (!aktivElev) return;
      if (aktivElev.faktura === 'ingen') aktivElev.faktura = 'skickad';
      stangFaktura();
      ritaElever();
    });
    document.getElementById('fSkrivUt').addEventListener('click', function () {
      document.body.classList.add('skriver-faktura');
      window.print();
      setTimeout(function () { document.body.classList.remove('skriver-faktura'); }, 400);
    });
  }
})();

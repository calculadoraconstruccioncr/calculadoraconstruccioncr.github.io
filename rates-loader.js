/**
 * rates-loader.js
 * Lee rates.json (mismo origen, sin CORS) y actualiza todos los
 * elementos de tasas en la página antes de que app.js haga sus
 * llamadas a proxies externos.
 *
 * Si rates.json es reciente (< 26 h), se usa directamente y se
 * marcan las tarjetas con punto verde "live".
 * Si es viejo o falla, se deja que app.js haga su propia lógica.
 */
(function () {
  'use strict';

  // ── Mapa: clave rates.json → IDs de elementos en el HTML ──────────
  const DISPLAY_MAP = {
    tbp:    { val: 'rval-tbp',    dot: 'rdot-tbp',    ref: 'ref-tbp',        input: 'l-tbp',    expo: null },
    ted:    { val: 'rval-ted',    dot: 'rdot-ted',     ref: 'ref-ted',        input: null,        expo: null },
    prime:  { val: 'rval-prime',  dot: 'rdot-prime',   ref: 'ref-prime',      input: 'l-prime',  expo: 'expo-prime' },
    sofr3:  { val: 'rval-sofr3',  dot: 'rdot-sofr3',   ref: 'ref-sofr3m',     input: null,        expo: 'expo-sofr3' },
    sofr6:  { val: 'rval-sofr6',  dot: 'rdot-sofr6',   ref: 'ref-sofr6m',     input: null,        expo: 'expo-sofr6' },
    tri3c:  { val: 'rval-tri3c',  dot: 'rdot-tri3c',   ref: 'ref-tri3m-crc',  input: null,        expo: 'expo-tri3c' },
    tri6c:  { val: 'rval-tri6c',  dot: 'rdot-tri6c',   ref: 'ref-tri6m-crc',  input: null,        expo: 'expo-tri6c' },
    tri12c: { val: 'rval-tri12c', dot: 'rdot-tri12c',  ref: 'ref-tri12m-crc', input: null,        expo: 'expo-tri12c' },
    tri3d:  { val: 'rval-tri3d',  dot: 'rdot-tri3d',   ref: 'ref-tri3m-usd',  input: null,        expo: 'expo-tri3' },
    tri6d:  { val: 'rval-tri6d',  dot: 'rdot-tri6d',   ref: 'ref-tri6m-usd',  input: null,        expo: 'expo-tri6' },
    tri12d: { val: 'rval-tri12d', dot: 'rdot-tri12d',  ref: 'ref-tri12m-usd', input: null,        expo: 'expo-tri12' },
  };

  const MAX_AGE_HOURS = 26; // rates.json se acepta si tiene < 26 h

  function setEl(id, value) {
    var el = document.getElementById(id);
    if (!el) return;
    if (el.tagName === 'INPUT') { el.value = value; }
    else { el.textContent = value; }
  }

  function applyRates(data) {
    var isRecent = false;
    if (data.updated) {
      var ageMs = Date.now() - new Date(data.updated).getTime();
      isRecent = ageMs < MAX_AGE_HOURS * 3600 * 1000;
    }

    // Actualizar cada tasa
    Object.keys(DISPLAY_MAP).forEach(function (key) {
      var val = data[key];
      if (val == null || isNaN(val)) return;

      var ids = DISPLAY_MAP[key];
      var pct = Number(val).toFixed(2) + '%';

      // Tarjeta de tasa (visualización)
      setEl(ids.val, pct);

      // Punto de estado (verde = live, rojo = error)
      var dot = document.getElementById(ids.dot);
      if (dot) {
        dot.className = 'rc-dot' + (isRecent ? ' live' : '');
      }

      // Input oculto que usa la calculadora
      setEl(ids.ref, val);

      // Input del formulario de préstamo (TBP y Prime visible)
      if (ids.input) { setEl(ids.input, val); }

      // Inputs del módulo Expo Construcción
      if (ids.expo) { setEl(ids.expo, val); }
    });

    // TC (tipo de cambio) — número entero, sin %
    if (data.tc && data.tc > 400) {
      setEl('tipo-cambio', Math.round(data.tc));
      setEl('tipo-cambio-mobile', Math.round(data.tc));
    }

    // Actualizar badge de tasas de referencia en préstamo (TBP y Prime)
    if (data.tbp) { setEl('badge-tbp', data.tbp.toFixed(2) + '%'); }
    if (data.prime) { setEl('badge-prime', data.prime.toFixed(2) + '%'); }

    // Actualizar timestamp del panel de tasas
    if (isRecent) {
      var ts = document.getElementById('rates-ts');
      if (ts) {
        var d = new Date(data.updated);
        var locale = (typeof state !== 'undefined' && state.lang === 'en') ? 'en-US' : 'es-CR';
        ts.textContent = 'Actualizado: ' + d.toLocaleDateString(locale) +
          ' · BCCR · FRED · Cámara';
      }
    }

    // Actualizar hint del monedero en nav
    if (data.tc && data.tc > 400) {
      var hint = document.getElementById('moneda-bar-hint');
      if (hint) {
        hint.textContent = 'BCCR ref: ₡' + Math.round(data.tc);
      }
    }

    // Disparar render() si app.js ya cargó el estado
    if (isRecent && typeof render === 'function') {
      // Sincronizar state del préstamo
      if (typeof state !== 'undefined') {
        if (data.tbp   != null) state.tbpRate   = data.tbp;
        if (data.prime != null) state.primeRate  = data.prime;
      }
      try { render(); } catch (e) { /* silencioso */ }
    }

    if (isRecent) {
      console.log('[rates-loader] ✅ rates.json aplicado (' +
        new Date(data.updated).toISOString() + ')');
    } else {
      console.warn('[rates-loader] ⚠ rates.json tiene > ' +
        MAX_AGE_HOURS + 'h. Dejando que app.js haga fetch en vivo.');
    }
  }

  // ── Fetch rates.json al cargar el DOM ──────────────────────────────
  function loadRates() {
    fetch('./rates.json?_=' + Date.now())
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        // Esperar a que app.js haya inicializado el DOM (~300ms)
        // antes de aplicar, para evitar que lo sobreescriba después
        setTimeout(function () { applyRates(data); }, 350);
      })
      .catch(function (err) {
        console.warn('[rates-loader] rates.json no disponible:', err.message);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadRates);
  } else {
    loadRates();
  }

  // Exponer para debug desde la consola del browser
  window.reloadRates = loadRates;

})();

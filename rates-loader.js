/**
 * rates-loader.js  v2
 * Lee rates.json (mismo origen, sin CORS) y actualiza:
 *  - Tasas de referencia (TBP, TED, TC, SOFR, TRI, Prime)
 *  - Costos de construcción por m² (COSTOS_M2 global de app.js)
 *  - Labels de los chips de acabado
 *
 * Si rates.json tiene > 26h se deja que app.js haga su propio fetch.
 */
(function () {
  'use strict';

  // ── Mapa: clave rates.json → IDs en el HTML ─────────────────────
  var DISPLAY_MAP = {
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

  var MAX_AGE_HOURS = 26;

  function setEl(id, value) {
    var el = document.getElementById(id);
    if (!el) return;
    if (el.tagName === 'INPUT') el.value = value;
    else el.textContent = value;
  }

  // ── Actualizar costos de construcción ────────────────────────────
  // COSTOS_M2 es una variable global del app.js (sin var/let/const)
  // Al sobreescribir sus propiedades, render() usará los nuevos valores.
  function applyCostosM2(costos) {
    if (!costos || typeof costos !== 'object') return;

    // 1. Actualizar la variable global de app.js
    if (window.COSTOS_M2) {
      if (costos.basico)     window.COSTOS_M2.basico     = costos.basico;
      if (costos.intermedio) window.COSTOS_M2.intermedio  = costos.intermedio;
      if (costos.alto)       window.COSTOS_M2.alto        = costos.alto;
      console.log('[rates-loader] ✅ COSTOS_M2 actualizado:', JSON.stringify(window.COSTOS_M2));
    } else {
      console.warn('[rates-loader] ⚠ COSTOS_M2 aún no disponible — reintentando en 600ms');
      setTimeout(function() { applyCostosM2(costos); }, 600);
      return;
    }

    // 2. Actualizar los labels de los chips de acabado
    function fmtK(v) { return '₡' + Math.round(v / 1000) + 'K/m²'; }
    setEl('acabado-sub-basico',      fmtK(costos.basico     || 285000));
    setEl('acabado-sub-intermedio',  fmtK(costos.intermedio  || 355000));
    setEl('acabado-sub-alto',        fmtK(costos.alto        || 430000));

    // 3. Actualizar las referencias en el hero
    var heroStat = document.getElementById('hero-stat-m2');
    if (heroStat && costos.basico && costos.alto) {
      heroStat.textContent = '₡' + Math.round(costos.basico/1000) + 'K–₡' + Math.round(costos.alto/1000) + 'K';
    }

    // 4. Forzar recálculo para que los nuevos costos se reflejen
    if (typeof render === 'function') {
      try { render(); } catch(e) { /* silencioso */ }
    }
  }

  // ── Actualizar tasas de referencia ────────────────────────────────
  function applyRates(data) {
    var isRecent = false;
    if (data.updated) {
      isRecent = (Date.now() - new Date(data.updated).getTime()) < MAX_AGE_HOURS * 3600 * 1000;
    }

    // Tasas financieras
    Object.keys(DISPLAY_MAP).forEach(function (key) {
      var val = data[key];
      if (val == null || isNaN(val)) return;
      var ids = DISPLAY_MAP[key];
      var pct = Number(val).toFixed(2) + '%';

      setEl(ids.val, pct);
      var dot = document.getElementById(ids.dot);
      if (dot) dot.className = 'rc-dot' + (isRecent ? ' live' : '');
      setEl(ids.ref, val);
      if (ids.input) setEl(ids.input, val);
      if (ids.expo)  setEl(ids.expo,  val);
    });

    // TC (tipo de cambio)
    if (data.tc && data.tc > 400) {
      var tc = Math.round(data.tc);
      setEl('tipo-cambio', tc);
      setEl('tipo-cambio-mobile', tc);
      var hint = document.getElementById('moneda-bar-hint');
      if (hint) hint.textContent = 'BCCR ref: ₡' + tc + '/$';
    }

    // Badges TBP / Prime
    if (data.tbp)   setEl('badge-tbp',   data.tbp.toFixed(2) + '%');
    if (data.prime) setEl('badge-prime', data.prime.toFixed(2) + '%');

    // Timestamp del panel de tasas
    if (isRecent) {
      var ts = document.getElementById('rates-ts');
      if (ts) {
        var d = new Date(data.updated);
        var locale = (typeof state !== 'undefined' && state.lang === 'en') ? 'en-US' : 'es-CR';
        ts.textContent = 'Actualizado: ' + d.toLocaleDateString(locale) + ' · BCCR · FRED · Cámara';
      }
    }

    // Sync state del préstamo
    if (typeof state !== 'undefined') {
      if (data.tbp   != null) state.tbpRate   = data.tbp;
      if (data.prime != null) state.primeRate  = data.prime;
    }

    // Costos de construcción (procesado después de render inicial)
    if (data.costos_m2) {
      // Esperar a que app.js haya inicializado COSTOS_M2
      var maxWait = 10, tries = 0;
      var waitForCostos = setInterval(function() {
        tries++;
        if (window.COSTOS_M2) {
          clearInterval(waitForCostos);
          applyCostosM2(data.costos_m2);
        } else if (tries >= maxWait) {
          clearInterval(waitForCostos);
          console.warn('[rates-loader] COSTOS_M2 no disponible tras ' + maxWait + ' intentos');
        }
      }, 300);
    }

    // Recalcular con nuevas tasas
    if (isRecent && typeof render === 'function') {
      try { render(); } catch(e) { /* silencioso */ }
    }

    console.log('[rates-loader] ' + (isRecent ? '✅' : '⚠') +
      ' rates.json aplicado (' + (data.updated || '?') + ')' +
      (data.costos_m2 ? ' | costos_m2 incluidos' : ''));
  }

  // ── Fetch rates.json ──────────────────────────────────────────────
  function loadRates() {
    fetch('./rates.json?_=' + Date.now())
      .then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function(data) {
        // Esperar a que app.js inicialice el DOM (~350ms)
        setTimeout(function() { applyRates(data); }, 350);
      })
      .catch(function(err) {
        console.warn('[rates-loader] rates.json no disponible:', err.message);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadRates);
  } else {
    loadRates();
  }

  // API pública para debug y botón "Actualizar tasas"
  window.reloadRates = loadRates;

})();

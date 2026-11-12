/* =========================================================================
   Sirena — motor de decisión prehospitalaria
   Vanilla JS, sin dependencias. Estado en memoria + maletín en localStorage.
   Pantallas (hash): #inicio #triage #derivacion #domicilio #hc #maletin #soporte
   ========================================================================= */
(function () {
  "use strict";

  const P = window.PROTOCOLOS;
  const U = window.BANDERAS_UNIVERSALES;
  const BASE = window.MALETIN_BASE;
  const SV = window.SOPORTE_VITAL;
  const PALS = window.DOSIS_PALS;
  const META = window.APP_META;
  const KEY = "sirena.maletin.v1";
  const KEY_THEME = "sirena.tema";
  const KEY_REG = "sirena.registro.pendientes";
  const KEY_SHEET = "sirena.registro.planilla";
  const PLANILLA_DEFECTO = window.APP_META.planilla || "";
  const COLUMNAS = ["ID atención", "Fecha", "Hora", "Turno", "Código despacho", "Edad", "Sexo", "Motivo", "CIE-10 motivo", "Tipo de manejo",
    "Diagnóstico presuntivo", "CIE-10 diagnóstico", "SNOMED CT diagnóstico", "Banderas rojas", "Banderas amarillas", "Conducta",
    "Paciente", "Internación / derivación", "Medicación administrada", "Faltantes del maletín", "RCP", "ECG",
    "TA", "FC", "FR", "SatO2", "T° axilar", "Glucemia", "Glasgow", "Versión app",
    "Tipo paciente", "Peso (kg)", "Embarazo", "Hora llegada", "Hora salida", "Hora llegada destino"];

  const CODIGOS = {
    rojo: { label: "Rojo", sub: "Emergencia" },
    amarillo: { label: "Amarillo", sub: "Urgencia" },
    verde: { label: "Verde", sub: "Consulta" }
  };

  const LOGO = `<svg class="logo" viewBox="0 0 48 48" aria-hidden="true"><rect x="13" y="5" width="8" height="4" rx="1.5" fill="var(--rojo)"/><path d="M4 14h26v22H4z" fill="var(--fg)"/><path d="M30 20h7.5l6.5 8v8H30z" fill="var(--fg)"/><path d="M32.5 22.5h4.3l3.9 5H32.5z" fill="var(--bg)"/><path d="M15 18h4v5h5v4h-5v5h-4v-5h-5v-4h5z" fill="var(--rojo)"/><circle cx="12" cy="37" r="4.2" fill="var(--bg)"/><circle cx="12" cy="37" r="2.6" fill="var(--fg)"/><circle cx="36" cy="37" r="4.2" fill="var(--bg)"/><circle cx="36" cy="37" r="2.6" fill="var(--fg)"/></svg>`;

  /* Hallazgos "normales" para completar rápido la planilla */
  const NORMAL = {
    cv: "R1 y R2 normofonéticos, sin soplos. Pulsos periféricos presentes. Relleno capilar < 2 s.",
    resp: "Buena entrada de aire bilateral, sin ruidos agregados. Sin tiraje.",
    abd: "Blando, depresible, indoloro, sin defensa. RHA presentes.",
    neuro: "Lúcido, orientado en tiempo y espacio. Sin foco motor ni sensitivo. Pupilas isocóricas reactivas."
  };
  const DESCARTABLES = ["Jeringa", "Aguja", "Abbocath", "Guía de suero", "Máscara nebulizadora", "Cánula nasal", "Electrodos", "Tira reactiva", "Gasas", "Guantes"];
  const PACIENTE = ["Queda en domicilio", "Se niega atención", "Se niega al traslado", "Ausente", "Óbito"];
  const INTERNACION = ["Sala de guardia", "UTI / UCO", "Sala general", "Neo", "Maternidad"];

  /* ------------------------------------------------------------ signos vitales: normales, técnica y escalas */
  const NORMALES = { tas: "120", tad: "80", fc: "80", fr: "16", sat: "98", temp: "36,5", gluc: "100", gcs: "15", arm: "No" };
  const GCS = [
    { k: "o", t: "Apertura ocular", ops: [[4, "Espontánea"], [3, "A la orden verbal"], [2, "Al estímulo doloroso"], [1, "Ninguna"]] },
    { k: "v", t: "Respuesta verbal", ops: [[5, "Orientado"], [4, "Confuso"], [3, "Palabras inapropiadas"], [2, "Sonidos incomprensibles"], [1, "Ninguna"]] },
    { k: "m", t: "Respuesta motora", ops: [[6, "Obedece órdenes"], [5, "Localiza el dolor"], [4, "Retira al dolor"], [3, "Flexión anormal (decorticación)"], [2, "Extensión (descerebración)"], [1, "Ninguna"]] }
  ];
  const ARM_OPS = ["No", "Sí · bolsa-válvula-máscara", "Sí · ventilador"];
  const VINFO = {
    ta: { t: "Tensión arterial", u: "mmHg", fuente: "MSAL-HTA · PALS",
      como: ["Paciente sentado o acostado, en reposo 5 min si la situación lo permite.", "Manguito del tamaño correcto: la cámara cubre al menos el 80 % del brazo. Uno chico da valores falsamente altos.", "Brazo apoyado a la altura del corazón, sin ropa que ajuste.", "Inflar 20–30 mmHg por encima de la desaparición del pulso radial y desinflar 2–3 mmHg por segundo.", "Sistólica: primer ruido. Diastólica: cuando desaparecen los ruidos.", "Dolor torácico o sospecha de disección: medir en ambos brazos."],
      rangos: [["< 90", "TAS: hipotensión", "rojo"], ["< 120/80", "Normal", "verde"], ["≥ 140/90", "Hipertensión", "amarillo"], ["≥ 180/110", "HTA severa", "rojo"]],
      ped: "Niños: hipotensión si TAS < 70 en lactantes, < 70 + (2 × edad en años) entre 1 y 10 años, y < 90 desde los 10 años." },
    fc: { t: "Frecuencia cardíaca", u: "lpm", fuente: "ACLS · PALS",
      como: ["Palpar el pulso radial con dos dedos (carotídeo si no se palpa el radial).", "Contar 30 s y multiplicar por 2. Si es irregular, contar 60 s completos.", "Irregular o > 150 lpm: confirmar con monitor o ECG."],
      rangos: [["< 50", "Bradicardia", "rojo"], ["60–100", "Normal adulto", "verde"], ["101–120", "Taquicardia", "amarillo"], ["> 120", "Alarma", "rojo"]],
      pedT: [["Neonato", "100–205"], ["Lactante", "100–180"], ["1–2 años", "98–140"], ["3–5 años", "80–120"], ["6–11 años", "75–118"], ["≥ 12 años", "60–100"]] },
    fr: { t: "Frecuencia respiratoria", u: "rpm", fuente: "PALS · SAME",
      como: ["Contar sin avisarle al paciente: si lo nota, cambia el ritmo. Mirar el tórax o apoyar la mano.", "Contar 30 s y multiplicar por 2. En niños o respiración irregular, 60 s.", "Observar además tiraje, aleteo nasal y uso de músculos accesorios."],
      rangos: [["< 10", "Bradipnea", "rojo"], ["12–20", "Normal adulto", "verde"], ["21–30", "Taquipnea", "amarillo"], ["> 30", "Alarma", "rojo"]],
      pedT: [["Lactante", "30–53"], ["1–2 años", "22–37"], ["3–5 años", "20–28"], ["6–11 años", "18–25"], ["≥ 12 años", "12–20"]] },
    sat: { t: "Saturación de O₂", u: "%", fuente: "MSAL-EPOC · SAME",
      como: ["Dedo tibio y limpio, sin esmalte ni uñas postizas (o lóbulo de la oreja).", "Esperar 30 s a que la onda o el indicador de señal estén estables.", "Comprobar que la FC del oxímetro coincida con el pulso palpado.", "Registrar si es a aire ambiente o con O₂ y cuántos litros."],
      rangos: [["≥ 95 %", "Normal", "verde"], ["92–94 %", "Vigilar", "amarillo"], ["< 92 %", "Alarma", "rojo"], ["88–92 %", "Objetivo en EPOC", "amarillo"]],
      alerta: "No es confiable con mala perfusión, frío, temblor o luz intensa. En intoxicación por monóxido de carbono da valores falsamente normales." },
    temp: { t: "Temperatura axilar", u: "°C", fuente: "SAME",
      como: ["Axila seca, termómetro en el centro del hueco axilar y brazo pegado al cuerpo.", "Digital: hasta el aviso sonoro. De mercurio: 3–5 min.", "Si se bañó o estuvo muy abrigado, esperar 15–30 min."],
      rangos: [["< 35", "Hipotermia", "rojo"], ["35,5–37,4", "Normal", "verde"], ["37,5–37,9", "Febrícula", "amarillo"], ["≥ 38", "Fiebre", "amarillo"], ["≥ 40", "Hiperpirexia", "rojo"]] },
    gluc: { t: "Glucemia capilar", u: "mg/dl", fuente: "SAME · SAE",
      como: ["Lavar el dedo con agua y secar: el alcohol o restos de azúcar alteran el valor.", "Punzar el costado de la yema, no el centro.", "No exprimir con fuerza: diluye la gota con líquido de los tejidos.", "Si el equipo marca LO o HI, registrarlo así y tratar."],
      rangos: [["< 70", "Hipoglucemia (< 54 grave)", "rojo"], ["70–140", "Normal casual", "verde"], ["141–250", "Hiperglucemia", "amarillo"], ["> 250", "Buscar cetosis", "rojo"]] },
    gcs: { t: "Escala de Glasgow", u: "/15", fuente: "PHTLS · SAME",
      como: ["Evaluar la mejor respuesta en cada componente.", "Estímulo doloroso: presión en el lecho ungueal o en el trapecio.", "Registrar los tres componentes, por ejemplo O3 V4 M6."],
      rangos: [["13–15", "Leve", "verde"], ["9–12", "Moderado", "amarillo"], ["≤ 8", "Grave: proteger la vía aérea", "rojo"]] },
    arm: { t: "Asistencia respiratoria mecánica", u: "", fuente: "SAME",
      como: ["Indicar si el paciente requiere ventilación asistida y con qué dispositivo.", "Con ventilación asistida, registrar también la SatO₂ y la FR que se le administra."],
      rangos: [] }
  };

  /* ------------------------------------------------------------ fichas: estado que se conserva entre casos */
  const KEY_SRI = "sirena.sri.conc";
  const FS = {
    sri: { kg: "", c: (() => { try { return JSON.parse(localStorage.getItem(KEY_SRI) || "{}"); } catch (e) { return {}; } })() },
    embStock: false,
    got: { modo: "vol", vol: "", t: "", tu: "h", dosis: "", du: "mcgkgmin", kg: "", mg: "", ml: "" }
  };

  /* ------------------------------------------------------------ estado */
  const S = {};
  function estadoInicial() {
    Object.assign(S, {
      codigo: null, motivo: null, texto: "", caseId: null, inicio: null, retomable: null, flujo: null,
      banderas: new Set(), auto: new Set(), off: new Set(), sistemas: new Set(),
      override: false, dx: null,
      v: { ta: "", tas: "", tad: "", fc: "", fr: "", sat: "", temp: "", gluc: "", gcs: "", arm: "" },
      dados: {},
      hc: { edad: "", sexo: "", antec: "", cv: "", resp: "", abd: "", neuro: "", desc: new Set(), descOtro: "", obs: "", rcp: false, ecg: false, paciente: "", intern: "" },
      gcsComp: null,
      pac: { tipo: "", emb: false, kg: "" },
      horas: { llegada: "", salida: "", destino: "" },
      tec: S.tec || { edad: "", f: new Set() },
      pals: S.pals || { kg: "", edad: "" }
    });
  }
  estadoInicial();

  /* ------------------------------------------------------------ paciente */
  const esNino = () => S.pac.tipo === "nino" || (num(S.hc.edad) !== null && num(S.hc.edad) < 15);
  const ICO = {
    nino: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9" r="2.8"/><path d="M8.5 21v-4.2a3.5 3.5 0 0 1 7 0V21"/></svg>',
    adulto: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="4.8" r="2.6"/><path d="M7 22v-8.3A4.4 4.4 0 0 1 11.4 9.3h1.2A4.4 4.4 0 0 1 17 13.7V22"/></svg>'
  };
  function pacienteHTML() {
    const t = S.pac.tipo, sx = S.hc.sexo;
    return `<div class="pacrow">
        <button type="button" class="pbtn" data-act="ptipo" data-val="nino" aria-pressed="${t === "nino"}">${ICO.nino}<span>Niño</span></button>
        <button type="button" class="pbtn" data-act="ptipo" data-val="adulto" aria-pressed="${t === "adulto"}">${ICO.adulto}<span>Adulto</span></button>
        <button type="button" class="pbtn sx" data-act="psexo" data-val="F" aria-pressed="${sx === "F"}"><b>F</b><span>Mujer</span></button>
        <button type="button" class="pbtn sx" data-act="psexo" data-val="M" aria-pressed="${sx === "M"}"><b>M</b><span>Varón</span></button>
      </div>
      ${t || sx ? `<div class="pacdatos">
        <label class="vf"><span>Edad</span><input data-pac="edad" type="text" inputmode="decimal" autocomplete="off" placeholder="años" value="${esc(S.hc.edad)}" aria-label="Edad en años"></label>
        ${t === "nino" ? `<label class="vf"><span>Peso</span><input data-pac="kg" type="text" inputmode="decimal" autocomplete="off" placeholder="kg" value="${esc(S.pac.kg)}" aria-label="Peso en kg"></label>` : ""}
        ${sx === "F" && t !== "nino" ? `<button type="button" class="pbtn emb" data-act="pemb" aria-pressed="${S.pac.emb}"><b>${S.pac.emb ? "✓" : "+"}</b><span>Embarazada</span></button>` : ""}
      </div>` : ""}
      ${t === "nino" ? `<p class="hint">Pediátrico: las dosis de adulto se bloquean y se usa la calculadora por peso.</p>` : ""}`;
  }
  function refrescarPaciente() { $$(".pac").forEach((el) => { el.innerHTML = pacienteHTML(); }); }

  /* ------------------------------------------------------------ guardado automático del caso en curso */
  const KEY_CASO = "sirena.caso.actual";
  let tCaso = null;
  function guardarCaso() {
    clearTimeout(tCaso);
    tCaso = setTimeout(() => {
      if (!S.motivo) return;
      try {
        localStorage.setItem(KEY_CASO, JSON.stringify(Object.assign({}, S, {
          banderas: [...S.banderas], auto: [...S.auto], off: [...S.off], sistemas: [...S.sistemas],
          hc: Object.assign({}, S.hc, { desc: [...S.hc.desc] }), tec: undefined, retomable: undefined,
          pantalla: location.hash.replace("#", "") || "inicio", guardado: Date.now()
        })));
      } catch (e) { /* sin almacenamiento */ }
    }, 250);
  }
  function borrarCaso() { clearTimeout(tCaso); try { localStorage.removeItem(KEY_CASO); } catch (e) { /* nada */ } }
  function leerCaso() { try { return JSON.parse(localStorage.getItem(KEY_CASO) || "null"); } catch (e) { return null; } }
  function retomarCaso(c) {
    const destino = c.pantalla && !c.pantalla.startsWith("f-") ? c.pantalla : "triage";
    estadoInicial();
    Object.assign(S, c, {
      banderas: new Set(c.banderas), auto: new Set(c.auto), off: new Set(c.off), sistemas: new Set(c.sistemas),
      hc: Object.assign({}, S.hc, c.hc, { desc: new Set(c.hc.desc || []) }), tec: S.tec, retomable: null
    });
    delete S.pantalla; delete S.guardado;
    go(destino);
  }

  /* ------------------------------------------------------------ notas de prueba */
  const KEY_NOTAS = "sirena.notas";
  const NOTAS = (() => { try { return JSON.parse(localStorage.getItem(KEY_NOTAS) || "[]"); } catch (e) { return []; } })();
  const saveNotas = () => { try { localStorage.setItem(KEY_NOTAS, JSON.stringify(NOTAS)); } catch (e) { /* nada */ } };

  /* ------------------------------------------------------------ pantalla encendida */
  let wakeLock = null, quiereWake = false;
  async function pantallaEncendida(on) {
    quiereWake = on;
    try {
      if (on && !wakeLock && navigator.wakeLock && document.visibilityState === "visible") {
        wakeLock = await navigator.wakeLock.request("screen");
        wakeLock.addEventListener("release", () => { wakeLock = null; });
      } else if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
    } catch (e) { wakeLock = null; }
  }
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && quiereWake) pantallaEncendida(true); });

  /* ------------------------------------------------------------ registro de atenciones (sin datos personales) */
  const REG = (() => { try { return JSON.parse(localStorage.getItem(KEY_REG) || "[]"); } catch (e) { return []; } })();
  const saveReg = () => { try { localStorage.setItem(KEY_REG, JSON.stringify(REG)); } catch (e) { /* en memoria */ } };
  const planilla = () => { try { return localStorage.getItem(KEY_SHEET) || PLANILLA_DEFECTO; } catch (e) { return PLANILLA_DEFECTO; } };

  /* Envío automático: un script de Google (Apps Script) publicado como aplicación web recibe las filas
     y las escribe en la planilla. El link queda solo en este teléfono, nunca en el código público. */
  const KEY_ENVIO = "sirena.registro.envio", KEY_ULT = "sirena.registro.ultimo";
  const urlEnvio = () => { try { return localStorage.getItem(KEY_ENVIO) || ""; } catch (e) { return ""; } };
  let enviando = false, envioError = "";
  async function enviarPendientes(manual) {
    const url = urlEnvio();
    if (!url || enviando || !navigator.onLine) { if (manual && !navigator.onLine) toast("Sin conexión: se envía cuando vuelva la señal"); return; }
    if (!REG.length && !NOTAS.length) { if (manual) toast("No hay nada pendiente"); return; }
    enviando = true;
    const lote = [];
    if (REG.length) lote.push(["Registro", REG.map((r) => r.slice())]);
    if (NOTAS.length) lote.push(["Notas", NOTAS.map((r) => r.slice())]);
    let enviadas = 0;
    try {
      for (const [hoja, filas] of lote) {
        const r = await fetch(url, { method: "POST", body: JSON.stringify({ hoja, filas }) });
        const j = await r.json();
        if (!j || !j.ok) throw new Error((j && j.error) || "respuesta inválida");
        const ok = new Set(j.ids || []);
        const lista = hoja === "Registro" ? REG : NOTAS;
        // Solo se borran las filas que la planilla confirmó y que no cambiaron mientras tanto.
        for (let i = lista.length - 1; i >= 0; i--) {
          const enviada = filas.find((f) => f[0] === lista[i][0]);
          if (ok.has(lista[i][0]) && enviada && enviada.join("\t") === lista[i].join("\t")) { lista.splice(i, 1); if (hoja === "Registro") enviadas++; }
        }
        hoja === "Registro" ? saveReg() : saveNotas();
      }
      envioError = "";
      try { localStorage.setItem(KEY_ULT, String(Date.now())); } catch (e) { /* nada */ }
      if (enviadas || manual) toast(enviadas ? `${enviadas} atenci${enviadas > 1 ? "ones enviadas" : "ón enviada"} a la planilla` : "Planilla al día");
    } catch (e) {
      envioError = String(e && e.message || e);
      if (manual) toast("No se pudo enviar. Quedan guardadas en el teléfono.");
    } finally {
      enviando = false;
      const foco = document.activeElement && document.activeElement.matches("input, textarea, select");
      if (actual() === "registro" ? !foco || document.activeElement.id !== "envioUrl" : actual() === "inicio" && !foco) render(true);
    }
  }
  function ultimoEnvio() {
    let t = 0; try { t = Number(localStorage.getItem(KEY_ULT)) || 0; } catch (e) { t = 0; }
    if (!t) return "todavía no se envió nada";
    const d = new Date(t), p = (n) => String(n).padStart(2, "0");
    return `último envío ${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  /* ------------------------------------------------------------ maletín */
  const M = (() => {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { saved = null; }
    return { estado: (saved && saved.estado) || {}, propios: (saved && saved.propios) || [] };
  })();
  function saveMaletin() { try { localStorage.setItem(KEY, JSON.stringify(M)); } catch (e) { /* en memoria */ } }
  const baseItem = (id) => BASE.find((d) => d.id === id);
  function enStock(id) {
    if (!id) return true;
    const b = baseItem(id);
    const baseOk = b ? (id in M.estado ? M.estado[id] : b.enStock) : false;
    return baseOk || M.propios.some((d) => d.equivale === id && d.enStock);
  }
  const nombreFarmaco = (id) => (baseItem(id) ? baseItem(id).nombre : id);
  function presentacion(id) {
    const b = baseItem(id);
    if (b && (id in M.estado ? M.estado[id] : b.enStock)) return b.presentacion;
    const p = M.propios.find((d) => d.equivale === id && d.enStock);
    if (p) return `${p.nombre}${p.presentacion ? " · " + p.presentacion : ""}`;
    return b ? b.presentacion : "";
  }
  function resolver(item) {
    if (enStock(item.f)) return { estado: "ok", f: item.f, dosis: item.dosis, nota: item.nota, original: item.f, kg: item.kg, edadMin: item.edadMin, edadTxt: item.edadTxt };
    const alt = (item.alt || []).find((a) => enStock(a.f));
    if (alt) return { estado: "alt", f: alt.f, dosis: alt.dosis || alt.texto, nota: item.nota, original: item.f, kg: alt.kg, edadMin: alt.edadMin, edadTxt: alt.edadTxt };
    return { estado: "no", original: item.f, dosis: item.dosis, nota: item.nota };
  }

  /* ------------------------------------------------------------ utilidades */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const num = (x) => { const n = parseFloat(String(x).replace(",", ".")); return isNaN(n) ? null : n; };

  function protocolo() {
    if (S.motivo === "general") {
      const sis = window.SISTEMAS.filter((x) => S.sistemas.has(x.id));
      return {
        id: "general", general: true, titulo: S.texto || "Otro motivo", corto: "Manejo general",
        banderas: sis.flatMap((x) => x.banderas), fuentes: ["SAME", "SAE", "PHTLS", "ACLS"],
        soporte: ["Evaluación primaria XABCDE y signos vitales completos.", "O₂ si SatO₂ < 92 %. Acceso venoso. Glucemia capilar.", "Monitor y ECG según el cuadro.", "Tratar el síntoma principal sin demorar el traslado.", "Preaviso al centro receptor."],
        diagnosticos: window.SINTOMATICOS
      };
    }
    return P.find((p) => p.id === S.motivo);
  }
  const todasBanderas = () => [...(protocolo() ? protocolo().banderas : []), ...U];
  const tildadas = (nivel) => todasBanderas().filter((b) => S.banderas.has(b.id) && (!nivel || b.nivel === nivel));

  /* Coincidencia por raíz: "convulsiono" encuentra "convulsion", "desmayada" encuentra "desmayo". */
  const raiz = (w) => (w.length >= 5 ? w.slice(0, Math.max(4, w.length - 2)) : w);
  function coincide(tokens, frase, kw) {
    if (kw.includes(" ")) return (" " + frase + " ").includes(" " + kw + " ") ? 3 + kw.split(" ").length : 0;
    for (const tk of tokens) {
      if (tk === kw) return 2;
      if (kw.length >= 5 && tk.length >= 5 && (tk.startsWith(raiz(kw)) || kw.startsWith(raiz(tk)))) return 1.5;
    }
    return 0;
  }
  function buscar(texto) {
    const frase = norm(texto).replace(/[^a-z0-9ñ ]+/g, " ").replace(/\s+/g, " ").trim();
    if (frase.length < 3) return [];
    const tokens = frase.split(" ");
    return P.map((p) => {
      let score = 0;
      [...p.keywords, p.titulo].forEach((k) => { score += coincide(tokens, frase, norm(k)); });
      if (score && p.ped) score *= esNino() ? 3 : S.pac.tipo === "adulto" || num(S.hc.edad) !== null ? 0.2 : 0.9;
      return { p, score };
    }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score);
  }

  function toast(msg) {
    const old = $(".toast"); if (old) old.remove();
    const el = document.createElement("div");
    el.className = "toast"; el.setAttribute("role", "status"); el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  }
  async function copiar(texto, fallbackId = "hcPlano", msg = "Copiado") {
    try { await navigator.clipboard.writeText(texto); toast(msg); return true; }
    catch (e) {
      const ta = $("#" + fallbackId); if (ta) { ta.value = texto; ta.hidden = false; ta.focus(); ta.select(); }
      toast("Seleccioná el texto y copialo");
      return false;
    }
  }

  /* ------------------------------------------------------------ signos vitales → banderas automáticas */
  function reglasVitales() {
    const v = S.v;
    const tas = num(String(v.ta).split("/")[0]);
    const fc = num(v.fc), fr = num(v.fr), sat = num(v.sat), t = num(v.temp), gcs = num(v.gcs);
    const epoc = S.motivo === "disnea" && /epoc/.test(norm(S.hc.antec + " " + S.texto));
    if (esNino()) {
      const ed = num(S.hc.edad);
      const tasMin = ed === null ? 70 : ed < 1 ? 70 : ed < 10 ? 70 + 2 * ed : 90;
      return {
        u_tas: tas !== null && tas > 0 && tas < tasMin,
        u_fc: false, u_fr: false,
        u_sat: sat !== null && sat > 0 && sat < 92,
        u_temp: t !== null && t >= 40,
        u_hipot: t !== null && t > 0 && t < 35,
        u_gcs: gcs !== null && gcs >= 3 && gcs < 15
      };
    }
    return {
      u_tas: tas !== null && tas > 0 && tas < 90,
      u_fc: fc !== null && fc > 0 && (fc < 50 || fc > 120),
      u_fr: fr !== null && fr > 0 && (fr < 10 || fr > 30),
      u_sat: sat !== null && sat > 0 && sat < (epoc ? 88 : 92),
      u_temp: t !== null && t >= 40,
      u_hipot: t !== null && t > 0 && t < 35,
      u_gcs: gcs !== null && gcs >= 3 && gcs < 15
    };
  }
  function aplicarVitales() {
    const r = reglasVitales();
    Object.entries(r).forEach(([id, on]) => {
      if (on && !S.off.has(id)) { S.banderas.add(id); S.auto.add(id); }
      if (!on && S.auto.has(id)) { S.banderas.delete(id); S.auto.delete(id); }
      if (!on) S.off.delete(id);
    });
  }

  /* ------------------------------------------------------------ historia clínica (orden de la planilla) */
  function dxActual() { const p = protocolo(); return p && p.diagnosticos.find((d) => d.id === S.dx); }
  const esPed = () => { const p = protocolo(); return !!(p && p.ped); };
  const kgPac = () => { const k = num(S.pac.kg); return k && k > 0 ? k : null; };
  const edadBloquea = (x) => x.edadMin && num(S.hc.edad) !== null && num(S.hc.edad) < x.edadMin;
  function medicacion(dx) {
    const vistos = new Set();
    return dx.tratamiento.map((it, i) => {
      const r = Object.assign(resolver(it), { cond: !!it.cond, key: dx.id + ":" + i });
      if (r.kg && kgPac()) r.dosis = textoPed(r.kg, kgPac(), r.dosis);
      r.bloq = edadBloquea(r);
      return r;
    }).filter((r) => {
      if (r.estado === "no" || vistos.has(r.f)) return false;
      vistos.add(r.f); return true;
    });
  }
  function recetaPedTxt(dx) {
    return (dx.recetaPed || []).filter((x) => !edadBloquea(x)).map((x) => `${x.n} ${textoPed(x.kg, kgPac(), "por peso")}`);
  }
  const embInfo = (f) => (S.pac.emb && window.FICHA_EMB && window.FICHA_EMB.items[f]) || null;
  const dado = (r) => !r.bloq && (r.key in S.dados ? S.dados[r.key] : !r.cond && !((embInfo(r.f) || [])[0] === "no"));
  function medicacionDada(dx) { return esNino() && !esPed() ? [] : medicacion(dx).filter(dado); }
  function dosisCorta(t) { return String(t).split(/\.\s|\. /)[0].replace(/\.$/, ""); }
  const enDomicilio = () => S.flujo === "domicilio";

  function camposHC() {
    const p = protocolo();
    const dx = dxActual();
    const v = S.v;
    const rojas = tildadas("rojo"), amarillas = tildadas("amarillo");
    const F = [];
    F.push(["Código", S.codigo ? CODIGOS[S.codigo].label : "—"]);
    F.push(["Edad / Sexo", `${S.hc.edad || "—"} / ${S.hc.sexo || "—"}${esNino() ? " · pediátrico" : ""}${S.pac.kg ? ` · ${S.pac.kg} kg` : ""}${S.pac.emb ? " · embarazada" : ""}`]);
    F.push(["Horarios", `Llegada ${S.horas.llegada || "—"} · Salida ${S.horas.salida || "—"} · Llegada a destino ${S.horas.destino || "—"}`]);
    F.push(["Motivo de la consulta", p ? `${p.titulo}${S.texto && norm(S.texto) !== norm(p.titulo) ? ` (refiere: ${S.texto})` : ""}` : "—"]);
    F.push(["Antec. de enferm. y medicación actual", S.hc.antec || "—"]);
    F.push(["Signos vitales", [
      `TA ${v.ta || "—"}`, `FC ${v.fc || "—"}`, `FR ${v.fr || "—"}`, `ARM ${v.arm || "—"}`,
      `SatO₂ ${v.sat ? v.sat + " %" : "—"}`, `T° ax ${v.temp ? v.temp + " °C" : "—"}`,
      `Glucemia ${v.gluc ? v.gluc + " mg/dl" : "—"}`, `Glasgow ${v.gcs ? v.gcs + "/15" + (S.gcsComp ? ` (O${S.gcsComp.o} V${S.gcsComp.v} M${S.gcsComp.m})` : "") : "—"}`
    ].join(" · ")]);
    F.push(["Cardiovascular", S.hc.cv || "—"]);
    F.push(["Respiratorio", S.hc.resp || "—"]);
    F.push(["Abdomen", S.hc.abd || "—"]);
    F.push(["Neurológico", S.hc.neuro || "—"]);

    let dxTxt = "—", tto = [], meds = [];
    if (enDomicilio() && dx) {
      dxTxt = `${dx.nombre} (CIE-10 ${dx.cie10})`;
      meds = medicacionDada(dx).map((r) => `${nombreFarmaco(r.f)} ${dosisCorta(r.dosis)}`);
      tto = [...meds, ...recetaPedTxt(dx).map((t) => `Rp/ ${t}`), ...dx.receta.map((t) => `Rp/ ${t}`), ...dx.medidas, ...dx.indicaciones];
    } else if (!enDomicilio() && p) {
      dxTxt = `${p.titulo} — criterio de traslado`;
      tto = ["Traslado. Soporte durante el traslado según protocolo."];
    }
    F.push(["Diagnóstico presuntivo", dxTxt]);
    F.push(["Tto. e indicaciones", tto.length ? tto.join(" · ") : "—"]);
    const desc = [...S.hc.desc, ...(S.hc.descOtro ? [S.hc.descOtro] : [])];
    F.push(["Medicación y descartables utilizados", [...meds, ...desc].join(" · ") || "—"]);

    const obs = [];
    if (rojas.length) obs.push("Criterios de traslado: " + rojas.map((b) => b.texto).join("; "));
    if (amarillas.length) obs.push("Precauciones: " + amarillas.map((b) => b.texto).join("; "));
    if (S.override) obs.push("Manejo domiciliario pese a criterio de traslado: decisión médica.");
    if (enDomicilio() && dx) obs.push("Pautas de alarma explicadas: " + dx.alarma.filter((t) => !/^Llamar|^Ante cualquiera/.test(t)).join(" ") + ` Llamar al ${META.emergencias}.`);
    if (S.hc.obs) obs.push(S.hc.obs);
    F.push(["Observaciones", `RCP: ${S.hc.rcp ? "SÍ" : "NO"} · ECG: ${S.hc.ecg ? "SÍ" : "NO"}${obs.length ? " · " + obs.join(" · ") : ""}`]);
    F.push(["Paciente", S.hc.paciente || "—"]);
    F.push(["Internación / Derivación", S.hc.intern || "—"]);
    return F;
  }
  function conductaTxt() {
    if (S.flujo === "derivacion") return "Traslado";
    return S.override ? "Domicilio pese a criterio de traslado" : "Domicilio";
  }
  function filaRegistro() {
    const p = protocolo(), dx = dxActual(), d = new Date(S.inicio || Date.now());
    const pad = (n) => String(n).padStart(2, "0");
    const dom = enDomicilio() && dx;
    const meds = dom ? medicacionDada(dx).map((r) => nombreFarmaco(r.f)) : [];
    const falt = dom ? dx.tratamiento.map(resolver).filter((r) => r.estado === "no").map((r) => nombreFarmaco(r.original)) : [];
    const h = d.getHours();
    const fila = [
      S.caseId, `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, `${pad(h)}:${pad(d.getMinutes())}`,
      h >= 8 && h < 20 ? "Día" : "Noche", S.codigo ? CODIGOS[S.codigo].label : "",
      S.hc.edad, S.hc.sexo, p ? (p.general ? `Otro: ${S.texto}` : p.titulo) : "", p ? p.cie10 || "R69" : "",
      p && p.general ? "Manejo general" : "Protocolo específico",
      dom ? dx.nombre : (S.flujo === "derivacion" ? "Criterio de traslado" : ""), dom ? dx.cie10 : "", dom ? dx.snomed : "",
      tildadas("rojo").map((b) => b.texto).join("; "), tildadas("amarillo").map((b) => b.texto).join("; "),
      conductaTxt(), S.hc.paciente, S.hc.intern, meds.join("; "), falt.join("; "),
      S.hc.rcp ? "Sí" : "No", S.hc.ecg ? "Sí" : "No",
      S.v.ta, S.v.fc, S.v.fr, S.v.sat, S.v.temp, S.v.gluc, S.v.gcs, META.version,
      esNino() ? "Pediátrico" : (S.pac.tipo === "adulto" || S.hc.edad ? "Adulto" : ""), S.pac.kg, S.pac.emb ? "Sí" : "",
      S.horas.llegada, S.horas.salida, S.horas.destino
    ];
    return fila.map((x) => String(x == null ? "" : x).replace(/[\t\r\n]+/g, " ").trim());
  }
  function guardarRegistro() {
    if (!S.flujo || !S.caseId) return false;
    const fila = filaRegistro();
    const i = REG.findIndex((r) => r[0] === S.caseId);
    if (i >= 0) REG[i] = fila; else REG.push(fila);
    saveReg();
    setTimeout(() => enviarPendientes(false), 300);
    return true;
  }
  const tsv = (filas) => filas.map((f) => f.join("\t")).join("\n");

  const textoHC = () => camposHC().map(([k, v]) => `${k.toUpperCase()}: ${v}`).join("\n");

  /* ------------------------------------------------------------ piezas de UI */
  function header(titulo, { back = true, chip = true, extra = "", logo = false } = {}) {
    const c = S.codigo;
    return `<header class="top"><div class="wrap topin">
      ${back ? `<button class="back" data-act="back" aria-label="Volver">‹</button>` : ""}
      ${logo ? LOGO : ""}
      <h1>${esc(titulo)}</h1>
      ${chip ? `<span class="chip ${c || "none"}">${c ? "Código " + CODIGOS[c].label : "Sin código"}</span>` : ""}
      ${extra}
      <button class="back nota" data-act="nota" aria-label="Anotar un problema de la app"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg></button>
    </div></header>`;
  }
  const bar = (html) => `<nav class="bar"><div class="wrap">${html}</div></nav>`;

  function barTriage() {
    const r = tildadas("rojo").length, a = tildadas("amarillo").length;
    if (r) return `<button class="btn danger" data-act="evaluar">Trasladar · criterio de guía</button>`;
    if (a) return `<button class="btn warn" data-act="evaluar">Domicilio con precauciones (${a})</button>`;
    return `<button class="btn primary" data-act="evaluar">Sin banderas: resolver en domicilio</button>`;
  }

  function vitalesHTML() {
    const lab = (k, l) => `<button type="button" class="vlab" data-act="vinfo" data-k="${k}" aria-label="${l}: ver cómo se mide">${l}<i aria-hidden="true">i</i></button>`;
    const inp = (k, l, mode = "numeric") => `<input data-v="${k}" type="text" inputmode="${mode}" ${mode === "numeric" ? 'pattern="[0-9]*"' : ""} autocomplete="off" placeholder="${NORMALES[k]}" value="${esc(S.v[k])}" aria-label="${l}">`;
    const f = (k, l, mode) => `<div class="vf">${lab(k, l)}${inp(k, l, mode)}</div>`;
    const gcsTxt = S.gcsComp ? ` <em class="gcomp">O${S.gcsComp.o} V${S.gcsComp.v} M${S.gcsComp.m}</em>` : "";
    return `<div class="vitals">
      <div class="vf ta">${lab("ta", "TA")}<div class="tain">${inp("tas", "TA sistólica")}<span aria-hidden="true">/</span>${inp("tad", "TA diastólica")}</div></div>
      ${f("fc", "FC")}${f("fr", "FR")}${f("sat", "SatO₂")}
      ${f("temp", "T° axilar", "decimal")}${f("gluc", "Glucemia")}
      <div class="vf">${lab("gcs", "Glasgow")}${inp("gcs", "Glasgow")}${gcsTxt}</div>
      <div class="vf">${lab("arm", "ARM")}<button type="button" class="armv" data-act="vinfo" data-k="arm">${esc(S.v.arm || "—")}</button></div>
    </div>
    <div class="vhelp"><span class="hint">Tocá el nombre de cada signo para ver cómo se mide. Los números grises son los valores normales de un adulto.</span>
      <button type="button" class="btn sm ghost" data-act="vnormales">Completar vacíos con normales</button></div>`;
  }

  /* Hoja inferior con técnica, rangos y escalas */
  function abrirHoja(k) {
    const d = VINFO[k]; if (!d) return;
    const rangos = d.rangos.length ? `<div class="rg">${d.rangos.map(([v, l, t]) => `<div class="r ${t}"><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join("")}</div>` : "";
    const ped = d.pedT ? `<p class="label">Niños (despierto)</p><div class="pedt">${d.pedT.map(([a, v]) => `<div><span>${esc(a)}</span><b>${esc(v)}</b></div>`).join("")}</div>` : (d.ped ? `<p class="hint">${esc(d.ped)}</p>` : "");
    let extra = "";
    if (k === "gcs") {
      const c = S.gcsComp || {};
      extra = `<div class="gcs">${GCS.map((g) => `<div class="gg"><p class="label">${esc(g.t)}</p>${g.ops.map(([n, t]) => `<button type="button" data-act="gsel" data-g="${g.k}" data-n="${n}" aria-pressed="${c[g.k] === n}"><b>${n}</b><span>${esc(t)}</span></button>`).join("")}</div>`).join("")}</div>
        <div class="gtotal" id="gtotal">${gcsTotalHTML()}</div>`;
    }
    if (k === "fc" || k === "fr") {
      extra = `<button type="button" class="btn primary contar" data-act="contar" data-k="${k}">Contar ${k === "fc" ? "la frecuencia cardíaca" : "la frecuencia respiratoria"}</button>`;
    }
    if (k === "arm") {
      extra = `<div class="seg">${ARM_OPS.map((o) => `<button type="button" data-act="armsel" data-val="${esc(o)}" aria-pressed="${S.v.arm === o}">${esc(o)}</button>`).join("")}</div>`;
    }
    const h = $("#hoja");
    h.innerHTML = `<div class="hoja-bg" data-act="hojaX"></div>
      <section class="hoja-p" role="dialog" aria-modal="true" aria-labelledby="hojaT">
        <header><h2 id="hojaT">${esc(d.t)}${d.u ? ` <small>${esc(d.u)}</small>` : ""}</h2><button type="button" class="back" data-act="hojaX" aria-label="Cerrar">×</button></header>
        <div class="hoja-b">
          ${extra}
          ${rangos}
          ${d.alerta ? `<div class="alert warn"><p>${esc(d.alerta)}</p></div>` : ""}
          ${ped}
          <p class="label">Cómo se mide</p><ol class="steps">${d.como.map((t, i) => `<li><span class="key">${i + 1}</span><span>${esc(t)}</span></li>`).join("")}</ol>
          <p class="hint">Fuente: ${esc(d.fuente)}</p>
        </div>
      </section>`;
    h.hidden = false;
    document.body.classList.add("lock");
    const btn = h.querySelector(".hoja-p .back"); if (btn) btn.focus();
  }
  function cerrarHoja() { pararContador(); pantallaEncendida(location.hash === "#soporte"); const h = $("#hoja"); if (h) { h.hidden = true; h.innerHTML = ""; } document.body.classList.remove("lock"); }

  /* ------------------------------------------------------------ contador de FC y FR */
  const CT = { k: null, dur: 30, t0: 0, taps: [], timer: null, fin: false, audio: null };
  const CT_TXT = {
    fc: { t: "Contar FC", u: "lpm", pad: "Tocá en cada latido", ini: "Tocá acá en el primer latido para empezar", rojo: (v) => v < 50 || v > 120, amar: (v) => v > 100 },
    fr: { t: "Contar FR", u: "rpm", pad: "Tocá en cada respiración (cuando sube el tórax)", ini: "Tocá acá en la primera respiración para empezar", rojo: (v) => v < 10 || v > 30, amar: (v) => v > 20 }
  };
  function pararContador() { if (CT.timer) { clearInterval(CT.timer); CT.timer = null; } }
  function abrirContador(k) {
    pararContador(); pantallaEncendida(true);
    Object.assign(CT, { k, t0: 0, taps: [], fin: false });
    const d = CT_TXT[k];
    $("#hoja").innerHTML = `<div class="hoja-bg" data-act="hojaX"></div>
      <section class="hoja-p ct" role="dialog" aria-modal="true" aria-labelledby="hojaT">
        <header><h2 id="hojaT">${d.t}</h2><button type="button" class="back" data-act="hojaX" aria-label="Cerrar">×</button></header>
        <div class="hoja-b">
          <div class="seg">${[15, 30, 60].map((n) => `<button type="button" data-act="ctdur" data-n="${n}" aria-pressed="${CT.dur === n}">${n} s</button>`).join("")}</div>
          <button type="button" id="pad" class="pad" aria-live="polite"></button>
          <div id="ctRes"></div>
          <p class="hint">${k === "fc" ? "Ritmo irregular o FC > 150: contá 60 s y confirmá con monitor." : "Contá sin que el paciente lo note. En niños, 60 s."}</p>
        </div>
      </section>`;
    pintarContador();
  }
  function ctCalculo() {
    const t = CT.taps, n = t.length;
    if (n < 3) return null;
    const iv = []; for (let i = 1; i < n; i++) iv.push(t[i] - t[i - 1]);
    const prom = iv.reduce((a, b) => a + b, 0) / iv.length;
    const de = Math.sqrt(iv.reduce((a, b) => a + (b - prom) ** 2, 0) / iv.length);
    return { v: Math.round(60000 / prom), irregular: n >= 5 && de / prom > 0.2 };
  }
  function pintarContador() {
    const d = CT_TXT[CT.k], pad = $("#pad"), res = $("#ctRes");
    if (!pad) return;
    const corriendo = CT.t0 && !CT.fin;
    const resta = corriendo ? Math.max(0, CT.dur - (Date.now() - CT.t0) / 1000) : CT.dur;
    const c = ctCalculo();
    pad.className = "pad" + (corriendo ? " on" : "") + (CT.fin ? " fin" : "");
    pad.innerHTML = CT.fin
      ? `<b>${c ? c.v : "—"}</b><span>${d.u}</span><small>Terminado · ${CT.taps.length} toques</small>`
      : corriendo
        ? `<b>${Math.ceil(resta)}</b><span>segundos</span><small>${d.pad} · ${CT.taps.length}</small>`
        : `<b>${CT.dur}</b><span>segundos</span><small>${d.ini}</small>`;
    if (corriendo) pad.style.setProperty("--p", `${(1 - resta / CT.dur) * 100}%`); else pad.style.removeProperty("--p");
    if (!res) return;
    const reiniciar = CT.fin ? `<button type="button" class="btn" data-act="ctreset">Volver a contar</button>` : "";
    if (!c) { res.innerHTML = corriendo ? `<p class="hint">Tocá por lo menos 3 veces para calcular.</p>` : (CT.fin ? `<p class="hint">Hicieron falta al menos 3 toques.</p><div class="row-btns">${reiniciar}</div>` : ""); return; }
    const tono = d.rojo(c.v) ? "rojo" : d.amar(c.v) ? "amarillo" : "verde";
    res.innerHTML = `<div class="ctval ${tono}"><span>${CT.fin ? "Resultado" : "Estimado"}</span><b>${c.v} ${d.u}</b>${c.irregular ? `<em>Intervalos irregulares: contá 60 s y confirmá con monitor</em>` : ""}</div>
      <div class="row-btns">${corriendo ? `<button type="button" class="btn" data-act="ctstop">Terminar ahora</button>` : ""}${reiniciar}<button type="button" class="btn primary" data-act="ctusar" data-v="${c.v}">Usar ${c.v} ${d.u}</button></div>`;
  }
  function ctAviso() {
    try { if (navigator.vibrate) navigator.vibrate([180, 90, 180]); } catch (e) { /* nada */ }
    try {
      const a = CT.audio; if (!a) return;
      const o = a.createOscillator(), g = a.createGain();
      o.frequency.value = 880; g.gain.value = 0.15; o.connect(g); g.connect(a.destination);
      o.start(); o.stop(a.currentTime + 0.35);
    } catch (e) { /* nada */ }
  }
  function ctTerminar() { pararContador(); CT.fin = true; ctAviso(); pintarContador(); }
  function ctToque() {
    const ahora = Date.now();
    if (CT.fin) return; // terminado: los toques en la zona de conteo no hacen nada
    if (!CT.t0) {
      try { CT.audio = CT.audio || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { CT.audio = null; }
      CT.t0 = ahora; CT.taps = [ahora];
      CT.timer = setInterval(() => { if ((Date.now() - CT.t0) / 1000 >= CT.dur) ctTerminar(); else pintarContador(); }, 200);
    } else CT.taps.push(ahora);
    try { if (navigator.vibrate) navigator.vibrate(15); } catch (e) { /* nada */ }
    pintarContador();
  }
  document.addEventListener("pointerdown", (e) => {
    if (e.target.closest && e.target.closest("#pad")) { e.preventDefault(); ctToque(); }
  });
  function gcsTotalHTML() {
    const c = S.gcsComp || {};
    const listo = c.o && c.v && c.m;
    const tot = listo ? c.o + c.v + c.m : null;
    const tono = !listo ? "" : tot <= 8 ? "rojo" : tot <= 12 ? "amarillo" : "verde";
    return `<div class="gsum ${tono}"><span>Total</span><b>${listo ? tot : "—"}</b><span>${listo ? `O${c.o} V${c.v} M${c.m}` : "Elegí los tres componentes"}</span></div>
      <button type="button" class="btn primary" data-act="gusar" ${listo ? "" : "disabled"}>${listo ? `Usar Glasgow ${tot}` : "Usar"}</button>`;
  }
  function vitalCambio() {
    const t = $$("input[data-v]");
    t.forEach((i) => { if (document.activeElement !== i) i.value = S.v[i.dataset.v] || ""; });
    const arm = $(".armv"); if (arm) arm.textContent = S.v.arm || "—";
    if (actual() === "triage") { aplicarVitales(); refrescarTriage(); } else refrescarHC();
  }

  function flagHTML(b) {
    return `<label class="flag ${b.nivel}"><input type="checkbox" data-act="flag" data-id="${b.id}" ${S.banderas.has(b.id) ? "checked" : ""}><span class="box" aria-hidden="true"></span><span class="ft">${esc(b.texto)}${S.auto.has(b.id) ? ` <em class="autot">automático</em>` : ""}</span></label>`;
  }

  function conductaList(list) {
    return `<ul class="cond">${list.map((b) => `<li class="${b.nivel}"><b>${esc(b.texto)}</b><span>${esc(b.conducta)}</span></li>`).join("")}</ul>`;
  }

  /* ------------------------------------------------------------ vistas */
  const V = {};

  function resultados() {
    const res = buscar(S.texto);
    const L = esNino() ? [...P.filter((p) => p.ped), ...P.filter((p) => !p.ped)] : [...P.filter((p) => !p.ped), ...P.filter((p) => p.ped)];
    const boton = (p) => `<button class="motivo${res.some((r) => r.p.id === p.id) ? " match" : ""}" data-act="motivo" data-id="${p.id}">${esc(p.titulo)}</button>`;
    const escrito = S.texto.trim().length >= 3;
    return `${escrito ? `<div class="sugeridos">
        ${res.length ? `<p class="label" style="margin:8px 0 0">${res.length > 1 ? "¿Cuál se parece más?" : "Coincidencia"}</p>${res.slice(0, 3).map((r) => `<button class="sug" data-act="motivo" data-id="${r.p.id}"><b>${esc(r.p.titulo)}</b><span>Protocolo específico</span></button>`).join("")}` : `<p class="hint" style="margin-top:8px">No hay un protocolo específico para "${esc(S.texto)}".</p>`}
        <button class="sug gen" data-act="motivo" data-id="general"><b>Manejo general por aparato</b><span>Para "${esc(S.texto)}": banderas por sistema y tratamiento sintomático</span></button>
      </div>` : ""}
      <p class="label" style="margin-top:22px">Motivos frecuentes</p>
      <div class="motivos">${L.slice(0, 10).map(boton).join("")}</div>
      <details class="mas"${escrito && res.some((r) => L.indexOf(r.p) >= 10) ? " open" : ""}><summary>Más motivos (${L.length - 10})</summary><div class="motivos">${L.slice(10).map(boton).join("")}</div></details>`;
  }

  V.inicio = () => {
    const tema = document.documentElement.getAttribute("data-theme") === "light" ? "☾" : "☀";
    return `${header("Sirena", { back: false, chip: false, logo: true, extra: `<button class="back" data-act="tema" aria-label="Cambiar tema claro u oscuro">${tema}</button>` })}
    <main class="wrap">
      ${S.retomable && !S.motivo ? (() => { const c = S.retomable; const pr = P.find((x) => x.id === c.motivo); const min = Math.round((Date.now() - c.guardado) / 60000);
        return `<div class="alert warn"><p class="k">Atención sin terminar</p><p>${esc(pr ? pr.titulo : c.texto || "Otro motivo")} · hace ${min < 1 ? "menos de 1 min" : min < 60 ? min + " min" : Math.round(min / 60) + " h"}</p>
        <div class="row-btns"><button class="btn sm" data-act="descartar">Descartar</button><button class="btn sm primary" data-act="retomar">Retomar</button></div></div>`; })() : ""}
      <section>
        <p class="label">Código de despacho</p>
        <div class="codes">${Object.entries(CODIGOS).map(([k, v]) => `<button class="code" data-c="${k}" data-act="codigo" aria-pressed="${S.codigo === k}">${v.label}<small>${v.sub}</small></button>`).join("")}</div>
      </section>
      ${S.codigo === "rojo" ? `<div class="alert"><p class="k" style="font-size:18px">Código rojo</p><p>Evaluación primaria XABCDE. No responde y no respira: <b>RCP</b>.</p><div class="row-btns"><button class="btn danger sm" data-act="go" data-to="soporte">Abrir RCP y soporte vital</button></div></div>` : ""}
      <section>
        <p class="label">Motivo de consulta</p>
        <div class="search"><input id="q" type="search" autocomplete="off" placeholder="Escribí el motivo (ej. falta de aire)" value="${esc(S.texto)}" aria-label="Escribir motivo de consulta"></div>
        <div class="pac">${pacienteHTML()}</div>
        <div id="res">${resultados()}</div>
      </section>
      <button class="reglink" data-act="go" data-to="registro"><span>Registro de atenciones</span><b class="chip ${REG.length ? "amarillo" : "none"}">${REG.length} pendiente${REG.length === 1 ? "" : "s"}</b></button>
      <p class="disclaimer">${esc(META.estado)}. ${esc(META.poblacion)} La decisión final es del médico actuante. Emergencias: ${esc(META.emergencias)}. <b>Versión ${esc(META.version)}</b></p>
    </main>`;
  };

  V.triage = () => {
    const p = protocolo();
    const grupo = (arr, nivel) => arr.filter((b) => b.nivel === nivel);
    const rojasP = grupo(p.banderas, "rojo"), amarP = grupo(p.banderas, "amarillo");
    return `${header(p.titulo)}
    <main class="wrap">
      ${p.general ? `<div class="alert warn"><p class="k">Manejo general · sin protocolo específico</p><p>Elegí el o los aparatos comprometidos para ver sus banderas. No reemplaza un protocolo específico: aplicá tu criterio.</p></div>
      <section><p class="label">Aparatos comprometidos</p><div class="chips">${window.SISTEMAS.map((x) => `<button data-act="sis" data-id="${x.id}" aria-pressed="${S.sistemas.has(x.id)}">${esc(x.nombre)}</button>`).join("")}</div></section>` : ""}
      <div class="horas mini">${horaHTML("llegada", "Hora de llegada")}</div>
      <section><p class="label">Signos vitales</p>${vitalesHTML()}<p class="hint" style="margin-top:8px">${esNino() ? "Pediátrico: la FC y la FR no se marcan solas porque dependen de la edad. Tocá FC o FR para ver la tabla. La TA usa el umbral de hipotensión pediátrico." : "Al cargarlos se marcan solas las banderas que correspondan. Podés destildarlas."}</p></section>
      <div class="legend"><span><i class="sq rojo"></i>Roja: criterio de traslado según guía</span><span><i class="sq amarillo"></i>Amarilla: domicilio con conducta específica</span></div>
      ${rojasP.length ? `<section><p class="label">Banderas rojas · ${esc(p.corto)}</p><div class="group">${rojasP.map(flagHTML).join("")}</div></section>` : ""}
      ${amarP.length ? `<section><p class="label">Banderas amarillas · ${esc(p.corto)}</p><div class="group">${amarP.map(flagHTML).join("")}</div></section>` : ""}
      <section><p class="label">Generales (todos los motivos)</p><div class="group">${U.map(flagHTML).join("")}</div></section>
      <p class="hint">Fuentes: ${p.fuentes.join(" · ")}</p>
    </main>
    ${bar(barTriage())}`;
  };

  V.derivacion = () => {
    const p = protocolo();
    const rojas = tildadas("rojo"), amar = tildadas("amarillo");
    return `${header(p.titulo)}
    <main class="wrap">
      <div class="alert" role="alert"><p class="k">CRITERIO DE DERIVACIÓN — TRASLADO INMEDIATO</p><p>Según guía, ${rojas.length === 1 ? "esta bandera indica" : "estas banderas indican"} traslado.</p></div>
      <section><p class="label">Qué indica la guía</p>${conductaList(rojas)}</section>
      ${amar.length ? `<section><p class="label">Además, precauciones</p>${conductaList(amar)}</section>` : ""}
      <section><p class="label">Soporte vital para el traslado</p><ul class="list">${p.soporte.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></section>
      <div class="row-btns"><button class="btn sm" data-act="go" data-to="soporte">RCP · Soporte vital</button></div>
      <section>
        <p class="label">Decisión médica</p>
        <p class="hint">Si según tu evaluación el paciente puede manejarse en domicilio, podés continuar. Queda registrado en la historia clínica.</p>
        <div class="row-btns" style="margin-top:10px"><button class="btn ghost" data-act="override1">Seguir de todos modos</button></div>
        <div id="confirm" hidden style="margin-top:10px"><div class="alert warn"><p class="k">¿Confirmás manejo domiciliario?</p><p>Se registra como decisión médica pese a criterio de traslado.</p>
          <div class="row-btns"><button class="btn sm" data-act="override0">Cancelar</button><button class="btn sm primary" data-act="override2">Confirmo</button></div></div></div>
      </section>
    </main>
    ${bar(`<button class="btn" data-act="nuevo">Nueva HC</button><button class="btn primary" data-act="go" data-to="hc">Historia clínica</button>`)}`;
  };

  V.domicilio = () => {
    const p = protocolo();
    const dx = dxActual();
    const amar = tildadas("amarillo");
    let html = `${header(p.titulo)}<main class="wrap">`;
    if (S.override) html += `<div class="alert warn"><p class="k">Domicilio pese a criterio de traslado</p><p>Decisión médica. Reforzar pautas de alarma y asegurar reevaluación.</p></div>`;
    else if (amar.length) html += `<div class="alert warn"><p class="k">Domicilio con precauciones</p><p>Cumplir la conducta de cada bandera amarilla.</p></div>${conductaList(amar)}`;
    else html += `<div class="alert ok"><p class="k">Sin banderas</p><p>Resolución domiciliaria habilitada.</p></div>`;

    html += `<section><p class="label">Diagnóstico presuntivo</p>`;
    html += p.diagnosticos.length
      ? `<div class="dx">${p.diagnosticos.map((d) => `<button data-act="dx" data-id="${d.id}" aria-pressed="${S.dx === d.id}"><b>${esc(d.nombre)}</b><span>${esc(d.criterio)}</span></button>`).join("")}</div>`
      : `<p class="hint">No hay diagnósticos cargados para este motivo. Registrá la conducta en la historia clínica.</p>`;
    html += `</section>`;

    if (dx) {
      const meds = medicacion(dx);
      const filas = dx.tratamiento.map(resolver);
      const cuenta = { ok: 0, alt: 0, no: 0 };
      filas.forEach((r) => cuenta[r.estado]++);
      html += `<article class="block" id="b1"><h2><span class="n">1</span>Medicación a administrar</h2><div class="body">
        ${esPed() && !kgPac() ? `<div class="alert warn"><p class="k">Cargá el peso</p><p>Las dosis se calculan con el peso del niño.</p><div class="pacdatos"><label class="vf"><span>Peso</span><input data-pac="kg" data-rd="1" type="text" inputmode="decimal" autocomplete="off" placeholder="kg" value="${esc(S.pac.kg)}" aria-label="Peso en kg"></label></div></div>` : ""}
        ${esPed() && kgPac() ? `<p class="hint">Dosis calculadas para ${esc(S.pac.kg)} kg. Verificá la concentración del envase.</p>` : ""}
        ${esNino() && !esPed() ? `<div class="alert warn"><p class="k">Paciente pediátrico</p><p>Las dosis de este protocolo son de adulto. Calculá por peso en la ficha de medicación pediátrica${S.pac.kg ? ` (${esc(S.pac.kg)} kg cargados)` : ""}.</p><div class="row-btns"><button class="btn sm primary" data-act="go" data-to="f-ped">Abrir medicación pediátrica</button></div></div>` : `<p class="hint">Tildado = administrado (pasa a la historia clínica). Los marcados "según cuadro" solo si corresponde.</p>
        ${S.pac.emb ? `<div class="alert warn"><p><b>Embarazada:</b> cada fármaco indica si se puede usar. Los contraindicados quedan sin tildar.</p></div>` : ""}
        ${meds.length ? meds.map((r) => r.bloq ? `<div class="rx off"><b>${esc(nombreFarmaco(r.f))}</b><span class="note">No indicado a esta edad. ${esc(r.edadTxt || "")}.</span></div>` : `<div class="rx${r.cond ? " cond" : ""}"><label class="given"><input type="checkbox" data-act="dado" data-key="${r.key}" ${dado(r) ? "checked" : ""}><span class="box" aria-hidden="true"></span><b>${esc(nombreFarmaco(r.f))}</b>${r.cond ? `<em class="condt">según cuadro</em>` : ""}</label><span class="pres">${esc(presentacion(r.f))}</span><span>${esc(r.dosis)}</span>${r.estado === "alt" ? `<span class="note">Sustituye a ${esc(nombreFarmaco(r.original))} (sin stock).</span>` : ""}${r.nota ? `<span class="note">${esc(r.nota)}</span>` : ""}${embInfo(r.f) ? `<span class="embn ${embInfo(r.f)[0]}">Embarazo: ${esc(embInfo(r.f)[1])}</span>` : ""}</div>`).join("")
          : `<p class="hint">${dx.tratamiento.length ? "Ningún fármaco indicado está en el maletín. Ver bloque 3." : "Este cuadro no requiere medicación del maletín."}</p>`}`}
      </div></article>
      <article class="block"><h2><span class="n">2</span>Indicaciones al paciente</h2><div class="body">
        ${dx.medidas.length || dx.indicaciones.length ? `<div><h3>Indicaciones</h3><ul>${[...dx.medidas, ...dx.indicaciones].map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>` : ""}
        ${(dx.recetaPed || []).length ? `<div><h3>Para indicar${kgPac() ? ` · ${esc(S.pac.kg)} kg` : ""}</h3><div class="pdg">${dx.recetaPed.map((x) => {
          if (edadBloquea(x)) return `<div class="pd off"><div class="pdh"><b>${esc(x.n)}</b></div><p class="pdx">No indicado a esta edad. ${esc(x.edadTxt)}.</p></div>`;
          const c = kgPac() ? calcPed(x.kg, kgPac()) : null;
          return `<div class="pd"><div class="pdh"><b>${esc(x.n)}</b></div>${c ? `<div class="pdd"><span class="big">${esc(c.dosis)}</span><span>${esc(x.kg.via || "")}</span></div>${c.ml.map((m) => `<span class="pdm">${esc(m)}</span>`).join("")}` : `<span class="pdm">Cargá el peso para calcular</span>`}<span class="pdf">${esc(x.kg.frec || "")}</span>${x.edadTxt ? `<span class="pdn">${esc(x.edadTxt)}.</span>` : ""}${x.nota ? `<span class="pdn">${esc(x.nota)}</span>` : ""}</div>`;
        }).join("")}</div></div>` : ""}
        ${dx.receta.length ? `<div><h3>Prescripción</h3>${esNino() && !esPed() ? `<p class="embn no">Dosis de adulto: ajustar por peso.</p>` : ""}${S.pac.emb ? `<p class="embn prec">Embarazada: revisá la receta. AINE (ibuprofeno, diclofenac) contraindicados desde la semana 20; IECA contraindicados siempre.</p>` : ""}<ul>${dx.receta.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>` : ""}
        <div><h3>Pautas de alarma</h3><ul>${dx.alarma.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>
      </div></article>
      <article class="block"><h2><span class="n">3</span>Guía vs. maletín</h2><div class="body">
        ${filas.length ? `<div class="summary"><span class="chip verde">${cuenta.ok} disponible${cuenta.ok === 1 ? "" : "s"}</span><span class="chip amarillo">${cuenta.alt} sustituido${cuenta.alt === 1 ? "" : "s"}</span><span class="chip rojo">${cuenta.no} faltante${cuenta.no === 1 ? "" : "s"}</span></div>
        <div class="cmp">${filas.map((r) => {
          if (r.estado === "ok") return `<div class="row"><span class="st ok" aria-label="Disponible">✓</span><div><b>${esc(nombreFarmaco(r.f))}</b><small>Indicado por la guía y disponible.</small></div></div>`;
          if (r.estado === "alt") return `<div class="row"><span class="st alt" aria-label="Sustituido">↺</span><div><b>${esc(nombreFarmaco(r.original))}</b><small>Sin stock. Alternativa disponible: ${esc(nombreFarmaco(r.f))}.</small></div></div>`;
          return `<div class="row"><span class="st no" aria-label="Faltante">✕</span><div><b>${esc(nombreFarmaco(r.original))}</b><small>Sin stock ni alternativa. Guía: ${esc(r.dosis)} Indicar por receta o reconsiderar traslado.</small></div></div>`;
        }).join("")}</div>` : `<p class="hint">La guía no indica fármacos del maletín para este cuadro.</p>`}
        <p class="hint">Fuentes: ${p.fuentes.join(" · ")}</p>
      </div></article>`;
    }
    html += `</main>`;
    html += bar(`<button class="btn" data-act="nuevo">Nueva HC</button><button class="btn primary" data-act="go" data-to="hc"${dx || !p.diagnosticos.length ? "" : " disabled"}>Historia clínica</button>`);
    return html;
  };

  V.hc = () => {
    const seg = (key, opts) => `<div class="seg">${opts.map((o) => `<button data-act="hcset" data-k="${key}" data-val="${esc(o)}" aria-pressed="${S.hc[key] === o}">${esc(o)}</button>`).join("")}</div>`;
    const yn = (key, label) => `<div class="yn"><span>${label}</span><button data-act="hcbool" data-k="${key}" data-val="1" aria-pressed="${S.hc[key]}">Sí</button><button data-act="hcbool" data-k="${key}" data-val="0" aria-pressed="${!S.hc[key]}">No</button></div>`;
    const hall = (k, l) => `<div class="hall"><div class="hall-h"><span>${l}</span><button class="btn sm ghost" data-act="normal" data-k="${k}">Normal</button></div><textarea data-hc="${k}" rows="2" aria-label="${l}">${esc(S.hc[k])}</textarea></div>`;
    return `${header("Historia clínica")}
    <main class="wrap">
      <p class="hint">Mismo orden que la planilla en papel. Los datos filiatorios (nombre, DNI, domicilio, obra social) se completan a mano.</p>
      <section class="form"><p class="label">Paciente</p><div class="pac">${pacienteHTML()}</div></section>
      <section class="form"><p class="label">Horarios</p><div class="horas">${horaHTML("llegada", "Llegada")}${horaHTML("salida", "Salida")}${horaHTML("destino", "Llegada a destino")}</div></section>
      <section class="form"><p class="label">Antec. de enferm. y medicación actual</p><textarea data-hc="antec" rows="2" aria-label="Antecedentes y medicación actual" placeholder="Ej. HTA, DBT2. Enalapril 10 mg/día">${esc(S.hc.antec)}</textarea></section>
      <section class="form"><p class="label">Signos vitales</p>${vitalesHTML()}</section>
      <section class="form"><p class="label">Hallazgos</p>${hall("cv", "Cardiovascular")}${hall("resp", "Respiratorio")}${hall("abd", "Abdomen")}${hall("neuro", "Neurológico")}</section>
      <section class="form"><p class="label">Descartables utilizados</p>
        <div class="chips">${DESCARTABLES.map((d) => `<button data-act="desc" data-val="${esc(d)}" aria-pressed="${S.hc.desc.has(d)}">${esc(d)}</button>`).join("")}</div>
        <input data-hc="descOtro" placeholder="Otros" value="${esc(S.hc.descOtro)}" aria-label="Otros descartables">
      </section>
      <section class="form"><p class="label">Observaciones</p>${yn("rcp", "RCP")}${yn("ecg", "ECG")}<textarea data-hc="obs" rows="2" aria-label="Observaciones" placeholder="Otras observaciones">${esc(S.hc.obs)}</textarea></section>
      <section class="form"><p class="label">Paciente</p>${seg("paciente", PACIENTE)}</section>
      <section class="form"><p class="label">Internación / Derivación</p>${seg("intern", INTERNACION)}</section>
      <section><p class="label">Para transcribir a la planilla</p><div class="sheet" id="hcPrev">${previewHC()}</div>
        <textarea id="hcPlano" class="hc" hidden aria-label="Texto plano de la historia clínica">${esc(textoHC())}</textarea></section>
    </main>
    ${bar(`<div class="bar3"><button class="btn" data-act="copiar">Copiar HC</button><button class="btn" data-act="guardarReg">Guardar en registro</button><button class="btn primary" data-act="nuevo">Nueva HC</button></div>`)}`;
  };
  function horaHTML(k, l) {
    return `<div class="hora"><span>${esc(l)}</span><input type="time" data-hora="${k}" value="${esc(S.horas[k])}" aria-label="${esc(l)}"><button type="button" class="btn sm" data-act="ahora" data-k="${k}">Ahora</button></div>`;
  }
  function previewHC() {
    return camposHC().map(([k, v]) => `<div class="sr"><span class="sk">${esc(k)}</span><span class="sv2">${esc(v)}</span></div>`).join("");
  }

  V.registro = () => {
    const url = planilla();
    return `${header("Registro", { chip: false })}
    <main class="wrap">
      <p class="hint">Cada atención queda como una fila sin datos personales. ${urlEnvio() ? "Con el envío automático activado, se mandan solas a la planilla cuando hay señal." : "Copiá las pendientes y pegalas en tu planilla de Google Sheets, en la primera fila vacía de la hoja Registro, o activá el envío automático más abajo."}</p>
      <div class="alert ${REG.length ? "warn" : "ok"}"><p class="k">${REG.length ? `${REG.length} ${REG.length > 1 ? "atenciones pendientes" : "atención pendiente"}` : "Nada pendiente"}</p><p>${REG.length ? (urlEnvio() ? (envioError ? "No se pudieron enviar todavía. Quedan guardadas y se reintenta solo." : navigator.onLine ? "Se están enviando." : "Sin señal: se envían cuando vuelva.") : "Se guardan en este teléfono hasta que las pegues.") : "Todo pasado a la planilla."}${urlEnvio() ? ` · ${ultimoEnvio()}` : ""}</p>
        ${urlEnvio() && (REG.length || NOTAS.length) ? `<div class="row-btns"><button class="btn sm primary" data-act="enviar"${enviando ? " disabled" : ""}>${enviando ? "Enviando…" : "Enviar ahora"}</button></div>` : ""}</div>
      ${REG.length ? `<div class="group">${REG.map((r) => `<div class="drug"><div class="t"><b>${esc(r[7])}</b><small>${esc(r[1].split("-").reverse().join("/"))} ${esc(r[2])} · ${esc(r[15])}${r[10] ? " · " + esc(r[10]) : ""}</small></div><button class="del" data-act="delReg" data-id="${esc(r[0])}" aria-label="Quitar atención">×</button></div>`).join("")}</div>
      <div class="row-btns"><button class="btn primary" data-act="copiarReg">Copiar ${REG.length} fila${REG.length > 1 ? "s" : ""}</button></div>
      <div id="vaciar" hidden class="alert warn"><p class="k">¿Ya las pegaste en la planilla?</p><p>Al vaciar, se borran de este teléfono.</p>
        <div class="row-btns"><button class="btn sm" data-act="vaciar0">Todavía no</button><button class="btn sm danger" data-act="vaciar2">Sí, vaciar pendientes</button></div></div>` : ""}
      <textarea id="regPlano" class="hc" hidden aria-label="Filas para pegar"></textarea>
      <section class="form"><p class="label">Notas de prueba · ${NOTAS.length}</p>
        ${NOTAS.length ? `<ul class="cond">${NOTAS.map((n, i) => `<li class="amarillo"><b>${esc(n[1])} ${esc(n[2])} · ${esc(n[3])}</b><span>${esc(n[5])}</span></li>`).join("")}</ul>
        <div class="row-btns"><button class="btn sm primary" data-act="copiarNotas">Copiar ${NOTAS.length} nota${NOTAS.length > 1 ? "s" : ""}</button><button class="btn sm ghost" data-act="vaciarNotas1">Vaciar</button></div>
        <div id="vaciarN" hidden class="alert warn"><p>¿Ya las pegaste en la hoja Notas de la planilla?</p><div class="row-btns"><button class="btn sm" data-act="vaciarNotas0">Todavía no</button><button class="btn sm danger" data-act="vaciarNotas2">Sí, vaciar</button></div></div>`
          : `<p class="hint">Tocá el lápiz de arriba en cualquier pantalla para anotar algo que falló o que faltó.</p>`}
      </section>
      <section class="form"><p class="label">Planilla</p>
        <input id="sheetUrl" type="url" placeholder="Pegá acá el link de tu Google Sheets" value="${esc(url)}" aria-label="Link de la planilla">
        <div class="row-btns">${url ? `<a class="btn sm" href="${esc(url)}" target="_blank" rel="noopener">Abrir planilla</a>` : ""}<button class="btn sm ghost" data-act="copiarEnc">Copiar encabezados</button></div>
      </section>
      <section class="form"><p class="label">Envío automático</p>
        <p class="hint">Pegá el link de la aplicación web del script de la planilla (termina en /exec). Queda guardado solo en este teléfono.</p>
        <input id="envioUrl" type="url" placeholder="https://script.google.com/macros/s/…/exec" value="${esc(urlEnvio())}" aria-label="Link del envío automático">
        ${urlEnvio() ? `<div class="row-btns"><button class="btn sm" data-act="probarEnvio">Probar conexión</button></div>` : ""}
        ${envioError ? `<p class="hint">Último error: ${esc(envioError)}</p>` : ""}
      </section>
      <p class="hint">Sirena versión ${esc(META.version)}</p>
    </main>
    ${bar(`<button class="btn" data-act="back">Volver</button>`)}`;
  };

  V.maletin = () => {
    const grupos = [...new Set(BASE.map((d) => d.grupo))];
    const stock = BASE.filter((d) => enStock(d.id)).length;
    return `${header("Maletín", { chip: false, back: false })}
    <main class="wrap">
      <p class="hint">${stock} de ${BASE.length} fármacos del catálogo en stock${M.propios.length ? ` · ${M.propios.length} agregado${M.propios.length > 1 ? "s" : ""} por vos` : ""}. Lo que apagues no se recomienda en domicilio: la app busca una alternativa o lo marca como faltante.</p>
      <section>
        <p class="label">Agregar al maletín</p>
        <form class="form" id="add">
          <label for="nNombre">Nombre comercial o genérico</label><input id="nNombre" required placeholder="Ej. Ondansetrón 4 mg">
          <label for="nPres">Presentación</label><input id="nPres" placeholder="Ej. Amp 4 mg/2 ml">
          <label for="nEq">Equivale a (para que los protocolos lo reconozcan)</label>
          <select id="nEq"><option value="">Ninguno (solo inventario)</option>${BASE.map((d) => `<option value="${d.id}">${esc(d.nombre)}</option>`).join("")}</select>
          <button class="btn primary" type="submit">Agregar</button>
        </form>
      </section>
      ${M.propios.length ? `<section><p class="label">Agregados por vos</p><div class="group">${M.propios.map((d) => `
        <div class="drug"><div class="t"><b>${esc(d.nombre)}</b><small>${esc(d.presentacion || "")}${d.equivale ? ` · equivale a ${esc(nombreFarmaco(d.equivale))}` : ""}</small></div>
        <label class="switch"><input type="checkbox" data-act="stockP" data-id="${d.id}" ${d.enStock ? "checked" : ""} aria-label="${esc(d.nombre)} en stock"><span></span></label>
        <button class="del" data-act="delP" data-id="${d.id}" aria-label="Quitar ${esc(d.nombre)}">×</button></div>`).join("")}</div></section>` : ""}
      ${grupos.map((g) => `<section><p class="label">${esc(g)}</p><div class="group">${BASE.filter((d) => d.grupo === g).map((d) => {
        const on = d.id in M.estado ? M.estado[d.id] : d.enStock;
        return `<div class="drug"><div class="t"><b>${esc(d.nombre)}</b><small>${esc(d.presentacion)}</small></div><label class="switch"><input type="checkbox" data-act="stock" data-id="${d.id}" ${on ? "checked" : ""} aria-label="${esc(d.nombre)} en stock"><span></span></label></div>`;
      }).join("")}</div></section>`).join("")}
      <section>
        <button class="btn ghost" data-act="reset1" style="width:100%">Restaurar maletín estándar</button>
        <div id="resetc" hidden style="margin-top:8px" class="alert warn"><p class="k">¿Restaurar?</p><p>Se pierden los cambios y los fármacos agregados.</p><div class="row-btns"><button class="btn sm" data-act="reset0">Cancelar</button><button class="btn sm danger" data-act="reset2">Restaurar</button></div></div>
      </section>
    </main>`;
  };

  V.soporte = () => {
    const farm = (x) => {
      const r = resolver({ f: x.f, dosis: x.texto, alt: x.alt });
      const st = r.estado === "ok" ? `<span class="chip verde">En maletín</span>` : r.estado === "alt" ? `<span class="chip amarillo">Alternativa</span>` : `<span class="chip rojo">Sin stock</span>`;
      return `<div class="dose"><div class="dh"><b>${esc(nombreFarmaco(r.estado === "no" ? x.f : r.f))}</b>${st}</div><span>${esc(r.estado === "no" ? x.texto : r.dosis)}</span></div>`;
    };
    const tiles = (d) => `<div class="tiles">${d.map((t) => `<div class="tile"><b>${esc(t.v)}</b><span>${esc(t.l)}</span></div>`).join("")}</div>`;
    const pasos = (d) => `<ol class="steps">${d.map((s) => `<li><span class="key">${esc(s.k)}</span><span>${esc(s.t)}</span></li>`).join("")}</ol>`;
    return `${header("RCP · Soporte vital", { chip: false, back: false })}
    <main class="wrap">
      ${SV.map((c) => `<details class="sv"${c.id === "rcp_adulto" && S.codigo === "rojo" ? " open" : ""}>
        <summary><span class="dot ${c.tono}"></span>${esc(c.titulo)}<span class="src">${esc(c.fuente)}</span></summary>
        <div class="body">
          ${c.datos && c.datos.length ? tiles(c.datos) : ""}
          ${c.pasos && c.pasos.length ? pasos(c.pasos) : ""}
          ${c.ramas && c.ramas.length ? `<div class="ramas">${c.ramas.map((r) => `<div class="rama ${r.tono}"><p>${esc(r.t)}</p><ul>${r.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>`).join("")}</div>` : ""}
          ${c.causas && c.causas.length ? c.causas.map((g) => `<div><p class="label">${esc(g.t)}</p><div class="chips static">${g.items.map((i) => `<span>${esc(i)}</span>`).join("")}</div></div>`).join("") : ""}
          ${c.farmacos && c.farmacos.length ? `<div><p class="label">Fármacos</p>${c.farmacos.map(farm).join("")}</div>` : ""}
          ${c.post ? `<div class="post"><p class="label">${esc(c.post.titulo)}</p>${tiles(c.post.datos)}${pasos(c.post.pasos)}</div>` : ""}
          ${c.pediatrico ? `<div><p class="label">Calculadora por peso</p>
            <div class="calc"><label for="kg">Peso (kg)<input id="kg" type="number" inputmode="decimal" min="1" max="80" step="0.5" value="${esc(S.pals.kg)}" placeholder="kg"></label>
            <label for="edad">Edad (años)<input id="edad" type="number" inputmode="numeric" min="0" max="18" value="${esc(S.pals.edad)}" placeholder="años"></label></div>
            <div id="palsOut" class="tiles pals">${palsOut()}</div></div>` : ""}
        </div></details>`).join("")}
      <p class="disclaimer">Verificar contra la edición vigente de cada curso y el protocolo local. Dosis pediátricas sin redondeo a presentación: revisar antes de cargar.</p>
    </main>`;
  };

  /* ------------------------------------------------------------ fichas */
  const FIC = window.FICHAS;
  const stockChip = (f, sinF = "Para indicar") => f ? (enStock(f) ? `<span class="chip verde">En maletín</span>` : `<span class="chip rojo">Sin stock</span>`) : `<span class="chip none">${sinF}</span>`;
  const rango = (a, b, u) => (Math.abs(a - b) < 1e-9 ? `${fmt(a)} ${u}` : `${fmt(a)}–${fmt(b)} ${u}`);
  const minus = (t) => t.charAt(0).toLowerCase() + t.slice(1);

  V.fichas = () => `${header("Fichas", { chip: false, back: false })}
    <main class="wrap">
      <p class="hint">Consulta rápida para tener a mano. Las dosis se cruzan con tu maletín.</p>
      <div class="fcards">${FIC.map((f) => `<button class="fcard ${f.tono}" data-act="go" data-to="f-${f.id}"><b>${esc(f.titulo)}</b><span>${esc(f.sub)}</span></button>`).join("")}</div>
      <p class="disclaimer">Borrador para validar con la Dirección Médica. Contenido propio basado en las fuentes citadas en cada ficha.</p>
    </main>`;

  function fichaActual() { const id = location.hash.replace("#f-", ""); return FIC.find((f) => f.id === id); }
  V.ficha = () => {
    const f = fichaActual();
    const cuerpo = { ped: fichaPed, sri: fichaSri, pecarn: fichaTec, pree: fichaPree, emb: fichaEmb, goteo: fichaGoteo }[f.tipo]();
    return `${header(f.titulo, { chip: false })}<main class="wrap ficha ${f.tono}">${cuerpo}</main>`;
  };

  function fichaPed() {
    const D = window.FICHA_PED;
    return `<div class="calc"><label for="kg">Peso (kg)<input id="kg" type="text" inputmode="decimal" autocomplete="off" value="${esc(S.pals.kg)}" placeholder="kg"></label>
      <label for="edad">Edad (años)<input id="edad" type="text" inputmode="decimal" autocomplete="off" value="${esc(S.pals.edad)}" placeholder="años"></label></div>
      <p class="hint">Edad en años: 6 meses = 0,5. Si no sabés el peso y tiene entre 1 y 10 años: (edad × 2) + 8.</p>
      <div id="pedOut">${pedOut()}</div>
      <p class="disclaimer">${esc(D.nota)} Fuente: ${esc(D.fuente)}.</p>`;
  }
  /* Dosis pediátrica por peso: la usan la ficha y los motivos pediátricos. */
  function calcPed(it, kg) {
    let dosis = "", ml = [];
    if (it.fijo) { dosis = it.fijo; ml = it.ml || []; }
    else if (it.calc === "puffs") { const n = Math.min(10, Math.max(2, Math.ceil(kg / 3))); dosis = `${n} disparos`; ml = ["100 mcg por disparo"]; }
    else if (it.calc === "ipra") { const big = kg >= 20; dosis = big ? "0,5 mg" : "0,25 mg"; ml = [big ? "2 ml de solución 0,25 mg/ml" : "1 ml de solución 0,25 mg/ml"]; }
    else if (it.calc === "adrNeb") { const v = Math.min(0.5 * kg, 5); dosis = `${fmt(v)} ml`; ml = ["de adrenalina 1:1000 sin diluir (0,5 ml/kg, máx. 5 ml)"]; }
    else if (it.calc === "adrIM") { const mx = kg >= 50 ? 0.5 : 0.3; const v = Math.min(0.01 * kg, mx); dosis = `${fmt(v)} mg`; ml = [`${fmt(v)} ml de adrenalina 1:1000 · máx. ${fmt(mx)} mg`]; }
    else if (it.calc === "dextrosa") { dosis = `${fmt(0.5 * kg)} g`; ml = [`${fmt(5 * kg)} ml de dextrosa 10 %`, `${fmt(2 * kg)} ml de dextrosa 25 % (preferir al 10 % en menores de 1 año)`]; }
    else if (it.calc === "sf") { dosis = `${fmt(20 * kg)} ml`; ml = [`20 ml/kg · si se sospecha causa cardíaca: ${fmt(10 * kg)} ml (10 ml/kg)`]; }
    else if (it.mlkg) { const v = it.max ? Math.min(it.mlkg * kg, it.max) : it.mlkg * kg; dosis = `${fmt(Math.round(v / 5) * 5 || v)} ml`; ml = [`${fmt(it.mlkg)} ml/kg${it.max && it.mlkg * kg > it.max ? ` · tope ${fmt(it.max)} ml` : ""}`]; }
    else {
      let lo = it.mgkg[0] * kg, hi = it.mgkg[1] * kg;
      if (it.min) { lo = Math.max(lo, it.min); hi = Math.max(hi, it.min); }
      if (it.max) { lo = Math.min(lo, it.max); hi = Math.min(hi, it.max); }
      dosis = rango(lo, hi, "mg");
      ml = (it.pres || []).map((p) => `${rango(lo / p.c, hi / p.c, "ml")} de ${minus(p.t)}`);
      if (it.max && it.mgkg[1] * kg > it.max) ml.push(`Tope por dosis: ${fmt(it.max)} mg`);
    }
    return { dosis, ml };
  }
  /* Texto de una línea para la historia clínica y la receta. */
  function textoPed(spec, kg, fallback) {
    if (!spec || !kg) return fallback || "";
    const { dosis, ml } = calcPed(spec, kg);
    return [`${dosis} ${spec.via || ""}`.trim(), ml[0] || "", spec.frec || ""].filter(Boolean).join(" · ");
  }
  function pedOut() {
    const D = window.FICHA_PED;
    const kg = num(S.pals.kg), edad = num(S.pals.edad);
    if (!kg || kg <= 0) return `<div class="alert warn"><p>Ingresá el peso para ver las dosis.</p></div>`;
    const item = (it) => {
      const { dosis, ml } = calcPed(it, kg);
      const bloqueado = it.edadMin && edad !== null && edad < it.edadMin;
      return `<div class="pd${bloqueado ? " off" : ""}">
        <div class="pdh"><b>${esc(it.n)}</b>${stockChip(it.f)}</div>
        ${bloqueado ? `<p class="pdx">No indicado a esta edad. ${esc(it.edadTxt)}.</p>` : `<div class="pdd"><span class="big">${esc(dosis)}</span><span>${esc(it.via)}</span></div>
        ${ml.map((m) => `<span class="pdm">${esc(m)}</span>`).join("")}
        <span class="pdf">${esc(it.frec)}</span>
        ${it.edadTxt ? `<span class="pdn">${esc(it.edadTxt)}.</span>` : ""}
        ${it.nota ? `<span class="pdn">${esc(it.nota)}</span>` : ""}`}
      </div>`;
    };
    return D.grupos.map((g) => `<section><p class="label">${esc(g.t)}</p><div class="pdg">${g.items.map(item).join("")}</div></section>`).join("");
  }

  function fichaSri() {
    const D = window.FICHA_SRI;
    return `<div class="calc one"><label for="sk">Peso (kg)<input id="sk" type="text" inputmode="decimal" autocomplete="off" value="${esc(FS.sri.kg)}" placeholder="70"></label></div>
      <ol class="steps">${D.pasos.map((p) => `<li><span class="key">${esc(p.k)}</span><span>${esc(p.t)}</span></li>`).join("")}</ol>
      <div id="sriOut">${sriOut()}</div>
      <div class="alert ok"><p>${esc(D.tubo)}</p></div>
      <div class="alert warn"><p>${esc(D.post)}</p></div>
      <p class="disclaimer">La concentración de cada droga se puede corregir según el envase que tengas; queda guardada en el teléfono. Fuente: ${esc(D.fuente)}.</p>`;
  }
  function sriOut() {
    const D = window.FICHA_SRI;
    const kg = num(FS.sri.kg);
    return D.grupos.map((g) => `<section><p class="label">${esc(g.t)}</p><div class="pdg">${g.items.map((it) => {
      const c = num(FS.sri.c[it.id]) || it.c;
      const porKg = `${fmt(it.dkg[0])}${it.dkg[0] !== it.dkg[1] ? "–" + fmt(it.dkg[1]) : ""} ${it.u}/kg`;
      let d = `<span class="pdm">${porKg}</span>`;
      if (kg) { const lo = it.dkg[0] * kg, hi = it.dkg[1] * kg; d = `<div class="pdd"><span class="big">${rango(lo, hi, it.u)}</span><span>${rango(lo / c, hi / c, "ml")}</span></div><span class="pdm">${porKg}</span>`; }
      return `<div class="pd"><div class="pdh"><b>${esc(it.n)}</b>${stockChip(it.id)}</div>${d}
        <label class="conc">Concentración <input data-conc="${it.id}" type="text" inputmode="decimal" value="${esc(FS.sri.c[it.id] || "")}" placeholder="${fmt(it.c)}"> ${esc(it.cu)}</label>
        <span class="pdn">${esc(it.nota)}</span></div>`;
    }).join("")}</div></section>`).join("") + (kg ? "" : `<p class="hint">Cargá el peso para ver las dosis en mg y ml.</p>`);
  }

  function fichaTec() {
    const D = window.FICHA_TEC;
    return `<p class="hint">${esc(D.aplica)}</p>
      <div class="seg big">${[["menor2", "Menor de 2 años"], ["mayor2", "2 años o más"]].map(([k, l]) => `<button data-act="tecEdad" data-val="${k}" aria-pressed="${S.tec.edad === k}">${l}</button>`).join("")}</div>
      <div id="tecOut">${tecOut()}</div>
      <p class="hint">${esc(D.mecanismo)}</p>
      <p class="disclaimer">Fuente: ${esc(D.fuente)}.</p>`;
  }
  function tecOut() {
    const D = window.FICHA_TEC;
    if (!S.tec.edad) return `<div class="alert warn"><p>Elegí la edad del niño.</p></div>`;
    const g = D[S.tec.edad];
    const fl = (arr, nivel, pre) => arr.map((t, i) => { const id = `${pre}${i}`; return `<label class="flag ${nivel}"><input type="checkbox" data-act="tecf" data-id="${id}" ${S.tec.f.has(id) ? "checked" : ""}><span class="box" aria-hidden="true"></span><span class="ft">${esc(t)}</span></label>`; }).join("");
    const alto = g.alto.some((_, i) => S.tec.f.has(`a${i}`)), medio = g.medio.some((_, i) => S.tec.f.has(`m${i}`));
    const r = D.resultado[alto ? "alto" : medio ? "medio" : "bajo"];
    return `<section><p class="label">Riesgo alto</p><div class="group">${fl(g.alto, "rojo", "a")}</div></section>
      <section><p class="label">Riesgo intermedio</p><div class="group">${fl(g.medio, "amarillo", "m")}</div></section>
      <div class="res ${r.tono}" role="status"><b>${esc(r.t)}</b><span>${esc(r.d)}</span></div>
      ${!alto && !medio ? `<section><p class="label">Pautas de alarma para la familia</p><ul class="list ok">${D.pautas.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></section>` : ""}`;
  }

  function fichaPree() {
    const D = window.FICHA_PREE;
    return `<p>${esc(D.def)}</p>
      <section><p class="label">Signos de gravedad</p><ul class="list rojo">${D.graves.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></section>
      <section><p class="label">Qué hacer</p><ol class="steps">${D.conducta.map((t, i) => `<li><span class="key">${i + 1}</span><span>${esc(t)}</span></li>`).join("")}</ol></section>
      <section><p class="label lchip">Sulfato de magnesio ${stockChip("sulfato_mg")}</p><div class="pdg">${D.mg.map((m) => `<div class="pd"><b>${esc(m.k)}</b><span>${esc(m.t)}</span></div>`).join("")}</div></section>
      <div class="alert warn"><p>${esc(D.toxicidad)}</p><p class="lchip">Gluconato de calcio ${stockChip("gluconato_ca")}</p></div>
      <section><p class="label">Antihipertensivo si TA ≥ 160/110</p><div class="pdg">${D.antiHTA.map((a) => `<div class="pd"><div class="pdh"><span>${esc(a.t)}</span>${stockChip(a.f)}</div></div>`).join("")}</div>
        <p class="hint" style="margin-top:8px">${esc(D.objetivo)}</p></section>
      <div class="alert"><p><b>${esc(D.nunca)}</b></p></div>
      <p class="disclaimer">Fuente: ${esc(D.fuente)}.</p>`;
  }

  function fichaEmb() {
    const D = window.FICHA_EMB;
    return `<p class="hint">${esc(D.aviso)}</p>
      <label class="tog"><span>Mostrar solo lo que tengo en el maletín</span><span class="switch"><input type="checkbox" data-act="embStock" ${FS.embStock ? "checked" : ""}><span></span></span></label>
      <div id="embOut">${embOut()}</div>
      <p class="disclaimer">Fuente: ${esc(D.fuente)}.</p>`;
  }
  function embOut() {
    const D = window.FICHA_EMB;
    const lista = BASE.filter((d) => D.items[d.id] && (!FS.embStock || enStock(d.id)));
    const g = [["si", "Se puede usar", "verde"], ["prec", "Con precaución", "amarillo"], ["no", "Evitar o contraindicado", "rojo"]];
    return g.map(([k, t, tono]) => {
      const xs = lista.filter((d) => D.items[d.id][0] === k);
      if (!xs.length) return "";
      return `<section><p class="label"><i class="sq ${tono}"></i> ${t} · ${xs.length}</p><ul class="cond">${xs.map((d) => `<li class="${tono}"><b>${esc(d.nombre)}</b><span>${esc(D.items[d.id][1])}</span></li>`).join("")}</ul></section>`;
    }).join("");
  }

  /* ------------------------------------------------------------ calculadora de goteo */
  const UNID = { mcgkgmin: "mcg/kg/min", mcgmin: "mcg/min", mgkgh: "mg/kg/h", mgh: "mg/h", gh: "g/h" };
  function fichaGoteo() {
    const G = FS.got;
    const inp = (k, l, ph) => `<label>${l}<input data-got="${k}" type="text" inputmode="decimal" autocomplete="off" value="${esc(G[k])}" placeholder="${ph}"></label>`;
    return `<div class="seg big">${[["vol", "Volumen y tiempo"], ["droga", "Dosis de droga"]].map(([k, l]) => `<button data-act="gotModo" data-val="${k}" aria-pressed="${G.modo === k}">${l}</button>`).join("")}</div>
      ${G.modo === "vol" ? `<div class="calc">${inp("vol", "Volumen (ml)", "500")}${inp("t", G.tu === "h" ? "Tiempo (horas)" : "Tiempo (minutos)", G.tu === "h" ? "8" : "30")}</div>
        <div class="seg">${[["h", "Horas"], ["min", "Minutos"]].map(([k, l]) => `<button data-act="gotTu" data-val="${k}" aria-pressed="${G.tu === k}">${l}</button>`).join("")}</div>`
      : `<div class="calc">${inp("dosis", "Dosis", "0,1")}<label>Unidad<select data-got="du">${Object.entries(UNID).map(([k, l]) => `<option value="${k}"${G.du === k ? " selected" : ""}>${l}</option>`).join("")}</select></label></div>
        <div class="calc">${inp("mg", "Droga en la bolsa (mg)", "4")}${inp("ml", "Volumen total (ml)", "250")}</div>
        ${/kg/.test(G.du) ? `<div class="calc one">${inp("kg", "Peso (kg)", "70")}</div>` : ""}
        <p class="hint">Para gramos (ej. sulfato de magnesio) usá g/h y cargá la droga en mg: 5 g = 5000 mg.</p>`}
      <div id="gotOut">${gotOut()}</div>
      <section><p class="label">Para recordar</p><ul class="list">
        <li>Microgotero (60 gotas = 1 ml): microgotas por minuto = ml/h.</li>
        <li>Macrogotero (20 gotas = 1 ml): macrogotas por minuto = ml/h ÷ 3.</li>
        <li>Para controlar un goteo: contá las gotas en 15 s y multiplicá por 4.</li>
      </ul></section>
      <p class="disclaimer">Cálculo aritmético. Confirmá el factor de goteo en el envase del equipo de infusión.</p>`;
  }
  function gotOut() {
    const G = FS.got;
    let mlh = null, extra = "";
    if (G.modo === "vol") {
      const v = num(G.vol), t = num(G.t);
      if (!v || !t) return `<div class="alert warn"><p>Cargá el volumen y el tiempo.</p></div>`;
      mlh = v / (G.tu === "h" ? t : t / 60);
    } else {
      const d = num(G.dosis), mg = num(G.mg), ml = num(G.ml), kg = num(G.kg);
      const porKg = /kg/.test(G.du);
      if (!d || !mg || !ml || (porKg && !kg)) return `<div class="alert warn"><p>Cargá la dosis, la droga en la bolsa, el volumen${porKg ? " y el peso" : ""}.</p></div>`;
      const mgh = { mcgkgmin: d * kg * 60 / 1000, mcgmin: d * 60 / 1000, mgkgh: d * kg, mgh: d, gh: d * 1000 }[G.du];
      const c = mg / ml;
      mlh = mgh / c;
      extra = `<div class="tile"><b>${fmt(c)} mg/ml</b><span>${fmt(c * 1000)} mcg/ml de concentración</span></div><div class="tile"><b>${fmt(mgh)} mg/h</b><span>dosis por hora</span></div>`;
    }
    const macro = mlh / 3, seg = macro > 0 ? 60 / macro : 0;
    const r1 = (x) => fmt(Math.round(x * 10) / 10);
    return `<div class="tiles got">
      <div class="tile big"><b>${r1(mlh)} ml/h</b><span>bomba de infusión</span></div>
      <div class="tile"><b>${Math.round(mlh)}</b><span>microgotas por minuto</span></div>
      <div class="tile"><b>${Math.round(macro)}</b><span>macrogotas por minuto${seg ? ` · 1 gota cada ${r1(seg)} s` : ""}</span></div>
      ${extra}</div>
      ${mlh > 999 ? `<div class="alert warn"><p>Ritmo muy alto: revisá los datos.</p></div>` : ""}`;
  }

  function palsOut() {
    const kg = Number(S.pals.kg), edad = Number(S.pals.edad);
    if (!kg || kg <= 0) return `<p class="hint">Ingresá el peso del niño para calcular las dosis. Si no lo sabés y tiene entre 1 y 10 años: (edad × 2) + 8.</p>`;
    return PALS.map((d) => {
      const r = d.calc(kg, edad);
      const sin = d.f && !enStock(d.f);
      return `<div class="tile${sin ? " sin" : ""}"><span class="tn">${esc(d.nombre)}${sin ? " · sin stock" : ""}</span><b>${esc(r.dosis)}</b><span>${esc(r.detalle)}</span></div>`;
    }).join("");
  }

  /* ------------------------------------------------------------ navegación */
  let prev = "inicio";
  function go(screen) { if (location.hash !== "#" + screen) location.hash = screen; else render(); }
  const TAB_DE = { inicio: "atencion", triage: "atencion", derivacion: "atencion", domicilio: "atencion", hc: "atencion", registro: "atencion", soporte: "rcp", fichas: "fichas", ficha: "fichas", maletin: "maletin" };
  let ultimaAtencion = "inicio";
  function actual() {
    const h = location.hash.replace("#", "") || "inicio";
    if (h.startsWith("f-")) return fichaActual() ? "ficha" : "fichas";
    if (!V[h]) return "inicio";
    if (["triage", "derivacion", "domicilio", "hc"].includes(h) && !protocolo()) return "inicio";
    if (h === "derivacion" && !tildadas("rojo").length) return "triage";
    return h;
  }
  function render(keepScroll) {
    const s = actual();
    const y = window.scrollY;
    if (s === "domicilio" || s === "derivacion") S.flujo = s;
    document.getElementById("app").innerHTML = V[s]();
    if (TAB_DE[s] === "atencion") ultimaAtencion = s === "inicio" ? "inicio" : (location.hash.replace("#", "") || "inicio");
    $$(".tabs button").forEach((b) => b.setAttribute("aria-current", b.dataset.tab === TAB_DE[s] ? "page" : "false"));
    document.body.classList.toggle("conbarra", !!document.querySelector("#app .bar"));
    if (["inicio", "triage", "derivacion", "domicilio"].includes(s)) prev = s;
    window.scrollTo(0, keepScroll ? y : 0);
    pantallaEncendida(s === "soporte");
    guardarCaso();
  }
  function back() {
    const s = actual();
    if (s === "ficha") return go("fichas");
    if (s === "registro") return go(prev === s ? "inicio" : prev);
    if (s === "hc") return go(S.flujo || "triage");
    if (s === "domicilio") return go(S.override ? "derivacion" : "triage");
    if (s === "derivacion") return go("triage");
    go("inicio");
  }
  function nuevo() {
    if (guardarRegistro()) toast("Atención guardada en el registro");
    borrarCaso(); estadoInicial(); go("inicio");
  }

  function syncPals() { if (esNino()) { if (S.hc.edad) S.pals.edad = S.hc.edad; if (S.pac.kg) S.pals.kg = S.pac.kg; } }
  function abrirNota() {
    const h = $("#hoja");
    h.innerHTML = `<div class="hoja-bg" data-act="hojaX"></div>
      <section class="hoja-p" role="dialog" aria-modal="true" aria-labelledby="hojaT">
        <header><h2 id="hojaT">Anotar un problema</h2><button type="button" class="back" data-act="hojaX" aria-label="Cerrar">×</button></header>
        <div class="hoja-b">
          <p class="hint">Qué falló, qué faltó o qué te hizo perder tiempo. Se guarda con la pantalla y la hora, sin datos del paciente.</p>
          <textarea id="notaTxt" class="hc" rows="4" placeholder="Ej. faltó el motivo dolor de oído en niños"></textarea>
          <button type="button" class="btn primary" data-act="notaOk">Guardar nota</button>
        </div>
      </section>`;
    h.hidden = false; document.body.classList.add("lock");
    setTimeout(() => { const t = $("#notaTxt"); if (t) t.focus(); }, 50);
  }
  function avisoVersion(v) {
    if (document.getElementById("upd")) return;
    const d = document.createElement("div");
    d.id = "upd"; d.setAttribute("role", "status");
    d.innerHTML = `<span>Hay una versión nueva de Sirena (${esc(v)})</span><button type="button" class="btn sm primary" data-act="recargar">Actualizar</button>`;
    document.body.appendChild(d);
  }
  function chequearVersion() {
    if (!/^https?:/.test(location.protocol) || !navigator.onLine) return;
    fetch("version.json?t=" + Date.now(), { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((j) => {
      if (j && j.version && j.version !== META.version) avisoVersion(j.version);
    }).catch(() => {});
  }

  function refrescarTriage() {
    $$("input[data-act=flag]").forEach((i) => {
      i.checked = S.banderas.has(i.dataset.id);
      const ft = i.parentElement.querySelector(".ft .autot");
      if (S.auto.has(i.dataset.id) && !ft) i.parentElement.querySelector(".ft").insertAdjacentHTML("beforeend", ` <em class="autot">automático</em>`);
      if (!S.auto.has(i.dataset.id) && ft) ft.remove();
    });
    const nav = $(".bar .wrap"); if (nav && actual() === "triage") nav.innerHTML = barTriage();
  }
  function refrescarHC() {
    const pv = $("#hcPrev"); if (pv) pv.innerHTML = previewHC();
    const ta = $("#hcPlano"); if (ta) ta.value = textoHC();
  }

  /* ------------------------------------------------------------ eventos */
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]");
    if (!b) return;
    const a = b.dataset.act;
    if (a === "flag" || a === "stock" || a === "stockP" || a === "dado" || a === "tecf" || a === "embStock") return;
    switch (a) {
      case "back": back(); break;
      case "go": go(b.dataset.to); break;
      case "sis": {
        const id = b.dataset.id;
        if (S.sistemas.has(id)) {
          S.sistemas.delete(id);
          const sx = window.SISTEMAS.find((x) => x.id === id);
          sx.banderas.forEach((f) => S.banderas.delete(f.id));
        } else S.sistemas.add(id);
        render(true); break;
      }
      case "ptipo": S.pac.tipo = S.pac.tipo === b.dataset.val ? "" : b.dataset.val; if (S.pac.tipo !== "nino") S.pac.kg = ""; else S.pac.emb = false; syncPals(); refrescarPaciente(); refrescarHC(); if (actual() === "triage") { aplicarVitales(); refrescarTriage(); } guardarCaso(); break;
      case "psexo": S.hc.sexo = S.hc.sexo === b.dataset.val ? "" : b.dataset.val; if (S.hc.sexo !== "F") S.pac.emb = false; refrescarPaciente(); refrescarHC(); guardarCaso(); break;
      case "pemb": S.pac.emb = !S.pac.emb; refrescarPaciente(); if (actual() === "domicilio") render(true); refrescarHC(); guardarCaso(); break;
      case "ahora": { const d = new Date(); S.horas[b.dataset.k] = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; $$(`input[data-hora="${b.dataset.k}"]`).forEach((i) => { i.value = S.horas[b.dataset.k]; }); refrescarHC(); guardarCaso(); break; }
      case "retomar": if (S.retomable) retomarCaso(S.retomable); break;
      case "descartar": S.retomable = null; borrarCaso(); render(); break;
      case "nota": abrirNota(); break;
      case "notaOk": {
        const t = ($("#notaTxt") || {}).value || "";
        if (t.trim()) {
          const d = new Date(), p = protocolo();
          NOTAS.push([`N${Date.now().toString(36)}`, `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`, `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
            actual(), p ? p.titulo : "", t.trim().replace(/[\t\r\n]+/g, " "), META.version]);
          saveNotas(); toast("Nota guardada"); setTimeout(() => enviarPendientes(false), 300);
        }
        cerrarHoja(); if (actual() === "registro") render(true); break;
      }
      case "copiarNotas": copiar(tsv(NOTAS), "regPlano", "Notas copiadas"); break;
      case "vaciarNotas1": $("#vaciarN").hidden = false; break;
      case "vaciarNotas0": $("#vaciarN").hidden = true; break;
      case "vaciarNotas2": NOTAS.length = 0; saveNotas(); render(true); toast("Notas vaciadas"); break;
      case "recargar": location.reload(); break;
      case "tab": {
        const t = b.dataset.tab;
        const destino = { atencion: ultimaAtencion, rcp: "soporte", fichas: "fichas", maletin: "maletin" }[t];
        if (TAB_DE[actual()] === t && t !== "atencion") { if (actual() === "ficha") go("fichas"); else window.scrollTo(0, 0); }
        else go(destino);
        break;
      }
      case "tecEdad": S.tec.edad = b.dataset.val; S.tec.f.clear(); $$("[data-act=tecEdad]").forEach((x) => x.setAttribute("aria-pressed", x === b)); $("#tecOut").innerHTML = tecOut(); break;
      case "vinfo": abrirHoja(b.dataset.k); break;
      case "hojaX": cerrarHoja(); break;
      case "gsel": {
        S.gcsComp = Object.assign({}, S.gcsComp || {}, { [b.dataset.g]: Number(b.dataset.n) });
        $$(`button[data-act=gsel][data-g="${b.dataset.g}"]`).forEach((x) => x.setAttribute("aria-pressed", x === b));
        $("#gtotal").innerHTML = gcsTotalHTML(); break;
      }
      case "gusar": {
        const c = S.gcsComp; S.v.gcs = String(c.o + c.v + c.m);
        cerrarHoja();
        const box = $("input[data-v=gcs]");
        if (box) { box.value = S.v.gcs; const em = box.parentElement.querySelector(".gcomp"); if (em) em.textContent = `O${c.o} V${c.v} M${c.m}`; else box.insertAdjacentHTML("afterend", ` <em class="gcomp">O${c.o} V${c.v} M${c.m}</em>`); }
        vitalCambio(); break;
      }
      case "contar": abrirContador(b.dataset.k); break;
      case "ctdur": if (!CT.t0 || CT.fin) { CT.dur = Number(b.dataset.n); Object.assign(CT, { t0: 0, taps: [], fin: false }); $$("[data-act=ctdur]").forEach((x) => x.setAttribute("aria-pressed", x === b)); pintarContador(); } break;
      case "ctstop": ctTerminar(); break;
      case "ctreset": pararContador(); Object.assign(CT, { t0: 0, taps: [], fin: false }); pintarContador(); break;
      case "ctusar": {
        const k = CT.k; S.v[k] = b.dataset.v; cerrarHoja();
        const inp = $(`input[data-v="${k}"]`); if (inp) inp.value = S.v[k];
        vitalCambio(); toast(`${k === "fc" ? "FC" : "FR"} ${S.v[k]} cargada`); break;
      }
      case "armsel": S.v.arm = b.dataset.val; cerrarHoja(); vitalCambio(); break;
      case "vnormales": {
        if (esNino()) { toast("En niños los valores normales cambian: cargá los medidos"); break; }
        let n = 0;
        Object.entries(NORMALES).forEach(([k, val]) => { if (!S.v[k]) { S.v[k] = val; n++; } });
        if (S.v.tas && S.v.tad) S.v.ta = `${S.v.tas}/${S.v.tad}`;
        vitalCambio(); toast(n ? `${n} valor${n > 1 ? "es" : ""} completado${n > 1 ? "s" : ""} con normales` : "No había campos vacíos"); break;
      }
      case "codigo": S.codigo = S.codigo === b.dataset.c ? null : b.dataset.c; render(); break;
      case "enviar": enviarPendientes(true); break;
      case "probarEnvio": {
        const u = urlEnvio();
        if (!/^https:\/\/script\.google(usercontent)?\.com\//.test(u)) { toast("El link tiene que ser de script.google.com"); break; }
        fetch(u + (u.includes("?") ? "&" : "?") + "ping=1").then((r) => r.json()).then((j) => { envioError = ""; toast(j && j.ok ? `Conectado a "${j.planilla || "la planilla"}"` : "Respondió, pero no es el script de Sirena"); if (j && j.ok && REG.length) enviarPendientes(false); else render(true); })
          .catch(() => { envioError = "no responde: revisá el link y que la implementación sea para «Cualquier persona»"; render(true); toast("No se pudo conectar"); });
        break;
      }
      case "gotModo": FS.got.modo = b.dataset.val; render(true); break;
      case "gotTu": FS.got.tu = b.dataset.val; render(true); break;
      case "motivo": S.caseId = S.caseId || "A" + Date.now().toString(36).toUpperCase(); S.inicio = S.inicio || Date.now(); S.motivo = b.dataset.id; if (protocolo() && protocolo().ped && !S.pac.tipo) S.pac.tipo = "nino"; S.sistemas.clear(); S.banderas.clear(); S.auto.clear(); S.off.clear(); S.override = false; S.dx = null; aplicarVitales(); go("triage"); break;
      case "evaluar":
        S.override = false; S.dx = null;
        if (tildadas("rojo").length) { S.hc.paciente = ""; go("derivacion"); }
        else { S.hc.paciente = "Queda en domicilio"; S.hc.intern = ""; go("domicilio"); }
        break;
      case "override1": $("#confirm").hidden = false; $("#confirm .btn.primary").focus(); break;
      case "override0": $("#confirm").hidden = true; break;
      case "override2": S.override = true; S.dx = null; S.hc.paciente = "Queda en domicilio"; S.hc.intern = ""; go("domicilio"); break;
      case "dx": S.dx = b.dataset.id; render(true); setTimeout(() => { const el = $("#b1"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 30); break;
      case "copiar": copiar(textoHC()); break;
      case "nuevo": nuevo(); break;
      case "guardarReg": if (guardarRegistro()) toast("Guardado en el registro"); break;
      case "copiarReg": copiar(tsv(REG), "regPlano", `${REG.length} fila${REG.length > 1 ? "s" : ""} copiada${REG.length > 1 ? "s" : ""}`).then(() => { const v = $("#vaciar"); if (v) v.hidden = false; }); break;
      case "copiarEnc": copiar(COLUMNAS.join("\t"), "regPlano", "Encabezados copiados"); break;
      case "vaciar0": $("#vaciar").hidden = true; break;
      case "vaciar2": REG.length = 0; saveReg(); render(); toast("Pendientes vaciados"); break;
      case "delReg": { const i = REG.findIndex((r) => r[0] === b.dataset.id); if (i >= 0) { REG.splice(i, 1); saveReg(); } render(true); break; }
      case "hcset": S.hc[b.dataset.k] = S.hc[b.dataset.k] === b.dataset.val ? "" : b.dataset.val; render(true); break;
      case "hcbool": S.hc[b.dataset.k] = b.dataset.val === "1"; render(true); break;
      case "desc": { const d = b.dataset.val; S.hc.desc.has(d) ? S.hc.desc.delete(d) : S.hc.desc.add(d); b.setAttribute("aria-pressed", S.hc.desc.has(d)); refrescarHC(); break; }
      case "normal": { S.hc[b.dataset.k] = NORMAL[b.dataset.k]; const t = $(`textarea[data-hc="${b.dataset.k}"]`); if (t) t.value = NORMAL[b.dataset.k]; refrescarHC(); break; }
      case "delP": M.propios = M.propios.filter((d) => d.id !== b.dataset.id); saveMaletin(); render(true); break;
      case "reset1": $("#resetc").hidden = false; break;
      case "reset0": $("#resetc").hidden = true; break;
      case "reset2": M.estado = {}; M.propios = []; saveMaletin(); render(); toast("Maletín estándar restaurado"); break;
      case "tema": {
        const r = document.documentElement;
        const next = r.getAttribute("data-theme") === "light" ? "dark" : "light";
        r.setAttribute("data-theme", next);
        try { localStorage.setItem(KEY_THEME, next); } catch (err) { /* nada */ }
        render(); break;
      }
    }
  });

  document.addEventListener("change", (e) => {
    const t = e.target, a = t.dataset && t.dataset.act;
    if (t.dataset && t.dataset.rd) { render(true); return; }
    if (t.id === "envioUrl") { render(true); if (urlEnvio()) enviarPendientes(false); return; }
    if (a === "flag") {
      const id = t.dataset.id;
      if (t.checked) S.banderas.add(id);
      else { S.banderas.delete(id); if (S.auto.has(id)) { S.auto.delete(id); S.off.add(id); } }
      refrescarTriage();
    } else if (a === "tecf") { t.checked ? S.tec.f.add(t.dataset.id) : S.tec.f.delete(t.dataset.id); const y = window.scrollY; $("#tecOut").innerHTML = tecOut(); window.scrollTo(0, y); }
    else if (a === "embStock") { FS.embStock = t.checked; $("#embOut").innerHTML = embOut(); }
    else if (a === "dado") { S.dados[t.dataset.key] = t.checked; }
    else if (a === "stock") { M.estado[t.dataset.id] = t.checked; saveMaletin(); }
    else if (a === "stockP") { const d = M.propios.find((x) => x.id === t.dataset.id); if (d) d.enStock = t.checked; saveMaletin(); }
  });

  document.addEventListener("input", (e) => {
    const t = e.target;
    if (t.id === "q") { S.texto = t.value; $("#res").innerHTML = resultados(); }
    else if (t.dataset.v) {
      const k = t.dataset.v;
      let val = t.value;
      if (k !== "temp") val = val.replace(/[^0-9]/g, "");
      else val = val.replace(/[^0-9.,]/g, "");
      if (val !== t.value) t.value = val;
      S.v[k] = val;
      if (k === "tas" || k === "tad") S.v.ta = S.v.tas || S.v.tad ? `${S.v.tas}/${S.v.tad}` : "";
      if (k === "tas" && val.length === 3) { const d = $("input[data-v=tad]"); if (d && !d.value) d.focus(); }
      if (k === "gcs") { S.gcsComp = null; const em = t.parentElement.querySelector(".gcomp"); if (em) em.remove(); }
      if (actual() === "triage") { aplicarVitales(); refrescarTriage(); } else refrescarHC();
    }
    else if (t.dataset.hc) { S.hc[t.dataset.hc] = t.value; refrescarHC(); }
    else if (t.dataset.pac) {
      if (t.dataset.pac === "edad") {
        S.hc.edad = t.value.replace(/[^0-9.,]/g, "");
        const ed = num(S.hc.edad);
        const tipo = ed === null ? S.pac.tipo : ed < 15 ? "nino" : "adulto";
        if (tipo !== S.pac.tipo) { S.pac.tipo = tipo; if (tipo === "nino") S.pac.emb = false; const pos = t.selectionStart; refrescarPaciente(); const n = $(`.pac input[data-pac="edad"]`); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (err) { /* nada */ } } }
      } else S.pac.kg = t.value.replace(/[^0-9.,]/g, "");
      syncPals();
      if (t.dataset.rd) return;
      if (actual() === "triage") { aplicarVitales(); refrescarTriage(); } else refrescarHC();
    }
    else if (t.dataset.hora) { S.horas[t.dataset.hora] = t.value; refrescarHC(); }
    else if (t.id === "sheetUrl") { try { localStorage.setItem(KEY_SHEET, t.value.trim()); } catch (err) { /* nada */ } }
    else if (t.id === "envioUrl") { try { localStorage.setItem(KEY_ENVIO, t.value.trim()); } catch (err) { /* nada */ } }
    else if (t.id === "kg" || t.id === "edad") {
      S.pals[t.id] = t.value;
      const po = $("#palsOut"); if (po) po.innerHTML = palsOut();
      const pe = $("#pedOut"); if (pe) pe.innerHTML = pedOut();
    }
    else if (t.dataset.got) { FS.got[t.dataset.got] = t.value; const o = $("#gotOut"); if (o) o.innerHTML = gotOut(); if (t.tagName === "SELECT") render(true); }
    else if (t.id === "sk") { FS.sri.kg = t.value; $("#sriOut").innerHTML = sriOut(); }
    else if (t.dataset.conc) {
      FS.sri.c[t.dataset.conc] = t.value.trim();
      try { localStorage.setItem(KEY_SRI, JSON.stringify(FS.sri.c)); } catch (err) { /* nada */ }
      const id = t.dataset.conc, pos = t.selectionStart;
      $("#sriOut").innerHTML = sriOut();
      const n = $(`input[data-conc="${id}"]`); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (err) { /* nada */ } }
    }
  });

  document.addEventListener("submit", (e) => {
    if (e.target.id !== "add") return;
    e.preventDefault();
    const nombre = $("#nNombre").value.trim();
    if (!nombre) return;
    M.propios.push({ id: "p" + Date.now(), nombre, presentacion: $("#nPres").value.trim(), equivale: $("#nEq").value, enStock: true });
    saveMaletin(); render(); toast(`${nombre} agregado al maletín`);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.id === "q") {
      const r = buscar(S.texto);
      S.caseId = S.caseId || "A" + Date.now().toString(36).toUpperCase(); S.inicio = S.inicio || Date.now();
      S.motivo = r.length ? r[0].p.id : "general";
      if (protocolo() && protocolo().ped && !S.pac.tipo) S.pac.tipo = "nino";
      S.sistemas.clear(); S.banderas.clear(); S.auto.clear(); S.off.clear(); S.override = false; S.dx = null;
      go("triage");
    }
  });

  window.addEventListener("hashchange", () => { cerrarHoja(); render(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrarHoja(); });

  /* ------------------------------------------------------------ arranque */
  try { const t = localStorage.getItem(KEY_THEME); if (t) document.documentElement.setAttribute("data-theme", t); } catch (e) { /* nada */ }
  if (!document.querySelector(".tabs")) {
    const ic = {
      atencion: '<path d="M9 3h6v3H9z"/><path d="M8 4.5H5.5v16h13v-16H16"/><path d="M12 10v6M9 13h6"/>',
      rcp: '<path d="M12 20.5s-7.5-4.6-7.5-10.4A4.1 4.1 0 0 1 12 7.3a4.1 4.1 0 0 1 7.5 2.8c0 5.8-7.5 10.4-7.5 10.4z"/><path d="M4 13h3.5l1.8-3 2.6 5.5 1.8-2.5H20"/>',
      fichas: '<rect x="3.5" y="7.5" width="13" height="13" rx="2"/><path d="M7.5 4h11a2 2 0 0 1 2 2v11"/><path d="M7 12h6M7 15.5h4"/>',
      maletin: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"/><path d="M12 10.5v6M9 13.5h6"/>'
    };
    const nav = document.createElement("nav");
    nav.className = "tabs"; nav.setAttribute("aria-label", "Secciones");
    nav.innerHTML = `<div class="tabs-in">${[["atencion", "Atención"], ["rcp", "RCP"], ["fichas", "Fichas"], ["maletin", "Maletín"]].map(([k, l]) => `<button data-act="tab" data-tab="${k}"><svg viewBox="0 0 24 24" aria-hidden="true">${ic[k]}</svg><span>${l}</span></button>`).join("")}</div>`;
    document.body.appendChild(nav);
  }
  if (!document.getElementById("hoja")) { const h = document.createElement("div"); h.id = "hoja"; h.hidden = true; document.body.appendChild(h); }
  const pendiente = leerCaso();
  if (pendiente && pendiente.motivo) S.retomable = pendiente;
  render();
  document.addEventListener("change", guardarCaso);
  document.addEventListener("input", guardarCaso);
  document.addEventListener("click", guardarCaso);
  chequearVersion();
  window.addEventListener("online", () => { chequearVersion(); enviarPendientes(false); });
  setTimeout(() => enviarPendientes(false), 1500);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") chequearVersion(); });
  if ("serviceWorker" in navigator && /^https?:/.test(location.protocol) && document.querySelector('link[rel="manifest"]')) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
})();

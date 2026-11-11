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
    "TA", "FC", "FR", "SatO2", "T° axilar", "Glucemia", "Glasgow", "Versión app"];

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

  /* ------------------------------------------------------------ estado */
  const S = {};
  function estadoInicial() {
    Object.assign(S, {
      codigo: null, motivo: null, texto: "", caseId: null, inicio: null,
      banderas: new Set(), auto: new Set(), off: new Set(), sistemas: new Set(),
      override: false, dx: null,
      v: { ta: "", fc: "", fr: "", sat: "", temp: "", gluc: "", gcs: "", arm: "" },
      dados: {},
      hc: { edad: "", sexo: "", antec: "", cv: "", resp: "", abd: "", neuro: "", desc: new Set(), descOtro: "", obs: "", rcp: false, ecg: false, paciente: "", intern: "" },
      pals: S.pals || { kg: 20, edad: 6 }
    });
  }
  estadoInicial();

  /* ------------------------------------------------------------ registro de atenciones (sin datos personales) */
  const REG = (() => { try { return JSON.parse(localStorage.getItem(KEY_REG) || "[]"); } catch (e) { return []; } })();
  const saveReg = () => { try { localStorage.setItem(KEY_REG, JSON.stringify(REG)); } catch (e) { /* en memoria */ } };
  const planilla = () => { try { return localStorage.getItem(KEY_SHEET) || PLANILLA_DEFECTO; } catch (e) { return PLANILLA_DEFECTO; } };

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
    if (enStock(item.f)) return { estado: "ok", f: item.f, dosis: item.dosis, nota: item.nota, original: item.f };
    const alt = (item.alt || []).find((a) => enStock(a.f));
    if (alt) return { estado: "alt", f: alt.f, dosis: alt.dosis || alt.texto, nota: item.nota, original: item.f };
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
  function medicacion(dx) {
    const vistos = new Set();
    return dx.tratamiento.map((it, i) => Object.assign(resolver(it), { cond: !!it.cond, key: dx.id + ":" + i })).filter((r) => {
      if (r.estado === "no" || vistos.has(r.f)) return false;
      vistos.add(r.f); return true;
    });
  }
  const dado = (r, i) => (r.key in S.dados ? S.dados[r.key] : !r.cond);
  function medicacionDada(dx) { return medicacion(dx).filter(dado); }
  function dosisCorta(t) { return String(t).split(/\.\s|\. /)[0].replace(/\.$/, ""); }
  const enDomicilio = () => S.flujo === "domicilio";

  function camposHC() {
    const p = protocolo();
    const dx = dxActual();
    const v = S.v;
    const rojas = tildadas("rojo"), amarillas = tildadas("amarillo");
    const F = [];
    F.push(["Código", S.codigo ? CODIGOS[S.codigo].label : "—"]);
    F.push(["Edad / Sexo", `${S.hc.edad || "—"} / ${S.hc.sexo || "—"}`]);
    F.push(["Motivo de la consulta", p ? `${p.titulo}${S.texto && norm(S.texto) !== norm(p.titulo) ? ` (refiere: ${S.texto})` : ""}` : "—"]);
    F.push(["Antec. de enferm. y medicación actual", S.hc.antec || "—"]);
    F.push(["Signos vitales", [
      `TA ${v.ta || "—"}`, `FC ${v.fc || "—"}`, `FR ${v.fr || "—"}`, `ARM ${v.arm || "—"}`,
      `SatO₂ ${v.sat ? v.sat + " %" : "—"}`, `T° ax ${v.temp ? v.temp + " °C" : "—"}`,
      `Glucemia ${v.gluc ? v.gluc + " mg/dl" : "—"}`, `Glasgow ${v.gcs ? v.gcs + "/15" : "—"}`
    ].join(" · ")]);
    F.push(["Cardiovascular", S.hc.cv || "—"]);
    F.push(["Respiratorio", S.hc.resp || "—"]);
    F.push(["Abdomen", S.hc.abd || "—"]);
    F.push(["Neurológico", S.hc.neuro || "—"]);

    let dxTxt = "—", tto = [], meds = [];
    if (enDomicilio() && dx) {
      dxTxt = `${dx.nombre} (CIE-10 ${dx.cie10})`;
      meds = medicacionDada(dx).map((r) => `${nombreFarmaco(r.f)} ${dosisCorta(r.dosis)}`);
      tto = [...meds, ...dx.receta.map((t) => `Rp/ ${t}`), ...dx.medidas, ...dx.indicaciones];
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
      S.v.ta, S.v.fc, S.v.fr, S.v.sat, S.v.temp, S.v.gluc, S.v.gcs, META.version
    ];
    return fila.map((x) => String(x == null ? "" : x).replace(/[\t\r\n]+/g, " ").trim());
  }
  function guardarRegistro() {
    if (!S.flujo || !S.caseId) return false;
    const fila = filaRegistro();
    const i = REG.findIndex((r) => r[0] === S.caseId);
    if (i >= 0) REG[i] = fila; else REG.push(fila);
    saveReg();
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
    const f = (k, l, ph, mode = "decimal") => `<label class="vf"><span>${l}</span><input data-v="${k}" inputmode="${mode}" placeholder="${ph}" value="${esc(S.v[k])}" aria-label="${l}"></label>`;
    return `<div class="vitals">
      ${f("ta", "TA", "120/80", "text")}${f("fc", "FC", "lpm", "numeric")}${f("fr", "FR", "rpm", "numeric")}${f("sat", "SatO₂", "%", "numeric")}
      ${f("temp", "T° axilar", "°C")}${f("gluc", "Glucemia", "mg/dl", "numeric")}${f("gcs", "Glasgow", "/15", "numeric")}${f("arm", "ARM", "—", "text")}
    </div>`;
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
    const boton = (p) => `<button class="motivo${res.some((r) => r.p.id === p.id) ? " match" : ""}" data-act="motivo" data-id="${p.id}">${esc(p.titulo)}</button>`;
    const escrito = S.texto.trim().length >= 3;
    return `${escrito ? `<div class="sugeridos">
        ${res.length ? `<p class="label" style="margin:8px 0 0">${res.length > 1 ? "¿Cuál se parece más?" : "Coincidencia"}</p>${res.slice(0, 3).map((r) => `<button class="sug" data-act="motivo" data-id="${r.p.id}"><b>${esc(r.p.titulo)}</b><span>Protocolo específico</span></button>`).join("")}` : `<p class="hint" style="margin-top:8px">No hay un protocolo específico para "${esc(S.texto)}".</p>`}
        <button class="sug gen" data-act="motivo" data-id="general"><b>Manejo general por aparato</b><span>Para "${esc(S.texto)}": banderas por sistema y tratamiento sintomático</span></button>
      </div>` : ""}
      <p class="label" style="margin-top:22px">Motivos frecuentes</p>
      <div class="motivos">${P.slice(0, 10).map(boton).join("")}</div>
      <details class="mas"${escrito && res.some((r) => P.indexOf(r.p) >= 10) ? " open" : ""}><summary>Más motivos (${P.length - 10})</summary><div class="motivos">${P.slice(10).map(boton).join("")}</div></details>`;
  }

  V.inicio = () => {
    const tema = document.documentElement.getAttribute("data-theme") === "light" ? "☾" : "☀";
    return `${header("Sirena", { back: false, chip: false, logo: true, extra: `<button class="back" data-act="tema" aria-label="Cambiar tema claro u oscuro">${tema}</button>` })}
    <main class="wrap">
      <section>
        <p class="label">Código de despacho</p>
        <div class="codes">${Object.entries(CODIGOS).map(([k, v]) => `<button class="code" data-c="${k}" data-act="codigo" aria-pressed="${S.codigo === k}">${v.label}<small>${v.sub}</small></button>`).join("")}</div>
      </section>
      ${S.codigo === "rojo" ? `<div class="alert"><p class="k" style="font-size:18px">Código rojo</p><p>Evaluación primaria XABCDE. No responde y no respira: <b>RCP</b>.</p><div class="row-btns"><button class="btn danger sm" data-act="go" data-to="soporte">Abrir RCP y soporte vital</button></div></div>` : ""}
      <section>
        <p class="label">Motivo de consulta</p>
        <div class="search"><input id="q" type="search" autocomplete="off" placeholder="Escribí el motivo (ej. falta de aire)" value="${esc(S.texto)}" aria-label="Escribir motivo de consulta"></div>
        <div id="res">${resultados()}</div>
      </section>
      <button class="reglink" data-act="go" data-to="registro"><span>Registro de atenciones</span><b class="chip ${REG.length ? "amarillo" : "none"}">${REG.length} pendiente${REG.length === 1 ? "" : "s"}</b></button>
      <p class="disclaimer">${esc(META.estado)}. ${esc(META.poblacion)} La decisión final es del médico actuante. Emergencias: ${esc(META.emergencias)}.</p>
    </main>
    ${bar(`<button class="btn" data-act="go" data-to="soporte">RCP · Soporte vital</button><button class="btn" data-act="go" data-to="maletin">Maletín</button>`)}`;
  };

  V.triage = () => {
    const p = protocolo();
    const grupo = (arr, nivel) => arr.filter((b) => b.nivel === nivel);
    const rojasP = grupo(p.banderas, "rojo"), amarP = grupo(p.banderas, "amarillo");
    return `${header(p.titulo)}
    <main class="wrap">
      ${p.general ? `<div class="alert warn"><p class="k">Manejo general · sin protocolo específico</p><p>Elegí el o los aparatos comprometidos para ver sus banderas. No reemplaza un protocolo específico: aplicá tu criterio.</p></div>
      <section><p class="label">Aparatos comprometidos</p><div class="chips">${window.SISTEMAS.map((x) => `<button data-act="sis" data-id="${x.id}" aria-pressed="${S.sistemas.has(x.id)}">${esc(x.nombre)}</button>`).join("")}</div></section>` : ""}
      <section><p class="label">Signos vitales</p>${vitalesHTML()}<p class="hint" style="margin-top:8px">Al cargarlos se marcan solas las banderas que correspondan. Podés destildarlas.</p></section>
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
    ${bar(`<button class="btn" data-act="nuevo">Nuevo caso</button><button class="btn primary" data-act="go" data-to="hc">Historia clínica</button>`)}`;
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
        <p class="hint">Tildado = administrado (pasa a la historia clínica). Los marcados "según cuadro" solo si corresponde.</p>
        ${meds.length ? meds.map((r) => `<div class="rx${r.cond ? " cond" : ""}"><label class="given"><input type="checkbox" data-act="dado" data-key="${r.key}" ${dado(r) ? "checked" : ""}><span class="box" aria-hidden="true"></span><b>${esc(nombreFarmaco(r.f))}</b>${r.cond ? `<em class="condt">según cuadro</em>` : ""}</label><span class="pres">${esc(presentacion(r.f))}</span><span>${esc(r.dosis)}</span>${r.estado === "alt" ? `<span class="note">Sustituye a ${esc(nombreFarmaco(r.original))} (sin stock).</span>` : ""}${r.nota ? `<span class="note">${esc(r.nota)}</span>` : ""}</div>`).join("")
          : `<p class="hint">${dx.tratamiento.length ? "Ningún fármaco indicado está en el maletín. Ver bloque 3." : "Este cuadro no requiere medicación del maletín."}</p>`}
      </div></article>
      <article class="block"><h2><span class="n">2</span>Indicaciones al paciente</h2><div class="body">
        ${dx.medidas.length || dx.indicaciones.length ? `<div><h3>Indicaciones</h3><ul>${[...dx.medidas, ...dx.indicaciones].map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>` : ""}
        ${dx.receta.length ? `<div><h3>Prescripción</h3><ul>${dx.receta.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>` : ""}
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
    html += bar(`<button class="btn" data-act="nuevo">Nuevo caso</button><button class="btn primary" data-act="go" data-to="hc"${dx || !p.diagnosticos.length ? "" : " disabled"}>Historia clínica</button>`);
    return html;
  };

  V.hc = () => {
    const seg = (key, opts) => `<div class="seg">${opts.map((o) => `<button data-act="hcset" data-k="${key}" data-val="${esc(o)}" aria-pressed="${S.hc[key] === o}">${esc(o)}</button>`).join("")}</div>`;
    const yn = (key, label) => `<div class="yn"><span>${label}</span><button data-act="hcbool" data-k="${key}" data-val="1" aria-pressed="${S.hc[key]}">Sí</button><button data-act="hcbool" data-k="${key}" data-val="0" aria-pressed="${!S.hc[key]}">No</button></div>`;
    const hall = (k, l) => `<div class="hall"><div class="hall-h"><span>${l}</span><button class="btn sm ghost" data-act="normal" data-k="${k}">Normal</button></div><textarea data-hc="${k}" rows="2" aria-label="${l}">${esc(S.hc[k])}</textarea></div>`;
    return `${header("Historia clínica")}
    <main class="wrap">
      <p class="hint">Mismo orden que la planilla en papel. Los datos filiatorios (nombre, DNI, domicilio, obra social) se completan a mano.</p>
      <section class="form"><p class="label">Edad y sexo</p>
        <div class="edadsexo"><label class="vf"><span>Edad</span><input data-hc="edad" inputmode="numeric" placeholder="años" value="${esc(S.hc.edad)}" aria-label="Edad en años"></label>${seg("sexo", ["F", "M", "X"])}</div>
      </section>
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
    ${bar(`<button class="btn" data-act="copiar">Copiar HC</button><button class="btn primary" data-act="guardarReg">Guardar en registro</button>`)}`;
  };
  function previewHC() {
    return camposHC().map(([k, v]) => `<div class="sr"><span class="sk">${esc(k)}</span><span class="sv2">${esc(v)}</span></div>`).join("");
  }

  V.registro = () => {
    const url = planilla();
    return `${header("Registro", { chip: false })}
    <main class="wrap">
      <p class="hint">Cada atención queda como una fila sin datos personales. Copiá las pendientes y pegalas en tu planilla de Google Sheets, en la primera fila vacía de la hoja Registro: cada dato cae en su columna.</p>
      <div class="alert ${REG.length ? "warn" : "ok"}"><p class="k">${REG.length ? `${REG.length} ${REG.length > 1 ? "atenciones pendientes" : "atención pendiente"}` : "Nada pendiente"}</p><p>${REG.length ? "Se guardan en este teléfono hasta que las pegues." : "Todo pasado a la planilla."}</p></div>
      ${REG.length ? `<div class="group">${REG.map((r) => `<div class="drug"><div class="t"><b>${esc(r[7])}</b><small>${esc(r[1].split("-").reverse().join("/"))} ${esc(r[2])} · ${esc(r[15])}${r[10] ? " · " + esc(r[10]) : ""}</small></div><button class="del" data-act="delReg" data-id="${esc(r[0])}" aria-label="Quitar atención">×</button></div>`).join("")}</div>
      <div class="row-btns"><button class="btn primary" data-act="copiarReg">Copiar ${REG.length} fila${REG.length > 1 ? "s" : ""}</button></div>
      <div id="vaciar" hidden class="alert warn"><p class="k">¿Ya las pegaste en la planilla?</p><p>Al vaciar, se borran de este teléfono.</p>
        <div class="row-btns"><button class="btn sm" data-act="vaciar0">Todavía no</button><button class="btn sm danger" data-act="vaciar2">Sí, vaciar pendientes</button></div></div>` : ""}
      <textarea id="regPlano" class="hc" hidden aria-label="Filas para pegar"></textarea>
      <section class="form"><p class="label">Planilla</p>
        <input id="sheetUrl" type="url" placeholder="Pegá acá el link de tu Google Sheets" value="${esc(url)}" aria-label="Link de la planilla">
        <div class="row-btns">${url ? `<a class="btn sm" href="${esc(url)}" target="_blank" rel="noopener">Abrir planilla</a>` : ""}<button class="btn sm ghost" data-act="copiarEnc">Copiar encabezados</button></div>
      </section>
    </main>
    ${bar(`<button class="btn" data-act="back">Volver</button>`)}`;
  };

  V.maletin = () => {
    const grupos = [...new Set(BASE.map((d) => d.grupo))];
    const stock = BASE.filter((d) => enStock(d.id)).length;
    return `${header("Maletín", { chip: false })}
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
    </main>
    ${bar(`<button class="btn" data-act="back">Volver</button>`)}`;
  };

  V.soporte = () => {
    const farm = (x) => {
      const r = resolver({ f: x.f, dosis: x.texto, alt: x.alt });
      const st = r.estado === "ok" ? `<span class="chip verde">En maletín</span>` : r.estado === "alt" ? `<span class="chip amarillo">Alternativa</span>` : `<span class="chip rojo">Sin stock</span>`;
      return `<div class="dose"><div class="dh"><b>${esc(nombreFarmaco(r.estado === "no" ? x.f : r.f))}</b>${st}</div><span>${esc(r.estado === "no" ? x.texto : r.dosis)}</span></div>`;
    };
    const tiles = (d) => `<div class="tiles">${d.map((t) => `<div class="tile"><b>${esc(t.v)}</b><span>${esc(t.l)}</span></div>`).join("")}</div>`;
    const pasos = (d) => `<ol class="steps">${d.map((s) => `<li><span class="key">${esc(s.k)}</span><span>${esc(s.t)}</span></li>`).join("")}</ol>`;
    return `${header("RCP · Soporte vital", { chip: false })}
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
            <div class="calc"><label for="kg">Peso (kg)<input id="kg" type="number" inputmode="decimal" min="1" max="80" step="0.5" value="${S.pals.kg}"></label>
            <label for="edad">Edad (años)<input id="edad" type="number" inputmode="numeric" min="0" max="18" value="${S.pals.edad}"></label></div>
            <div id="palsOut" class="tiles pals">${palsOut()}</div></div>` : ""}
        </div></details>`).join("")}
      <p class="disclaimer">Verificar contra la edición vigente de cada curso y el protocolo local. Dosis pediátricas sin redondeo a presentación: revisar antes de cargar.</p>
    </main>
    ${bar(`<button class="btn" data-act="back">Volver</button>`)}`;
  };

  function palsOut() {
    const kg = Number(S.pals.kg), edad = Number(S.pals.edad);
    if (!kg || kg <= 0) return `<p class="hint">Ingresá el peso.</p>`;
    return PALS.map((d) => {
      const r = d.calc(kg, edad);
      const sin = d.f && !enStock(d.f);
      return `<div class="tile${sin ? " sin" : ""}"><span class="tn">${esc(d.nombre)}${sin ? " · sin stock" : ""}</span><b>${esc(r.dosis)}</b><span>${esc(r.detalle)}</span></div>`;
    }).join("");
  }

  /* ------------------------------------------------------------ navegación */
  let prev = "inicio";
  function go(screen) { if (location.hash !== "#" + screen) location.hash = screen; else render(); }
  function actual() {
    const h = location.hash.replace("#", "") || "inicio";
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
    if (["inicio", "triage", "derivacion", "domicilio"].includes(s)) prev = s;
    window.scrollTo(0, keepScroll ? y : 0);
  }
  function back() {
    const s = actual();
    if (s === "maletin" || s === "soporte" || s === "registro") return go(prev === s ? "inicio" : prev);
    if (s === "hc") return go(S.flujo || "triage");
    if (s === "domicilio") return go(S.override ? "derivacion" : "triage");
    if (s === "derivacion") return go("triage");
    go("inicio");
  }
  function nuevo() {
    if (guardarRegistro()) toast("Atención guardada en el registro");
    estadoInicial(); go("inicio");
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
    if (a === "flag" || a === "stock" || a === "stockP" || a === "dado") return;
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
      case "codigo": S.codigo = S.codigo === b.dataset.c ? null : b.dataset.c; render(); break;
      case "motivo": S.caseId = S.caseId || "A" + Date.now().toString(36).toUpperCase(); S.inicio = S.inicio || Date.now(); S.motivo = b.dataset.id; S.sistemas.clear(); S.banderas.clear(); S.auto.clear(); S.off.clear(); S.override = false; S.dx = null; aplicarVitales(); go("triage"); break;
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
    if (a === "flag") {
      const id = t.dataset.id;
      if (t.checked) S.banderas.add(id);
      else { S.banderas.delete(id); if (S.auto.has(id)) { S.auto.delete(id); S.off.add(id); } }
      refrescarTriage();
    } else if (a === "stock") { M.estado[t.dataset.id] = t.checked; saveMaletin(); }
    else if (a === "stockP") { const d = M.propios.find((x) => x.id === t.dataset.id); if (d) d.enStock = t.checked; saveMaletin(); }
  });

  document.addEventListener("input", (e) => {
    const t = e.target;
    if (t.id === "q") { S.texto = t.value; $("#res").innerHTML = resultados(); }
    else if (t.dataset.v) {
      S.v[t.dataset.v] = t.value;
      if (actual() === "triage") { aplicarVitales(); refrescarTriage(); } else refrescarHC();
    }
    else if (t.dataset.hc) { S.hc[t.dataset.hc] = t.value; refrescarHC(); }
    else if (t.id === "sheetUrl") { try { localStorage.setItem(KEY_SHEET, t.value.trim()); } catch (err) { /* nada */ } }
    else if (t.id === "kg" || t.id === "edad") { S.pals[t.id] = t.value; $("#palsOut").innerHTML = palsOut(); }
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
      S.sistemas.clear(); S.banderas.clear(); S.auto.clear(); S.off.clear(); S.override = false; S.dx = null;
      go("triage");
    }
  });

  window.addEventListener("hashchange", () => render());

  /* ------------------------------------------------------------ arranque */
  try { const t = localStorage.getItem(KEY_THEME); if (t) document.documentElement.setAttribute("data-theme", t); } catch (e) { /* nada */ }
  render();
  if ("serviceWorker" in navigator && /^https?:/.test(location.protocol) && document.querySelector('link[rel="manifest"]')) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
})();

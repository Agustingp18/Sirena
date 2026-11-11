/* =========================================================================
   SOPORTE VITAL — referencias rápidas en formato visual
   -------------------------------------------------------------------------
   [BLS]   Soporte Vital Básico — AHA (versión vigente).
   [ACLS]  Soporte Vital Cardiovascular Avanzado — AHA (versión vigente).
   [PALS]  Soporte Vital Avanzado Pediátrico — AHA (versión vigente).
   [PHTLS] Soporte Vital Prehospitalario en Trauma — NAEMT (edición vigente).
   Cursos que dicta y acredita la SAE en Argentina.
   VALIDAR contra la edición en uso por el servicio.

   Bloques de cada tarjeta (todos opcionales):
     datos:     cifras clave en mosaicos  [{ v: "valor", l: "etiqueta" }]
     pasos:     secuencia corta           [{ k: "clave", t: "texto" }]
     ramas:     decisiones en columnas    [{ t: "título", tono, items: [] }]
     causas:    grupos de chips           [{ t: "5H", items: [] }]
     farmacos:  cruzados contra el maletín [{ f, texto, alt }]
     post:      bloque final (RCE)        { datos, pasos }
   ========================================================================= */

window.SOPORTE_VITAL = [
  {
    id: "rcp_adulto",
    titulo: "RCP adulto",
    fuente: "BLS · ACLS",
    tono: "rojo",
    datos: [
      { v: "100–120", l: "compresiones / min" },
      { v: "5–6 cm", l: "profundidad" },
      { v: "30:2", l: "sin vía aérea avanzada" },
      { v: "2 min", l: "analizar ritmo y rotar" },
      { v: "< 10 s", l: "pausas máximas" },
      { v: "1 c/ 6 s", l: "ventilación con vía aérea avanzada" }
    ],
    pasos: [
      { k: "1", t: "Escena segura" },
      { k: "2", t: "No responde y no respira normal → pedir DEA / monitor" },
      { k: "3", t: "Comprimir fuerte y rápido, dejar reexpandir" },
      { k: "4", t: "Conectar monitor y analizar ritmo" }
    ],
    ramas: [
      { t: "Desfibrilable · FV / TV sin pulso", tono: "rojo", items: [
        "Descarga 120–200 J bifásica",
        "RCP 2 min sin esperar",
        "Adrenalina 1 mg tras 2.ª descarga",
        "Amiodarona 300 mg tras 3.ª · luego 150 mg"
      ] },
      { t: "No desfibrilable · Asistolia / AESP", tono: "amarillo", items: [
        "RCP 2 min",
        "Adrenalina 1 mg lo antes posible",
        "Repetir adrenalina cada 3–5 min",
        "Buscar causa reversible"
      ] }
    ],
    causas: [
      { t: "5 H", items: ["Hipovolemia", "Hipoxia", "H⁺ acidosis", "Hipo / hiperpotasemia", "Hipotermia"] },
      { t: "5 T", items: ["Neumotórax a tensión", "Taponamiento", "Tóxicos", "Trombosis pulmonar", "Trombosis coronaria"] }
    ],
    farmacos: [
      { f: "adrenalina", texto: "1 mg EV/IO cada 3–5 min." },
      { f: "amiodarona", texto: "300 mg EV/IO en bolo; 2.ª dosis 150 mg.",
        alt: [{ f: "lidocaina", texto: "1–1,5 mg/kg EV/IO; luego 0,5–0,75 mg/kg." }] }
    ],
    post: {
      titulo: "Recuperó circulación (RCE)",
      datos: [
        { v: "92–98 %", l: "SatO₂" },
        { v: "35–45", l: "EtCO₂ mmHg" },
        { v: "≥ 90", l: "TAS mmHg (TAM ≥ 65)" }
      ],
      pasos: [
        { k: "ECG", t: "12 derivaciones: supradesnivel ST → centro con hemodinamia" },
        { k: "Glu", t: "Medir glucemia" },
        { k: "T°", t: "Evitar fiebre" },
        { k: "→", t: "Preaviso al centro receptor" }
      ]
    }
  },
  {
    id: "rcp_pediatrico",
    titulo: "RCP pediátrico",
    fuente: "PALS",
    tono: "rojo",
    pediatrico: true,
    datos: [
      { v: "100–120", l: "compresiones / min" },
      { v: "⅓ tórax", l: "≈ 4 cm lactante · 5 cm niño" },
      { v: "30:2", l: "1 reanimador" },
      { v: "15:2", l: "2 reanimadores" },
      { v: "1 c/ 2–3 s", l: "ventilación con vía aérea avanzada" },
      { v: "2 → 4 J/kg", l: "desfibrilación" }
    ],
    pasos: [
      { k: "!", t: "La causa más frecuente es la hipoxia: oxigenar y ventilar primero" },
      { k: "kg", t: "Peso desconocido (1–10 años): (edad × 2) + 8" }
    ],
    ramas: [
      { t: "Desfibrilable", tono: "rojo", items: ["2 J/kg → 4 J/kg → ≥ 4 J/kg", "Adrenalina tras 2.ª descarga", "Amiodarona 5 mg/kg tras 3.ª"] },
      { t: "No desfibrilable", tono: "amarillo", items: ["RCP 2 min", "Adrenalina lo antes posible", "Repetir cada 3–5 min"] }
    ],
    causas: [],
    farmacos: [],
    post: null
  },
  {
    id: "bradicardia",
    titulo: "Bradicardia con pulso",
    fuente: "ACLS",
    tono: "amarillo",
    datos: [{ v: "< 50", l: "FC lpm con síntomas" }],
    pasos: [
      { k: "?", t: "¿Hipotensión, confusión, shock, dolor isquémico o IC aguda?" },
      { k: "O₂", t: "O₂ si SatO₂ < 94 %, monitor, ECG, vía venosa" }
    ],
    ramas: [
      { t: "Sin síntomas graves", tono: "verde", items: ["Monitorizar", "Buscar la causa", "Trasladar"] },
      { t: "Inestable", tono: "rojo", items: ["Atropina 1 mg cada 3–5 min (máx. 3 mg)", "Si falla: marcapaso transcutáneo", "o adrenalina 2–10 mcg/min"] }
    ],
    causas: [{ t: "Causas", items: ["Isquemia", "Betabloqueantes", "Digoxina", "Hiperpotasemia"] }],
    farmacos: [
      { f: "atropina", texto: "1 mg EV en bolo, cada 3–5 min, máx. 3 mg." },
      { f: "adrenalina", texto: "Infusión 2–10 mcg/min EV titulada." }
    ],
    post: null
  },
  {
    id: "taquicardia",
    titulo: "Taquicardia con pulso",
    fuente: "ACLS",
    tono: "amarillo",
    datos: [{ v: "≥ 150", l: "FC lpm" }],
    pasos: [
      { k: "?", t: "¿Hipotensión, confusión, shock, dolor isquémico o IC aguda?" },
      { k: "ECG", t: "12 derivaciones si está estable" }
    ],
    ramas: [
      { t: "Inestable", tono: "rojo", items: ["Cardioversión sincronizada", "Sedar si es posible"] },
      { t: "Estable · QRS angosto", tono: "amarillo", items: ["Maniobras vagales", "Adenosina 6 mg → 12 mg"] },
      { t: "Estable · QRS ancho", tono: "amarillo", items: ["Amiodarona 150 mg en 10 min", "Consultar especialista"] }
    ],
    causas: [],
    farmacos: [
      { f: "adenosina", texto: "6 mg EV en bolo rápido + 20 ml SF; si no revierte, 12 mg." },
      { f: "amiodarona", texto: "150 mg EV en 10 min." },
      { f: "midazolam", texto: "2–5 mg EV antes de la cardioversión." }
    ],
    post: null
  },
  {
    id: "trauma",
    titulo: "Trauma grave",
    fuente: "PHTLS",
    tono: "rojo",
    datos: [
      { v: "≤ 10 min", l: "en escena" },
      { v: "80–90", l: "TAS objetivo sin TEC" },
      { v: "≥ 110", l: "TAS objetivo con TEC" },
      { v: "≥ 94 %", l: "SatO₂" }
    ],
    pasos: [
      { k: "X", t: "Hemorragia exsanguinante: compresión, torniquete, empaquetamiento" },
      { k: "A", t: "Vía aérea con restricción cervical" },
      { k: "B", t: "Ventilación: O₂, descartar neumotórax a tensión" },
      { k: "C", t: "Circulación: 2 accesos, hipotensión permisiva" },
      { k: "D", t: "Glasgow, pupilas, glucemia" },
      { k: "E", t: "Exponer y evitar hipotermia" }
    ],
    ramas: [],
    causas: [],
    farmacos: [
      { f: "acido_tranexamico", texto: "1 g EV en 10 min si sangra, dentro de las 3 h." },
      { f: "sf", texto: "Bolos de 250–500 ml hasta pulso radial.",
        alt: [{ f: "ringer", texto: "Bolos de 250–500 ml hasta pulso radial." }] },
      { f: "ketorolac", texto: "30 mg EV solo sin sangrado activo.",
        alt: [{ f: "dipirona", texto: "1–2 g EV lento." }] }
    ],
    post: null
  }
];

/* Dosis PALS por kg. Devuelven { dosis, detalle } calculados para un peso. */
window.DOSIS_PALS = [
  { f: "adrenalina", nombre: "Adrenalina RCP", calc: (kg) => {
      const mg = Math.min(0.01 * kg, 1);
      return { dosis: `${fmt(mg)} mg`, detalle: `${fmt(mg * 10)} ml de 1:10.000 (1 amp + 9 ml SF) · c/3–5 min` };
  } },
  { f: "adrenalina", nombre: "Adrenalina anafilaxia", calc: (kg) => {
      const mg = Math.min(0.01 * kg, 0.3);
      return { dosis: `${fmt(mg)} mg IM`, detalle: `${fmt(mg)} ml de 1:1000 · repetir c/5–15 min` };
  } },
  { f: "amiodarona", nombre: "Amiodarona", calc: (kg) => {
      return { dosis: `${fmt(Math.min(5 * kg, 300))} mg`, detalle: "EV/IO en bolo · hasta 3 dosis" };
  } },
  { f: "atropina", nombre: "Atropina", calc: (kg) => {
      return { dosis: `${fmt(Math.min(Math.max(0.02 * kg, 0.1), 0.5))} mg`, detalle: "EV/IO · mín. 0,1 · máx. 0,5 mg" };
  } },
  { f: "dextrosa25", nombre: "Dextrosa", calc: (kg) => {
      const g = 0.5 * kg;
      return { dosis: `${fmt(g)} g`, detalle: `${fmt(g * 4)} ml D25 % · o ${fmt(g * 10)} ml D10 %` };
  } },
  { f: "midazolam", nombre: "Midazolam convulsión", calc: (kg) => {
      return { dosis: `${fmt(Math.min(0.2 * kg, 10))} mg`, detalle: `IM o intranasal · EV: ${fmt(Math.min(0.1 * kg, 5))} mg` };
  } },
  { f: "sf", nombre: "Bolo de SF", calc: (kg) => {
      return { dosis: `${fmt(20 * kg)} ml`, detalle: `20 ml/kg · cardiogénico: ${fmt(10 * kg)} ml` };
  } },
  { f: null, nombre: "Desfibrilación", calc: (kg) => {
      return { dosis: `${fmt(2 * kg)} J`, detalle: `luego ${fmt(4 * kg)} J · máx. ${fmt(Math.min(10 * kg, 200))} J` };
  } },
  { f: null, nombre: "Tubo endotraqueal", calc: (kg, edad) => {
      if (!edad || edad < 2) return { dosis: "Broselow", detalle: "< 2 años: usar cinta según talla" };
      const d = edad / 4 + 3.5;
      return { dosis: `${fmt(d)} mm`, detalle: `con balón · fijar a ${fmt(3 * d)} cm` };
  } }
];

function fmt(n) {
  const r = Math.round(n * 100) / 100;
  return r.toLocaleString("es-AR", { maximumFractionDigits: 2 });
}

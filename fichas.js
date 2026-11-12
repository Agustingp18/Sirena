/* =========================================================================
   FICHAS DE CONSULTA RÁPIDA
   -------------------------------------------------------------------------
   BORRADOR — REQUIERE VALIDACIÓN DE LA DIRECCIÓN MÉDICA.
   Contenido propio, escrito a partir de las fuentes que cita cada ficha.
   Las dosis son orientativas: verificar siempre la concentración del
   envase que se tiene en la mano.

   Fuentes:
   [MSAL-HTAE]  Guía para el diagnóstico y tratamiento de la hipertensión en
                el embarazo. Dirección Nacional de Maternidad e Infancia,
                Ministerio de Salud de la Nación, 2.ª ed., 2010.
   [PECARN]     Kuppermann N y col. Identification of children at very low
                risk of clinically-important brain injuries after head trauma.
                Lancet 2009.
   [ANMAT]      Prospectos de productos comercializados en Argentina
                (paracetamol, ibuprofeno, dipirona).
   [PALS]       AHA, Soporte Vital Avanzado Pediátrico (versión vigente).
   [SAP]        Sociedad Argentina de Pediatría.
   [FDA-AINE]   FDA 2020: evitar AINE desde la semana 20 de gestación.
   ========================================================================= */

window.FICHAS = [
  { id: "ped", titulo: "Medicación pediátrica de urgencia", sub: "Dosis y mililitros según el peso", tono: "amarillo", tipo: "ped" },
  { id: "sri", titulo: "Secuencia rápida de intubación", sub: "Inducción y bloqueo por peso", tono: "rojo", tipo: "sri" },
  { id: "tec", titulo: "TEC leve en pediatría", sub: "Regla PECARN: ¿necesita tomografía?", tono: "azul", tipo: "pecarn" },
  { id: "pree", titulo: "Preeclampsia y eclampsia", sub: "Criterios de gravedad y sulfato de magnesio", tono: "rosa", tipo: "pree" },
  { id: "emb", titulo: "Fármacos del maletín en el embarazo", sub: "Qué usar, con qué cuidado y qué evitar", tono: "verde", tipo: "emb" },
  { id: "got", titulo: "Calculadora de goteo", sub: "ml/h, gotas por minuto e infusión de drogas", tono: "azul", tipo: "goteo" }
];

/* -------------------------------------------------------------------------
   1. MEDICACIÓN PEDIÁTRICA
   mgkg: [mín, máx] por dosis · max: tope por dosis en mg
   pres: presentaciones con concentración en mg/ml para calcular ml
   edadMin: edad mínima en años (0,25 = 3 meses)
   ------------------------------------------------------------------------- */
window.FICHA_PED = {
  fuente: "Prospectos ANMAT · SAP · PALS",
  nota: "Las gotas se calculan en ml: la cantidad de gotas por ml cambia según el gotero de cada marca.",
  grupos: [
    { t: "Fiebre y dolor", items: [
      { n: "Paracetamol", f: "paracetamol", via: "VO", mgkg: [10, 15], max: 1000, frec: "cada 6 h · máx. 60 mg/kg/día",
        pres: [{ t: "Jarabe 24 mg/ml (120 mg/5 ml)", c: 24 }, { t: "Gotas 100 mg/ml", c: 100 }] },
      { n: "Ibuprofeno", via: "VO", mgkg: [5, 10], max: 400, frec: "cada 6–8 h · máx. 40 mg/kg/día", edadMin: 0.5, edadTxt: "Mayores de 6 meses",
        nota: "5 mg/kg si T < 39 °C; 10 mg/kg si ≥ 39 °C.",
        pres: [{ t: "Suspensión 2 % (20 mg/ml)", c: 20 }, { t: "Suspensión 4 % (40 mg/ml)", c: 40 }] },
      { n: "Dipirona", f: "dipirona", via: "IM · EV lento · VO", mgkg: [10, 10], max: 1000, frec: "cada 6 h", edadMin: 0.25, edadTxt: "Desde 3 meses y 5 kg. De 3 a 11 meses, solo IM",
        pres: [{ t: "Ampolla 500 mg/ml", c: 500 }, { t: "Gotas 500 mg/ml", c: 500 }] }
    ] },
    { t: "Respiratorio", items: [
      { n: "Salbutamol aerosol", f: "salbutamol_mdi", via: "Inhalatoria con aerocámara", calc: "puffs", frec: "cada 20 min, hasta 3 veces" },
      { n: "Salbutamol nebulizado", f: "salbutamol_neb", via: "Nebulización en 3 ml de SF", mgkg: [0.15, 0.15], min: 2.5, max: 5, frec: "cada 20 min, hasta 3 veces",
        pres: [{ t: "Solución 5 mg/ml", c: 5 }] },
      { n: "Bromuro de ipratropio", f: "ipratropio_neb", via: "Nebulización junto al salbutamol", calc: "ipra", frec: "cada 20 min, hasta 3 veces" },
      { n: "Dexametasona", f: "dexametasona", via: "IM · EV · VO", mgkg: [0.15, 0.6], max: 16, frec: "dosis única",
        nota: "0,15 mg/kg en laringitis leve; 0,6 mg/kg en asma o laringitis moderada a grave.",
        pres: [{ t: "Ampolla 8 mg/2 ml (4 mg/ml)", c: 4 }] },
      { n: "Hidrocortisona", f: "hidrocortisona", via: "EV · IM", mgkg: [5, 5], max: 200, frec: "dosis inicial",
        nota: "Reconstituir el frasco según el envase." },
      { n: "Meprednisona", f: "meprednisona", via: "VO", mgkg: [1, 2], max: 40, frec: "una vez por día, 3–5 días" },
      { n: "Adrenalina nebulizada (laringitis)", f: "adrenalina", via: "Nebulización", calc: "adrNeb", frec: "dosis única; observar 2–3 h por efecto rebote" }
    ] },
    { t: "Anafilaxia", items: [
      { n: "Adrenalina IM", f: "adrenalina", via: "IM en cara anterolateral del muslo", calc: "adrIM", frec: "repetir cada 5–15 min si no mejora" },
      { n: "Difenhidramina", f: "difenhidramina", via: "IM · EV lento", mgkg: [1, 1], max: 50, frec: "dosis única", nota: "Coadyuvante: nunca reemplaza a la adrenalina." }
    ] },
    { t: "Convulsión", items: [
      { n: "Midazolam IM o intranasal", f: "midazolam", via: "IM · IN", mgkg: [0.2, 0.2], max: 10, frec: "repetir una vez a los 5–10 min si sigue", pres: [{ t: "Ampolla 15 mg/3 ml (5 mg/ml)", c: 5 }] },
      { n: "Midazolam EV", f: "midazolam", via: "EV lento", mgkg: [0.1, 0.1], max: 5, frec: "repetir una vez si sigue", pres: [{ t: "Ampolla 15 mg/3 ml (5 mg/ml)", c: 5 }] },
      { n: "Diazepam EV", f: "diazepam", via: "EV lento", mgkg: [0.3, 0.3], max: 10, frec: "repetir una vez si sigue", pres: [{ t: "Ampolla 10 mg/2 ml (5 mg/ml)", c: 5 }] },
      { n: "Diazepam rectal", f: "diazepam", via: "Rectal", mgkg: [0.5, 0.5], max: 10, frec: "si no hay acceso venoso", pres: [{ t: "Ampolla 10 mg/2 ml (5 mg/ml)", c: 5 }] }
    ] },
    { t: "Hipoglucemia y volumen", items: [
      { n: "Dextrosa", f: "dextrosa25", via: "EV", calc: "dextrosa", frec: "glucemia de control a los 15 min" },
      { n: "Solución fisiológica", f: "sf", via: "EV · IO en bolo", calc: "sf", frec: "reevaluar después de cada bolo" }
    ] },
    { t: "Náuseas y vómitos", items: [
      { n: "Ondansetrón", f: "ondansetron", via: "EV lento · IM", mgkg: [0.15, 0.15], max: 8, frec: "cada 8 h", edadMin: 0.5, edadTxt: "Mayores de 6 meses", pres: [{ t: "Ampolla 8 mg/4 ml (2 mg/ml)", c: 2 }] },
      { n: "Metoclopramida", f: "metoclopramida", via: "EV lento · IM", mgkg: [0.1, 0.15], max: 10, frec: "cada 8 h", edadMin: 1, edadTxt: "Contraindicada en menores de 1 año",
        nota: "Riesgo de reacción extrapiramidal en niños.", pres: [{ t: "Ampolla 10 mg/2 ml (5 mg/ml)", c: 5 }] }
    ] }
  ]
};

/* -------------------------------------------------------------------------
   2. SECUENCIA RÁPIDA DE INTUBACIÓN (adultos)
   u: unidad de la dosis · c: concentración por defecto en u/ml (editable)
   ------------------------------------------------------------------------- */
window.FICHA_SRI = {
  fuente: "SAE · ACLS · fichas técnicas",
  pasos: [
    { k: "1", t: "Preparación: equipo, aspiración, bolsa-válvula-máscara, capnografía, plan B (dispositivo supraglótico)" },
    { k: "2", t: "Preoxigenación: O₂ al 100 % durante 3 min, o 8 respiraciones a capacidad vital" },
    { k: "3", t: "Optimizar antes de inducir: TAS ≥ 90 y SatO₂ lo más alta posible" },
    { k: "4", t: "Inducción y bloqueo neuromuscular, uno detrás del otro" },
    { k: "5", t: "Posición: rampa (oreja a la altura del esternón)" },
    { k: "6", t: "Pasar el tubo y confirmar con capnografía y auscultación" },
    { k: "7", t: "Después: fijar, sedación y analgesia, ventilación protectora" }
  ],
  grupos: [
    { t: "Premedicación", items: [
      { id: "fentanilo", n: "Fentanilo", dkg: [1, 3], u: "mcg", c: 50, cu: "mcg/ml", nota: "Atenúa la respuesta simpática. Evitar en hipotensión." }
    ] },
    { t: "Inducción (elegir una)", items: [
      { id: "ketamina", n: "Ketamina", dkg: [1, 2], u: "mg", c: 50, cu: "mg/ml", nota: "De elección en shock o broncoespasmo." },
      { id: "etomidato", n: "Etomidato", dkg: [0.3, 0.3], u: "mg", c: 2, cu: "mg/ml", nota: "Estable hemodinámicamente." },
      { id: "midazolam", n: "Midazolam", dkg: [0.1, 0.3], u: "mg", c: 5, cu: "mg/ml", nota: "Puede producir hipotensión: usar la dosis baja si TAS limítrofe." },
      { id: "propofol", n: "Propofol", dkg: [1, 2], u: "mg", c: 10, cu: "mg/ml", nota: "Evitar en hipotensión o shock." }
    ] },
    { t: "Bloqueo neuromuscular", items: [
      { id: "succinilcolina", n: "Succinilcolina", dkg: [1.5, 1.5], u: "mg", c: 20, cu: "mg/ml", nota: "Contraindicada en hiperpotasemia, quemado o aplastado de más de 24 h, enfermedad neuromuscular. Verificar la concentración del envase." },
      { id: "rocuronio", n: "Rocuronio", dkg: [1, 1.2], u: "mg", c: 10, cu: "mg/ml", nota: "Alternativa cuando la succinilcolina está contraindicada. Dura 45–60 min." }
    ] }
  ],
  tubo: "Tubo: mujer 7–7,5 · hombre 7,5–8. Fijar a 21 cm (mujer) o 23 cm (hombre) en la comisura labial.",
  post: "Sedación y analgesia después de intubar: midazolam 0,05–0,1 mg/kg y fentanilo 1 mcg/kg, repetir según respuesta."
};

/* -------------------------------------------------------------------------
   3. TEC LEVE EN PEDIATRÍA (PECARN)
   ------------------------------------------------------------------------- */
window.FICHA_TEC = {
  fuente: "PECARN (Kuppermann, Lancet 2009)",
  aplica: "Para niños con Glasgow 14–15 dentro de las 24 h del golpe. Con Glasgow ≤ 13 se trata como TEC moderado o grave: traslado.",
  menor2: {
    alto: ["Glasgow 14 o alteración del estado mental (agitación, somnolencia, preguntas repetitivas, respuesta lenta)", "Fractura de cráneo palpable"],
    medio: ["Hematoma de cuero cabelludo occipital, parietal o temporal (no frontal)", "Pérdida de conciencia de 5 s o más", "Mecanismo de trauma grave", "No se comporta como siempre, según los padres"]
  },
  mayor2: {
    alto: ["Glasgow 14 o alteración del estado mental (agitación, somnolencia, preguntas repetitivas, respuesta lenta)", "Signos de fractura de base de cráneo (hematoma periorbitario o retroauricular, oto o rinorraquia, hemotímpano)"],
    medio: ["Pérdida de conciencia", "Vómitos", "Cefalea intensa", "Mecanismo de trauma grave"]
  },
  mecanismo: "Mecanismo grave: choque de vehículo con eyección, muerte de otro ocupante o vuelco; peatón o ciclista sin casco embestido por un vehículo; caída de más de 0,9 m en menores de 2 años o de más de 1,5 m desde los 2 años; golpe en la cabeza con un objeto de alto impacto.",
  resultado: {
    alto: { t: "Riesgo alto · traslado para tomografía", d: "Alrededor de 4 de cada 100 tienen una lesión cerebral importante.", tono: "rojo" },
    medio: { t: "Riesgo intermedio · traslado para evaluación", d: "Alrededor de 1 de cada 100. En el hospital deciden entre observar o hacer tomografía.", tono: "amarillo" },
    bajo: { t: "Riesgo muy bajo · no necesita tomografía", d: "Menos de 1 en 2000. Puede quedar en domicilio con un adulto y pautas de alarma.", tono: "verde" }
  },
  pautas: ["Vómitos repetidos.", "Somnolencia, le cuesta despertarse o está confuso.", "Dolor de cabeza que aumenta.", "Convulsión.", "Debilidad, dificultad para caminar o hablar.", "Pupilas de distinto tamaño.", "Llamar al 107 o al 911."]
};

/* -------------------------------------------------------------------------
   4. PREECLAMPSIA Y ECLAMPSIA (MSAL 2010)
   ------------------------------------------------------------------------- */
window.FICHA_PREE = {
  fuente: "Guía MSAL de hipertensión en el embarazo, 2010",
  def: "Hipertensión (TA ≥ 140/90) desde la semana 20 del embarazo, con proteinuria o compromiso de órganos. También puede aparecer en el puerperio.",
  graves: [
    "TA ≥ 160/110",
    "Cefalea persistente, alteraciones visuales, hiperreflexia o alteración del sensorio",
    "Dolor epigástrico o en hipocondrio derecho, náuseas o vómitos",
    "Oliguria",
    "Edema agudo de pulmón o cianosis",
    "Sangrado o sospecha de desprendimiento de placenta",
    "Convulsión: eclampsia"
  ],
  conducta: [
    "Decúbito lateral izquierdo. Proteger de golpes si convulsiona.",
    "O₂ si SatO₂ < 95 %. Acceso venoso.",
    "Sulfato de magnesio ante preeclampsia grave o eclampsia.",
    "Antihipertensivo si la TA es ≥ 160/110.",
    "Traslado urgente a una maternidad con la complejidad adecuada, con preaviso."
  ],
  mg: [
    { k: "Ataque", t: "5 g EV lento en 10–15 min: 2 ampollas de 10 ml al 25 % (o 4 de 5 ml) diluidas en 10 ml de dextrosa 5 %." },
    { k: "Mantenimiento", t: "1 g/h: 20 g (8 ampollas de 10 ml al 25 %) en 500 ml de dextrosa 5 % o Ringer, a 7 gotas/min o 21 microgotas/min." },
    { k: "Si convulsiona de nuevo", t: "Repetir 2,5–5 g EV lento diluido." }
  ],
  toxicidad: "Controlar reflejo patelar y frecuencia respiratoria cada 30 min. Suspender si desaparece el reflejo o la FR es menor de 16. Antídoto: gluconato de calcio 1 g EV lento (1 ampolla al 10 %).",
  antiHTA: [
    { f: "labetalol", t: "Labetalol: 20 mg EV en 10–15 min. Si no responde a los 15 min, 40 mg y luego 80 mg (máx. 220–300 mg)." },
    { f: "nifedipina", t: "Nifedipina: 10 mg por vía oral cada 30–40 min (máx. 40 mg). Solo si está consciente." },
    { f: "hidralazina", t: "Hidralazina: 5 mg EV, luego 5–10 mg cada 15–20 min (máx. 40 mg)." }
  ],
  objetivo: "Objetivo: bajar unos 30 mmHg la sistólica y 20 mmHg la diastólica. No bajar la diastólica de 80 mmHg.",
  nunca: "No usar nifedipina sublingual: produce descensos bruscos de la TA. No usar IECA (enalapril, captopril) en el embarazo."
};

/* -------------------------------------------------------------------------
   5. FÁRMACOS DEL MALETÍN EN EL EMBARAZO
   n: "si" se puede usar · "prec" con precaución · "no" evitar o contraindicado
   ------------------------------------------------------------------------- */
window.FICHA_EMB = {
  fuente: "Fichas técnicas ANMAT · MSAL hipertensión en el embarazo 2010 · FDA 2020 (AINE)",
  aviso: "En una emergencia con riesgo para la vida de la madre, se usa lo que la situación requiera: salvar a la madre es la mejor protección para el feto.",
  items: {
    paracetamol: ["si", "Analgésico y antitérmico de elección."],
    salbutamol_mdi: ["si", "Usar igual que fuera del embarazo."],
    salbutamol_neb: ["si", "Usar igual que fuera del embarazo."],
    ipratropio_neb: ["si", "Usar igual que fuera del embarazo."],
    oxigeno: ["si", "Objetivo SatO₂ ≥ 95 %."],
    hidrocortisona: ["si", "Usar cuando está indicada (asma, anafilaxia)."],
    dexametasona: ["si", "Usar cuando está indicada."],
    meprednisona: ["si", "Usar cuando está indicada."],
    difenhidramina: ["si", "Usar cuando está indicada."],
    adrenalina: ["si", "En anafilaxia se usa siempre."],
    metoclopramida: ["si", "Antiemético habitual en el embarazo."],
    dimenhidrinato: ["si", "Usar cuando está indicado."],
    ondansetron: ["prec", "Preferir otro antiemético en el primer trimestre."],
    dipirona: ["prec", "Evitar en el tercer trimestre. En el resto, solo si el paracetamol no alcanza."],
    hioscina: ["prec", "Pocos datos; dosis única si es necesaria."],
    hioscina_dipirona: ["prec", "Contiene dipirona: evitar en el tercer trimestre."],
    diclofenac: ["no", "Evitar desde la semana 20: oligoamnios y cierre del ductus."],
    ketorolac: ["no", "Evitar desde la semana 20: oligoamnios y cierre del ductus."],
    aas: ["prec", "Dosis baja (100 mg) solo si está indicada. Evitar dosis analgésicas."],
    dinitrato: ["prec", "Solo si está indicado (síndrome coronario)."],
    captopril: ["no", "IECA: contraindicado en el embarazo."],
    enalapril: ["no", "IECA: contraindicado en el embarazo."],
    amlodipina: ["prec", "Solo si no hay otra opción."],
    furosemida: ["prec", "Solo en edema agudo de pulmón."],
    atropina: ["si", "Usar cuando está indicada."],
    amiodarona: ["prec", "Solo en arritmias que ponen en riesgo la vida."],
    adenosina: ["si", "Se puede usar en taquicardia supraventricular."],
    lidocaina: ["si", "Usar cuando está indicada."],
    labetalol: ["si", "De elección en HTA severa del embarazo."],
    hidralazina: ["si", "Alternativa en HTA severa del embarazo."],
    nifedipina: ["si", "Por vía oral en HTA severa. Nunca sublingual."],
    diazepam: ["prec", "Dosis única en convulsión o crisis. Evitar uso prolongado."],
    lorazepam: ["prec", "Dosis única. Evitar uso prolongado."],
    midazolam: ["prec", "Dosis única en convulsión o sedación."],
    haloperidol: ["prec", "Dosis única en agitación si es necesario."],
    sulfato_mg: ["si", "De elección en preeclampsia grave y eclampsia."],
    gluconato_ca: ["si", "Antídoto del sulfato de magnesio."],
    dextrosa25: ["si", "Usar cuando está indicada."],
    glucagon: ["si", "Usar cuando está indicado."],
    tiamina: ["si", "Usar cuando está indicada."],
    naloxona: ["prec", "Titular de a poco: puede desencadenar abstinencia en la madre y el feto."],
    acido_tranexamico: ["si", "Se usa en la hemorragia posparto."],
    fentanilo: ["prec", "Solo para intubación o analgesia necesaria."],
    ketamina: ["prec", "Solo para intubación."],
    etomidato: ["prec", "Solo para intubación."],
    propofol: ["prec", "Solo para intubación."],
    succinilcolina: ["prec", "Solo para intubación."],
    rocuronio: ["prec", "Solo para intubación."],
    sf: ["si", "Usar cuando está indicada."],
    ringer: ["si", "Usar cuando está indicado."]
  }
};

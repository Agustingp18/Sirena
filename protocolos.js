/* =========================================================================
   BASE DE PROTOCOLOS PREHOSPITALARIOS
   -------------------------------------------------------------------------
   ESTADO: BORRADOR v1.0 — REQUIERE VALIDACIÓN DE LA DIRECCIÓN MÉDICA
   antes del uso asistencial. Cada protocolo indica su fuente de referencia.

   Referencias utilizadas (Argentina):
   [MSAL-EPOC]  GPC Nacional de Diagnóstico y Tratamiento de la EPOC —
                Ministerio de Salud de la Nación (2016) y Guía breve (2017).
   [MSAL-HTA]   GPC Nacional sobre Prevención, Diagnóstico y Tratamiento
                de la HTA — Ministerio de Salud de la Nación (2019).
                Urgencia hipertensiva: manejo ambulatorio VO, descenso gradual.
   [MSAL-ACV]   Lineamientos MSAL para la atención del ACV / Código ACV.
   [MSAL-DENGUE] Guía MSAL para el equipo de salud: Dengue (manejo por grupos).
   [MSAL-DIARREA] Normas MSAL de manejo de diarrea aguda / SRO.
   [SAME]       Manual de Procedimientos SAME (CABA) y SAME Provincia
                (Dec. PBA 898/16 y 212/17): ABC, traslado, preaviso.
   [SAE]        Consensos de la Sociedad Argentina de Emergencias.
   [BLS/ACLS/PALS] American Heart Association (versión vigente), cursos
                acreditados por la SAE en Argentina.
   [PHTLS]      NAEMT, Soporte Vital Prehospitalario en Trauma.

   Banderas: nivel "rojo"  = criterio de traslado por sí sola según guía.
             nivel "amarillo" = permite domicilio con la conducta indicada.
             No se decide por cantidad de banderas sino por su nivel.

   Códigos: cada motivo y diagnóstico lleva "cie10" (CIE-10 OMS, uso habitual
   en Argentina) y "snomed" (SNOMED CT, PENDIENTE: completar y verificar con
   el servidor de terminología nacional antes de usar en estadística).

   Estructura de un diagnóstico:
     tratamiento: [{ f: idFármaco, dosis, alt:[{f,dosis}], nota, cond }]
                  cond: true = condicional; el médico lo tilda si lo usó
     receta:      fármacos a prescribir (no se administran del maletín)
     medidas:     medidas no farmacológicas en domicilio
     indicaciones:pautas para el paciente
     alarma:      pautas de alarma para la historia clínica
   ========================================================================= */

window.APP_META = {
  version: "1.6.0",
  planilla: "", // link a la planilla de registro: se carga desde la app (pantalla Registro), no en el código público
  estado: "Borrador — validar con Dirección Médica antes de uso asistencial",
  emergencias: "107 (SAME) · 911",
  poblacion: "Protocolos domiciliarios para adultos; dosis pediátricas solo en Soporte vital (PALS)."
};

/* Banderas universales: se muestran en todos los motivos */
window.BANDERAS_UNIVERSALES = [
  { id: "u_gcs", nivel: "rojo", texto: "Glasgow < 15 nuevo o no responde a estímulos", conducta: "Deterioro neurológico: ABC, glucemia y traslado." },
  { id: "u_tas", nivel: "rojo", texto: "TAS < 90 mmHg, piel fría, relleno capilar > 2 s (shock)", conducta: "Shock: dos accesos, cristaloides en bolo, traslado." },
  { id: "u_fc", nivel: "rojo", texto: "FC < 50 o > 120 lpm, o arritmia nueva", conducta: "ECG y monitor; ver algoritmos ACLS. Traslado." },
  { id: "u_fr", nivel: "rojo", texto: "FR < 10 o > 30 rpm", conducta: "Soporte ventilatorio según necesidad y traslado." },
  { id: "u_sat", nivel: "rojo", texto: "SatO₂ < 92 % a aire ambiente (EPOC: < 88 %)", conducta: "O₂ titulado y traslado." },
  { id: "u_hipot", nivel: "rojo", texto: "Temperatura < 35 °C", conducta: "Hipotermia: abrigo activo y traslado." },
  { id: "u_temp", nivel: "amarillo", texto: "Temperatura ≥ 40 °C", conducta: "Antitérmico y medios físicos, reevaluar a los 30–60 min. Si no desciende o hay deterioro, trasladar." },
  { id: "u_red", nivel: "amarillo", texto: "Sin red de contención o sin posibilidad de cumplir indicaciones", conducta: "Coordinar acompañante o seguimiento. Si no se puede garantizar, trasladar." }
];

window.PROTOCOLOS = [
  /* ---------------------------------------------------------------- */
  {
    id: "disnea", cie10: "R06.0", snomed: "",
    titulo: "Dificultad respiratoria",
    corto: "Disnea",
    keywords: ["disnea", "falta de aire", "ahogo", "respirar", "respiratoria", "asma", "epoc", "broncoespasmo", "silbido", "sibilancias", "tos", "fatiga"],
    fuentes: ["MSAL-EPOC", "ACLS", "SAME", "SAE"],
    banderas: [
      { id: "d1", nivel: "rojo", texto: "No puede completar frases / uso de músculos accesorios o tiraje", conducta: "Insuficiencia respiratoria: O₂, broncodilatador y traslado." },
      { id: "d2", nivel: "rojo", texto: "Cianosis central", conducta: "Hipoxemia grave: O₂ y traslado." },
      { id: "d3", nivel: "rojo", texto: "Somnolencia, confusión o agitación (hipercapnia / hipoxia)", conducta: "Probable hipercapnia o hipoxia grave: traslado, considerar VNI en destino." },
      { id: "d4", nivel: "rojo", texto: "Tórax silencioso: sin sibilancias pese a gran esfuerzo", conducta: "Crisis de riesgo vital: nebulización continua durante el traslado." },
      { id: "d5", nivel: "rojo", texto: "Rales bilaterales, ortopnea, esputo rosado (edema agudo de pulmón)", conducta: "Edema agudo de pulmón: furosemida + nitrato si TAS > 100, traslado sentado." },
      { id: "d6", nivel: "rojo", texto: "Estridor, disfonía o edema de lengua/labios (vía aérea / anafilaxia)", conducta: "Vía aérea comprometida / anafilaxia: adrenalina IM y traslado." },
      { id: "d7", nivel: "rojo", texto: "Dolor torácico asociado o sospecha de TEP (disnea súbita, TVP, inmovilización)", conducta: "Sospecha de SCA o TEP: ECG de 12 derivaciones y traslado." },
      { id: "d8", nivel: "rojo", texto: "Fiebre + foco pulmonar con confusión, FR ≥ 30 o TAS < 90 (neumonía grave)", conducta: "Neumonía grave: O₂ y traslado." },
      { id: "d9", nivel: "rojo", texto: "Sin respuesta tras 3 ciclos de broncodilatador", conducta: "Falla del tratamiento inicial: traslado." },
      { id: "d10", nivel: "amarillo", texto: "Comorbilidad severa (cardiopatía, O₂ domiciliario, internaciones recientes)", conducta: "Puede quedar en domicilio solo con buena respuesta al broncodilatador. Control médico en 24 h y umbral bajo para trasladar." }
    ],
    soporte: [
      "Posición sentada o semisentada.",
      "O₂ para SatO₂ objetivo 92–96 % (EPOC: 88–92 %, evitar hiperoxia).",
      "Monitor, oximetría continua, ECG de 12 derivaciones si hay dolor o arritmia.",
      "Acceso venoso periférico.",
      "Broncoespasmo: salbutamol 5 mg + ipratropio 0,5 mg nebulizados durante el traslado.",
      "Corticoide sistémico: hidrocortisona 200 mg EV (o dexametasona 8 mg EV).",
      "Edema agudo de pulmón con TAS > 100: furosemida 40 mg EV + dinitrato de isosorbide 5 mg SL.",
      "Anafilaxia: adrenalina 0,5 mg IM (0,5 ml 1:1000), repetir cada 5–15 min.",
      "Preparar manejo avanzado de vía aérea. Preaviso al centro receptor."
    ],
    diagnosticos: [
      {
        id: "epoc_leve", cie10: "J44.1", snomed: "",
        nombre: "EPOC reagudizado leve",
        criterio: "EPOC conocido, aumento de disnea/tos/esputo, SatO₂ ≥ 88 %, sin banderas rojas y buena respuesta al broncodilatador.",
        tratamiento: [
          { f: "salbutamol_neb", dosis: "5 mg (1 ml de solución 0,5 %) nebulizado, en 3 ml de SF, con O₂ o aire a 6–8 L/min. Repetir cada 20 min hasta 3 veces.",
            alt: [{ f: "salbutamol_mdi", dosis: "4–8 disparos con aerocámara cada 20 min, hasta 3 ciclos." }] },
          { f: "ipratropio_neb", dosis: "0,5 mg (2 ml de solución 0,025 %) en la misma nebulización que el salbutamol." },
          { f: "meprednisona", dosis: "40 mg VO, primera dosis en domicilio.",
            alt: [{ f: "hidrocortisona", dosis: "200 mg EV/IM, dosis única en domicilio." }, { f: "dexametasona", dosis: "8 mg IM, dosis única." }],
            nota: "[MSAL-EPOC] corticoide sistémico por 5 días en la exacerbación." },
          { cond: true, f: "oxigeno", dosis: "Solo si SatO₂ < 88 %, a bajo flujo (1–2 L/min por cánula). Objetivo 88–92 %." }
        ],
        receta: [
          "Meprednisona 40 mg/día VO por 5 días.",
          "Salbutamol aerosol 2 disparos cada 4–6 h según necesidad, con aerocámara.",
          "Si aumentó la purulencia del esputo: amoxicilina-ácido clavulánico 875/125 mg cada 12 h por 5–7 días (según evaluación)."
        ],
        medidas: ["Revisar técnica inhalatoria y aerocámara.", "Mantener tratamiento inhalado de base.", "Consejería para dejar de fumar."],
        indicaciones: [
          "Control con su médico de cabecera o neumonólogo en 48–72 h.",
          "Continuar su medicación habitual para la EPOC.",
          "No fumar ni exponerse a humo."
        ],
        alarma: [
          "Falta de aire que no mejora con el aerosol.",
          "Labios o uñas azuladas.",
          "Somnolencia, confusión o dificultad para despertarse.",
          "Fiebre mayor a 38,5 °C que persiste más de 48 h.",
          "Dolor de pecho o palpitaciones.",
          "Ante cualquiera de estos signos llamar al 107 o al 911."
        ]
      },
      {
        id: "asma_leve", cie10: "J45.9", snomed: "",
        nombre: "Crisis asmática leve a moderada",
        criterio: "Asma conocida, habla en frases, FR < 30, FC < 120, SatO₂ ≥ 92 %, mejora con broncodilatador.",
        tratamiento: [
          { f: "salbutamol_mdi", dosis: "4–10 disparos con aerocámara cada 20 min durante la primera hora.",
            alt: [{ f: "salbutamol_neb", dosis: "2,5–5 mg (0,5–1 ml de solución 0,5 %) en 3 ml de SF cada 20 min, hasta 3 veces." }] },
          { cond: true, f: "ipratropio_neb", dosis: "0,5 mg asociado al salbutamol si la crisis es moderada." },
          { f: "meprednisona", dosis: "40–50 mg VO, primera dosis.",
            alt: [{ f: "dexametasona", dosis: "8 mg IM, dosis única." }, { f: "hidrocortisona", dosis: "200 mg EV/IM, dosis única." }] }
        ],
        receta: [
          "Meprednisona 40 mg/día VO por 5–7 días.",
          "Salbutamol aerosol 2–4 disparos cada 4–6 h según necesidad.",
          "Revisar o iniciar corticoide inhalado de mantenimiento con su médico."
        ],
        medidas: ["Revisar técnica inhalatoria.", "Identificar el desencadenante (infección, alérgenos, abandono del tratamiento)."],
        indicaciones: [
          "Control con su médico en 24–48 h.",
          "No suspender el tratamiento de mantenimiento.",
          "Evitar humo, polvo y desencadenantes conocidos."
        ],
        alarma: [
          "Necesita el aerosol más seguido que cada 4 h o no le hace efecto.",
          "No puede hablar de corrido o camina con dificultad por la falta de aire.",
          "Labios azulados, somnolencia o confusión.",
          "Llamar al 107 o al 911."
        ]
      },
      {
        id: "ira_alta", cie10: "J06.9", snomed: "",
        nombre: "Infección respiratoria aguda sin hipoxemia",
        criterio: "Tos, rinorrea u odinofagia, SatO₂ ≥ 95 %, sin taquipnea ni foco de condensación.",
        tratamiento: [
          { f: "paracetamol", dosis: "1 g VO si T ≥ 38 °C o malestar.",
            alt: [{ f: "dipirona", dosis: "1 g IM/EV lento (diluido) si no tolera VO." }] }
        ],
        receta: ["Paracetamol 500 mg–1 g VO cada 6–8 h según fiebre/dolor (máx. 3–4 g/día)."],
        medidas: ["Hidratación abundante.", "Reposo relativo."],
        indicaciones: [
          "Consultar con su médico si persisten los síntomas más de 5 días.",
          "Lavado de manos y ventilación del ambiente."
        ],
        alarma: [
          "Falta de aire o respiración rápida.",
          "Fiebre que dura más de 72 h.",
          "Dolor de pecho al respirar.",
          "Llamar al 107 o al 911."
        ]
      }
    ]
  },

  /* ---------------------------------------------------------------- */
  {
    id: "abdomen", cie10: "R10.4", snomed: "",
    titulo: "Dolor abdominal",
    corto: "Abdomen",
    keywords: ["abdominal", "abdomen", "panza", "estomago", "estómago", "colico", "cólico", "vomito", "vómitos", "diarrea", "nauseas", "renal", "gastroenteritis", "epigastrio"],
    fuentes: ["MSAL-DIARREA", "SAME", "SAE"],
    banderas: [
      { id: "a1", nivel: "rojo", texto: "Abdomen en tabla, defensa o reacción peritoneal", conducta: "Abdomen agudo quirúrgico: nada por boca, acceso venoso y traslado." },
      { id: "a2", nivel: "rojo", texto: "Hematemesis, melena o rectorragia", conducta: "Hemorragia digestiva: dos accesos venosos, sin AINE, traslado." },
      { id: "a3", nivel: "rojo", texto: "Distensión + vómitos persistentes + sin eliminación de gases (obstrucción)", conducta: "Obstrucción intestinal: nada por boca y traslado." },
      { id: "a4", nivel: "rojo", texto: "Dolor desproporcionado al examen en > 50 años o con FA (isquemia mesentérica)", conducta: "Sospecha de isquemia mesentérica: traslado." },
      { id: "a5", nivel: "rojo", texto: "Masa pulsátil o dolor abdominal/lumbar con hipotensión (aneurisma de aorta)", conducta: "Sospecha de aneurisma complicado: dos accesos, hipotensión permisiva, traslado urgente." },
      { id: "a6", nivel: "rojo", texto: "Mujer en edad fértil con atraso menstrual o metrorragia (embarazo ectópico)", conducta: "Descartar embarazo ectópico: traslado a centro con ginecología." },
      { id: "a7", nivel: "rojo", texto: "Embarazo en curso", conducta: "Dolor abdominal en embarazo: traslado a maternidad." },
      { id: "a8", nivel: "rojo", texto: "Fiebre + ictericia (colangitis) o dolor en FID que migró desde epigastrio", conducta: "Colangitis o apendicitis probable: traslado." },
      { id: "a9", nivel: "rojo", texto: "Deshidratación severa o intolerancia oral", conducta: "Hidratación EV y traslado." },
      { id: "a10", nivel: "amarillo", texto: "Dolor epigástrico con factores de riesgo cardiovascular sin ECG normal", conducta: "Hacer ECG: si es normal y el cuadro es digestivo, puede continuar en domicilio. Sin ECG o con ECG anormal, trasladar." },
      { id: "a11", nivel: "amarillo", texto: "Mayor de 65 años", conducta: "Los cuadros graves dan pocos signos a esta edad: examen completo, control en 12–24 h y umbral bajo para trasladar." }
    ],
    soporte: [
      "Nada por boca.",
      "Dos accesos venosos periféricos.",
      "Hipotensión: SF o Ringer en bolos de 500 ml, reevaluando.",
      "O₂ si SatO₂ < 92 %.",
      "ECG de 12 derivaciones si el dolor es epigástrico.",
      "Analgesia sin AINE si hay sangrado: dipirona 1–2 g EV lento.",
      "Monitoreo de signos vitales. Preaviso al centro receptor."
    ],
    diagnosticos: [
      {
        id: "colico_inesp", cie10: "R10.4", snomed: "",
        nombre: "Dolor abdominal cólico inespecífico",
        criterio: "Dolor cólico difuso, abdomen blando y depresible, sin signos peritoneales, signos vitales normales.",
        tratamiento: [
          { f: "hioscina", dosis: "20 mg (1 amp) IM o EV lento.",
            alt: [{ f: "hioscina_dipirona", dosis: "1 amp diluida en 100 ml de SF, EV lento en 15–20 min, o IM profunda." }] },
          { cond: true, f: "hioscina_dipirona", dosis: "Si el dolor es intenso: 1 amp diluida en 100 ml SF EV lento (en lugar de hioscina sola).",
            nota: "Contraindicada si hay alergia a pirazolonas." }
        ],
        receta: ["Hioscina 10 mg VO cada 8 h si reaparece el dolor (hasta 48 h)."],
        medidas: ["Dieta liviana y fraccionada.", "Hidratación oral."],
        indicaciones: ["Reevaluación médica en 12–24 h si persiste el dolor."],
        alarma: [
          "Dolor que aumenta o se concentra en un punto (sobre todo abajo a la derecha).",
          "Abdomen duro o muy doloroso al tocarlo.",
          "Fiebre, vómitos persistentes o sangre en vómito o materia fecal.",
          "Mareos o desmayo.",
          "Llamar al 107 o al 911."
        ]
      },
      {
        id: "gea", cie10: "A09", snomed: "",
        nombre: "Gastroenteritis aguda sin deshidratación grave",
        criterio: "Diarrea y/o vómitos, tolera líquidos tras antiemético, sin sangre, signos vitales normales.",
        tratamiento: [
          { f: "metoclopramida", dosis: "10 mg IM o EV lento.",
            alt: [{ f: "ondansetron", dosis: "4–8 mg EV lento o IM." }],
            nota: "Metoclopramida: riesgo de reacción extrapiramidal en jóvenes." },
          { cond: true, f: "hioscina", dosis: "20 mg IM si hay dolor cólico asociado." }
        ],
        receta: ["Sales de rehidratación oral (fórmula OMS) según tolerancia y tras cada deposición."],
        medidas: ["Rehidratación oral fraccionada (sorbos cada 5–10 min).", "Alimentación habitual liviana en cuanto tolere."],
        indicaciones: [
          "No usar antidiarreicos si hay fiebre o sangre en la materia fecal.",
          "Lavado de manos y cuidado al manipular alimentos."
        ],
        alarma: [
          "No puede retener líquidos.",
          "Orina muy poco o muy oscura, boca seca, mareos al pararse.",
          "Sangre en la materia fecal o fiebre alta.",
          "Llamar al 107 o al 911."
        ]
      },
      {
        id: "colico_renal", cie10: "N23", snomed: "",
        nombre: "Cólico renal no complicado",
        criterio: "Dolor lumbar irradiado a flanco/genitales, puñopercusión positiva, sin fiebre, sin anuria, no monorreno, no embarazada.",
        tratamiento: [
          { f: "diclofenac", dosis: "75 mg IM profunda, dosis única.",
            alt: [{ f: "ketorolac", dosis: "30 mg IM o EV lento." }],
            nota: "Evitar AINE en insuficiencia renal, úlcera activa o anticoagulación." },
          { cond: true, f: "dipirona", dosis: "2 g EV lento diluido o 1 g IM si el AINE está contraindicado o el dolor persiste." }
        ],
        receta: ["Diclofenac 50 mg VO cada 8–12 h con comidas por 3–5 días."],
        medidas: ["Hidratación oral habitual (no forzar).", "Calor local."],
        indicaciones: ["Consulta con urología o médico de cabecera en 48–72 h para estudios."],
        alarma: [
          "Fiebre o escalofríos.",
          "No puede orinar.",
          "Dolor que no cede con la medicación.",
          "Vómitos persistentes.",
          "Llamar al 107 o al 911."
        ]
      }
    ]
  },

  /* ---------------------------------------------------------------- */
  {
    id: "hta", cie10: "R03.0", snomed: "",
    titulo: "Pico de presión",
    corto: "HTA",
    keywords: ["presion", "presión", "hipertension", "hipertensión", "hta", "tension", "tensión", "pico de presion", "presion alta"],
    fuentes: ["MSAL-HTA", "ACLS", "SAME", "SAE"],
    banderas: [
      { id: "h1", nivel: "rojo", texto: "Dolor torácico o dolor desgarrante hacia la espalda (SCA / disección)", conducta: "Emergencia hipertensiva (SCA / disección): ECG, AAS si no hay sospecha de disección, traslado." },
      { id: "h2", nivel: "rojo", texto: "Disnea, rales, ortopnea (edema agudo de pulmón)", conducta: "Edema agudo de pulmón: furosemida + nitrato, traslado sentado." },
      { id: "h3", nivel: "rojo", texto: "Foco neurológico, confusión, convulsión o cefalea súbita intensa", conducta: "Posible ACV o encefalopatía: Código ACV, no bajar la TA en el móvil." },
      { id: "h4", nivel: "rojo", texto: "Alteraciones visuales nuevas", conducta: "Daño de órgano blanco: traslado." },
      { id: "h5", nivel: "rojo", texto: "Embarazo ≥ 20 semanas o puerperio (preeclampsia / eclampsia)", conducta: "Preeclampsia: sulfato de magnesio si hay criterios de gravedad, traslado a maternidad." },
      { id: "h6", nivel: "rojo", texto: "Oliguria o hematuria", conducta: "Daño renal agudo: traslado." },
      { id: "h7", nivel: "rojo", texto: "Asimetría de pulsos o de TA entre brazos", conducta: "Sospecha de disección aórtica: no dar AAS, traslado urgente." },
      { id: "h8", nivel: "rojo", texto: "Epistaxis que no cede con compresión", conducta: "Epistaxis no controlada: compresión sostenida y traslado." },
      { id: "h9", nivel: "amarillo", texto: "Abandono del tratamiento o sin médico de cabecera", conducta: "Asegurar continuidad: turno en CAPS o con su médico en 24–72 h." }
    ],
    soporte: [
      "Emergencia hipertensiva: hay daño agudo de órgano blanco. No bajar la TA en forma brusca en el móvil.",
      "Monitor, ECG de 12 derivaciones, acceso venoso, O₂ si SatO₂ < 92 %.",
      "SCA: AAS 162–325 mg masticada + dinitrato de isosorbide 5 mg SL si TAS > 90.",
      "Edema agudo de pulmón: furosemida 40 mg EV + dinitrato 5 mg SL, posición sentada.",
      "Sospecha de ACV: NO tratar la TA en el prehospitalario (salvo indicación del centro). Activar Código ACV.",
      "[MSAL] Preeclampsia grave / eclampsia: sulfato de magnesio 5 g EV lento en 10–15 min y traslado a maternidad (ver ficha Preeclampsia).",
      "Contraindicado: nifedipina sublingual.",
      "Preaviso al centro receptor."
    ],
    diagnosticos: [
      {
        id: "urg_hta", cie10: "I10", snomed: "",
        nombre: "HTA severa asintomática (urgencia hipertensiva)",
        criterio: "TA ≥ 180/110 sin síntomas ni daño agudo de órgano blanco, persistente tras 30 min de reposo.",
        tratamiento: [
          { f: "captopril", dosis: "25 mg VO (tragado, no sublingual). Reevaluar TA a los 30–60 min.",
            alt: [{ f: "enalapril", dosis: "10 mg VO." }, { f: "amlodipina", dosis: "5 mg VO." }],
            nota: "[MSAL-HTA] Descenso gradual por vía oral; no buscar normalizar la TA en el momento. IECA contraindicados en embarazo, angioedema previo o hiperpotasemia." }
        ],
        receta: ["Reiniciar o ajustar su antihipertensivo habitual (si lo abandonó, retomarlo)."],
        medidas: [
          "Reposo 30 min en ambiente tranquilo y nueva toma de TA antes de medicar.",
          "Investigar abandono del tratamiento, AINE, descongestivos, alcohol, dolor o ansiedad."
        ],
        indicaciones: [
          "Control de TA con su médico de cabecera en 24–72 h.",
          "Tomar la medicación todos los días a la misma hora.",
          "Dieta con poca sal; evitar antiinflamatorios y descongestivos.",
          "Si tiene tensiómetro: registrar la presión mañana y tarde."
        ],
        alarma: [
          "Dolor de pecho o falta de aire.",
          "Pérdida de fuerza, adormecimiento de un lado del cuerpo o dificultad para hablar.",
          "Dolor de cabeza muy intenso o visión borrosa.",
          "Llamar al 107 o al 911."
        ]
      },
      {
        id: "hta_reactiva", cie10: "R03.0", snomed: "",
        nombre: "Elevación tensional reactiva (dolor / ansiedad)",
        criterio: "TA elevada en contexto de dolor, ansiedad o estrés, que desciende con reposo o tratamiento de la causa.",
        tratamiento: [
          { cond: true, f: "lorazepam", dosis: "1 mg SL si hay ansiedad marcada.",
            alt: [{ f: "diazepam", dosis: "5 mg VO." }],
            nota: "No indicar antihipertensivo de rescate: tratar la causa y re-medir." }
        ],
        receta: [],
        medidas: ["Tratar el dolor si lo hay.", "Reposo, respiración pausada, re-medir a los 30 min."],
        indicaciones: ["Control de TA ambulatorio en la semana.", "No manejar si recibió benzodiacepinas."],
        alarma: [
          "Dolor de pecho, falta de aire o síntomas neurológicos.",
          "Llamar al 107 o al 911."
        ]
      }
    ]
  },

  /* ---------------------------------------------------------------- */
  {
    id: "neuro", cie10: "R29.8", snomed: "",
    titulo: "Foco neurológico / vértigo",
    corto: "Neuro",
    keywords: ["foco", "neurologico", "neurológico", "acv", "ictus", "paralisis", "parálisis", "hemiparesia", "debilidad", "habla", "boca torcida", "vertigo", "vértigo", "mareo", "convulsion", "convulsión", "facial"],
    fuentes: ["MSAL-ACV", "ACLS", "SAME", "SAE"],
    banderas: [
      { id: "n1", nivel: "rojo", texto: "Asimetría facial, caída de un brazo o alteración del habla (Cincinnati +)", conducta: "Activar Código ACV: registrar hora y preavisar centro con trombólisis." },
      { id: "n2", nivel: "rojo", texto: "Déficit que comenzó en las últimas 24 h (registrar última vez visto bien)", conducta: "Ventana terapéutica: Código ACV." },
      { id: "n3", nivel: "rojo", texto: "Cefalea súbita e intensa, 'la peor de su vida'", conducta: "Sospecha de hemorragia subaracnoidea: traslado." },
      { id: "n4", nivel: "rojo", texto: "Convulsión", conducta: "Convulsión: benzodiacepina si persiste, glucemia, traslado." },
      { id: "n5", nivel: "rojo", texto: "Vértigo con diplopía, disartria, ataxia o nistagmo vertical (signos centrales)", conducta: "Vértigo de causa central probable: Código ACV." },
      { id: "n6", nivel: "rojo", texto: "Imposibilidad de caminar sin ayuda", conducta: "Ataxia: descartar causa central, traslado." },
      { id: "n7", nivel: "rojo", texto: "Paciente anticoagulado o con trauma de cráneo", conducta: "Riesgo de hemorragia intracraneal: traslado para TC." },
      { id: "n8", nivel: "rojo", texto: "Parálisis facial que respeta la frente (central)", conducta: "Parálisis facial central: Código ACV." },
      { id: "n9", nivel: "amarillo", texto: "Primer vértigo en > 60 años o con factores de riesgo vascular", conducta: "Mayor riesgo de causa central: examen neurológico completo. Ante cualquier duda, trasladar." }
    ],
    soporte: [
      "Medir glucemia capilar: si < 60 mg/dl tratar (simula ACV).",
      "ABC, cabecera a 0–30°, O₂ solo si SatO₂ < 94 %.",
      "Registrar hora de inicio / última vez visto bien. Escala de Cincinnati.",
      "Acceso venoso con SF (no soluciones glucosadas). Nada por boca.",
      "No descender la TA en el prehospitalario.",
      "Convulsión activa: diazepam 10 mg EV lento o midazolam 10 mg IM.",
      "Activar Código ACV: preaviso a centro con capacidad de trombólisis."
    ],
    diagnosticos: [
      {
        id: "vertigo_perif", cie10: "H81.3", snomed: "",
        nombre: "Vértigo periférico agudo",
        criterio: "Vértigo rotatorio, desencadenado por posición o de inicio insidioso, nistagmo horizontal, sin signos centrales, camina con ayuda mínima.",
        tratamiento: [
          { f: "dimenhidrinato", dosis: "50 mg IM o EV lento diluido.",
            alt: [{ f: "metoclopramida", dosis: "10 mg IM/EV si predominan las náuseas." }] }
        ],
        receta: ["Dimenhidrinato 50 mg VO cada 8 h por 48–72 h como máximo."],
        medidas: ["Reposo relativo; levantarse despacio.", "Hidratación."],
        indicaciones: [
          "No manejar ni operar maquinaria mientras tenga síntomas o tome la medicación.",
          "Consulta con otorrinolaringología o clínica médica en la semana."
        ],
        alarma: [
          "Pérdida de fuerza o adormecimiento de un lado del cuerpo.",
          "Dificultad para hablar o visión doble.",
          "No puede mantenerse en pie o caminar.",
          "Dolor de cabeza intenso.",
          "Llamar al 107 o al 911."
        ]
      },
      {
        id: "bell", cie10: "G51.0", snomed: "",
        nombre: "Parálisis facial periférica aislada",
        criterio: "Parálisis de toda la hemicara (incluye la frente), sin otro déficit, sin trauma ni otitis complicada.",
        tratamiento: [],
        receta: [
          "Meprednisona 60 mg/día VO por 5 días y luego descenso en 5 días (iniciar en las primeras 72 h).",
          "Lágrimas artificiales cada 2–4 h y oclusión ocular nocturna."
        ],
        medidas: ["Protección del ojo afectado."],
        indicaciones: ["Consulta con clínica médica o neurología dentro de las 72 h."],
        alarma: [
          "Pérdida de fuerza en brazo o pierna, o dificultad para hablar.",
          "Dolor de oído intenso con fiebre o lesiones en el oído.",
          "Ojo rojo o doloroso.",
          "Llamar al 107 o al 911."
        ]
      }
    ]
  },

  /* ---------------------------------------------------------------- */
  {
    id: "lumbar", cie10: "M54.5", snomed: "",
    titulo: "Dolor lumbar / trauma leve",
    corto: "Lumbar / trauma",
    keywords: ["lumbar", "lumbalgia", "espalda", "cintura", "trauma", "golpe", "caida", "caída", "contusion", "contusión", "esguince", "torcedura", "ciatica", "ciática"],
    fuentes: ["PHTLS", "SAME", "SAE"],
    banderas: [
      { id: "l1", nivel: "rojo", texto: "Retención o incontinencia urinaria / anestesia en silla de montar", conducta: "Sospecha de síndrome de cauda equina: traslado." },
      { id: "l2", nivel: "rojo", texto: "Debilidad o déficit sensitivo progresivo en miembros", conducta: "Compresión radicular o medular: traslado." },
      { id: "l3", nivel: "rojo", texto: "Fiebre o antecedente oncológico / pérdida de peso", conducta: "Sospecha de infección o metástasis vertebral: traslado." },
      { id: "l4", nivel: "rojo", texto: "Dolor lumbar + hipotensión o masa pulsátil (aneurisma de aorta)", conducta: "Sospecha de aneurisma complicado: traslado urgente." },
      { id: "l5", nivel: "rojo", texto: "Mecanismo de alta energía o caída de altura", conducta: "[PHTLS] Mecanismo de riesgo: XABCDE y restricción espinal, traslado." },
      { id: "l6", nivel: "rojo", texto: "Dolor en línea media cervical o dorsal tras trauma", conducta: "[PHTLS] Restricción de movimiento espinal y traslado." },
      { id: "l7", nivel: "rojo", texto: "Deformidad, crepitación o impotencia funcional (sospecha de fractura)", conducta: "Inmovilizar la fractura, analgesia y traslado." },
      { id: "l8", nivel: "amarillo", texto: "> 65 años, osteoporosis o corticoides crónicos con trauma", conducta: "Riesgo de fractura con trauma menor: si hay dolor óseo puntual o no puede movilizarse, trasladar para radiografía." },
      { id: "l9", nivel: "rojo", texto: "Trauma de cráneo con pérdida de conocimiento, vómitos o amnesia", conducta: "Trauma de cráneo de riesgo: traslado para TC." },
      { id: "l10", nivel: "rojo", texto: "Paciente anticoagulado con golpe en la cabeza", conducta: "Anticoagulado con golpe en la cabeza: traslado para TC aunque esté asintomático." },
      { id: "l11", nivel: "amarillo", texto: "Anticoagulado con trauma menor periférico", conducta: "Controlar hematoma y explicar pautas de sangrado. Control médico en 24 h." }
    ],
    soporte: [
      "[PHTLS] Evaluación XABCDE: controlar primero la hemorragia exsanguinante (torniquete si es extremidad).",
      "Restricción de movimiento espinal (collar, tabla) si el mecanismo o la clínica lo indican.",
      "ABC, control de hemorragias externas.",
      "Inmovilización de fracturas antes de mover al paciente.",
      "Acceso venoso. Hipotensión permisiva (TAS 80–90) si no hay TEC; con TEC mantener TAS ≥ 110.",
      "Sangrado significativo < 3 h: ácido tranexámico 1 g EV en 10 min.",
      "Analgesia: dipirona 2 g EV lento o ketorolac 30 mg EV (evitar AINE si hay sangrado).",
      "Monitoreo neurológico seriado. Preaviso al centro receptor."
    ],
    diagnosticos: [
      {
        id: "lumbalgia", cie10: "M54.5", snomed: "",
        nombre: "Lumbalgia mecánica aguda",
        criterio: "Dolor lumbar que empeora con el movimiento y mejora con reposo, sin déficit neurológico ni banderas rojas.",
        tratamiento: [
          { f: "diclofenac", dosis: "75 mg IM profunda (glúteo), dosis única.",
            alt: [{ f: "ketorolac", dosis: "30–60 mg IM." }],
            nota: "Evitar AINE en insuficiencia renal, úlcera, anticoagulación o embarazo." },
          { cond: true, f: "dipirona", dosis: "1–2 g IM o EV lento si el AINE está contraindicado." }
        ],
        receta: ["Ibuprofeno 400 mg VO cada 8 h con comidas por 5–7 días."],
        medidas: ["Mantenerse activo: el reposo absoluto empeora la evolución.", "Calor local 20 min 3 veces por día."],
        indicaciones: ["Consulta con su médico si no mejora en 1–2 semanas."],
        alarma: [
          "Dificultad para orinar o pérdida de control de esfínteres.",
          "Pérdida de fuerza o adormecimiento en las piernas o en la zona genital.",
          "Fiebre.",
          "Llamar al 107 o al 911."
        ]
      },
      {
        id: "contusion", cie10: "T14.0", snomed: "",
        nombre: "Contusión o esguince leve",
        criterio: "Trauma de baja energía, puede apoyar o mover la extremidad, sin deformidad ni dolor óseo puntual.",
        tratamiento: [
          { f: "ketorolac", dosis: "30 mg IM si el dolor es moderado.",
            alt: [{ f: "diclofenac", dosis: "75 mg IM." }, { f: "dipirona", dosis: "1 g IM." }] }
        ],
        receta: ["Ibuprofeno 400 mg VO cada 8 h con comidas por 3–5 días."],
        medidas: ["Hielo envuelto 15–20 min cada 2–3 h por 48 h.", "Elevación del miembro y vendaje compresivo suave."],
        indicaciones: ["Consulta con traumatología si no mejora en 5–7 días o no puede apoyar."],
        alarma: [
          "Aumento importante de hinchazón, dolor o deformidad.",
          "Dedos fríos, pálidos o adormecidos.",
          "Llamar al 107 o al 911."
        ]
      }
    ]
  },

  /* ---------------------------------------------------------------- */
  {
    id: "torax", cie10: "R07.4", snomed: "",
    titulo: "Dolor torácico",
    corto: "Dolor torácico",
    keywords: ["torax", "tórax", "toracico", "torácico", "pecho", "precordial", "infarto", "angina", "opresion", "opresión", "palpitaciones"],
    fuentes: ["ACLS", "SAME", "SAE"],
    banderas: [
      { id: "t1", nivel: "rojo", texto: "Dolor opresivo, irradiado, con sudoración o náuseas", conducta: "Probable SCA: ECG, AAS, nitrato si TAS > 90, traslado." },
      { id: "t2", nivel: "rojo", texto: "ECG anormal: supra o infradesnivel ST, BRI nuevo, arritmia", conducta: "ECG patológico: preaviso a hemodinamia si hay supradesnivel ST." },
      { id: "t3", nivel: "rojo", texto: "Disnea, síncope o hipotensión asociados", conducta: "Inestabilidad: monitor-desfibrilador y traslado." },
      { id: "t4", nivel: "rojo", texto: "Dolor desgarrante hacia la espalda o asimetría de pulsos (disección)", conducta: "Sospecha de disección: no dar AAS, traslado urgente." },
      { id: "t5", nivel: "rojo", texto: "Disnea súbita + taquicardia con factores de riesgo de TEP", conducta: "Sospecha de TEP: O₂ y traslado." },
      { id: "t6", nivel: "amarillo", texto: "Antecedente de cardiopatía isquémica o múltiples factores de riesgo", conducta: "Solo puede quedar en domicilio si el dolor es claramente osteomuscular y el ECG es normal. Ante duda, trasladar." },
      { id: "t7", nivel: "rojo", texto: "No es posible realizar ECG en escena", conducta: "Sin ECG no se puede descartar SCA: traslado." }
    ],
    soporte: [
      "ECG de 12 derivaciones en < 10 min; transmitir si hay sistema.",
      "AAS 162–325 mg masticada (si no hay alergia ni sospecha de disección).",
      "Dinitrato de isosorbide 5 mg SL si TAS > 90, sin IAM de VD ni uso de sildenafil en 48 h.",
      "O₂ solo si SatO₂ < 90 %.",
      "Acceso venoso, monitor-desfibrilador colocado.",
      "Preaviso a centro con hemodinamia si hay supradesnivel ST."
    ],
    diagnosticos: [
      {
        id: "osteomuscular", cie10: "R07.3", snomed: "",
        nombre: "Dolor torácico osteomuscular",
        criterio: "Dolor punzante reproducible a la palpación o con movimientos, ECG normal, sin factores de riesgo relevantes.",
        tratamiento: [
          { f: "diclofenac", dosis: "75 mg IM.",
            alt: [{ f: "ketorolac", dosis: "30 mg IM." }, { f: "dipirona", dosis: "1 g IM." }] }
        ],
        receta: ["Ibuprofeno 400 mg VO cada 8 h con comidas por 3–5 días."],
        medidas: ["Calor local.", "Evitar esfuerzos que reproduzcan el dolor."],
        indicaciones: ["Consulta con su médico en 24–48 h. Conservar el ECG realizado."],
        alarma: [
          "Dolor opresivo, que se extiende a brazo, mandíbula o espalda.",
          "Falta de aire, sudoración fría o desmayo.",
          "Llamar al 107 o al 911."
        ]
      },
      {
        id: "ansiedad", cie10: "F41.0", snomed: "",
        nombre: "Crisis de ansiedad / ataque de pánico",
        criterio: "Diagnóstico de exclusión: ECG normal, signos vitales normales tras calmarse, cuadro compatible y antecedentes.",
        tratamiento: [
          { f: "lorazepam", dosis: "1–2 mg SL.",
            alt: [{ f: "diazepam", dosis: "5–10 mg VO." }] }
        ],
        receta: [],
        medidas: ["Ambiente tranquilo, respiración lenta y guiada."],
        indicaciones: [
          "Consulta con salud mental o su médico en la semana.",
          "No manejar ni consumir alcohol tras recibir benzodiacepinas."
        ],
        alarma: [
          "Dolor de pecho que no cede o cambia de características.",
          "Ideas de hacerse daño.",
          "Llamar al 107 o al 911."
        ]
      }
    ]
  },

  /* ---------------------------------------------------------------- */
  {
    id: "fiebre", cie10: "R50.9", snomed: "",
    titulo: "Fiebre / síndrome febril",
    corto: "Fiebre",
    keywords: ["fiebre", "febril", "temperatura", "dengue", "escalofrios", "escalofríos", "infeccion", "infección", "angina", "garganta"],
    fuentes: ["MSAL-DENGUE", "SAME", "SAE"],
    banderas: [
      { id: "f1", nivel: "rojo", texto: "Rigidez de nuca, petequias o púrpura", conducta: "Sospecha de meningococcemia / meningitis: barbijo, traslado inmediato." },
      { id: "f2", nivel: "rojo", texto: "Confusión o somnolencia", conducta: "Probable sepsis o infección del SNC: traslado." },
      { id: "f3", nivel: "rojo", texto: "Inmunosupresión (quimioterapia, trasplante, corticoides crónicos, HIV avanzado)", conducta: "Posible neutropenia febril: traslado." },
      { id: "f4", nivel: "rojo", texto: "Dengue con signos de alarma: dolor abdominal intenso, vómitos persistentes, sangrado de mucosas, lipotimia", conducta: "[MSAL-DENGUE] Dengue con signos de alarma (grupo C): hidratación EV y traslado." },
      { id: "f5", nivel: "rojo", texto: "Intolerancia oral o deshidratación", conducta: "Hidratación EV y traslado." },
      { id: "f6", nivel: "amarillo", texto: "Adulto mayor frágil con deterioro del estado general", conducta: "Buscar foco con examen completo. Puede quedar en domicilio con acompañante y control en 24 h; umbral bajo para trasladar." },
      { id: "f7", nivel: "rojo", texto: "Foco que requiere evaluación hospitalaria (neumonía, pielonefritis, celulitis extensa)", conducta: "Foco que requiere tratamiento hospitalario: traslado." },
      { id: "f8", nivel: "amarillo", texto: "Sospecha de dengue con comorbilidad (embarazo, > 65 años, diabetes, cardiopatía, nefropatía) o riesgo social", conducta: "[MSAL-DENGUE] Grupo B: requiere control diario. Si no se puede garantizar el seguimiento en 24 h, trasladar." }
    ],
    soporte: [
      "Sospecha de meningitis: barbijo para el equipo y paciente, traslado inmediato.",
      "Hipotensión: SF o Ringer 500–1000 ml en bolo, reevaluando.",
      "O₂ si SatO₂ < 92 %.",
      "Antitérmico: dipirona 1 g EV lento o paracetamol (evitar AINE e IM si se sospecha dengue).",
      "Preaviso al centro receptor."
    ],
    diagnosticos: [
      {
        id: "fiebre_vas", cie10: "J06.9", snomed: "",
        nombre: "Síndrome febril con foco de vía aérea superior",
        criterio: "Fiebre con odinofagia, rinorrea o tos, buen estado general, signos vitales normales al ceder la fiebre.",
        tratamiento: [
          { f: "paracetamol", dosis: "1 g VO.",
            alt: [{ f: "dipirona", dosis: "1 g IM o EV lento diluido." }] }
        ],
        receta: ["Paracetamol 500 mg–1 g VO cada 6–8 h si T ≥ 38 °C (máx. 3–4 g/día)."],
        medidas: ["Hidratación abundante.", "Ropa liviana; no usar baños fríos ni alcohol."],
        indicaciones: ["Consulta con su médico si la fiebre dura más de 72 h o aparece placa en la garganta."],
        alarma: [
          "Manchas en la piel que no desaparecen al presionarlas.",
          "Rigidez de cuello, confusión o somnolencia.",
          "Falta de aire.",
          "Llamar al 107 o al 911."
        ]
      },
      {
        id: "dengue_a", cie10: "A90", snomed: "",
        nombre: "Sospecha de dengue sin signos de alarma",
        criterio: "Fiebre de < 7 días con cefalea, dolor retroocular, mialgias o exantema, en contexto epidemiológico, sin signos de alarma, tolera VO.",
        tratamiento: [
          { f: "paracetamol", dosis: "1 g VO.",
            nota: "[MSAL-DENGUE] No usar AINE, aspirina, corticoides ni medicación intramuscular." }
        ],
        receta: ["Paracetamol 500 mg–1 g VO cada 6 h si hay fiebre o dolor (máx. 4 g/día)."],
        medidas: ["Abundante líquido (agua, jugos, caldos, SRO).", "Reposo y uso de mosquitero / repelente para no transmitir."],
        indicaciones: [
          "Control clínico en 24–48 h y especialmente cuando baje la fiebre (fase crítica).",
          "Es una enfermedad de notificación obligatoria: indicar consulta en centro de salud para análisis."
        ],
        alarma: [
          "Dolor de panza intenso o continuo.",
          "Vómitos que no paran.",
          "Sangrado de encías, nariz u orina.",
          "Mareos, desmayo, somnolencia o irritabilidad.",
          "Disminución de la orina.",
          "Llamar al 107 o al 911."
        ]
      }
    ]
  },

  /* ---------------------------------------------------------------- */
  {
    id: "glucemia", cie10: "R73.9", snomed: "",
    titulo: "Hipo / hiperglucemia",
    corto: "Glucemia",
    keywords: ["glucemia", "hipoglucemia", "hiperglucemia", "diabetes", "diabetico", "diabético", "azucar", "azúcar", "insulina", "descompensacion", "descompensación"],
    fuentes: ["ACLS", "PALS", "SAME", "SAE"],
    banderas: [
      { id: "g1", nivel: "rojo", texto: "Hipoglucemia que no revierte o recurre tras el tratamiento", conducta: "Dextrosa EV y traslado." },
      { id: "g2", nivel: "rojo", texto: "Uso de sulfonilureas (glibenclamida) o insulina de acción prolongada", conducta: "Riesgo de hipoglucemia prolongada: observación hospitalaria." },
      { id: "g3", nivel: "rojo", texto: "Alteración del sensorio que persiste tras normalizar la glucemia", conducta: "Otra causa probable del deterioro: traslado." },
      { id: "g4", nivel: "rojo", texto: "No puede comer o queda solo en domicilio", conducta: "Riesgo de recurrencia sin vigilancia: traslado." },
      { id: "g5", nivel: "rojo", texto: "Causa no aclarada (no diabético, alcohol, sepsis, intoxicación)", conducta: "Causa no aclarada: traslado." },
      { id: "g6", nivel: "rojo", texto: "Glucemia > 250 con vómitos, dolor abdominal o respiración de Kussmaul (cetoacidosis)", conducta: "Probable cetoacidosis: SF EV y traslado." },
      { id: "g7", nivel: "rojo", texto: "Glucemia > 600 o deshidratación marcada", conducta: "Probable estado hiperosmolar: SF EV y traslado." },
      { id: "g8", nivel: "amarillo", texto: "Hiperglucemia 250–400 mg/dl con infección intercurrente", conducta: "Buscar foco, hidratación oral y control con su médico en 24 h." }
    ],
    soporte: [
      "Hipoglucemia sin vía oral: dextrosa 25 % 50–100 ml EV (12,5–25 g); glucagón 1 mg IM si no hay acceso.",
      "Alcoholismo o desnutrición: tiamina 100 mg EV/IM antes de la dextrosa.",
      "Hiperglucemia con deshidratación: SF 1000 ml en la primera hora si no hay insuficiencia cardíaca.",
      "Glucemias capilares seriadas durante el traslado.",
      "Preaviso al centro receptor."
    ],
    diagnosticos: [
      {
        id: "hipo_revertida", cie10: "E16.0", snomed: "",
        nombre: "Hipoglucemia revertida en diabético con insulina rápida u omisión de comida",
        criterio: "Recupera la conciencia por completo, puede comer, causa clara, sin sulfonilureas ni insulina de acción prolongada, acompañado.",
        tratamiento: [
          { cond: true, f: "dextrosa25", dosis: "Si no tolera VO: 50–100 ml EV (12,5–25 g). Glucemia de control a los 15 min.",
            alt: [{ f: "glucagon", dosis: "1 mg IM o SC." }],
            nota: "Si está consciente y deglute: 15–20 g de hidratos VO (3 cucharadas de azúcar en agua o ½ vaso de jugo) y re-medir a los 15 min." }
        ],
        receta: [],
        medidas: ["Comida con hidratos complejos tras la corrección (pan, galletitas)."],
        indicaciones: [
          "Controlar la glucemia cada 2–4 h durante las próximas 12–24 h.",
          "No quedarse solo durante las próximas 12 h.",
          "Revisar con su médico la dosis de insulina en las próximas 48 h."
        ],
        alarma: [
          "Sudoración, temblor, confusión o somnolencia.",
          "Glucemia menor a 70 mg/dl que no sube con azúcar.",
          "Convulsión o pérdida del conocimiento.",
          "Llamar al 107 o al 911."
        ]
      },
      {
        id: "hiper_simple", cie10: "R73.9", snomed: "",
        nombre: "Hiperglucemia simple sin cetosis",
        criterio: "Diabético conocido, glucemia < 400, tolera VO, sin vómitos ni dolor abdominal, sensorio normal.",
        tratamiento: [],
        receta: ["Continuar su tratamiento habitual; no suspender la insulina."],
        medidas: ["Hidratación oral abundante con agua."],
        indicaciones: [
          "Control con su médico en 24–48 h.",
          "Medir glucemia cada 4–6 h si tiene glucómetro."
        ],
        alarma: [
          "Vómitos, dolor de panza o respiración agitada.",
          "Mucha sed y orina abundante que no mejoran.",
          "Somnolencia o confusión.",
          "Llamar al 107 o al 911."
        ]
      }
    ]
  },

  /* ---------------------------------------------------------------- */
  {
    id: "alergia", cie10: "T78.4", snomed: "",
    titulo: "Reacción alérgica",
    corto: "Alergia",
    keywords: ["alergia", "alergica", "alérgica", "urticaria", "ronchas", "picazon", "picazón", "hinchazon", "hinchazón", "anafilaxia", "picadura", "edema"],
    fuentes: ["ACLS", "PALS", "SAME", "SAE"],
    banderas: [
      { id: "al1", nivel: "rojo", texto: "Disnea, sibilancias, estridor o disfonía", conducta: "Anafilaxia: adrenalina 0,5 mg IM y traslado." },
      { id: "al2", nivel: "rojo", texto: "Edema de lengua, úvula o glotis", conducta: "Anafilaxia: adrenalina 0,5 mg IM, O₂, traslado." },
      { id: "al3", nivel: "rojo", texto: "Hipotensión, síncope o mareo intenso", conducta: "Shock anafiláctico: adrenalina IM, SF en bolo, traslado." },
      { id: "al4", nivel: "rojo", texto: "Vómitos o dolor abdominal intenso tras alérgeno conocido", conducta: "Anafilaxia: adrenalina 0,5 mg IM y traslado." },
      { id: "al5", nivel: "rojo", texto: "Progresión rápida de los síntomas", conducta: "Adrenalina IM ante cualquier signo sistémico y traslado." },
      { id: "al6", nivel: "amarillo", texto: "Antecedente de anafilaxia", conducta: "Si la reacción actual es solo cutánea puede quedar en domicilio, con observación prolongada en escena y consulta con alergista." },
      { id: "al7", nivel: "rojo", texto: "Angioedema en paciente que toma IECA (enalapril, captopril)", conducta: "Angioedema por IECA: no responde bien a adrenalina, traslado." }
    ],
    soporte: [
      "ADRENALINA 0,5 mg IM (0,5 ml de 1:1000) en cara anterolateral del muslo. Repetir cada 5–15 min.",
      "Decúbito supino con piernas elevadas (sentado si predomina la disnea).",
      "O₂ a alto flujo.",
      "Hipotensión: SF 500–1000 ml en bolo rápido.",
      "Broncoespasmo: salbutamol nebulizado.",
      "Antihistamínico y corticoide son coadyuvantes; no reemplazan a la adrenalina.",
      "Observación hospitalaria por riesgo de reacción bifásica."
    ],
    diagnosticos: [
      {
        id: "urticaria", cie10: "L50.0", snomed: "",
        nombre: "Urticaria / reacción alérgica cutánea sin compromiso sistémico",
        criterio: "Lesiones cutáneas y prurito, sin compromiso respiratorio, cardiovascular ni digestivo.",
        tratamiento: [
          { f: "difenhidramina", dosis: "50 mg IM o EV lento." },
          { cond: true, f: "dexametasona", dosis: "8 mg IM si las lesiones son extensas.",
            alt: [{ f: "hidrocortisona", dosis: "200 mg IM/EV." }] }
        ],
        receta: ["Loratadina 10 mg/día o cetirizina 10 mg/día VO por 5–7 días."],
        medidas: ["Identificar y evitar el desencadenante.", "Compresas frías locales."],
        indicaciones: [
          "No manejar: la medicación puede dar somnolencia.",
          "Consulta con alergista si fue una reacción a alimento, medicamento o picadura."
        ],
        alarma: [
          "Falta de aire o silbido en el pecho.",
          "Hinchazón de labios, lengua o garganta, o cambio en la voz.",
          "Mareo o desmayo.",
          "Llamar al 107 o al 911."
        ]
      }
    ]
  },

  /* ---------------------------------------------------------------- */
  {
    id: "cefalea", cie10: "R51", snomed: "",
    titulo: "Cefalea",
    corto: "Cefalea",
    keywords: ["cefalea", "dolor de cabeza", "migraña", "jaqueca", "cabeza"],
    fuentes: ["SAME", "SAE"],
    banderas: [
      { id: "c1", nivel: "rojo", texto: "Inicio súbito e intenso (en segundos)", conducta: "Sospecha de hemorragia subaracnoidea: traslado." },
      { id: "c2", nivel: "rojo", texto: "Fiebre + rigidez de nuca", conducta: "Sospecha de meningitis: barbijo y traslado." },
      { id: "c3", nivel: "rojo", texto: "Foco neurológico, confusión o convulsión", conducta: "Causa secundaria probable: traslado." },
      { id: "c4", nivel: "rojo", texto: "Primera cefalea intensa en > 50 años o cambio del patrón habitual", conducta: "Cefalea secundaria posible: traslado para estudio." },
      { id: "c5", nivel: "rojo", texto: "Posterior a trauma de cráneo", conducta: "Trauma de cráneo: traslado para TC." },
      { id: "c6", nivel: "rojo", texto: "Embarazo o puerperio", conducta: "Descartar preeclampsia o trombosis venosa: traslado." },
      { id: "c7", nivel: "rojo", texto: "Inmunosupresión, cáncer o anticoagulación", conducta: "Alto riesgo de causa secundaria: traslado." },
      { id: "c8", nivel: "rojo", texto: "TA ≥ 180/120 con síntomas", conducta: "Emergencia hipertensiva: traslado." },
      { id: "c9", nivel: "amarillo", texto: "Usa analgésicos más de 10 días por mes", conducta: "Probable cefalea por abuso de medicación: tratar la crisis y derivar a neurología en forma programada." }
    ],
    soporte: [
      "Glucemia capilar, signos vitales y evaluación neurológica seriada.",
      "Acceso venoso. Cabecera a 30°.",
      "Analgesia: dipirona 1–2 g EV lento.",
      "Náuseas: metoclopramida 10 mg EV lento.",
      "Preaviso al centro receptor."
    ],
    diagnosticos: [
      {
        id: "migrana", cie10: "G43.9", snomed: "",
        nombre: "Migraña o cefalea tensional (patrón habitual)",
        criterio: "Paciente con diagnóstico previo, cefalea similar a episodios anteriores, examen neurológico normal.",
        tratamiento: [
          { f: "ketorolac", dosis: "30 mg IM o EV lento.",
            alt: [{ f: "diclofenac", dosis: "75 mg IM." }, { f: "dipirona", dosis: "1–2 g IM o EV lento diluido." }] },
          { f: "metoclopramida", dosis: "10 mg IM o EV lento (náuseas y efecto antimigrañoso)." }
        ],
        receta: ["Ibuprofeno 400–600 mg VO o paracetamol 1 g VO al inicio del dolor (no más de 10 días por mes)."],
        medidas: ["Reposo en ambiente oscuro y silencioso.", "Hidratación."],
        indicaciones: ["Consulta con neurología o su médico si las crisis son frecuentes."],
        alarma: [
          "Dolor de cabeza que empeora o es el peor de su vida.",
          "Fiebre con rigidez de cuello.",
          "Pérdida de fuerza, dificultad para hablar o visión doble.",
          "Llamar al 107 o al 911."
        ]
      }
    ]
  }
];

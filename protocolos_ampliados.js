/* =========================================================================
   PROTOCOLOS AMPLIADOS — motivos frecuentes del prehospitalario
   -------------------------------------------------------------------------
   ESTADO: BORRADOR — REQUIERE VALIDACIÓN DE LA DIRECCIÓN MÉDICA.
   Misma estructura que data/protocolos.js. Se agregan a window.PROTOCOLOS.

   Referencias adicionales (Argentina):
   [MSAL-SM]    Lineamientos MSAL para la atención de la urgencia en salud
                mental y Ley Nacional de Salud Mental 26.657.
   [MSAL-PONZ]  Guías MSAL de envenenamiento por animales ponzoñosos
                (escorpionismo, araneísmo).
   [MSAL-RABIA] Normas MSAL de profilaxis antirrábica humana.
   [MSAL-VAC]   Calendario Nacional de Vacunación (dT).
   [CIAAT]      Centros de información toxicológica: Hospital Posadas
                0800-333-0160 · Hospital de Niños R. Gutiérrez 0800-444-8694
                (verificar números vigentes).
   ========================================================================= */
(function () {
  const R = (id, texto, conducta) => ({ id, nivel: "rojo", texto, conducta });
  const A = (id, texto, conducta) => ({ id, nivel: "amarillo", texto, conducta });
  const LLAMAR = "Llamar al 107 o al 911.";

  const NUEVOS = [
    /* ------------------------------------------------------------ */
    {
      id: "agitacion", cie10: "R45.1", snomed: "", titulo: "Agitación psicomotriz", corto: "Agitación",
      keywords: ["agitacion", "agitado", "agitada", "excitado", "excitacion", "brote", "violento", "violenta", "agresivo", "agresiva", "psicotico", "psicosis", "loco", "delirio", "alucinaciones", "descontrolado", "descontrolada", "excitacion psicomotriz", "salud mental", "psiquiatrico"],
      fuentes: ["MSAL-SM", "SAME", "SAE"],
      banderas: [
        R("ag1", "Fiebre, foco neurológico, trauma de cráneo o hipoxemia (causa orgánica probable)", "Tratar la causa orgánica y trasladar a hospital general."),
        R("ag2", "Confusión fluctuante o desorientación (delirium)", "El delirium es una urgencia médica: glucemia, SatO₂ y traslado."),
        R("ag3", "Sospecha de intoxicación o abstinencia (alcohol, cocaína, benzodiacepinas)", "Abstinencia alcohólica: tiamina 100 mg + benzodiacepina. Traslado."),
        R("ag4", "Riesgo cierto e inminente para sí o para terceros", "[Ley 26.657] Traslado a guardia de hospital general para evaluación interdisciplinaria. Pedir apoyo policial si peligra el equipo."),
        R("ag5", "Ideas de muerte o intento de suicidio", "No dejar solo al paciente. Traslado para evaluación de salud mental."),
        R("ag6", "Requirió sedación por vía parenteral", "Riesgo de depresión respiratoria: monitoreo de SatO₂ y traslado."),
        R("ag7", "Primer episodio psicótico", "Requiere evaluación médica y de salud mental: traslado."),
        A("ag8", "Diagnóstico psiquiátrico conocido con descompensación leve que cede con abordaje verbal", "Puede quedar en domicilio con acompañante responsable. Contactar a su equipo tratante en 24–48 h.")
      ],
      soporte: [
        "Seguridad del equipo primero: salida libre, retirar objetos peligrosos, pedir apoyo si hace falta.",
        "Abordaje verbal: tono calmo, una sola persona habla, ofrecer opciones.",
        "Glucemia capilar, SatO₂, temperatura y signos vitales en cuanto sea seguro.",
        "Sedación si el abordaje verbal falla: haloperidol 5 mg IM + midazolam 5 mg IM (o lorazepam 2 mg VO si acepta).",
        "Contención física solo como último recurso, con personal suficiente, por el menor tiempo posible y registrada en la historia clínica.",
        "Tras sedar: monitoreo de SatO₂ y FR durante todo el traslado.",
        "[Ley 26.657] Traslado a hospital general, no a institución monovalente."
      ],
      diagnosticos: [
        {
          id: "descomp_leve", cie10: "R45.1", snomed: "", nombre: "Descompensación conductual leve en paciente psiquiátrico conocido",
          criterio: "Antecedente psiquiátrico, sin causa orgánica, acepta medicación oral y cede con el abordaje verbal.",
          tratamiento: [
            { f: "lorazepam", dosis: "1–2 mg VO o SL.", alt: [{ f: "diazepam", dosis: "10 mg VO." }] }
          ],
          receta: ["Continuar su medicación psiquiátrica habitual."],
          medidas: ["Ambiente tranquilo, retirar objetos peligrosos.", "Acompañante responsable las próximas 24 h."],
          indicaciones: ["Contactar a su psiquiatra o equipo tratante en 24–48 h.", "No consumir alcohol ni otras sustancias."],
          alarma: ["Agresividad o agitación que vuelve.", "Ideas de hacerse daño o de dañar a otros.", "Confusión, fiebre o somnolencia excesiva.", LLAMAR]
        }
      ]
    },

    /* ------------------------------------------------------------ */
    {
      id: "sincope", cie10: "R55", snomed: "", titulo: "Síncope / desmayo", corto: "Síncope",
      keywords: ["sincope", "desmayo", "desmayado", "desmayada", "se desmayo", "lipotimia", "perdio el conocimiento", "desvanecimiento", "se desvanecio", "perdida de conocimiento"],
      fuentes: ["ACLS", "SAME", "SAE"],
      banderas: [
        R("si1", "Dolor torácico, disnea o palpitaciones antes del episodio", "Probable causa cardíaca: ECG, monitor y traslado."),
        R("si2", "Ocurrió durante el esfuerzo o acostado", "Síncope de alto riesgo: traslado con monitor."),
        R("si3", "ECG anormal: bloqueo AV, FC < 40, QT largo, patrón de Brugada, TV", "Arritmia: ver algoritmos ACLS y trasladar."),
        R("si4", "Cardiopatía estructural o insuficiencia cardíaca conocida", "Alto riesgo de arritmia: traslado."),
        R("si5", "Antecedente familiar de muerte súbita antes de los 50 años", "Traslado para estudio cardiológico."),
        R("si6", "Melena, dolor abdominal o hipotensión que persiste", "Posible sangrado: dos accesos y traslado."),
        R("si7", "Trauma significativo, foco neurológico o convulsión", "Traslado."),
        A("si8", "Mayor de 65 años sin otros criterios", "ECG obligatorio. Si es normal y se recuperó por completo, control con su médico en 24–48 h."),
        A("si9", "Toma antihipertensivos o diuréticos con hipotensión ortostática", "Revisar medicación con su médico en 24–48 h.")
      ],
      soporte: ["Decúbito supino con piernas elevadas.", "ECG de 12 derivaciones y monitor.", "Glucemia capilar.", "Acceso venoso; SF en bolo si hay hipotensión.", "Arritmia: algoritmos ACLS.", "Preaviso al centro receptor."],
      diagnosticos: [
        {
          id: "vasovagal", cie10: "R55", snomed: "", nombre: "Síncope vasovagal o situacional",
          criterio: "Desencadenante claro (calor, dolor, miedo, estar de pie, tos, micción), pródromos típicos, recuperación rápida y completa, ECG normal.",
          tratamiento: [{ cond: true, f: "sf", dosis: "500 ml EV si hay hipotensión ortostática que mejora con volumen." }],
          receta: [],
          medidas: ["Reposo acostado 15–20 min antes de incorporarse."],
          indicaciones: ["Ante los síntomas previos, sentarse o acostarse con las piernas elevadas.", "Buena hidratación; levantarse despacio.", "Consulta con su médico en la semana."],
          alarma: ["Nuevo desmayo, sobre todo al hacer esfuerzo o acostado.", "Dolor de pecho, palpitaciones o falta de aire.", "Materia fecal negra.", LLAMAR]
        }
      ]
    },

    /* ------------------------------------------------------------ */
    {
      id: "convulsion", cie10: "R56.8", snomed: "", titulo: "Convulsión", corto: "Convulsión",
      keywords: ["convulsion", "convulsiona", "convulsiono", "convulsiones", "convulsionando", "epilepsia", "epileptico", "epileptica", "ataque epileptico", "crisis convulsiva", "tonico clonica", "espuma por la boca"],
      fuentes: ["SAME", "SAE", "PALS"],
      banderas: [
        R("cv1", "Dura más de 5 min o crisis repetidas sin recuperar la conciencia (estado epiléptico)", "Diazepam 10 mg EV lento o midazolam 10 mg IM; vía aérea, O₂ y traslado."),
        R("cv2", "Primera convulsión de su vida", "Requiere estudio: traslado."),
        R("cv3", "No recupera la conciencia o queda con foco neurológico", "Traslado. Considerar Código ACV."),
        R("cv4", "Trauma de cráneo, fiebre o rigidez de nuca", "Traslado."),
        R("cv5", "Embarazo ≥ 20 semanas o puerperio (eclampsia)", "[MSAL] Sulfato de magnesio 5 g EV lento en 10–15 min y traslado a maternidad (ver ficha Preeclampsia)."),
        R("cv6", "Hipoglucemia, intoxicación o abstinencia como causa", "Tratar la causa y trasladar."),
        R("cv7", "Lesiones importantes durante la crisis o aspiración", "Traslado."),
        A("cv8", "Abandono o cambio reciente de su medicación antiepiléptica", "Retomar el tratamiento indicado y consultar con su neurólogo en 24–48 h.")
      ],
      soporte: ["Proteger de golpes; no introducir objetos en la boca.", "Posición lateral de seguridad al terminar la crisis.", "O₂, aspiración, glucemia capilar.", "Crisis > 5 min: diazepam 10 mg EV lento o midazolam 10 mg IM; repetir una vez si persiste.", "Monitoreo respiratorio tras la benzodiacepina.", "Preaviso al centro receptor."],
      diagnosticos: [
        {
          id: "crisis_conocido", cie10: "G40.9", snomed: "", nombre: "Crisis aislada en epiléptico conocido",
          criterio: "Epilepsia diagnosticada, crisis similar a las habituales, recuperación completa, sin trauma ni fiebre.",
          tratamiento: [{ cond: true, f: "midazolam", dosis: "10 mg IM solo si la crisis se repite en escena.", alt: [{ f: "diazepam", dosis: "10 mg EV lento." }] }],
          receta: ["Continuar su medicación antiepiléptica sin saltear dosis."],
          medidas: ["Acompañante las próximas 24 h."],
          indicaciones: ["No manejar, no nadar ni bañarse solo, no trabajar en altura.", "Dormir bien y evitar alcohol.", "Control con su neurólogo en la semana."],
          alarma: ["Nueva convulsión o una que dure más de 5 minutos.", "No se despierta bien o está confuso.", "Fiebre, dolor de cabeza intenso o golpe en la cabeza.", LLAMAR]
        }
      ]
    },

    /* ------------------------------------------------------------ */
    {
      id: "intoxicacion", cie10: "T65.9", snomed: "", titulo: "Intoxicación", corto: "Intoxicación",
      keywords: ["intoxicacion", "intoxicado", "intoxicada", "tomo pastillas", "sobredosis", "ingesta", "ingirio", "envenenamiento", "veneno", "alcohol", "alcoholizado", "borracho", "ebrio", "monoxido", "brasero", "calefon", "droga", "drogas", "cocaina", "lavandina", "pastillas"],
      fuentes: ["CIAAT", "SAME", "SAE", "ACLS"],
      banderas: [
        R("tx1", "Alteración del sensorio o convulsiones", "XABCDE, glucemia y traslado."),
        R("tx2", "Ingesta intencional o intento de suicidio", "No dejar solo. Traslado: requiere evaluación de salud mental."),
        R("tx3", "Sospecha de monóxido de carbono (brasero, calefón, varios convivientes con cefalea)", "Evacuar, O₂ 100 % con máscara reservorio y trasladar a todos los expuestos."),
        R("tx4", "Sustancia de alto riesgo: antidepresivos, betabloqueantes, bloqueantes cálcicos, paracetamol, organofosforados, metanol, opioides", "Traslado. Consultar al centro toxicológico."),
        R("tx5", "Bradipnea o miosis (sospecha de opioides)", "Naloxona 0,4 mg EV/IM titulada; ventilar. Traslado."),
        R("tx6", "Arritmia, QRS ancho o dolor torácico", "Monitor, ECG y traslado."),
        R("tx7", "Ingesta de cáusticos (lavandina concentrada, destapacañerías)", "No inducir vómito ni dar de beber. Traslado."),
        A("tx8", "Intoxicación alcohólica leve: responde, protege la vía aérea, sin trauma, acompañado", "Puede quedar en domicilio con acompañante sobrio y posición lateral. Si empeora, trasladar."),
        A("tx9", "Ingesta accidental de sustancia de baja toxicidad confirmada por el centro toxicológico", "Seguir la indicación del centro toxicológico y dejar pautas de alarma.")
      ],
      soporte: ["XABCDE y glucemia capilar.", "O₂ según SatO₂ (100 % si se sospecha monóxido).", "Opioides: naloxona 0,4 mg EV/IM, repetir según respuesta.", "Alcoholismo o desnutrición: tiamina 100 mg antes de la dextrosa.", "No inducir el vómito. Llevar el envase o la sustancia.", "Consultar al centro toxicológico: Hospital Posadas 0800-333-0160."],
      diagnosticos: [
        {
          id: "alcohol_leve", cie10: "F10.0", snomed: "", nombre: "Intoxicación alcohólica leve",
          criterio: "Responde a la voz, protege la vía aérea, glucemia normal, sin trauma ni otras sustancias.",
          tratamiento: [
            { cond: true, f: "tiamina", dosis: "100 mg IM si hay consumo crónico o desnutrición." },
            { cond: true, f: "metoclopramida", dosis: "10 mg IM si hay vómitos." }
          ],
          receta: [],
          medidas: ["Posición lateral de seguridad.", "Acompañante sobrio durante las próximas 12 h."],
          indicaciones: ["No volver a beber alcohol hoy.", "Hidratación con agua.", "Ofrecer consulta por consumo problemático si corresponde."],
          alarma: ["No se despierta o respira lento.", "Vómitos con sangre.", "Convulsión o golpe en la cabeza.", LLAMAR]
        }
      ]
    },

    /* ------------------------------------------------------------ */
    {
      id: "epistaxis", cie10: "R04.0", snomed: "", titulo: "Epistaxis", corto: "Epistaxis",
      keywords: ["epistaxis", "sangrado nasal", "sangra la nariz", "sangre por la nariz", "hemorragia nasal", "sangrado de nariz"],
      fuentes: ["SAME", "SAE"],
      banderas: [
        R("ep1", "No cede tras 15–20 min de compresión bien hecha", "Taponamiento anterior si se dispone y traslado."),
        R("ep2", "Taquicardia, hipotensión o mareo al pararse", "Acceso venoso, SF y traslado."),
        R("ep3", "Sangra por ambas fosas o hacia la garganta (posterior)", "Traslado."),
        R("ep4", "Anticoagulado o con trastorno de la coagulación, con sangrado activo", "Traslado."),
        R("ep5", "Trauma facial", "Traslado."),
        A("ep6", "Anticoagulado con sangrado que ya cedió", "Control de coagulación con su médico en 24–48 h."),
        A("ep7", "TA ≥ 180/110", "Calmar y re-medir. No bajar la TA en forma brusca; ver protocolo de pico de presión.")
      ],
      soporte: ["Sentado, cabeza inclinada hacia adelante.", "Compresión bidigital de las alas nasales 15–20 min sin soltar.", "Frío local.", "Acceso venoso si el sangrado es abundante."],
      diagnosticos: [
        {
          id: "epistaxis_ant", cie10: "R04.0", snomed: "", nombre: "Epistaxis anterior autolimitada",
          criterio: "Sangrado por una fosa que cede con compresión, sin repercusión hemodinámica.",
          tratamiento: [],
          receta: ["Vaselina o solución fisiológica nasal para humidificar."],
          medidas: ["Compresión hasta que ceda por completo."],
          indicaciones: ["No sonarse ni hurgarse la nariz por 48 h.", "Evitar esfuerzos y comidas calientes hoy.", "No tomar aspirina ni antiinflamatorios salvo indicación médica."],
          alarma: ["Vuelve a sangrar y no cede en 20 minutos.", "Sangre por la boca o mareos.", LLAMAR]
        }
      ]
    },

    /* ------------------------------------------------------------ */
    {
      id: "ansiedad", cie10: "F41.9", snomed: "", titulo: "Crisis de ansiedad / conversiva", corto: "Ansiedad",
      keywords: ["ansiedad", "angustia", "ataque de panico", "panico", "nervios", "nerviosa", "nervioso", "crisis nerviosa", "hiperventilacion", "conversiva", "conversion", "disociativa", "crisis de angustia"],
      fuentes: ["MSAL-SM", "SAME", "SAE"],
      banderas: [
        R("an1", "Dolor torácico con factores de riesgo o ECG anormal", "Manejar como dolor torácico: traslado."),
        R("an2", "Signos vitales alterados o SatO₂ baja", "Buscar causa orgánica: traslado."),
        R("an3", "Foco neurológico real o confusión", "Traslado."),
        R("an4", "Ideas de muerte o riesgo para sí o terceros", "No dejar solo. Traslado para evaluación de salud mental."),
        R("an5", "Sospecha de intoxicación", "Ver protocolo de intoxicación: traslado."),
        R("an6", "Primer episodio en mayor de 40 años", "Descartar causa orgánica: traslado."),
        A("an7", "Crisis recurrentes sin tratamiento", "Derivar a salud mental en forma programada.")
      ],
      soporte: ["ECG si hay dolor torácico o palpitaciones.", "Glucemia y SatO₂.", "Ambiente tranquilo; respiración lenta guiada."],
      diagnosticos: [
        {
          id: "panico", cie10: "F41.0", snomed: "", nombre: "Crisis de ansiedad / ataque de pánico",
          criterio: "Diagnóstico de exclusión: signos vitales normales al calmarse, ECG normal si había síntomas cardíacos.",
          tratamiento: [{ f: "lorazepam", dosis: "1–2 mg SL.", alt: [{ f: "diazepam", dosis: "5–10 mg VO." }] }],
          receta: [],
          medidas: ["Ambiente tranquilo, respiración lenta y guiada."],
          indicaciones: ["Consulta con salud mental o su médico en la semana.", "No manejar ni tomar alcohol tras la benzodiacepina."],
          alarma: ["Dolor de pecho que no cede.", "Ideas de hacerse daño.", LLAMAR]
        },
        {
          id: "conversiva", cie10: "F44.9", snomed: "", nombre: "Crisis conversiva / disociativa",
          criterio: "Diagnóstico de exclusión: signos vitales normales, glucemia normal, examen neurológico con signos de inconsistencia.",
          tratamiento: [{ cond: true, f: "lorazepam", dosis: "1 mg SL solo si hay ansiedad marcada." }],
          receta: [],
          medidas: ["No confrontar ni minimizar; trato respetuoso.", "Reducir el público alrededor."],
          indicaciones: ["Derivación programada a salud mental.", "Acompañante las próximas horas."],
          alarma: ["Pérdida de fuerza o del habla que persiste.", "Convulsión con mordedura de lengua o pérdida de orina.", LLAMAR]
        }
      ]
    },

    /* ------------------------------------------------------------ */
    {
      id: "itu", cie10: "R30.0", snomed: "", titulo: "Síntomas urinarios", corto: "Urinario",
      keywords: ["orina", "orinar", "ardor al orinar", "disuria", "infeccion urinaria", "cistitis", "pielonefritis", "polaquiuria", "orina seguido", "orina con sangre", "hematuria", "urinaria"],
      fuentes: ["SAME", "SAE"],
      banderas: [
        R("iu1", "Fiebre con vómitos o que no tolera la vía oral", "Pielonefritis con intolerancia oral: traslado."),
        R("iu2", "Hipotensión, taquicardia o confusión (sepsis)", "SF en bolo y traslado."),
        R("iu3", "Embarazada con fiebre o dolor lumbar", "Traslado a maternidad."),
        R("iu4", "Retención urinaria o anuria", "Ver protocolo de retención urinaria."),
        R("iu5", "Inmunosupresión, monorreno o uropatía obstructiva conocida", "Traslado."),
        R("iu6", "Adulto mayor con confusión", "Traslado."),
        A("iu7", "Fiebre con puñopercusión positiva que tolera la vía oral", "Urocultivo y antibiótico en menos de 24 h. Si no se puede garantizar, trasladar."),
        A("iu8", "Embarazada sin fiebre", "Urocultivo y antibiótico apto para el embarazo; control obstétrico en 24–48 h."),
        A("iu9", "Varón con síntomas urinarios", "Requiere urocultivo y tratamiento más prolongado: consulta en 24 h.")
      ],
      soporte: ["Signos vitales, glucemia.", "Acceso venoso y SF si hay hipotensión.", "Antitérmico."],
      diagnosticos: [
        {
          id: "cistitis", cie10: "N30.0", snomed: "", nombre: "Cistitis no complicada en mujer no embarazada",
          criterio: "Disuria, polaquiuria o urgencia miccional, sin fiebre ni dolor lumbar.",
          tratamiento: [{ cond: true, f: "hioscina", dosis: "20 mg IM si hay dolor suprapúbico cólico." }],
          receta: ["Antibiótico según consenso local (por ejemplo nitrofurantoína 100 mg VO cada 12 h por 5 días)."],
          medidas: ["Abundante líquido."],
          indicaciones: ["Consulta con su médico si no mejora en 48 h.", "Completar el antibiótico aunque mejore."],
          alarma: ["Fiebre, escalofríos o dolor en la cintura.", "Vómitos.", "Sangre abundante en la orina.", LLAMAR]
        }
      ]
    },

    /* ------------------------------------------------------------ */
    {
      id: "garganta_oido", cie10: "R07.0", snomed: "", titulo: "Dolor de garganta / oído", corto: "Garganta / oído",
      keywords: ["garganta", "odinofagia", "dolor de garganta", "angina", "anginas", "amigdalitis", "faringitis", "placas", "oido", "otalgia", "dolor de oido", "otitis"],
      fuentes: ["SAME", "SAE"],
      banderas: [
        R("go1", "Dificultad respiratoria o estridor", "Vía aérea en riesgo: O₂ y traslado inmediato."),
        R("go2", "No puede tragar la saliva, babea o voz apagada", "Sospecha de absceso o epiglotitis: traslado sentado."),
        R("go3", "Trismus o tumefacción del cuello", "Infección profunda de cuello: traslado."),
        R("go4", "Rigidez de nuca o alteración del sensorio", "Traslado."),
        R("go5", "Tumefacción detrás de la oreja, parálisis facial o vértigo con otitis", "Otitis complicada: traslado."),
        A("go6", "Diabetes o inmunosupresión con otitis externa dolorosa", "Riesgo de otitis externa maligna: consulta en 24 h.")
      ],
      soporte: ["Posición sentada.", "O₂ si SatO₂ < 92 %.", "No examinar la faringe con baja lengua si se sospecha epiglotitis."],
      diagnosticos: [
        {
          id: "faringitis", cie10: "J02.9", snomed: "", nombre: "Faringoamigdalitis aguda",
          criterio: "Odinofagia, sin dificultad respiratoria, traga saliva, sin trismus.",
          tratamiento: [{ f: "paracetamol", dosis: "1 g VO.", alt: [{ f: "dipirona", dosis: "1 g IM." }] }],
          receta: ["Ibuprofeno 400 mg VO cada 8 h con comidas por 3–5 días.", "Si hay criterios de etiología bacteriana: amoxicilina 500 mg VO cada 8 h por 10 días."],
          medidas: ["Líquidos frescos, alimentos blandos."],
          indicaciones: ["Consulta con su médico si no mejora en 72 h."],
          alarma: ["No puede tragar la saliva o abrir la boca.", "Falta de aire.", "Hinchazón en el cuello.", LLAMAR]
        },
        {
          id: "otitis", cie10: "H66.9", snomed: "", nombre: "Otitis aguda no complicada",
          criterio: "Otalgia sin tumefacción retroauricular, sin parálisis facial ni vértigo.",
          tratamiento: [{ f: "ketorolac", dosis: "30 mg IM.", alt: [{ f: "diclofenac", dosis: "75 mg IM." }, { f: "dipirona", dosis: "1 g IM." }] }],
          receta: ["Otitis externa: gotas óticas con antibiótico y corticoide según indicación.", "Otitis media: amoxicilina 875 mg VO cada 12 h por 7–10 días según evaluación."],
          medidas: ["No introducir objetos en el oído; mantenerlo seco."],
          indicaciones: ["Consulta con otorrinolaringología o su médico en 48–72 h."],
          alarma: ["Hinchazón o dolor detrás de la oreja.", "Parálisis de la cara o mareos.", "Fiebre alta.", LLAMAR]
        }
      ]
    },

    /* ------------------------------------------------------------ */
    {
      id: "dental", cie10: "K08.8", snomed: "", titulo: "Dolor dental", corto: "Dental",
      keywords: ["muela", "muelas", "diente", "dientes", "dental", "odontalgia", "dolor de muela", "flemon", "encia"],
      fuentes: ["SAME", "SAE"],
      banderas: [
        R("de1", "Tumefacción del piso de la boca o del cuello con dificultad para tragar o respirar", "Sospecha de angina de Ludwig: vía aérea en riesgo, traslado."),
        R("de2", "Trismus marcado", "Infección profunda: traslado."),
        R("de3", "Fiebre con compromiso del estado general", "Traslado."),
        R("de4", "Tumefacción alrededor del ojo", "Traslado."),
        A("de5", "Flemón localizado con fiebre leve", "Antibiótico y consulta odontológica en 24 h.")
      ],
      soporte: ["Vía aérea: posición sentada.", "Analgesia EV.", "Acceso venoso."],
      diagnosticos: [
        {
          id: "odontalgia", cie10: "K04.0", snomed: "", nombre: "Odontalgia (pulpitis)",
          criterio: "Dolor dental sin tumefacción facial importante ni fiebre.",
          tratamiento: [{ f: "ketorolac", dosis: "30 mg IM.", alt: [{ f: "diclofenac", dosis: "75 mg IM." }, { f: "dipirona", dosis: "1 g IM." }] }],
          receta: ["Ibuprofeno 400–600 mg VO cada 8 h con comidas.", "Si hay flemón: amoxicilina 875 mg VO cada 12 h por 7 días."],
          medidas: ["No aplicar calor en la cara."],
          indicaciones: ["Consulta odontológica en 24–48 h."],
          alarma: ["Hinchazón que crece hacia el cuello o el ojo.", "Dificultad para tragar, respirar o abrir la boca.", LLAMAR]
        }
      ]
    },

    /* ------------------------------------------------------------ */
    {
      id: "herida", cie10: "T14.1", snomed: "", titulo: "Herida cortante", corto: "Herida",
      keywords: ["herida", "corte", "cortante", "laceracion", "se corto", "punzante", "puñalada", "vidrio", "cuchillo", "tajo"],
      fuentes: ["PHTLS", "MSAL-VAC", "SAME"],
      banderas: [
        R("he1", "Hemorragia que no cede con compresión directa", "[PHTLS] Torniquete si es una extremidad y traslado."),
        R("he2", "Herida penetrante en tórax, abdomen o cuello", "No retirar objetos clavados. XABCDE y traslado."),
        R("he3", "Pérdida de movilidad, sensibilidad o pulso distal", "Lesión de tendón, nervio o vaso: traslado."),
        R("he4", "Amputación", "Conservar el segmento en gasa húmeda, en bolsa sobre hielo, y trasladar."),
        R("he5", "Herida compleja en cara, párpado o labio", "Traslado para reparación."),
        A("he6", "Requiere sutura sin otros criterios", "Derivar a guardia para sutura dentro de las 6–8 h (no urgente)."),
        A("he7", "Vacuna antitetánica no al día", "[MSAL-VAC] Indicar dT en vacunatorio o centro de salud."),
        A("he8", "Diabetes o inmunosupresión", "Mayor riesgo de infección: control de la herida en 48 h.")
      ],
      soporte: ["Compresión directa; torniquete si no cede en extremidad.", "Lavado con SF.", "Vendaje e inmovilización.", "Analgesia."],
      diagnosticos: [
        {
          id: "herida_sup", cie10: "T14.1", snomed: "", nombre: "Herida superficial o excoriación sin necesidad de sutura",
          criterio: "Bordes que afrontan solos, sin sangrado activo, sin compromiso de estructuras.",
          tratamiento: [{ cond: true, f: "ketorolac", dosis: "30 mg IM si hay dolor moderado.", alt: [{ f: "dipirona", dosis: "1 g IM." }] }],
          receta: [],
          medidas: ["Lavado abundante con agua y jabón o SF.", "Cubrir con gasa limpia."],
          indicaciones: ["Curación diaria con agua y jabón.", "Verificar vacuna antitetánica: refuerzo de dT si pasaron más de 10 años (más de 5 si la herida está sucia)."],
          alarma: ["Enrojecimiento que se extiende, pus o fiebre.", "Dolor que aumenta.", LLAMAR]
        }
      ]
    },

    /* ------------------------------------------------------------ */
    {
      id: "quemadura", cie10: "T30.0", snomed: "", titulo: "Quemadura", corto: "Quemadura",
      keywords: ["quemadura", "quemado", "quemada", "se quemo", "escaldadura", "agua hirviendo", "fuego", "incendio", "aceite caliente"],
      fuentes: ["PHTLS", "SAME", "SAE"],
      banderas: [
        R("qu1", "2.º grado en más del 10 % de la superficie corporal o 3.er grado extenso", "Enfriar, cubrir, evitar hipotermia. Ringer lactato si > 20 %. Traslado."),
        R("qu2", "Cara, manos, pies, genitales o articulaciones", "Traslado a centro con quemados."),
        R("qu3", "Quemadura circunferencial", "Riesgo de compromiso circulatorio: traslado."),
        R("qu4", "Sospecha de inhalación: espacio cerrado, hollín, disfonía, vello nasal quemado", "O₂ 100 %, vigilar la vía aérea, traslado."),
        R("qu5", "Eléctrica o química", "Eléctrica: ECG y monitor. Química: lavado abundante. Traslado."),
        R("qu6", "Trauma asociado", "XABCDE y traslado."),
        A("qu7", "Diabetes, inmunosupresión o edad avanzada", "Mayor riesgo de complicaciones: curación y control en centro de salud en 24 h.")
      ],
      soporte: ["Detener el proceso: retirar ropa y anillos.", "Enfriar con agua templada 20 min (no hielo).", "Cubrir con apósito limpio o film.", "Evitar la hipotermia.", "[PHTLS] Adulto con > 20 %: Ringer lactato 500 ml/h.", "Analgesia EV."],
      diagnosticos: [
        {
          id: "quem_leve", cie10: "T30.0", snomed: "", nombre: "Quemadura de 1.er grado o 2.º grado superficial pequeña",
          criterio: "Menos del 10 % de superficie, fuera de zonas especiales, sin inhalación.",
          tratamiento: [{ f: "ketorolac", dosis: "30 mg IM.", alt: [{ f: "dipirona", dosis: "1 g IM." }] }],
          receta: ["Ibuprofeno 400 mg VO cada 8 h con comidas por 3 días."],
          medidas: ["Enfriar con agua templada 20 min.", "Cubrir con gasa limpia."],
          indicaciones: ["No romper las ampollas.", "No aplicar pasta dental, manteca ni hielo.", "Curación en centro de salud en 24–48 h.", "Verificar vacuna antitetánica."],
          alarma: ["Fiebre, pus o enrojecimiento que se extiende.", "Dolor que aumenta.", LLAMAR]
        }
      ]
    },

    /* ------------------------------------------------------------ */
    {
      id: "hemorragia_dig", cie10: "K92.2", snomed: "", titulo: "Hemorragia digestiva", corto: "Hemorragia dig.",
      keywords: ["vomito con sangre", "vomita sangre", "hematemesis", "melena", "materia fecal negra", "heces negras", "caca negra", "sangre en la materia fecal", "rectorragia", "sangrado digestivo", "borra de cafe"],
      fuentes: ["SAME", "SAE"],
      banderas: [
        R("hd1", "Hematemesis o vómito en borra de café", "Dos accesos, nada por boca, traslado."),
        R("hd2", "Melena", "Traslado."),
        R("hd3", "Rectorragia abundante o con coágulos", "Traslado."),
        R("hd4", "Taquicardia, hipotensión, ortostatismo o síncope", "Cristaloides titulados y traslado urgente."),
        R("hd5", "Anticoagulado o antiagregado con sangrado", "Traslado."),
        R("hd6", "Cirrosis o várices conocidas", "Traslado urgente."),
        A("hd7", "Mayor de 65 años con sangrado escaso", "Umbral bajo para trasladar; control médico en 24 h.")
      ],
      soporte: ["Dos accesos venosos.", "Cristaloides titulados a TAS ≥ 90.", "Nada por boca; O₂ si SatO₂ < 92 %.", "No usar AINE.", "Preaviso al centro receptor."],
      diagnosticos: [
        {
          id: "rectorragia_leve", cie10: "K62.5", snomed: "", nombre: "Rectorragia escasa por hemorroides o fisura conocida",
          criterio: "Sangre roja que mancha el papel o recubre la materia fecal, sin repercusión hemodinámica.",
          tratamiento: [],
          receta: [],
          medidas: ["Baños de asiento con agua tibia."],
          indicaciones: ["Dieta rica en fibra y abundante agua.", "Evitar antiinflamatorios.", "Consulta con coloproctología o su médico en la semana."],
          alarma: ["Materia fecal negra o sangrado abundante.", "Mareos o desmayo.", LLAMAR]
        }
      ]
    },

    /* ------------------------------------------------------------ */
    {
      id: "deshidratacion", cie10: "E86", snomed: "", titulo: "Deshidratación / decaimiento en adulto mayor", corto: "Deshidratación",
      keywords: ["deshidratacion", "deshidratado", "deshidratada", "no toma liquidos", "no come", "decaimiento", "decaido", "decaida", "adulto mayor", "abuelo", "abuela", "anciano"],
      fuentes: ["SAME", "SAE"],
      banderas: [
        R("dh1", "Confusión o deterioro del sensorio", "Buscar causa (infección, ACV, glucemia): traslado."),
        R("dh2", "Hipotensión o taquicardia", "SF en bolos de 250–500 ml y traslado."),
        R("dh3", "Oliguria marcada", "Traslado."),
        R("dh4", "Intolerancia oral", "Hidratación EV y traslado."),
        R("dh5", "Fiebre con foco", "Traslado."),
        R("dh6", "Glucemia > 300 o < 70 mg/dl", "Ver protocolo de glucemia: traslado."),
        A("dh7", "Insuficiencia cardíaca o renal conocida", "Hidratar con cautela; control médico en 24 h."),
        A("dh8", "Toma diuréticos", "No suspender por cuenta propia: revisar con su médico en 24–48 h.")
      ],
      soporte: ["Signos vitales y glucemia.", "SF en bolos de 250–500 ml con reevaluación (cautela si hay IC).", "Monitor si hay alteración del sensorio."],
      diagnosticos: [
        {
          id: "deshid_leve", cie10: "E86", snomed: "", nombre: "Deshidratación leve que tolera la vía oral",
          criterio: "Lúcido, sin hipotensión, tolera líquidos, con cuidador.",
          tratamiento: [{ cond: true, f: "sf", dosis: "500 ml EV si hay ortostatismo leve que mejora con volumen." }],
          receta: ["Sales de rehidratación oral según tolerancia."],
          medidas: ["Ofrecer líquidos en pequeñas cantidades frecuentes."],
          indicaciones: ["1,5–2 L de líquido por día salvo restricción indicada por su médico.", "Control con su médico en 24–48 h.", "Cuidador atento a la cantidad de orina."],
          alarma: ["Confusión o somnolencia.", "No orina en 8 horas.", "No puede tomar líquidos o vomita.", LLAMAR]
        }
      ]
    },

    /* ------------------------------------------------------------ */
    {
      id: "caida", cie10: "T14.0", snomed: "", titulo: "Caída en adulto mayor", corto: "Caída",
      keywords: ["caida", "se cayo", "cayo", "tropezo", "resbalo", "caido", "caida de propia altura"],
      fuentes: ["PHTLS", "SAME", "SAE"],
      banderas: [
        R("ca1", "Golpe en la cabeza con anticoagulación, pérdida de conocimiento, vómitos o confusión", "Traslado para TC."),
        R("ca2", "Dolor de cadera con acortamiento o rotación externa del miembro", "Sospecha de fractura de cadera: inmovilizar, analgesia, traslado."),
        R("ca3", "No puede levantarse ni caminar", "Traslado."),
        R("ca4", "Dolor en línea media cervical o dorsal", "[PHTLS] Restricción de movimiento espinal y traslado."),
        R("ca5", "La caída fue por un síncope, dolor torácico o foco neurológico", "Manejar la causa: ECG y traslado."),
        R("ca6", "Permaneció más de 1 h en el piso", "Riesgo de rabdomiólisis e hipotermia: traslado."),
        R("ca7", "Deformidad o dolor óseo puntual", "Inmovilizar y trasladar para radiografía."),
        A("ca8", "Caídas repetidas o vive solo", "Evaluación geriátrica, adaptar el hogar y coordinar acompañamiento.")
      ],
      soporte: ["XABCDE con restricción espinal según mecanismo.", "Inmovilizar fracturas.", "Glucemia y ECG si la causa no es mecánica.", "Analgesia: dipirona EV (evitar AINE en adultos mayores)."],
      diagnosticos: [
        {
          id: "caida_leve", cie10: "T14.0", snomed: "", nombre: "Caída mecánica con contusión leve",
          criterio: "Tropezón claro, sin golpe en la cabeza o sin criterios de riesgo, camina sin dificultad.",
          tratamiento: [{ f: "dipirona", dosis: "1 g IM.", alt: [{ f: "paracetamol", dosis: "1 g VO." }], nota: "Evitar AINE en adultos mayores (riesgo renal y digestivo)." }],
          receta: ["Paracetamol 1 g VO cada 8 h si hay dolor."],
          medidas: ["Hielo envuelto 15 min cada 2–3 h por 48 h."],
          indicaciones: ["Retirar alfombras sueltas, mejorar la iluminación, usar calzado cerrado.", "Control con su médico en 24–48 h."],
          alarma: ["Somnolencia, vómitos o dolor de cabeza que aumenta en las próximas 72 h.", "No puede apoyar la pierna.", LLAMAR]
        }
      ]
    },

    /* ------------------------------------------------------------ */
    {
      id: "ic", cie10: "I50.9", snomed: "", titulo: "Insuficiencia cardíaca descompensada", corto: "IC",
      keywords: ["insuficiencia cardiaca", "ic", "edemas", "piernas hinchadas", "edema de piernas", "ortopnea", "no puede acostarse", "retencion de liquidos", "cardiaco", "cardiopata"],
      fuentes: ["ACLS", "SAME", "SAE"],
      banderas: [
        R("ic1", "Edema agudo de pulmón, SatO₂ < 90 % o FR > 30", "Sentado, O₂, furosemida 40 mg EV + nitrato SL si TAS > 100. Traslado."),
        R("ic2", "TAS < 90", "Shock cardiogénico: no usar nitratos, traslado urgente."),
        R("ic3", "Dolor torácico", "Ver protocolo de dolor torácico: traslado."),
        R("ic4", "Arritmia nueva o FC > 120", "ECG, monitor, traslado."),
        R("ic5", "Confusión u oliguria", "Bajo gasto: traslado."),
        R("ic6", "Síncope", "Traslado."),
        A("ic7", "Aumento de más de 2 kg en 3 días con disnea solo de esfuerzo", "Ajuste del diurético con su cardiólogo en 24–48 h."),
        A("ic8", "Abandonó la dieta sin sal o la medicación", "Retomar el tratamiento y control médico en 48 h.")
      ],
      soporte: ["Posición sentada, piernas colgando.", "O₂ para SatO₂ ≥ 92 %.", "Furosemida 40 mg EV (o el doble de su dosis oral habitual).", "Dinitrato de isosorbide 5 mg SL si TAS > 100.", "ECG y monitor.", "Preaviso al centro receptor."],
      diagnosticos: [
        {
          id: "ic_leve", cie10: "I50.0", snomed: "", nombre: "IC crónica con descompensación leve",
          criterio: "IC conocida, edemas o disnea de esfuerzo, SatO₂ ≥ 94 %, TAS > 100, sin dolor torácico.",
          tratamiento: [{ f: "furosemida", dosis: "40 mg EV o IM." }],
          receta: ["Ajuste del diurético oral según indicación de su médico en las próximas 48 h."],
          medidas: ["Cabecera elevada para dormir."],
          indicaciones: ["Dieta sin sal y líquidos limitados a 1,5 L por día.", "Pesarse todas las mañanas y anotarlo.", "Control con su cardiólogo en 48 h."],
          alarma: ["Falta de aire en reposo o al acostarse.", "Aumento de peso de más de 1 kg por día.", "Dolor de pecho o desmayo.", LLAMAR]
        }
      ]
    },

    /* ------------------------------------------------------------ */
    {
      id: "palpitaciones", cie10: "R00.2", snomed: "", titulo: "Palpitaciones", corto: "Palpitaciones",
      keywords: ["palpitaciones", "taquicardia", "corazon acelerado", "late rapido", "latidos", "arritmia", "aleteo", "fibrilacion"],
      fuentes: ["ACLS", "SAME", "SAE"],
      banderas: [
        R("pa1", "Hipotensión, dolor torácico, disnea, síncope o confusión", "Inestable: ACLS (cardioversión) y traslado."),
        R("pa2", "FC ≥ 150 lpm", "ECG, monitor; ver algoritmo ACLS de taquicardia."),
        R("pa3", "Fibrilación auricular de reciente comienzo", "Traslado para control de frecuencia y anticoagulación."),
        R("pa4", "ECG con TV, QRS ancho o bloqueo", "Traslado con monitor."),
        R("pa5", "Cardiopatía estructural o antecedente familiar de muerte súbita", "Traslado."),
        A("pa6", "FA crónica conocida con FC 100–120 sin síntomas", "Control de frecuencia con su cardiólogo en 24–48 h; verificar anticoagulación.")
      ],
      soporte: ["Monitor y ECG de 12 derivaciones.", "Acceso venoso.", "TSV estable: maniobras vagales.", "Algoritmos ACLS de taquicardia."],
      diagnosticos: [
        {
          id: "extrasistolia", cie10: "R00.2", snomed: "", nombre: "Palpitaciones con ECG normal o extrasistolia aislada",
          criterio: "Signos vitales normales, ECG sin arritmia sostenida, desencadenante (cafeína, estrés, falta de sueño).",
          tratamiento: [{ cond: true, f: "lorazepam", dosis: "1 mg SL si hay ansiedad marcada." }],
          receta: [],
          medidas: [],
          indicaciones: ["Evitar café, mate en exceso, bebidas energizantes y alcohol.", "Consulta con cardiología para Holter. Conservar el ECG."],
          alarma: ["Palpitaciones con dolor de pecho, falta de aire o desmayo.", "Palpitaciones que no ceden.", LLAMAR]
        }
      ]
    },

    /* ------------------------------------------------------------ */
    {
      id: "retencion", cie10: "R33", snomed: "", titulo: "Retención urinaria", corto: "Retención",
      keywords: ["no puede orinar", "retencion urinaria", "retencion de orina", "globo vesical", "no orina", "sonda", "sonda vesical", "sonda tapada"],
      fuentes: ["SAME", "SAE"],
      banderas: [
        R("re1", "Fiebre o signos de sepsis", "Traslado."),
        R("re2", "Hematuria con coágulos", "Traslado."),
        R("re3", "Lumbalgia o déficit neurológico en miembros", "Sospecha de cauda equina: traslado."),
        R("re4", "Trauma pelviano o uretral", "No sondar. Traslado."),
        R("re5", "No es posible sondar en domicilio", "Traslado."),
        A("re6", "Sonda vesical permanente obstruida", "Lavado o recambio; consulta con urología en 48–72 h.")
      ],
      soporte: ["Signos vitales.", "Sondaje vesical con técnica estéril si no hay trauma.", "Analgesia."],
      diagnosticos: [
        {
          id: "rau", cie10: "R33", snomed: "", nombre: "Retención aguda de orina (hiperplasia prostática o fármacos)",
          criterio: "Globo vesical, sin fiebre, sin hematuria franca, sondaje exitoso.",
          tratamiento: [],
          receta: [],
          medidas: ["Sondaje vesical con técnica estéril y bolsa colectora.", "Evacuar en forma fraccionada si el volumen es grande."],
          indicaciones: ["Mantener la sonda hasta la consulta con urología en 48–72 h.", "Revisar con su médico fármacos que retienen orina (antihistamínicos, antidepresivos, descongestivos)."],
          alarma: ["Fiebre o escalofríos.", "La sonda deja de drenar.", "Sangre abundante en la orina.", LLAMAR]
        }
      ]
    },

    /* ------------------------------------------------------------ */
    {
      id: "embarazo", cie10: "O26.9", snomed: "", titulo: "Embarazada con síntomas", corto: "Embarazo",
      keywords: ["embarazada", "embarazo", "contracciones", "metrorragia", "perdidas vaginales", "perdida de liquido", "sangrado vaginal", "trabajo de parto", "rompio bolsa", "rompio la bolsa", "gestante", "parto"],
      fuentes: ["MSAL-HTA", "SAME", "SAE"],
      banderas: [
        R("em1", "Sangrado vaginal en cualquier trimestre", "Decúbito lateral izquierdo; no hacer tacto vaginal en 2.º y 3.er trimestre. Traslado a maternidad."),
        R("em2", "Dolor abdominal intenso", "Traslado a maternidad."),
        R("em3", "Pérdida de líquido amniótico", "Traslado a maternidad."),
        R("em4", "Contracciones regulares o trabajo de parto", "Evaluar si el parto es inminente: si lo es, asistirlo en el lugar. Si no, traslado a maternidad."),
        R("em5", "TA ≥ 140/90 con ≥ 20 semanas, o cefalea, alteraciones visuales o epigastralgia", "Preeclampsia: sulfato de magnesio si hay criterios de gravedad. Traslado a maternidad."),
        R("em6", "Convulsión", "[MSAL] Eclampsia: sulfato de magnesio 5 g EV lento en 10–15 min y traslado (ver ficha Preeclampsia)."),
        R("em7", "Disminución de los movimientos fetales (≥ 28 semanas)", "Traslado a maternidad."),
        R("em8", "Trauma abdominal o fiebre", "Traslado a maternidad.")
      ],
      soporte: ["Decúbito lateral izquierdo.", "O₂ si SatO₂ < 95 %.", "Acceso venoso.", "Preaviso a la maternidad.", "Kit de parto preparado."],
      diagnosticos: [
        {
          id: "nauseas_emb", cie10: "O21.0", snomed: "", nombre: "Náuseas y vómitos del primer trimestre sin deshidratación",
          criterio: "Embarazo < 14 semanas, tolera algo de líquido, sin dolor abdominal ni sangrado.",
          tratamiento: [{ cond: true, f: "metoclopramida", dosis: "10 mg IM si los vómitos persisten." }],
          receta: [],
          medidas: ["Comidas pequeñas y frecuentes; galletitas secas al levantarse."],
          indicaciones: ["Control obstétrico en 24–72 h."],
          alarma: ["No puede retener nada durante 24 h.", "Sangrado vaginal o dolor abdominal.", "Orina muy poco u oscura.", LLAMAR]
        }
      ]
    },

    /* ------------------------------------------------------------ */
    {
      id: "mordedura", cie10: "T14.1", snomed: "", titulo: "Mordedura de animal", corto: "Mordedura",
      keywords: ["mordedura", "mordio", "mordida", "perro", "gato", "rabia", "murcielago", "lo mordio", "la mordio"],
      fuentes: ["MSAL-RABIA", "MSAL-VAC", "PHTLS"],
      banderas: [
        R("mo1", "Hemorragia que no cede con compresión", "[PHTLS] Compresión, torniquete si es extremidad, traslado."),
        R("mo2", "Lesiones extensas, desgarros o compromiso funcional de mano o cara", "Traslado para reparación quirúrgica."),
        R("mo3", "Mordedura en el cuello", "Traslado."),
        R("mo4", "Murciélago o animal silvestre", "[MSAL-RABIA] Profilaxis antirrábica inmediata: traslado al centro de referencia."),
        R("mo5", "Fiebre o signos de infección sistémica", "Traslado."),
        A("mo6", "Animal desconocido o que no se puede observar", "[MSAL-RABIA] Consulta para profilaxis antirrábica dentro de las 24 h."),
        A("mo7", "Perro o gato conocido", "[MSAL-RABIA] Observar al animal 10 días y notificar a zoonosis."),
        A("mo8", "Mordedura de gato, en la mano o profunda", "Indicar profilaxis antibiótica.")
      ],
      soporte: ["Compresión directa.", "Lavado abundante con agua y jabón.", "Analgesia."],
      diagnosticos: [
        {
          id: "mordedura_leve", cie10: "T14.1", snomed: "", nombre: "Mordedura leve de perro o gato",
          criterio: "Herida pequeña, sin compromiso de estructuras profundas.",
          tratamiento: [{ cond: true, f: "ketorolac", dosis: "30 mg IM si hay dolor.", alt: [{ f: "dipirona", dosis: "1 g IM." }] }],
          receta: ["Profilaxis en mordedura de gato, en mano o profunda: amoxicilina-clavulánico 875/125 mg VO cada 12 h por 3–5 días."],
          medidas: ["[MSAL-RABIA] Lavado con agua y jabón durante 10–15 min.", "No cerrar la herida en forma primaria."],
          indicaciones: ["Verificar vacuna antitetánica (dT).", "Notificar a zoonosis del municipio.", "Control de la herida en 48 h."],
          alarma: ["Enrojecimiento, pus o fiebre.", "El animal enferma o muere en los próximos 10 días: consultar de inmediato.", LLAMAR]
        }
      ]
    },

    /* ------------------------------------------------------------ */
    {
      id: "picadura", cie10: "T63.9", snomed: "", titulo: "Picadura (alacrán, araña, abeja)", corto: "Picadura",
      keywords: ["picadura", "picado", "picada", "alacran", "escorpion", "araña", "arana", "abeja", "avispa", "viuda negra", "araña de rincon", "loxosceles", "latrodectus", "tityus"],
      fuentes: ["MSAL-PONZ", "SAME", "SAE"],
      banderas: [
        R("pi1", "Alacrán con vómitos, sudoración, sialorrea, taquicardia o HTA", "[MSAL-PONZ] Escorpionismo moderado o grave: antiveneno en hospital. Traslado."),
        R("pi2", "Alacrán en niño o adulto mayor", "[MSAL-PONZ] Traslado para observación."),
        R("pi3", "Araña de rincón con placa violácea o orina oscura", "[MSAL-PONZ] Loxoscelismo: traslado para evaluar antiveneno."),
        R("pi4", "Viuda negra con dolor intenso, contracturas o sudoración", "[MSAL-PONZ] Latrodectismo: traslado."),
        R("pi5", "Reacción alérgica sistémica (disnea, hipotensión, edema de lengua)", "Anafilaxia: adrenalina 0,5 mg IM y traslado."),
        R("pi6", "Múltiples picaduras de abeja o avispa", "Riesgo de toxicidad sistémica: traslado."),
        A("pi7", "Alacrán en adulto sano con solo dolor local", "[MSAL-PONZ] Observación mínima de 6 h con acompañante. Si aparecen síntomas generales, trasladar."),
        A("pi8", "Sospecha de araña de rincón sin lesión aún", "Control de la zona a las 24–48 h.")
      ],
      soporte: ["Identificar al animal si es seguro (llevarlo en un frasco).", "Frío local.", "Acceso venoso y monitor si hay síntomas sistémicos.", "Notificación obligatoria."],
      diagnosticos: [
        {
          id: "himenoptero", cie10: "T63.4", snomed: "", nombre: "Picadura de abeja o avispa con reacción local",
          criterio: "Dolor, edema y eritema local, sin síntomas generales.",
          tratamiento: [{ cond: true, f: "difenhidramina", dosis: "50 mg IM si hay prurito o edema extenso." }],
          receta: ["Loratadina 10 mg VO por día por 3–5 días."],
          medidas: ["Retirar el aguijón raspando, sin apretarlo.", "Frío local."],
          indicaciones: ["Consulta con alergista si la reacción fue extensa."],
          alarma: ["Falta de aire, hinchazón de labios o lengua, mareos.", LLAMAR]
        },
        {
          id: "escorpion_leve", cie10: "T63.2", snomed: "", nombre: "Picadura de alacrán con solo dolor local (adulto)",
          criterio: "Adulto sano, dolor y parestesias locales, sin síntomas generales.",
          tratamiento: [{ f: "dipirona", dosis: "1 g IM.", alt: [{ f: "ketorolac", dosis: "30 mg IM." }] }],
          receta: [],
          medidas: ["Frío local.", "Observación mínima de 6 h con acompañante."],
          indicaciones: ["Es de notificación obligatoria: informar en el centro de salud.", "Buscar y eliminar alacranes del domicilio."],
          alarma: ["Vómitos, sudoración, salivación o palpitaciones.", "Agitación o somnolencia.", LLAMAR]
        }
      ]
    }
  ];

  /* Lumbociatalgia: se suma al protocolo de dolor lumbar existente */
  const lumbar = window.PROTOCOLOS.find((p) => p.id === "lumbar");
  if (lumbar) {
    lumbar.keywords.push("lumbociatalgia", "nervio ciatico");
    lumbar.diagnosticos.splice(1, 0, {
      id: "lumbociatalgia", cie10: "M54.4", snomed: "", nombre: "Lumbociatalgia sin déficit neurológico",
      criterio: "Dolor lumbar irradiado por la pierna debajo de la rodilla, fuerza y sensibilidad conservadas, esfínteres normales.",
      tratamiento: [
        { f: "diclofenac", dosis: "75 mg IM profunda.", alt: [{ f: "ketorolac", dosis: "30–60 mg IM." }] },
        { cond: true, f: "dexametasona", dosis: "8 mg IM si el dolor radicular es intenso." }
      ],
      receta: ["Ibuprofeno 400 mg VO cada 8 h con comidas por 7 días."],
      medidas: ["Mantenerse activo dentro de lo tolerable.", "Calor local."],
      indicaciones: ["Consulta con su médico o traumatología en 1–2 semanas."],
      alarma: ["Pérdida de fuerza en la pierna.", "Adormecimiento en la zona genital o dificultad para orinar.", LLAMAR]
    });
  }

  window.PROTOCOLOS.push(...NUEVOS);
})();

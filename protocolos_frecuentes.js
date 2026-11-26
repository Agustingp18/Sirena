/* =========================================================================
   MOTIVOS FRECUENTES — agregados en la versión 2.0 a partir del uso real
   -------------------------------------------------------------------------
   BORRADOR — REQUIERE VALIDACIÓN DE LA DIRECCIÓN MÉDICA.
   Misma estructura que protocolos.js. Además:
     · separa "Hipo / hiperglucemia" en dos motivos;
     · suma banderas generales para la evaluación primaria XABCDE;
     · agrega sinónimos de despacho a motivos existentes.

   Fuentes:
   [PHTLS]  NAEMT, Soporte Vital de Trauma Prehospitalario (versión vigente):
            evaluación XABCDE, restricción de movimiento espinal,
            emergencias ambientales (calor).
   [ACLS]   AHA, Soporte Vital Cardiovascular Avanzado: shock, bradicardia,
            taquicardia, síndrome coronario, ACV.
   [CCHR]   Regla canadiense de TC de cráneo (Stiell IG y col., Lancet 2001).
   [PECARN] Kuppermann N y col., Lancet 2009 (TEC pediátrico).
   [AANC]   Petrel C, Gardella J, Gamba M. Guía para el manejo del TEC
            pediátrico leve. Rev Argent Neurocir 2005;19.
   [MSAL-OBS]  Emergencia obstétrica: manual breve para la práctica clínica.
               Ministerio de Salud de la Nación, 2015.
   [4AT]    Bellelli G y col., Age Ageing 2014: detección rápida de delirium.
   [MSAL-CALOR] Ministerio de Salud de la Nación: recomendaciones para evitar
               golpes de calor (grupos de riesgo y prevención).
   [MSAL-DENGUE] Guía MSAL para el equipo de salud: Dengue.
   [qSOFA]  Seymour CW y col., JAMA 2016 (Sepsis-3).
   [NEWS2]  Royal College of Physicians, National Early Warning Score 2, 2017.
   ========================================================================= */

(function () {
  const R = (id, texto, conducta) => ({ id, nivel: "rojo", texto, conducta });
  const A = (id, texto, conducta) => ({ id, nivel: "amarillo", texto, conducta });
  const P = window.PROTOCOLOS;
  const buscarP = (id) => P.find((p) => p.id === id);
  const ALARMA_GENERAL = "Llamar al 107 o al 911.";

  /* ---------------------------------------------------------------- banderas generales por letra de XABCDE */
  window.BANDERAS_UNIVERSALES.push(
    R("u_x", "Hemorragia exanguinante", "Compresión directa, vendaje compresivo o torniquete. Traslado inmediato [PHTLS]."),
    R("u_a", "Vía aérea comprometida: ronquido, gorgoteo, estridor o no puede hablar", "Apertura de vía aérea, aspiración, cánula. Traslado inmediato [PHTLS]."),
    R("u_b", "Trabajo respiratorio aumentado: tiraje, uso de accesorios, no completa frases", "O₂ y posición semisentada. Traslado [PHTLS]."),
    R("u_d", "Foco neurológico agudo o Cincinnati positiva", "Registrar la hora de última vez visto bien. Código ACV: traslado inmediato a centro con tomografía [ACLS]."),
    R("u_e", "Petequias o púrpura con fiebre o mal estado general", "Sospecha de meningococcemia: barbijo para el equipo y traslado inmediato."),
    A("u_gluc", "Glucemia < 70 mg/dl", "Corregir: hidratos VO si deglute, si no dextrosa EV o glucagón. Revaluar a los 15 min y buscar la causa.")
  );

  /* ---------------------------------------------------------------- hipo e hiperglucemia por separado */
  const vieja = buscarP("glucemia");
  const hipoDx = vieja.diagnosticos.find((d) => d.id === "hipo_revertida");
  const hiperDx = vieja.diagnosticos.find((d) => d.id === "hiper_simple");
  const bandera = (id) => vieja.banderas.find((b) => b.id === id);

  const NUEVOS = [
    {
      id: "hipoglucemia", cie10: "E16.2", snomed: "",
      titulo: "Hipoglucemia",
      corto: "Hipoglucemia",
      keywords: ["hipoglucemia", "hipo", "baja de azucar", "se le bajo el azucar", "azucar baja", "glucemia baja", "glucosa baja", "diabetico desorientado", "diabetico desmayado", "insulina", "sudoroso", "transpirado y confuso"],
      fuentes: ["ACLS", "PALS", "SAME", "SAE"],
      banderas: ["g1", "g2", "g3", "g4", "g5"].map(bandera),
      soporte: vieja.soporte.filter((t) => !/Hiperglucemia/.test(t)),
      diagnosticos: [hipoDx]
    },
    {
      id: "hiperglucemia", cie10: "R73.9", snomed: "",
      titulo: "Hiperglucemia",
      corto: "Hiperglucemia",
      keywords: ["hiperglucemia", "azucar alta", "glucemia alta", "glucosa alta", "se le subio el azucar", "diabetes descompensada", "descompensado", "diabetico", "diabetes", "hi en el glucometro", "mucha sed"],
      fuentes: ["ACLS", "SAME", "SAE"],
      banderas: [
        bandera("g6"), bandera("g7"),
        R("hg1", "Alteración del sensorio, signos de deshidratación grave o hipotensión", "SF 1000 ml en la primera hora si no hay insuficiencia cardíaca, y traslado."),
        R("hg2", "Diabetes tipo 1 con glucemia > 250 y malestar, aunque no vomite", "Riesgo de cetoacidosis: traslado para medir cetonas y estado ácido-base."),
        bandera("g8"),
        A("hg3", "Glucemia > 200 sin diabetes conocida (debut)", "Consulta con su médico o guardia en 24 h para laboratorio. Si supera 300 o tiene síntomas, trasladar."),
        A("hg4", "Embarazada con hiperglucemia", "Control obstétrico en 24 h.")
      ],
      soporte: vieja.soporte.filter((t) => !/Hipoglucemia|tiamina/i.test(t)),
      diagnosticos: [hiperDx]
    },

    /* ---------------------------------------------------------------- hipotensión */
    {
      id: "hipotension", cie10: "I95.9", snomed: "",
      titulo: "Hipotensión / presión baja",
      corto: "Hipotensión",
      keywords: ["hipotension", "presion baja", "baja de presion", "se le bajo la presion", "tension baja", "presion 8", "presion 9", "lipotimia", "flojo", "debil", "palido", "pálido"],
      fuentes: ["ACLS", "SAME", "SAE"],
      banderas: [
        R("hp1", "Signos de shock: piel fría y pálida, relleno capilar > 2 s, confusión u orina escasa", "Decúbito con piernas elevadas, O₂, dos accesos venosos, SF 500 ml en bolo y revaluar. Traslado [ACLS]."),
        R("hp2", "Índice de shock ≥ 1 (FC igual o mayor que la TAS)", "Hipovolemia, sangrado o sepsis probables: SF y traslado."),
        R("hp3", "Dolor torácico, disnea, palpitaciones, síncope o ECG anormal", "Posible causa cardíaca: monitor, ECG de 12 derivaciones y traslado."),
        R("hp4", "Fiebre o foco infeccioso con hipotensión (qSOFA ≥ 2)", "Sospecha de sepsis: SF en bolos de 500 ml revaluando, y traslado [qSOFA]."),
        R("hp5", "Sangrado (melena, hematemesis, metrorragia) o dolor abdominal o lumbar", "Hemorragia o aneurisma: dos vías, SF y traslado."),
        R("hp6", "Urticaria, edema de cara o lengua, broncoespasmo tras una exposición", "Anafilaxia: adrenalina 0,5 mg IM (ver motivo Reacción alérgica) y traslado."),
        R("hp7", "No mejora con 500 ml de SF o la TAS sigue < 90", "Traslado."),
        R("hp8", "Embarazo", "Decúbito lateral izquierdo, SF y traslado."),
        A("hp9", "Toma antihipertensivos, diuréticos o nitratos, o le cambiaron la dosis", "Puede quedar si revierte y tolera sentarse y pararse sin síntomas. Revisar la medicación con su médico en 24–48 h."),
        A("hp10", "Adulto mayor que vive solo", "Asegurar acompañante y control en 24 h, o trasladar.")
      ],
      soporte: [
        "Decúbito supino con piernas elevadas.",
        "O₂ si SatO₂ < 94 %. Monitor y ECG de 12 derivaciones.",
        "Dos accesos venosos. SF 500 ml en bolo y revaluar TA, FC y perfusión.",
        "Glucemia capilar.",
        "Preaviso al centro receptor."
      ],
      diagnosticos: [
        {
          id: "hipot_ortost", cie10: "I95.1", snomed: "",
          nombre: "Hipotensión ortostática o por medicación, revertida",
          criterio: "Mejora acostado o con hidratación; TAS ≥ 90 sentado y de pie sin síntomas; sin signos de shock ni de sangrado.",
          tratamiento: [
            { cond: true, f: "sf", dosis: "500 ml EV y revaluar.", nota: "Solo si persiste el ortostatismo y no hay insuficiencia cardíaca." }
          ],
          receta: [],
          medidas: ["Levantarse en dos tiempos: sentarse un minuto antes de pararse.", "Tomar líquido en forma frecuente, salvo restricción por insuficiencia cardíaca o renal.", "Evitar el calor y el ayuno prolongado."],
          indicaciones: ["No suspender ni cambiar la medicación por su cuenta: revisarla con su médico en 24–48 h."],
          alarma: ["Desmayo o mareo que no mejora al acostarse.", "Dolor de pecho, falta de aire o palpitaciones.", "Materia fecal negra o vómitos con sangre.", "Confusión o mucho decaimiento.", ALARMA_GENERAL]
        },
        {
          id: "hipot_basal", cie10: "I95.9", snomed: "",
          nombre: "Presión baja habitual, sin síntomas",
          criterio: "TAS 90–100 conocida como habitual, sin síntomas, perfusión normal, sin causa aguda.",
          tratamiento: [],
          receta: [],
          medidas: ["Hidratación adecuada.", "Levantarse despacio."],
          indicaciones: ["Control con su médico en forma programada."],
          alarma: ["Desmayo, mareo intenso o confusión.", "Dolor de pecho o falta de aire.", ALARMA_GENERAL]
        }
      ]
    },

    /* ---------------------------------------------------------------- mareo */
    {
      id: "mareo", cie10: "R42", snomed: "",
      titulo: "Mareo",
      corto: "Mareo",
      keywords: ["mareo", "mareos", "mareado", "mareada", "se marea", "se mareo", "inestable", "inestabilidad", "se le nubla la vista", "sensacion de desmayo", "cabeza liviana", "le da vueltas", "todo gira", "vertigo", "vértigo"],
      fuentes: ["ACLS", "MSAL-ACV", "SAME", "SAE"],
      banderas: [
        R("mr1", "Foco neurológico o escala de Cincinnati positiva", "Código ACV: registrar la hora de última vez visto bien y traslado inmediato [ACLS]."),
        R("mr2", "Vértigo continuo con imposibilidad de caminar, visión doble, dificultad para hablar o nistagmo vertical", "Signos de vértigo central (cerebelo o tronco): traslado."),
        R("mr3", "Dolor torácico, palpitaciones, disnea o síncope", "Posible causa cardíaca: monitor, ECG de 12 derivaciones y traslado."),
        R("mr4", "ECG anormal: bloqueo AV, bradicardia < 50, taquiarritmia o ritmo irregular nuevo", "Traslado con monitor [ACLS]."),
        R("mr5", "Hipotensión que no revierte o índice de shock ≥ 1", "Seguir el motivo Hipotensión: SF y traslado."),
        R("mr6", "Materia fecal negra, vómitos con sangre o palidez marcada", "Sangrado oculto probable: traslado."),
        R("mr7", "Cefalea súbita e intensa", "Descartar hemorragia subaracnoidea: traslado."),
        A("mr8", "Glucemia < 70 o > 250 mg/dl", "Corregir y seguir el motivo de glucemia que corresponda."),
        A("mr9", "Medicación nueva o aumento de dosis (antihipertensivos, psicofármacos, opioides)", "Probable efecto adverso: revisar con su médico en 24–48 h."),
        A("mr10", "Mayor de 65 años con factores de riesgo vascular, primer episodio", "Umbral bajo para trasladar. Si queda, control médico en 24 h."),
        A("mr11", "Exposición al calor o poca ingesta de líquidos", "Ver motivo Golpe de calor. Hidratación y lugar fresco.")
      ],
      soporte: ["Glucemia capilar.", "TA acostado y de pie (ortostatismo).", "ECG de 12 derivaciones y monitor.", "Escala de Cincinnati.", "Acceso venoso y SF si hay hipotensión."],
      diagnosticos: [
        {
          id: "mareo_ortost", cie10: "R42", snomed: "",
          nombre: "Presíncope ortostático o por deshidratación",
          criterio: "Mareo al pararse que mejora acostado, ortostatismo presente, ECG y examen neurológico normales.",
          tratamiento: [{ cond: true, f: "sf", dosis: "500 ml EV y revaluar.", nota: "Si no tolera líquidos por boca o persiste el ortostatismo." }],
          receta: [],
          medidas: ["Hidratación oral frecuente.", "Levantarse en dos tiempos.", "Evitar el calor y estar mucho tiempo de pie."],
          indicaciones: ["Control con su médico en 24–48 h; revisar la medicación."],
          alarma: ["Desmayo.", "Dolor de pecho, palpitaciones o falta de aire.", "Dificultad para hablar, boca torcida o debilidad de un lado.", "Materia fecal negra.", ALARMA_GENERAL]
        },
        Object.assign({}, buscarP("neuro").diagnosticos.find((d) => d.id === "vertigo_perif")),
        {
          id: "mareo_inesp", cie10: "R42", snomed: "",
          nombre: "Mareo inespecífico con examen y ECG normales",
          criterio: "Sin vértigo rotatorio, sin ortostatismo, glucemia, ECG y examen neurológico normales.",
          tratamiento: [],
          receta: [],
          medidas: ["Hidratación.", "Reposo relativo; evitar manejar o subir escaleras hasta que pase."],
          indicaciones: ["Consulta con su médico en 48–72 h para estudio."],
          alarma: ["Desmayo.", "Dolor de pecho, palpitaciones o falta de aire.", "Dificultad para hablar, boca torcida o debilidad de un lado.", "Dolor de cabeza muy intenso.", ALARMA_GENERAL]
        }
      ]
    },

    /* ---------------------------------------------------------------- calor */
    {
      id: "calor", cie10: "T67.5", snomed: "",
      titulo: "Golpe de calor / agotamiento por calor",
      corto: "Calor",
      keywords: ["calor", "golpe de calor", "insolacion", "insolación", "ola de calor", "mucho calor", "sol", "agotamiento por calor", "deshidratado por calor", "desmayo por calor", "temperatura alta"],
      fuentes: ["PHTLS", "MSAL-CALOR", "SAME"],
      banderas: [
        R("gc1", "T ≥ 40 °C con confusión, conducta extraña, convulsión o coma", "Golpe de calor: enfriamiento inmediato y durante el traslado (desvestir, mojar la piel y ventilar, compresas frías en cuello, axilas e ingles). Los antitérmicos no sirven [PHTLS]."),
        R("gc2", "Hipotensión, taquicardia que no cede o no tolera la vía oral", "SF EV y traslado."),
        R("gc3", "Orina oscura o escasa, o dolor muscular con debilidad", "Posible rabdomiólisis o falla renal: SF y traslado."),
        R("gc4", "Adulto mayor, lactante o enfermo crónico con compromiso del estado general", "Grupo de riesgo [MSAL-CALOR]: traslado."),
        A("gc5", "Toma diuréticos, antihipertensivos, anticolinérgicos, antipsicóticos o antidepresivos", "Mayor riesgo con el calor: hidratar, controlar en 24 h y revisar la medicación con su médico."),
        A("gc6", "Vive solo o no tiene un lugar fresco", "Asegurar acompañante y ambiente ventilado, o trasladar.")
      ],
      soporte: [
        "Llevar a un lugar fresco y a la sombra. Desvestir.",
        "Golpe de calor: enfriamiento activo (mojar la piel y ventilar, compresas frías) sin demorar el traslado [PHTLS].",
        "Acceso venoso y SF si hay hipotensión o no tolera la vía oral.",
        "Glucemia capilar. Controlar la temperatura en forma seriada.",
        "Preaviso al centro receptor."
      ],
      diagnosticos: [
        {
          id: "agot_calor", cie10: "T67.5", snomed: "",
          nombre: "Agotamiento por calor",
          criterio: "Sed, debilidad, sudoración, cefalea, náuseas o mareo, T < 40 °C, sensorio normal, mejora con reposo en lugar fresco e hidratación.",
          tratamiento: [{ cond: true, f: "sf", dosis: "500–1000 ml EV.", nota: "Si no tolera líquidos por boca o tiene hipotensión ortostática." }],
          receta: [],
          medidas: ["Reposo en un lugar fresco y ventilado, con ropa liviana.", "Agua o sales de rehidratación oral a sorbos frecuentes.", "Paños húmedos y ducha tibia."],
          indicaciones: ["Evitar el sol entre las 10 y las 16 h [MSAL-CALOR].", "No tomar bebidas con cafeína, azúcar o alcohol, ni muy frías o muy calientes [MSAL-CALOR].", "Comidas livianas y sin actividad física intensa."],
          alarma: ["Confusión, conducta extraña o somnolencia.", "Temperatura que no baja o piel caliente y seca.", "Vómitos que no dejan tomar líquidos.", "Orina oscura o escasa.", "Desmayo o convulsión.", ALARMA_GENERAL]
        },
        {
          id: "calambres_calor", cie10: "T67.2", snomed: "",
          nombre: "Calambres por calor",
          criterio: "Calambres dolorosos tras esfuerzo con calor, sin otros síntomas, T normal.",
          tratamiento: [],
          receta: [],
          medidas: ["Reposo en lugar fresco.", "Sales de rehidratación oral o agua con alimentos salados.", "Estirar suavemente el músculo."],
          indicaciones: ["No volver a la actividad intensa en el día."],
          alarma: ["Orina oscura.", "Debilidad o dolor muscular que aumenta.", "Confusión o fiebre.", ALARMA_GENERAL]
        }
      ]
    },

    /* ---------------------------------------------------------------- trauma leve en la escuela */
    {
      id: "trauma_escuela", ped: true, cie10: "T14.0", snomed: "",
      titulo: "Golpe o trauma leve en la escuela",
      corto: "Trauma en la escuela",
      keywords: ["colegio", "escuela", "jardin", "jardín", "recreo", "docente", "maestra", "golpe en el colegio", "se cayo en el colegio", "se golpeo", "golpe", "golpeado", "golpeada", "raspon", "raspón", "escoriacion", "escoriación", "se lastimo", "trauma", "traumatismo", "golpe en la cabeza"],
      fuentes: ["PECARN", "PHTLS", "AANC", "SAP"],
      banderas: [
        R("te1", "Golpe en la cabeza con riesgo alto (PECARN): Glasgow < 15, alteración del estado mental o signos de fractura de cráneo", "Necesita tomografía: traslado [PECARN]."),
        R("te2", "Pérdida de conocimiento prolongada, convulsión, vómitos repetidos o cefalea que aumenta", "Traslado [AANC]."),
        R("te3", "Deformidad, dolor óseo puntual o no puede mover o apoyar el miembro", "Inmovilizar en la posición encontrada y traslado para radiografía."),
        R("te4", "Dolor en la línea media del cuello o mecanismo de alta energía (caída de más de 1,5 m, golpe muy fuerte)", "Restricción de movimiento espinal y traslado [PHTLS]."),
        R("te5", "Dolor abdominal o torácico después del golpe", "Posible lesión interna: traslado."),
        R("te6", "Herida que necesita sutura, sangrado que no cede, lesión en el ojo o en los dientes", "Curación y traslado o derivación al servicio que corresponda."),
        A("te7", "Golpe en la cabeza con riesgo intermedio (PECARN): pérdida breve de conocimiento, mecanismo grave, cefalea intensa o un vómito", "Observación por un adulto durante 4–6 h y consulta en guardia; si no se puede asegurar, trasladar [PECARN]."),
        A("te8", "No se puede avisar a la familia", "Dejar al niño con un adulto responsable de la escuela, con pautas por escrito, y registrar a quién se entregó.")
      ],
      soporte: [
        "Evaluación primaria XABCDE.",
        "Restricción de movimiento espinal si hay dolor cervical o mecanismo de alta energía [PHTLS].",
        "Inmovilizar fracturas en la posición encontrada; controlar pulsos distales.",
        "Analgesia por peso (ficha de medicación pediátrica).",
        "Preaviso al centro receptor."
      ],
      diagnosticos: [
        {
          id: "contusion_ped", cie10: "T14.0", snomed: "",
          nombre: "Contusión o escoriación leve",
          criterio: "Lúcido, juega o camina con normalidad, sin dolor óseo puntual ni deformidad, moviliza bien el miembro.",
          tratamiento: [],
          receta: [],
          recetaPed: [
            { n: "Paracetamol", kg: { mgkg: [10, 15], max: 1000, via: "VO", frec: "cada 6 h si hay dolor", pres: [{ t: "Jarabe 24 mg/ml (120 mg/5 ml)", c: 24 }, { t: "Comp 500 mg", c: 500 }] } },
            { n: "Ibuprofeno", kg: { mgkg: [5, 10], max: 400, via: "VO", frec: "cada 8 h si hay dolor", pres: [{ t: "Suspensión 4 % (40 mg/ml)", c: 40 }, { t: "Comp 400 mg", c: 400 }] }, edadMin: 0.5, edadTxt: "Mayores de 6 meses" }
          ],
          medidas: ["Lavar la herida con agua y jabón y cubrir con gasa.", "Hielo envuelto en un paño, 15 minutos varias veces en el día."],
          indicaciones: ["Avisar a la familia y dejar constancia de la atención.", "Consultar con su pediatra si el dolor sigue en 48–72 h."],
          alarma: ["Dolor que aumenta, hinchazón importante o no puede mover la zona.", "Herida con pus, enrojecida o caliente.", "Fiebre.", ALARMA_GENERAL]
        },
        {
          id: "tec_leve_ped", cie10: "S09.9", snomed: "",
          nombre: "Golpe en la cabeza sin criterios de riesgo (PECARN bajo)",
          criterio: "Glasgow 15, conducta normal para el niño, sin pérdida de conocimiento, sin vómitos, sin cefalea intensa, sin signos de fractura, mecanismo no grave [PECARN].",
          tratamiento: [],
          receta: [],
          recetaPed: [
            { n: "Paracetamol", kg: { mgkg: [10, 15], max: 1000, via: "VO", frec: "cada 6 h si hay dolor", pres: [{ t: "Jarabe 24 mg/ml (120 mg/5 ml)", c: 24 }, { t: "Comp 500 mg", c: 500 }] } }
          ],
          medidas: ["Hielo envuelto en un paño sobre el chichón.", "Puede dormir con normalidad; un adulto lo controla durante las próximas 24 h."],
          indicaciones: ["Avisar a la familia y dejar constancia de la atención.", "Evitar deportes y juegos bruscos por 24–48 h."],
          alarma: ["Dolor de cabeza intenso o que aumenta [AANC].", "Vómitos repetidos.", "Confusión, no reconoce a la familia o le cuesta hablar.", "Debilidad, torpeza al caminar o problemas de equilibrio.", "Convulsión.", "Cuesta despertarlo.", "Sangre o líquido claro por la nariz o los oídos.", ALARMA_GENERAL]
        }
      ]
    },

    /* ---------------------------------------------------------------- TEC en adulto */
    {
      id: "tec_adulto", cie10: "S09.9", snomed: "",
      titulo: "Golpe en la cabeza (TEC) en adulto",
      corto: "TEC adulto",
      keywords: ["tec", "golpe en la cabeza", "se golpeo la cabeza", "pego la cabeza", "traumatismo de craneo", "traumatismo craneal", "trauma de craneo", "trauma craneal", "golpe cabeza", "cabeza", "chichon", "chichón", "via publica", "accidente", "choque", "moto", "atropellado"],
      fuentes: ["CCHR", "PHTLS", "ACLS", "SAME"],
      banderas: [
        R("tc_cchr", "Regla canadiense positiva (riesgo alto o mediano)", "Necesita tomografía: traslado [CCHR]."),
        R("tc6", "Anticoagulado, antiagregado doble o trastorno de la coagulación", "Riesgo de sangrado intracraneal aun sin síntomas: traslado para tomografía."),
        R("tc7", "Convulsión, foco neurológico o cefalea intensa que aumenta", "Traslado."),
        R("tc9", "Dolor en la línea media cervical, déficit en miembros o mecanismo de alta energía", "Restricción de movimiento espinal y traslado [PHTLS]."),
        R("tc10", "Intoxicación (alcohol o drogas) que no permite evaluar bien", "No se puede descartar lesión: traslado."),
        R("tc11", "Heridas o lesiones en otras regiones que requieren evaluación", "Seguir la evaluación de trauma [PHTLS]: traslado."),
        A("tc12", "Pérdida breve de conocimiento, amnesia o desorientación con regla canadiense negativa", "Puede quedar en domicilio solo con un adulto responsable durante 24 h y pautas por escrito.")
      ],
      soporte: [
        "Evaluación primaria XABCDE con restricción de movimiento espinal si corresponde [PHTLS].",
        "O₂ para SatO₂ ≥ 94 %. Evitar hipotensión e hipoxia.",
        "Glasgow y pupilas seriados; glucemia capilar.",
        "Glasgow ≤ 8: proteger la vía aérea.",
        "Preaviso al centro receptor."
      ],
      diagnosticos: [
        {
          id: "tec_leve", cie10: "S09.9", snomed: "",
          nombre: "TEC leve con regla canadiense negativa",
          criterio: "Glasgow 15, sin criterios de la regla canadiense, sin anticoagulantes, sin foco neurológico, sin intoxicación, con adulto responsable.",
          tratamiento: [{ cond: true, f: "paracetamol", dosis: "1 g VO.", nota: "Si hay dolor." }],
          receta: ["Paracetamol 1 g VO cada 8 h si hay dolor."],
          medidas: ["Reposo relativo durante 24–48 h.", "Hielo envuelto en un paño sobre el golpe."],
          indicaciones: ["Estar acompañado por un adulto durante las próximas 24 h.", "No tomar alcohol, sedantes ni somníferos.", "No manejar en las próximas 24 h."],
          alarma: ["Dolor de cabeza intenso o que aumenta.", "Vómitos repetidos.", "Confusión, somnolencia o cuesta despertarlo.", "Dificultad para hablar, debilidad o torpeza de un lado.", "Convulsión.", "Sangre o líquido claro por la nariz o los oídos.", "Pupilas de distinto tamaño o visión doble.", ALARMA_GENERAL]
        }
      ]
    },

    /* ---------------------------------------------------------------- metrorragia */
    {
      id: "metrorragia", cie10: "N93.9", snomed: "",
      titulo: "Hemorragia vaginal",
      corto: "Metrorragia",
      keywords: ["hemorragia vaginal", "sangrado vaginal", "metrorragia", "sangra mucho", "menstruacion abundante", "menstruación abundante", "menorragia", "perdida de sangre", "perdidas de sangre", "sangrado genital", "sangrado", "regla abundante", "posmenopausia"],
      fuentes: ["MSAL-OBS", "ACLS", "SAME"],
      banderas: [
        R("mt1", "Embarazo confirmado o posible (atraso menstrual, test positivo, sin anticoncepción)", "Evaluación obstétrica con ecografía: traslado a maternidad. Con dolor abdominal o inestabilidad pensar en embarazo ectópico."),
        R("mt2", "Signos de shock o índice de shock ≥ 1", "Dos accesos venosos gruesos, SF, O₂, abrigo y traslado [MSAL-OBS]."),
        R("mt3", "Síncope o mareo al pararse", "Ortostatismo por pérdida de sangre: SF y traslado."),
        R("mt4", "Dolor abdominal intenso o defensa", "Traslado."),
        R("mt5", "Sangrado muy abundante: empapa una toalla o más por hora durante 2 h, o coágulos grandes", "Traslado."),
        R("mt6", "Parto, cesárea o aborto en las últimas 6 semanas", "Posible retención de restos o infección: traslado a maternidad [MSAL-OBS]."),
        R("mt7", "Anticoagulada con sangrado abundante", "Traslado."),
        A("mt8", "Fiebre, flujo con mal olor o dolor pelviano", "Posible infección: consulta en guardia ginecológica en el día."),
        A("mt9", "Sangrado después de la menopausia", "Siempre se estudia: consulta ginecológica preferente en los próximos días."),
        A("mt10", "Sangrado moderado, estable, sin embarazo", "Consulta ginecológica en 24–72 h.")
      ],
      soporte: [
        "Decúbito, abrigo y O₂ si hay signos de hipoperfusión.",
        "Dos accesos venosos gruesos y SF; revaluar TA, FC y perfusión [MSAL-OBS].",
        "Calcular el índice de shock (FC/TAS).",
        "Preaviso a maternidad o al centro receptor."
      ],
      diagnosticos: [
        {
          id: "sua", cie10: "N93.9", snomed: "",
          nombre: "Sangrado uterino anormal, estable, sin embarazo",
          criterio: "Embarazo descartado (test negativo o fecha de última menstruación y anticoncepción confiables), estable, sin ortostatismo, sangrado leve a moderado.",
          tratamiento: [{ cond: true, f: "paracetamol", dosis: "1 g VO.", nota: "Si hay dolor." }],
          receta: ["Paracetamol 1 g VO cada 8 h si hay dolor."],
          medidas: ["Reposo relativo.", "Contar cuántas toallas usa por día para informarlo en la consulta."],
          indicaciones: ["Consulta ginecológica en 24–72 h.", "Si no tiene test de embarazo reciente, hacerlo."],
          alarma: ["Empapa una toalla o más por hora durante 2 horas.", "Mareo o desmayo al pararse.", "Dolor de panza intenso.", "Fiebre o flujo con mal olor.", ALARMA_GENERAL]
        }
      ]
    },

    /* ---------------------------------------------------------------- dolor generalizado */
    {
      id: "dolor_general", cie10: "R52.9", snomed: "",
      titulo: "Dolor generalizado / malestar inespecífico",
      corto: "Dolor generalizado",
      keywords: ["dolor generalizado", "dolor de cuerpo", "me duele todo", "le duele todo", "malestar general", "malestar", "decaimiento", "decaido", "cansancio", "dolor muscular", "mialgias", "cuerpo cortado", "quebrantamiento", "dolores", "inespecifico", "molestias", "no se siente bien", "se siente mal"],
      fuentes: ["qSOFA", "NEWS2", "MSAL-DENGUE", "SAME", "SAE"],
      banderas: [
        R("dg1", "Petequias o púrpura con fiebre", "Sospecha de meningococcemia: barbijo y traslado inmediato."),
        R("dg2", "NEWS2 ≥ 7 o qSOFA ≥ 2 (FR ≥ 22, confusión, TAS ≤ 100)", "Riesgo alto o sepsis probable: O₂, acceso venoso, SF y traslado [NEWS2 · qSOFA]."),
        R("dg3", "Orina oscura con dolor y debilidad muscular (tras esfuerzo intenso, calor, convulsión, caída prolongada o estatinas)", "Posible rabdomiólisis: SF y traslado."),
        R("dg4", "Debilidad que avanza desde las piernas, o dificultad para caminar o respirar", "Posible causa neuromuscular (Guillain-Barré): traslado."),
        R("dg5", "Inmunosupresión (quimioterapia, corticoides, trasplante) con fiebre", "Traslado."),
        A("dg6", "El dolor se concentra en una zona (pecho, abdomen, cabeza, espalda)", "Cambiar al motivo de esa zona para usar sus banderas."),
        A("dg7", "Fiebre con dolor de cuerpo en época o zona de dengue", "Manejo de dengue (motivo Fiebre): solo paracetamol, hidratación y control [MSAL-DENGUE]."),
        A("dg8", "NEWS2 de 5 o 6", "Riesgo intermedio: revaluar y umbral bajo para trasladar [NEWS2]."),
        A("dg9", "Adulto mayor que vive solo, aislamiento o ánimo deprimido", "Asegurar acompañamiento y derivar a su médico o a salud mental.")
      ],
      soporte: ["Signos vitales completos y NEWS2.", "Glucemia capilar y temperatura.", "Buscar petequias, foco infeccioso y signos de deshidratación.", "Acceso venoso y SF si hay hipotensión.", "Preaviso al centro receptor."],
      diagnosticos: [
        {
          id: "viral_mialgias", cie10: "B34.9", snomed: "",
          nombre: "Cuadro viral con dolor de cuerpo",
          criterio: "Fiebre baja o sin fiebre, mialgias y decaimiento de pocos días, NEWS2 < 5, sin petequias, sin signos de alarma de dengue.",
          tratamiento: [{ cond: true, f: "paracetamol", dosis: "1 g VO.", alt: [{ f: "dipirona", dosis: "1 g IM o EV lento diluido." }] }],
          receta: ["Paracetamol 1 g VO cada 8 h si hay dolor o fiebre."],
          medidas: ["Reposo e hidratación abundante."],
          indicaciones: ["Si hay circulación de dengue, no tomar ibuprofeno ni aspirina [MSAL-DENGUE].", "Consulta con su médico si no mejora en 48–72 h."],
          alarma: ["Manchas en la piel que no desaparecen al presionarlas.", "Dolor de panza intenso, vómitos persistentes o sangrados.", "Falta de aire o confusión.", "Orina oscura o escasa.", ALARMA_GENERAL]
        },
        {
          id: "dolor_inesp", cie10: "R52.9", snomed: "",
          nombre: "Dolor generalizado inespecífico, sin signos de alarma",
          criterio: "Examen sin hallazgos focales, signos vitales normales, NEWS2 < 5.",
          tratamiento: [{ cond: true, f: "paracetamol", dosis: "1 g VO." }],
          receta: ["Paracetamol 1 g VO cada 8 h si hay dolor."],
          medidas: ["Reposo relativo."],
          indicaciones: ["Consulta con su médico en 48–72 h para estudio (laboratorio)."],
          alarma: ["Fiebre, manchas en la piel o dolor que se concentra en una zona.", "Debilidad que avanza.", "Orina oscura.", ALARMA_GENERAL]
        }
      ]
    }
  ];

  /* ---------------------------------------------------------------- alteración del sensorio */
  NUEVOS.push({
    id: "sensorio", cie10: "R41.0", snomed: "",
    titulo: "Confusión / alteración del sensorio",
    corto: "Sensorio",
    keywords: ["confusion", "confusión", "confuso", "confusa", "confundido", "confundida", "desorientado", "desorientada", "obnubilado", "obnubilada", "obnubilacion", "somnoliento", "somnolienta", "dormido", "no responde", "no reacciona", "no se despierta", "esta raro", "esta rara", "desvaria", "desvarío", "delira", "incoherente", "habla incoherencias", "deterioro del sensorio", "alteracion del sensorio", "sensorio", "perdido", "ido", "abombado", "abombada", "sopor", "estuporoso", "inconsciente"],
    fuentes: ["ACLS", "PHTLS", "4AT", "SAME", "SAE"],
    banderas: [
      R("se1", "Glasgow ≤ 8 o no protege la vía aérea", "Posición lateral, aspiración, cánula y O₂. Preparar vía aérea avanzada. Traslado inmediato [PHTLS]."),
      R("se2", "Foco neurológico, anisocoria o Cincinnati positiva", "Registrar la hora de última vez visto bien: Código ACV. Traslado inmediato [ACLS]."),
      R("se3", "Fiebre, rigidez de nuca o petequias", "Sospecha de meningitis o sepsis: barbijo, acceso venoso y traslado."),
      R("se4", "Sospecha de intoxicación: fármacos, alcohol, drogas o monóxido de carbono", "Ver motivo Intoxicación. Miosis con bradipnea: naloxona. Monóxido: sacar del ambiente y O₂ al 100 %. Traslado."),
      R("se5", "Golpe en la cabeza reciente o anticoagulado", "Lesión intracraneal posible: traslado para tomografía."),
      R("se7", "Confusión aguda o fluctuante sin causa reversible (4AT ≥ 4)", "Delirium: necesita estudio de la causa. Traslado."),
      R("se8", "Convulsión, o estado posictal que no mejora", "Ver motivo Convulsión. Traslado."),
      R("se9", "Glucemia < 70 que no revierte, o > 400 mg/dl", "Seguir el motivo de glucemia que corresponda. Traslado."),
      A("se10", "Glucemia < 70 que revierte por completo con el tratamiento", "La causa fue la hipoglucemia: seguir el motivo Hipoglucemia."),
      A("se11", "Demencia o deterioro conocido y está igual que siempre según el cuidador", "Sin cambio agudo: puede quedar con su cuidador y consulta con su médico."),
      A("se12", "Medicación nueva o aumento de dosis (benzodiacepinas, opioides, anticolinérgicos) en adulto mayor", "Probable efecto adverso: revisar con su médico; umbral bajo para trasladar.")
    ],
    soporte: [
      "Vía aérea: posición lateral si no hay trauma, aspiración, cánula. O₂ para SatO₂ ≥ 94 %.",
      "Glucemia capilar siempre. Hipoglucemia: dextrosa EV o glucagón; alcoholismo o desnutrición: tiamina antes.",
      "Miosis con bradipnea: naloxona 0,4 mg EV, IM o intranasal, repetir según respuesta [ACLS].",
      "Temperatura, ECG y escala de Cincinnati.",
      "Preaviso al centro receptor."
    ],
    diagnosticos: [
      {
        id: "deterioro_basal", cie10: "F03", snomed: "",
        nombre: "Deterioro cognitivo conocido, en su estado habitual",
        criterio: "El cuidador confirma que está igual que siempre, sin cambio agudo; signos vitales, glucemia y examen neurológico sin cambios.",
        tratamiento: [],
        receta: [],
        medidas: ["Ambiente tranquilo, con luz de día y objetos conocidos.", "Asegurar hidratación y alimentación."],
        indicaciones: ["Consulta con su médico en forma programada.", "Revisar la medicación con su médico."],
        alarma: ["Más confundido o somnoliento que lo habitual.", "Fiebre, no come o no toma líquidos.", "Debilidad de un lado, boca torcida o dificultad para hablar.", "Caída o golpe en la cabeza.", ALARMA_GENERAL]
      }
    ]
  });

  // Reemplaza el motivo combinado de glucemia por los dos nuevos, en el mismo lugar.
  P.splice(P.indexOf(vieja), 1, ...NUEVOS);

  /* ---------------------------------------------------------------- sinónimos de despacho para motivos existentes */
  const MAS = {
    hta: ["presion alta", "se le subio la presion", "tension alta", "hipertenso", "hipertensa", "presion 18", "presion 20", "presion 22", "crisis hipertensiva"],
    agitacion: ["excitacion", "excitado", "brote psicotico", "crisis psiquiatrica", "descompensacion psiquiatrica", "agresiva", "rompe cosas", "esquizofrenia", "consumo"],
    convulsion: ["ataque", "convulsivo", "convulsiva", "crisis convulsiva", "convulsionando", "temblores", "epileptico", "espasmos"],
    caida: ["caida de propia altura", "se cayo", "abuela se cayo", "abuelo se cayo", "se cayo de la cama", "adulto mayor caido", "anciano", "anciana", "en el piso", "no se puede levantar"],
    sincope: ["se desmayo", "desmayo", "perdio el conocimiento", "se desvanecio"],
    disnea: ["le falta el aire", "no puede respirar", "ahogo", "se ahoga"],
    torax: ["dolor de pecho", "dolor en el pecho", "opresion", "puntada en el pecho"],
    abdomen: ["dolor de panza", "dolor de estomago", "dolor abdominal"]
  };
  Object.entries(MAS).forEach(([id, kws]) => { const p = buscarP(id); if (p) p.keywords.push(...kws); });
  // Motivos que son de adultos: el buscador los baja cuando el paciente es un niño.
  ["caida", "tec_adulto", "deshidratacion", "sensorio", "hipotension", "metrorragia"].forEach((id) => { const p = buscarP(id); if (p) p.adulto = true; });
  // "mareo" pasa a tener motivo propio: se quita de foco neurológico para no competir.
  const neuro = buscarP("neuro");
  if (neuro) neuro.keywords = neuro.keywords.filter((k) => !/^mareo$/.test(k));
})();

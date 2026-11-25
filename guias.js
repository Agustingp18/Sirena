/* =========================================================================
   GUÍAS DE EVALUACIÓN POR MOTIVO — versión 2.0
   -------------------------------------------------------------------------
   BORRADOR — REQUIERE VALIDACIÓN DE LA DIRECCIÓN MÉDICA.
   Estructura de la evaluación (herramientas de uso diario en prehospitalaria):
     · Evaluación primaria XABCDE  [PHTLS]      → en app.js, con banderas generales
     · Interrogatorio SAMPLE        [PHTLS]      → común a todos los motivos
     · Dolor: OPQRST                [PHTLS]      → en los motivos con dolor
     · Preguntas clave del motivo y qué constatar, con escalas validadas

   Cada pregunta puede marcar sola una bandera del motivo:
     sn(id, pregunta, { si: "bandera", no: "bandera", txt: "detalle" })   Sí / No
     tx(id, pregunta, ejemplo)                                             texto libre
     op(id, pregunta, opciones, { fl: { opción: "bandera" }, multi, hc })  opciones
   hc: sección de la historia clínica donde va el hallazgo (cv, resp, abd, neuro).
   ========================================================================= */

(function () {
  const sn = (id, q, o = {}) => Object.assign({ id, q, r: "sn" }, o);
  const tx = (id, q, ph = "", o = {}) => Object.assign({ id, q, r: "tx", ph }, o);
  const op = (id, q, ops, o = {}) => Object.assign({ id, q, r: "op", ops }, o);

  /* ---------------------------------------------------------------- SAMPLE común */
  window.SAMPLE = [
    { k: "S", t: "Signos y síntomas", items: [tx("s_inicio", "¿Desde cuándo?", "hora o días"), op("s_evol", "Evolución", ["Empeora", "Estable", "Mejora"])] },
    { k: "A", t: "Alergias", items: [sn("a_alerg", "¿Alergia a medicamentos?", { txt: "¿A cuál?" })] },
    { k: "M", t: "Medicación", items: [tx("m_hab", "Medicación habitual", "Ej. enalapril, metformina"), sn("m_acoag", "¿Anticoagulantes o antiagregantes?", { txt: "¿Cuál?" }), sn("m_nueva", "¿Medicación nueva o cambio de dosis?", { txt: "¿Cuál?" })] },
    { k: "P", t: "Patologías previas", items: [tx("p_antec", "Antecedentes", "HTA, DBT, cardiopatía, EPOC, cirugías"), sn("p_emb", "¿Puede estar embarazada?", { soloF: true })] },
    { k: "L", t: "Última ingesta", items: [tx("l_ult", "Última comida o bebida", "hora")] },
    { k: "E", t: "Eventos previos", items: [tx("e_prev", "¿Qué estaba haciendo? ¿Qué lo desencadenó?")] }
  ];
  /* En niños cambian algunas preguntas */
  window.SAMPLE_PED = {
    P: [tx("p_antec", "Antecedentes", "prematurez, enfermedades, internaciones"), sn("p_vac", "¿Vacunas al día?")],
    L: [tx("l_ult", "Última comida o toma", "hora")]
  };
  window.OPQRST = [
    { k: "O", t: "Inicio", items: [op("o_ini", "Comienzo", ["Brusco", "Gradual"])] },
    { k: "P", t: "Provocación", items: [tx("o_prov", "¿Qué lo provoca, empeora o alivia?")] },
    { k: "Q", t: "Calidad", items: [op("o_cal", "Tipo de dolor", ["Opresivo", "Punzante", "Cólico", "Urente", "Sordo", "Pulsátil"])] },
    { k: "R", t: "Irradiación", items: [tx("o_irr", "¿Dónde duele y hacia dónde se irradia?")] },
    { k: "S", t: "Severidad", items: [op("o_int", "Intensidad 0–10", ["1–3", "4–6", "7–8", "9–10"])] },
    { k: "T", t: "Tiempo", items: [tx("o_dur", "Duración; ¿constante o intermitente?")] }
  ];

  /* ---------------------------------------------------------------- escalas */
  window.ESCALAS = {
    cincinnati: {
      t: "Escala de Cincinnati", fuente: "ACLS · MSAL-ACV", tipo: "items", flag: "u_d",
      como: "Positiva si hay al menos un hallazgo anormal.",
      items: [["Asimetría facial: al sonreír, un lado no se mueve igual", 1], ["Caída de un brazo: con los brazos extendidos 10 s y ojos cerrados, uno cae", 1], ["Habla anormal: arrastra palabras, usa palabras incorrectas o no puede hablar", 1]],
      interp: (p) => p >= 1 ? ["rojo", "Positiva: probable ACV. Registrar la hora de última vez visto bien: Código ACV."] : ["verde", "Negativa"]
    },
    cchr: {
      t: "Regla canadiense de TC de cráneo", fuente: "CCHR (Stiell, Lancet 2001)", tipo: "items",
      como: "Para TEC con Glasgow 13–15 y pérdida de conocimiento, amnesia o desorientación presenciadas. No aplica en menores de 16 años, anticoagulados, convulsión postraumática o TEC penetrante: en esos casos, trasladar.",
      items: [["Glasgow < 15 a las 2 h del golpe", "A"], ["Sospecha de fractura abierta o con hundimiento", "A"], ["Signos de fractura de base: hematoma periorbitario o retroauricular, hemotímpano, salida de líquido claro por nariz u oído", "A"], ["Dos o más vómitos", "A"], ["65 años o más", "A"], ["Amnesia de lo previo al golpe de 30 min o más", "M"], ["Mecanismo peligroso: peatón atropellado, eyectado del vehículo, caída de más de 1 m o 5 escalones", "M"]],
      interp: (p, sel) => sel.some((x) => x === "A") ? ["rojo", "Riesgo alto: necesita TC (riesgo de intervención neuroquirúrgica)."] : sel.length ? ["rojo", "Riesgo mediano: necesita TC (lesión en la TC)."] : ["verde", "Negativa: la regla no indica TC."]
    },
    qsofa: {
      t: "qSOFA", fuente: "Sepsis-3 (Seymour, JAMA 2016)", tipo: "items",
      como: "Sospecha de infección con 2 o más criterios: riesgo alto de evolución desfavorable. Se completa sola con los signos vitales cargados.",
      items: [["FR ≥ 22 rpm", 1, "fr"], ["Alteración del estado mental (Glasgow < 15)", 1, "gcs"], ["TAS ≤ 100 mmHg", 1, "tas"]],
      interp: (p) => p >= 2 ? ["rojo", `${p}/3: sepsis probable. Traslado.`] : ["verde", `${p}/3`]
    },
    ortost: {
      t: "Ortostatismo", fuente: "ACLS · SAME", tipo: "ortost",
      como: "TA y FC acostado tras 5 min, y de pie tras 1–3 min. Positivo: la TAS baja 20 o más, la TAD baja 10 o más, la FC sube 30 o más, o aparecen síntomas. No pararlo si está hipotenso acostado."
    },
    rass: {
      t: "Escala de agitación y sedación (RASS)", fuente: "Sessler, Am J Respir Crit Care Med 2002", tipo: "select",
      ops: [[4, "Combativo: violento, peligro inmediato para el equipo"], [3, "Muy agitado: agresivo, se arranca vías"], [2, "Agitado: movimientos sin propósito"], [1, "Inquieto: ansioso, sin agresividad"], [0, "Alerta y tranquilo"], [-1, "Somnoliento: se despierta a la voz más de 10 s"], [-2, "Sedación leve: se despierta a la voz menos de 10 s"], [-3, "Sedación moderada: se mueve a la voz sin contacto visual"], [-4, "Sedación profunda: solo responde al estímulo físico"], [-5, "No despierta"]],
      interp: (v) => v >= 3 ? ["rojo", `RASS +${v}: riesgo para el equipo. Contención y sedación según protocolo.`] : v >= 1 ? ["amarillo", `RASS +${v}: abordaje verbal.`] : v <= -3 ? ["rojo", `RASS ${v}: sedación profunda, vigilar vía aérea.`] : ["verde", `RASS ${v > 0 ? "+" : ""}${v}`]
    },
    news2: {
      t: "NEWS2", fuente: "Royal College of Physicians 2017", tipo: "news2",
      como: "Puntaje de gravedad con los signos vitales (adultos, no embarazadas). 0–4 bajo; 3 en un solo parámetro, revaluar pronto; 5–6 medio; 7 o más alto."
    },
    pecarn: { t: "PECARN: TEC pediátrico", fuente: "Kuppermann, Lancet 2009", tipo: "ficha", ficha: "tec" }
  };

  /* ---------------------------------------------------------------- guías por motivo */
  window.GUIAS = {
    hipoglucemia: {
      S: [sn("hg_sint", "¿Sudoración, temblor, confusión o convulsión?")],
      M: [op("hg_trat", "Tratamiento de la diabetes", ["Insulina rápida", "Insulina lenta (NPH, glargina)", "Glibenclamida u otra sulfonilurea", "Metformina u otros", "No es diabético"], { multi: true, fl: { "Insulina lenta (NPH, glargina)": "g2", "Glibenclamida u otra sulfonilurea": "g2", "No es diabético": "g5" } })],
      L: [sn("hg_comida", "¿Saltó una comida o comió menos?"), sn("hg_alc", "¿Consumió alcohol?", { si: "g5" })],
      E: [sn("hg_ejer", "¿Más actividad física de lo habitual?")],
      esp: [sn("hg_rec", "¿Hipoglucemias previas o recurrentes?"), sn("hg_fiebre", "¿Fiebre o infección?", { si: "g5" }), sn("hg_solo", "¿Queda solo después de la atención?", { si: "g4" })],
      ex: [tx("hg_g15", "Glucemia de control a los 15 min", "mg/dl"), op("hg_sens", "Sensorio después de corregir", ["Recuperó por completo", "Persiste alterado"], { fl: { "Persiste alterado": "g3" }, hc: "neuro" }), op("hg_vo", "Tolera la vía oral", ["Sí", "No"], { fl: { No: "g4" } })]
    },
    hiperglucemia: {
      S: [sn("hy_sed", "¿Sed intensa u orina abundante?"), sn("hy_vom", "¿Vómitos o dolor abdominal?", { si: "g6" })],
      M: [op("hy_trat", "Tratamiento", ["Insulina", "Antidiabéticos orales", "No es diabético conocido"], { multi: true, fl: { "No es diabético conocido": "hg3" } }), sn("hy_omit", "¿Omitió la insulina o la medicación?"), sn("hy_cort", "¿Toma corticoides?")],
      P: [op("hy_tipo", "Tipo de diabetes", ["Tipo 1", "Tipo 2", "No sabe"])],
      esp: [sn("hy_inf", "¿Fiebre, tos, ardor al orinar o herida infectada?", { si: "g8" }), tx("hy_cifras", "Glucemias de los últimos días", "mg/dl")],
      ex: [op("hy_resp", "Respiración", ["Normal", "Rápida y profunda (Kussmaul)"], { fl: { "Rápida y profunda (Kussmaul)": "g6" }, hc: "resp" }), op("hy_hidr", "Hidratación", ["Normal", "Mucosas secas", "Deshidratación marcada"], { fl: { "Deshidratación marcada": "g7" } }), op("hy_aliento", "Aliento", ["Normal", "Olor a manzana (cetósico)"], { fl: { "Olor a manzana (cetósico)": "g6" } })]
    },
    hta: {
      M: [op("ht_adh", "Medicación antihipertensiva", ["La toma bien", "La dejó o la olvidó", "No tiene tratamiento"], { fl: { "La dejó o la olvidó": "h9", "No tiene tratamiento": "h9" } })],
      P: [sn("ht_emb", "¿Embarazo de 20 semanas o más, o puerperio?", { si: "h5", soloF: true })],
      esp: [tx("ht_hab", "TA habitual", "mmHg"), sn("ht_tor", "¿Dolor de pecho o de espalda?", { si: "h1" }), sn("ht_dis", "¿Falta de aire o no puede acostarse?", { si: "h2" }), sn("ht_neu", "¿Debilidad, dificultad para hablar o confusión?", { si: "h3" }), sn("ht_vis", "¿Alteraciones visuales nuevas?", { si: "h4" }), sn("ht_orina", "¿Orina menos o con sangre?", { si: "h6" }), sn("ht_desenc", "¿Dolor, ansiedad o angustia que explique el pico?")],
      ex: [tx("ht_ta2", "TA de control tras 15–30 min de reposo", "mmHg"), op("ht_bra", "TA en ambos brazos", ["Similar", "Diferencia > 20 mmHg"], { fl: { "Diferencia > 20 mmHg": "h7" }, hc: "cv" }), op("ht_rales", "Auscultación pulmonar", ["Sin rales", "Rales"], { fl: { Rales: "h2" }, hc: "resp" }), op("ht_epis", "Epistaxis", ["No", "Cede con compresión", "No cede"], { fl: { "No cede": "h8" } })],
      escalas: [{ k: "cincinnati", flag: "h3" }]
    },
    hipotension: {
      S: [sn("hp_sint", "¿Mareo al pararse, visión borrosa o desmayo?")],
      M: [sn("hp_med", "¿Antihipertensivos, diuréticos o nitratos, o le cambiaron la dosis?", { si: "hp9" })],
      P: [sn("hp_card", "¿Cardiopatía o insuficiencia cardíaca?"), tx("hp_hab", "TA habitual", "mmHg")],
      L: [sn("hp_ingesta", "¿Comió y tomó líquido normalmente?")],
      esp: [sn("hp_sang", "¿Materia fecal negra, vómitos con sangre u otro sangrado?", { si: "hp5" }), sn("hp_tor", "¿Dolor de pecho, palpitaciones o falta de aire?", { si: "hp3" }), sn("hp_fiebre", "¿Fiebre o foco infeccioso?"), sn("hp_alerg", "¿Ronchas, hinchazón o broncoespasmo tras una exposición?", { si: "hp6" }), sn("hp_perd", "¿Diarrea, vómitos o calor?")],
      ex: [op("hp_perf", "Perfusión", ["Normal", "Fría, pálida, relleno > 2 s"], { fl: { "Fría, pálida, relleno > 2 s": "hp1" }, hc: "cv" }), op("hp_abd", "Abdomen", ["Normal", "Doloroso o masa pulsátil"], { fl: { "Doloroso o masa pulsátil": "hp5" }, hc: "abd" }), op("hp_ecg", "ECG", ["Normal", "Alterado", "No realizado"], { fl: { Alterado: "hp3" } })],
      escalas: [{ k: "ortost" }, { k: "qsofa", flag: "hp4" }],
      auto: { shock: "hp2" }
    },
    mareo: {
      S: [op("mr_tipo", "¿Cómo es el mareo?", ["Todo gira (vértigo)", "Sensación de desmayo", "Inestabilidad al caminar", "Difícil de describir"]), op("mr_dur", "Duración", ["Segundos, al mover la cabeza", "Minutos a horas", "Continuo"]), sn("mr_parar", "¿Aparece al pararse?")],
      M: [sn("mr_med", "¿Medicación nueva o cambio de dosis?", { si: "mr9" })],
      L: [sn("mr_liq", "¿Tomó poco líquido o estuvo al calor?", { si: "mr11" })],
      esp: [sn("mr_tor", "¿Dolor de pecho, palpitaciones o falta de aire?", { si: "mr3" }), sn("mr_cef", "¿Dolor de cabeza súbito e intenso?", { si: "mr7" }), sn("mr_neu", "¿Visión doble, dificultad para hablar, debilidad u hormigueo de un lado?", { si: "mr2" }), sn("mr_sang", "¿Materia fecal negra o vómitos con sangre?", { si: "mr6" }), sn("mr_oido", "¿Zumbido o pérdida de audición?"), sn("mr_desm", "¿Se desmayó?")],
      ex: [op("mr_marcha", "Marcha", ["Normal", "Inestable pero camina", "No puede caminar"], { fl: { "No puede caminar": "mr2" }, hc: "neuro" }), op("mr_nist", "Nistagmo", ["No", "Horizontal", "Vertical o cambia de dirección"], { fl: { "Vertical o cambia de dirección": "mr2" }, hc: "neuro" }), op("mr_ecg", "ECG", ["Normal", "Alterado", "No realizado"], { fl: { Alterado: "mr4" } })],
      escalas: [{ k: "cincinnati", flag: "mr1" }, { k: "ortost" }],
      auto: { shock: "mr5" }
    },
    calor: {
      S: [sn("gc_conf", "¿Confusión, conducta extraña o convulsión?", { si: "gc1" }), sn("gc_vom", "¿Vómitos que no lo dejan tomar líquidos?", { si: "gc2" }), sn("gc_orina", "¿Orina oscura o escasa?", { si: "gc3" })],
      M: [sn("gc_med", "¿Diuréticos, antihipertensivos o psicofármacos?", { si: "gc5" })],
      E: [op("gc_exp", "Exposición", ["Calor en la casa", "Sol directo", "Esfuerzo físico al calor"], { multi: true })],
      esp: [tx("gc_liq", "¿Cuánto líquido tomó hoy?"), sn("gc_solo", "¿Vive solo o sin un lugar fresco?", { si: "gc6" })],
      ex: [op("gc_piel", "Piel", ["Sudorosa", "Caliente y seca"], { hc: "cv" }), op("gc_mus", "Músculos", ["Sin dolor", "Calambres", "Dolor con debilidad"], { fl: { "Dolor con debilidad": "gc3" } })]
    },
    trauma_escuela: {
      S: [op("te_zona", "Zona del golpe", ["Cabeza", "Cara", "Brazo", "Pierna", "Tórax o abdomen", "Otra"], { multi: true }), sn("te_dolor", "¿Dolor que no le deja mover la zona?", { si: "te3" })],
      E: [op("te_mec", "Mecanismo", ["Caída de su altura", "Caída de más de 1,5 m", "Golpe con objeto o con otro chico", "Golpe de alta energía"], { fl: { "Caída de más de 1,5 m": "te4", "Golpe de alta energía": "te4" } }), tx("te_hora", "Hora del golpe", "hh:mm"), tx("te_quien", "Quién lo vio / adulto a cargo")],
      esp: [sn("te_pc", "¿Perdió el conocimiento?", { si: "te7" }), sn("te_vom", "¿Vomitó?", { txt: "¿Cuántas veces?" }), sn("te_cef", "¿Dolor de cabeza intenso?", { si: "te7" }), sn("te_cond", "¿Conducta distinta a la habitual según el docente?", { si: "te1" }), sn("te_cuello", "¿Dolor en el cuello?", { si: "te4" }), sn("te_flia", "¿Se pudo avisar a la familia?", { no: "te8" })],
      ex: [op("te_craneo", "Cráneo", ["Sin lesiones", "Hematoma", "Depresión o crepitación"], { fl: { "Depresión o crepitación": "te1" }, hc: "neuro" }), op("te_miembro", "Miembro afectado", ["Moviliza bien", "Dolor óseo puntual", "Deformidad"], { fl: { "Dolor óseo puntual": "te3", Deformidad: "te3" } }), op("te_pulsos", "Pulsos distales", ["Presentes", "Disminuidos"], { fl: { Disminuidos: "te3" }, hc: "cv" }), op("te_piel", "Piel", ["Sin lesiones", "Escoriación", "Herida que necesita sutura"], { fl: { "Herida que necesita sutura": "te6" } })],
      escalas: [{ k: "pecarn" }]
    },
    tec_adulto: {
      S: [sn("tc_pc", "¿Perdió el conocimiento?"), sn("tc_amn", "¿Amnesia o desorientación?"), sn("tc_vom", "¿Vómitos?", { txt: "¿Cuántos?" }), sn("tc_cef", "¿Cefalea que aumenta?", { si: "tc7" }), sn("tc_conv", "¿Convulsión?", { si: "tc7" })],
      L: [sn("tc_alc", "¿Alcohol o drogas que no permiten evaluarlo bien?", { si: "tc10" })],
      E: [op("tc_mec", "Mecanismo", ["Caída de su altura", "Caída de más de 1 m o 5 escalones", "Peatón atropellado", "Choque en auto o moto", "Golpe directo", "Agresión"]), tx("tc_hora", "Hora del golpe", "hh:mm")],
      esp: [sn("tc_cuello", "¿Dolor de cuello u hormigueo en los miembros?", { si: "tc9" }), sn("tc_otras", "¿Otras lesiones (tórax, abdomen, miembros)?", { si: "tc11" })],
      ex: [op("tc_pup", "Pupilas", ["Isocóricas reactivas", "Anisocoria", "Arreactivas"], { fl: { Anisocoria: "tc7", Arreactivas: "tc7" }, hc: "neuro" }), op("tc_cuero", "Cuero cabelludo", ["Sin lesiones", "Hematoma", "Herida", "Hundimiento"], { fl: { Hundimiento: "tc_cchr" } }), op("tc_foco", "Foco motor", ["No", "Sí"], { fl: { "Sí": "tc7" }, hc: "neuro" })],
      escalas: [{ k: "cchr", flag: "tc_cchr" }],
      siGen: { m_acoag: "tc6" }
    },
    metrorragia: {
      ocultar: ["p_emb"],
      S: [tx("mt_fum", "Fecha de última menstruación (FUM)", "dd/mm"), tx("mt_desde", "¿Desde cuándo sangra?"), tx("mt_toallas", "Toallas por hora o por día"), sn("mt_coag", "¿Coágulos grandes?", { si: "mt5" }), sn("mt_dolor", "¿Dolor abdominal?"), sn("mt_mareo", "¿Mareo al pararse o desmayo?", { si: "mt3" })],
      M: [op("mt_mac", "Anticoncepción", ["Ninguna", "Pastillas", "Inyectable", "DIU", "Implante", "Ligadura"])],
      P: [op("mt_emb", "¿Puede estar embarazada?", ["No", "Sí o no sabe", "Embarazo confirmado"], { fl: { "Sí o no sabe": "mt1", "Embarazo confirmado": "mt1" } }), sn("mt_test", "¿Test de embarazo?", { txt: "Resultado" }), sn("mt_post", "¿Parto, cesárea o aborto en las últimas 6 semanas?", { si: "mt6" }), sn("mt_meno", "¿Menopausia?", { si: "mt9" })],
      esp: [sn("mt_fiebre", "¿Fiebre o flujo con mal olor?", { si: "mt8" }), sn("mt_prev", "¿Episodios previos o estudios ginecológicos?")],
      ex: [op("mt_perf", "Perfusión", ["Normal", "Pálida, fría o relleno > 2 s"], { fl: { "Pálida, fría o relleno > 2 s": "mt2" }, hc: "cv" }), op("mt_abd", "Abdomen", ["Blando, indoloro", "Doloroso", "Defensa"], { fl: { Defensa: "mt4" }, hc: "abd" })],
      escalas: [{ k: "ortost", flag: "mt3" }],
      auto: { shock: "mt2" },
      siGen: { m_acoag: "mt7" }
    },
    dolor_general: {
      dolor: true,
      S: [sn("dg_fiebre", "¿Fiebre?"), sn("dg_orina", "¿Orina oscura?", { si: "dg3" }), sn("dg_deb", "¿Debilidad que avanza desde las piernas?", { si: "dg4" }), sn("dg_manchas", "¿Manchas o puntitos rojos en la piel?")],
      M: [sn("dg_estat", "¿Estatinas u otra medicación nueva?")],
      P: [sn("dg_inmuno", "¿Quimioterapia, corticoides o trasplante?", { si: "dg5" })],
      E: [sn("dg_esf", "¿Esfuerzo intenso, calor o caída prolongada?")],
      esp: [sn("dg_dengue", "¿Dengue en la zona o en convivientes?", { si: "dg7" }), sn("dg_peso", "¿Pérdida de peso o sudores nocturnos?"), sn("dg_animo", "¿Ánimo deprimido, aislamiento o vive solo?", { si: "dg9" })],
      ex: [op("dg_piel", "Piel", ["Sin lesiones", "Exantema", "Petequias o púrpura"], { fl: { "Petequias o púrpura": "dg1" } }), op("dg_hidr", "Hidratación", ["Normal", "Deshidratado"]), op("dg_foco", "Dolor localizado al examen", ["No", "Sí"], { fl: { "Sí": "dg6" } })],
      escalas: [{ k: "qsofa", flag: "dg2" }, { k: "news2" }],
      auto: { news7: "dg2", news5: "dg8" }
    },
    agitacion: {
      nota: "Ley 26.657 de Salud Mental: la internación involuntaria solo procede ante riesgo cierto e inminente para sí o para terceros. Contención física como último recurso, nunca boca abajo, y por el menor tiempo posible.",
      S: [op("ag_ini", "Comienzo", ["Brusco (horas)", "Progresivo (días)"]), sn("ag_aluc", "¿Alucinaciones o ideas delirantes?"), sn("ag_conf", "¿Confusión o desorientación que va y viene?", { si: "ag2" })],
      M: [sn("ag_psico", "¿Toma psicofármacos? ¿Los dejó?", { txt: "¿Cuáles?" })],
      P: [op("ag_ant", "Antecedente psiquiátrico", ["No", "Sí, conocido", "Primer episodio"], { fl: { "Primer episodio": "ag7" } }), sn("ag_org", "¿Diabetes, epilepsia o enfermedad neurológica?")],
      L: [op("ag_sust", "Sustancias", ["No", "Alcohol", "Cocaína u otras", "Abstinencia"], { multi: true, fl: { Alcohol: "ag3", "Cocaína u otras": "ag3", Abstinencia: "ag3" } })],
      E: [tx("ag_desenc", "Desencadenante, qué pasó")],
      esp: [sn("ag_seg", "¿Hay armas u objetos peligrosos? (seguridad de la escena)"), sn("ag_riesgo", "¿Amenazó o agredió a otros o a sí mismo?", { si: "ag4" }), sn("ag_suic", "¿Ideas de muerte o intento de suicidio?", { si: "ag5" }), sn("ag_fiebre", "¿Fiebre, golpe en la cabeza o falta de aire?", { si: "ag1" })],
      ex: [op("ag_orient", "Orientación", ["Orientado", "Desorientado"], { fl: { Desorientado: "ag2" }, hc: "neuro" }), op("ag_foco", "Foco neurológico", ["No", "Sí"], { fl: { "Sí": "ag1" }, hc: "neuro" }), op("ag_sed", "Requirió sedación parenteral", ["No", "Sí"], { fl: { "Sí": "ag6" } })],
      escalas: [{ k: "rass" }]
    },
    convulsion: {
      S: [op("cv_tipo", "Tipo de crisis", ["Generalizada tónico-clónica", "Focal", "Nadie la vio"]), tx("cv_dur", "Duración según el testigo", "minutos"), sn("cv_rep", "¿Más de una crisis sin recuperar entre ellas?", { si: "cv1" }), sn("cv_esf", "¿Relajación de esfínteres o mordedura de lengua?")],
      M: [op("cv_fae", "Antiepilépticos", ["Los toma bien", "Los dejó o cambió la dosis", "No toma"], { fl: { "Los dejó o cambió la dosis": "cv8" } })],
      P: [op("cv_ant", "Antecedente", ["Epiléptico conocido", "Primera convulsión"], { fl: { "Primera convulsión": "cv2" } }), sn("cv_emb", "¿Embarazo de 20 semanas o más, o puerperio?", { si: "cv5", soloF: true })],
      L: [op("cv_sust", "Sustancias", ["No", "Alcohol", "Abstinencia de alcohol o benzodiacepinas", "Drogas"], { fl: { "Abstinencia de alcohol o benzodiacepinas": "cv6", Drogas: "cv6" } })],
      E: [sn("cv_tec", "¿Golpe en la cabeza o fiebre?", { si: "cv4" }), sn("cv_sueno", "¿Falta de sueño u otro desencadenante?")],
      ex: [op("cv_conc", "Conciencia", ["Recuperada", "Posictal, mejorando", "No recupera"], { fl: { "No recupera": "cv3" }, hc: "neuro" }), op("cv_foco", "Foco neurológico", ["No", "Sí"], { fl: { "Sí": "cv3" }, hc: "neuro" }), op("cv_nuca", "Rigidez de nuca", ["No", "Sí"], { fl: { "Sí": "cv4" }, hc: "neuro" }), op("cv_les", "Lesiones", ["No", "Mordedura de lengua", "Trauma importante"], { fl: { "Trauma importante": "cv7" } })]
    },
    caida: {
      S: [op("ca_zona", "Dónde se golpeó", ["Cabeza", "Cadera", "Muñeca o brazo", "Columna", "Otra"], { multi: true }), sn("ca_lev", "¿Pudo levantarse solo?", { no: "ca3" })],
      M: [sn("ca_psico", "¿Sedantes, antihipertensivos o medicación nueva?")],
      E: [op("ca_por", "¿Por qué se cayó?", ["Tropezó o resbaló", "Se mareó o desmayó antes", "No recuerda"], { fl: { "Se mareó o desmayó antes": "ca5", "No recuerda": "ca5" } }), sn("ca_1h", "¿Más de 1 hora en el piso?", { si: "ca6" })],
      esp: [sn("ca_tec", "¿Pérdida de conocimiento, vómitos o confusión?", { si: "ca1" }), sn("ca_prev", "¿Caídas previas en el último año?", { si: "ca8" }), sn("ca_solo", "¿Vive solo?", { si: "ca8" })],
      ex: [op("ca_cad", "Cadera", ["Sin dolor", "Dolor, acortamiento o rotación externa"], { fl: { "Dolor, acortamiento o rotación externa": "ca2" } }), op("ca_col", "Columna", ["Sin dolor", "Dolor en la línea media"], { fl: { "Dolor en la línea media": "ca4" } }), op("ca_oseo", "Dolor óseo puntual o deformidad", ["No", "Sí"], { fl: { "Sí": "ca7" } }), op("ca_marcha", "Marcha", ["Camina", "No puede caminar"], { fl: { "No puede caminar": "ca3" }, hc: "neuro" })],
      escalas: [{ k: "cchr", flag: "ca1" }, { k: "ortost" }],
      siGen: { m_acoag: "ca1" }
    },
    sincope: {
      S: [sn("si_prod", "¿Calor, náuseas o visión borrosa antes?"), sn("si_tor", "¿Dolor de pecho, palpitaciones o falta de aire antes?", { si: "si1" }), tx("si_dur", "Duración de la pérdida de conocimiento")],
      M: [sn("si_med", "¿Antihipertensivos o diuréticos?", { si: "si9" })],
      P: [sn("si_card", "¿Cardiopatía o insuficiencia cardíaca?", { si: "si4" }), sn("si_fam", "¿Muerte súbita en la familia antes de los 50 años?", { si: "si5" })],
      E: [op("si_pos", "Situación", ["De pie", "Sentado", "Acostado", "Durante un esfuerzo"], { fl: { Acostado: "si2", "Durante un esfuerzo": "si2" } })],
      esp: [sn("si_mel", "¿Materia fecal negra u otro sangrado?", { si: "si6" }), sn("si_post", "¿Movimientos o confusión prolongada después?", { si: "si7" })],
      ex: [op("si_ecg", "ECG", ["Normal", "Alterado", "No realizado"], { fl: { Alterado: "si3" } })],
      escalas: [{ k: "ortost" }]
    },
    torax: { dolor: true, ex: [op("tx_ecg", "ECG de 12 derivaciones", ["Normal", "Alterado", "No realizado"])] },
    abdomen: { dolor: true },
    lumbar: { dolor: true },
    cefalea: { dolor: true, escalas: [{ k: "cincinnati" }] },
    dental: { dolor: true },
    garganta_oido: { dolor: true },
    neuro: { escalas: [{ k: "cincinnati", flag: "n1" }] }
  };
})();

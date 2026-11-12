/* =========================================================================
   PROTOCOLOS PEDIÁTRICOS — manejo domiciliario
   -------------------------------------------------------------------------
   BORRADOR — REQUIERE VALIDACIÓN DE LA DIRECCIÓN MÉDICA.
   Misma estructura que protocolos.js, con dos agregados:
     ped: true                   el motivo es pediátrico
     tratamiento[].kg            dosis por peso: la app la calcula con el
                                 peso cargado (mgkg, max, pres, via, frec)
     recetaPed                   fármacos para indicar, calculados por peso
   Si el peso no está cargado se muestra la dosis por kg.

   Fuentes:
   [SAP-IRAB]  Recomendaciones para el manejo de las infecciones respiratorias
               agudas bajas en menores de 2 años. Actualización 2021.
               Arch Argent Pediatr 2021;119(4):S171-S197.
   [MSAL-IRAB] Programa IRAb: módulo de capacitación para el equipo de salud.
               Ministerio de Salud de la Nación, 2025.
   [SAP-FSF]   Consenso para el uso adecuado de antibióticos en el niño menor
               de 36 meses con fiebre sin foco. Arch Argent Pediatr
               2017;115 Supl 2:S27-S37.
   [MSAL-DIARREA] Normas MSAL de manejo de la diarrea aguda (planes A, B, C).
   [MSAL-DENGUE]  Guía MSAL para el equipo de salud: Dengue.
   [SAP]       Sociedad Argentina de Pediatría (consensos y recomendaciones).
   [PALS]      AHA, Soporte Vital Avanzado Pediátrico (versión vigente).
   ========================================================================= */

(function () {
  const PARACETAMOL = { mgkg: [10, 15], max: 1000, via: "VO", frec: "cada 6 h · máx. 60 mg/kg/día",
    pres: [{ t: "Jarabe 24 mg/ml (120 mg/5 ml)", c: 24 }, { t: "Gotas 100 mg/ml", c: 100 }] };
  const IBUPROFENO = { mgkg: [5, 10], max: 400, via: "VO", frec: "cada 6–8 h · máx. 40 mg/kg/día",
    pres: [{ t: "Suspensión 2 % (20 mg/ml)", c: 20 }, { t: "Suspensión 4 % (40 mg/ml)", c: 40 }] };

  const RX_ANTITERMICO = [
    { n: "Paracetamol", kg: PARACETAMOL, nota: "Si T ≥ 38 °C o dolor. Un solo antitérmico: no alternar [MSAL-IRAB]." },
    { n: "Ibuprofeno", kg: IBUPROFENO, edadMin: 0.5, edadTxt: "Mayores de 6 meses",
      nota: "Alternativa al paracetamol. No usar si se sospecha dengue [MSAL-DENGUE] ni si está deshidratado." }
  ];
  const ALARMA_FIEBRE = [
    "Decaimiento o somnolencia que no mejora cuando baja la fiebre.",
    "Manchas en la piel que no desaparecen al presionarlas.",
    "Respira rápido, se le hunden las costillas o hace ruido al respirar.",
    "No quiere tomar líquidos, orina poco o vomita todo.",
    "Convulsión.",
    "Llanto inconsolable o irritabilidad que no cede.",
    "Llamar al 107 o al 911."
  ];

  const PEDIATRICOS = [
    /* ---------------------------------------------------------------- */
    {
      id: "fiebre_ped", ped: true, cie10: "R50.9", snomed: "",
      titulo: "Fiebre en el niño",
      corto: "Fiebre pediátrica",
      keywords: ["fiebre", "febril", "temperatura", "nene con fiebre", "nena con fiebre", "bebe con fiebre", "bebé con fiebre", "lactante febril", "hijo con fiebre", "calentura"],
      fuentes: ["SAP-FSF", "MSAL-IRAB", "MSAL-DENGUE"],
      banderas: [
        { id: "fp1", nivel: "rojo", texto: "Menor de 3 meses con T ≥ 38 °C", conducta: "[SAP-FSF] Menor de 1 mes: internación siempre. De 1 a 3 meses necesita laboratorio, orina y hemocultivos. Traslado." },
        { id: "fp2", nivel: "rojo", texto: "Mal estado general: letárgico, llanto débil, irritable o hipotónico aun sin fiebre", conducta: "[SAP-FSF] Aspecto tóxico (Yale ≥ 10): sospecha de infección bacteriana grave. Traslado." },
        { id: "fp3", nivel: "rojo", texto: "Petequias o púrpura fuera de cara y cuello, rigidez de nuca o fontanela abombada", conducta: "Sospecha de meningococcemia o meningitis: barbijo para el equipo, acceso venoso si no demora y traslado inmediato." },
        { id: "fp4", nivel: "rojo", texto: "Dificultad respiratoria: tiraje, aleteo nasal, quejido o SatO₂ < 92 %", conducta: "O₂ y traslado." },
        { id: "fp5", nivel: "rojo", texto: "Signos de deshidratación o no tolera líquidos", conducta: "Traslado para hidratación." },
        { id: "fp6", nivel: "rojo", texto: "Inmunodeficiencia, cardiopatía, enfermedad crónica grave o prematuro menor de 3 meses de edad corregida", conducta: "Alto riesgo de infección grave: traslado." },
        { id: "fp7", nivel: "amarillo", texto: "De 3 a 36 meses con T ≥ 39 °C sin foco, o fiebre sin foco de más de 48 h", conducta: "[SAP-FSF] Necesita orina completa y urocultivo. Puede quedar en domicilio con consulta en las próximas 24 h para estudios; si no se puede garantizar, trasladar." },
        { id: "fp8", nivel: "amarillo", texto: "Vacunas incompletas para la edad (neumococo, Hib)", conducta: "[SAP-FSF] Mayor riesgo de bacteriemia: control pediátrico en 24 h y umbral bajo para trasladar." },
        { id: "fp9", nivel: "amarillo", texto: "Sospecha de dengue por contexto epidemiológico", conducta: "[MSAL-DENGUE] Solo paracetamol: no ibuprofeno, aspirina ni medicación IM. Control diario." },
        { id: "fp10", nivel: "amarillo", texto: "Fiebre de 5 días o más", conducta: "Consulta pediátrica en 24 h para reevaluar el foco." }
      ],
      soporte: [
        "Evaluación primaria y signos vitales con valores para la edad.",
        "O₂ si SatO₂ < 92 %. Glucemia capilar si está decaído.",
        "Shock: SF 20 ml/kg EV o IO en bolo, reevaluando después de cada bolo [PALS].",
        "Sospecha de meningitis: barbijo y traslado inmediato.",
        "Antitérmico por peso (ficha de medicación pediátrica). Preaviso al centro receptor."
      ],
      diagnosticos: [
        {
          id: "fsf_ped", cie10: "R50.9", snomed: "",
          nombre: "Fiebre sin foco con buen estado general",
          criterio: "3 a 36 meses, buen estado general, vacunas completas, T < 39 °C y menos de 24–48 h de evolución [SAP-FSF].",
          tratamiento: [
            { f: "paracetamol", kg: PARACETAMOL, dosis: "10–15 mg/kg VO (máx. 1 g).",
              alt: [{ f: "dipirona", kg: { mgkg: [10, 10], max: 1000, via: "IM", frec: "dosis única", pres: [{ t: "Ampolla 500 mg/ml", c: 500 }] }, edadMin: 0.25, dosis: "10 mg/kg IM (desde 3 meses y 5 kg)." }],
              cond: true }
          ],
          receta: [],
          recetaPed: RX_ANTITERMICO,
          medidas: ["Ropa liviana y ofrecer líquidos seguido; mantener la lactancia.", "Baño tibio solo si lo tolera: nunca agua fría ni alcohol [MSAL-IRAB]."],
          indicaciones: ["Control pediátrico en 24 h.", "Si la fiebre sigue más de 48 h sin causa clara, consultar para análisis de orina [SAP-FSF].", "No dar antibióticos sin indicación médica."],
          alarma: ALARMA_FIEBRE
        },
        {
          id: "iras_ped", cie10: "J06.9", snomed: "",
          nombre: "Infección respiratoria alta (resfrío) con fiebre",
          criterio: "Rinorrea, congestión o tos, buen estado general, sin tiraje ni taquipnea para la edad.",
          tratamiento: [
            { f: "paracetamol", kg: PARACETAMOL, dosis: "10–15 mg/kg VO (máx. 1 g).", cond: true }
          ],
          receta: [],
          recetaPed: RX_ANTITERMICO,
          medidas: ["Lavados nasales con solución fisiológica antes de comer y de dormir.", "Ofrecer líquidos seguido; mantener la lactancia.", "Ambiente sin humo."],
          indicaciones: ["No usar antitusivos, descongestivos ni antibióticos sin indicación médica, sobre todo en menores de 2 años.", "Consulta pediátrica si la fiebre dura más de 72 h o aparece dolor de oído."],
          alarma: ALARMA_FIEBRE
        }
      ]
    },

    /* ---------------------------------------------------------------- */
    {
      id: "laringitis", ped: true, cie10: "J05.0", snomed: "",
      titulo: "Laringitis (crup)",
      corto: "Laringitis",
      keywords: ["laringitis", "crup", "tos perruna", "tos de perro", "estridor", "disfonia", "disfonía", "ronquera", "afonia", "afonía", "falso crup"],
      fuentes: ["SAP", "PALS"],
      banderas: [
        { id: "la1", nivel: "rojo", texto: "Estridor en reposo, tiraje o agitación", conducta: "Laringitis moderada a grave: O₂, adrenalina nebulizada y dexametasona 0,6 mg/kg. Traslado: la adrenalina puede tener efecto rebote a las 2–3 h." },
        { id: "la2", nivel: "rojo", texto: "Cianosis, SatO₂ < 92 %, letargo o deterioro de la conciencia", conducta: "Obstrucción grave: O₂, adrenalina nebulizada y preparar la vía aérea. Traslado inmediato." },
        { id: "la3", nivel: "rojo", texto: "Babeo, no puede tragar, se sienta inclinado hacia adelante o aspecto tóxico", conducta: "Sospecha de epiglotitis o absceso: no revisar la garganta, no acostarlo ni hacerlo llorar. O₂ sin forzar la máscara, en brazos del cuidador. Traslado inmediato." },
        { id: "la4", nivel: "rojo", texto: "Comienzo brusco tras atragantarse, sin catarro previo", conducta: "Sospecha de cuerpo extraño: si no ventila, maniobras de desobstrucción [PALS]. Traslado." },
        { id: "la5", nivel: "amarillo", texto: "Menor de 6 meses o laringitis a repetición", conducta: "Edad o evolución atípica: pensar en causa estructural. Preferir traslado o asegurar control pediátrico en 12–24 h." },
        { id: "la6", nivel: "amarillo", texto: "Intubación previa, vía aérea difícil conocida o internación anterior por laringitis", conducta: "Umbral bajo para trasladar. Si queda en domicilio, control en 24 h." }
      ],
      soporte: [
        "Mantenerlo tranquilo, sentado en brazos de su cuidador.",
        "O₂ humidificado si SatO₂ < 92 %, sin forzar la máscara.",
        "Adrenalina nebulizada 0,5 ml/kg de 1:1000 sin diluir (máx. 5 ml).",
        "Dexametasona 0,6 mg/kg VO o IM (máx. 16 mg).",
        "Preaviso al centro receptor."
      ],
      diagnosticos: [
        {
          id: "lar_leve", cie10: "J05.0", snomed: "",
          nombre: "Laringitis leve",
          criterio: "Tos perruna y disfonía; estridor solo con el llanto o la agitación, sin estridor en reposo ni tiraje. Buen estado general.",
          tratamiento: [
            { f: "dexametasona", kg: { mgkg: [0.15, 0.6], max: 16, via: "VO o IM", frec: "dosis única", pres: [{ t: "Ampolla 8 mg/2 ml (4 mg/ml)", c: 4 }] },
              dosis: "0,15–0,6 mg/kg VO o IM, dosis única (máx. 16 mg).",
              nota: "En la laringitis leve alcanza con 0,15 mg/kg. La solución de la ampolla se puede dar por boca.",
              alt: [{ f: "meprednisona", kg: { mgkg: [1, 2], max: 40, via: "VO", frec: "dosis única" }, dosis: "1–2 mg/kg VO (máx. 40 mg)." }] }
          ],
          receta: [],
          recetaPed: [RX_ANTITERMICO[0]],
          medidas: ["Mantenerlo tranquilo y en brazos: el llanto empeora el estridor.", "Ofrecer líquidos.", "Ambiente sin humo. No hacen falta vapor ni nebulizaciones caseras."],
          indicaciones: ["Suele empeorar de noche y mejora en 2 a 3 días.", "Control pediátrico en 24 h."],
          alarma: [
            "Ruido al respirar estando tranquilo.",
            "Se le hunden las costillas o el cuello al respirar.",
            "Labios morados o muy pálidos.",
            "Babeo o no puede tragar.",
            "Muy decaído o muy agitado.",
            "Llamar al 107 o al 911."
          ]
        }
      ]
    },

    /* ---------------------------------------------------------------- */
    {
      id: "bronquiolitis", ped: true, cie10: "J21.9", snomed: "",
      titulo: "Bronquiolitis y sibilancias del lactante",
      corto: "Bronquiolitis",
      keywords: ["bronquiolitis", "silbido", "silbidos", "sibilancias", "le silba el pecho", "bebe con tos", "bebé con tos", "lactante con tos", "respira rapido", "respira rápido", "broncoespasmo"],
      fuentes: ["SAP-IRAB", "MSAL-IRAB"],
      banderas: [
        { id: "br1", nivel: "rojo", texto: "SatO₂ < 92 %, cianosis o apneas", conducta: "[SAP-IRAB] Criterio de internación: O₂ por cánula, posición semisentada y traslado." },
        { id: "br2", nivel: "rojo", texto: "Dificultad respiratoria grave (Tal ≥ 9): tiraje generalizado, quejido, FR muy elevada", conducta: "[MSAL-IRAB] Derivación urgente al segundo nivel: O₂ y traslado." },
        { id: "br3", nivel: "rojo", texto: "No puede alimentarse o come menos de la mitad de lo habitual", conducta: "[SAP-IRAB] Criterio de internación. Traslado." },
        { id: "br4", nivel: "rojo", texto: "Factor de riesgo: menor de 1 mes, prematuro o < 2500 g al nacer, cardiopatía congénita, enfermedad pulmonar crónica, inmunodeficiencia, desnutrición o trastorno neurológico", conducta: "[MSAL-IRAB] Criterio absoluto de derivación, sin importar el puntaje." },
        { id: "br5", nivel: "amarillo", texto: "Dificultad moderada (Tal 5–8): tiraje subcostal, FR elevada", conducta: "[SAP-IRAB] Prueba con salbutamol y reevaluar. Si no mejora a leve, trasladar." },
        { id: "br6", nivel: "amarillo", texto: "Menor de 3 meses, madre menor de 17 años, riesgo social o lejos de una guardia", conducta: "[MSAL-IRAB] Riesgo para manejo en domicilio: preferir traslado o asegurar control en 24 h." }
      ],
      soporte: [
        "Posición semisentada y aspirar las secreciones nasales.",
        "O₂ por cánula nasal si SatO₂ < 92 % [SAP-IRAB].",
        "Prueba con salbutamol: 2 disparos con aerocámara; seguir solo si mejora.",
        "Preaviso al centro receptor."
      ],
      diagnosticos: [
        {
          id: "bronq_leve", cie10: "J21.9", snomed: "",
          nombre: "Bronquiolitis leve",
          criterio: "Menor de 2 años, primer episodio de sibilancias tras un catarro, Tal 0–4, SatO₂ ≥ 92 %, se alimenta bien [MSAL-IRAB].",
          tratamiento: [
            { f: "salbutamol_mdi", kg: { fijo: "2 disparos", via: "Inhalatoria con aerocámara", frec: "prueba terapéutica", ml: ["100 mcg por disparo"] },
              dosis: "Prueba: 2 disparos con aerocámara.", cond: true,
              nota: "[SAP-IRAB] No es de rutina. Seguir en domicilio con 2 disparos cada 6 h solo si bajan la FR y el trabajo respiratorio [MSAL-IRAB]." }
          ],
          receta: ["Salbutamol aerosol 2 disparos con aerocámara cada 6 h, solo si respondió a la prueba [MSAL-IRAB]."],
          recetaPed: [RX_ANTITERMICO[0]],
          medidas: ["Lavar y aspirar la nariz con solución fisiológica antes de comer y de dormir.", "Posición semisentada.", "Tomas más chicas y más frecuentes; mantener la lactancia.", "Ambiente sin humo."],
          indicaciones: ["No sirven corticoides, jarabes para la tos, mucolíticos ni antibióticos [SAP-IRAB].", "Control pediátrico todos los días durante las primeras 48 h [SAP-IRAB]."],
          alarma: [
            "Le cuesta más respirar o se le hunden las costillas.",
            "Labios o piel morados o muy pálidos.",
            "Pausas en la respiración.",
            "Rechaza el alimento o moja menos pañales.",
            "Fiebre que no baja con lo habitual.",
            "Muy irritable o no puede dormir.",
            "Llamar al 107 o al 911."
          ]
        },
        {
          id: "sib_rec", cie10: "R06.2", snomed: "",
          nombre: "Sibilancias recurrentes leves (segundo episodio o más)",
          criterio: "Lactante con episodios previos de sibilancias, dificultad leve, SatO₂ ≥ 92 %, buena respuesta al salbutamol.",
          tratamiento: [
            { f: "salbutamol_mdi", kg: { calc: "puffs", via: "Inhalatoria con aerocámara", frec: "cada 20 min, hasta 3 veces" }, dosis: "2 disparos con aerocámara cada 20 min, hasta 3 veces." },
            { f: "meprednisona", kg: { mgkg: [1, 1], max: 40, via: "VO", frec: "dosis inicial" }, dosis: "1 mg/kg VO (máx. 40 mg).",
              nota: "[MSAL-IRAB] Corticoide en el segundo episodio o en sibilancias recurrentes.",
              alt: [{ f: "dexametasona", kg: { mgkg: [0.6, 0.6], max: 16, via: "VO o IM", frec: "dosis única", pres: [{ t: "Ampolla 8 mg/2 ml (4 mg/ml)", c: 4 }] }, dosis: "0,6 mg/kg VO o IM (máx. 16 mg)." }] }
          ],
          receta: ["Salbutamol aerosol 2 disparos con aerocámara cada 6 h.", "Meprednisona 1 mg/kg una vez por día, 3 días en total [MSAL-IRAB]."],
          recetaPed: [{ n: "Meprednisona (días 2 y 3)", kg: { mgkg: [1, 1], max: 40, via: "VO", frec: "una vez por día" } }],
          medidas: ["Aerocámara bien apoyada; contar 5 respiraciones por disparo.", "Lavados nasales con solución fisiológica.", "Ambiente sin humo."],
          indicaciones: ["Control pediátrico en 24 h.", "Consultar al pediatra por el seguimiento de las sibilancias recurrentes."],
          alarma: [
            "Le cuesta más respirar o se le hunden las costillas.",
            "Necesita el aerosol antes de las 4 h.",
            "Labios morados o muy pálidos.",
            "No puede comer ni hablar por la falta de aire.",
            "Llamar al 107 o al 911."
          ]
        }
      ]
    },

    /* ---------------------------------------------------------------- */
    {
      id: "conv_febril", ped: true, cie10: "R56.0", snomed: "",
      titulo: "Convulsión febril",
      corto: "Convulsión febril",
      keywords: ["convulsion febril", "convulsión febril", "convulsiono con fiebre", "convulsionó con fiebre", "convulsion con fiebre", "convulsión con fiebre", "ataque con fiebre", "se puso rigido con fiebre", "se puso rígido con fiebre"],
      fuentes: ["SAP", "PALS"],
      banderas: [
        { id: "cf1", nivel: "rojo", texto: "Sigue convulsionando o la crisis duró más de 5 minutos", conducta: "[PALS] ABC, O₂ y glucemia. Midazolam 0,2 mg/kg IM o intranasal, o diazepam 0,5 mg/kg rectal (ficha de medicación pediátrica). Traslado." },
        { id: "cf2", nivel: "rojo", texto: "Crisis focal, de más de 15 minutos o más de una en 24 h (convulsión febril compleja)", conducta: "Convulsión febril compleja: traslado para evaluación." },
        { id: "cf3", nivel: "rojo", texto: "No recupera la conciencia o queda con un déficit (no mueve un lado, no habla)", conducta: "Traslado." },
        { id: "cf4", nivel: "rojo", texto: "Menor de 12 meses, o venía tomando antibióticos", conducta: "Puede enmascarar una meningitis: evaluación hospitalaria. Traslado." },
        { id: "cf5", nivel: "rojo", texto: "Mayor de 5 años", conducta: "Fuera de la edad típica: buscar otra causa. Traslado." },
        { id: "cf6", nivel: "rojo", texto: "Petequias, rigidez de nuca, fontanela abombada o aspecto tóxico", conducta: "Sospecha de meningitis o sepsis: barbijo y traslado inmediato." },
        { id: "cf7", nivel: "rojo", texto: "Glucemia < 60 mg/dl", conducta: "Hipoglucemia: dextrosa por peso (ficha de medicación pediátrica) y traslado." },
        { id: "cf8", nivel: "amarillo", texto: "Primera convulsión febril", conducta: "La primera suele evaluarse en guardia. Puede quedar en domicilio si fue simple, tiene más de 18 meses, recuperó del todo, tiene un foco claro y la familia está contenida; si no, trasladar." }
      ],
      soporte: [
        "Lateralizar, aspirar secreciones y O₂.",
        "Glucemia capilar.",
        "Si sigue a los 5 minutos: midazolam o diazepam por peso (ficha de medicación pediátrica) [PALS].",
        "Bajar la fiebre con paracetamol por peso.",
        "Preaviso al centro receptor."
      ],
      diagnosticos: [
        {
          id: "cfs", cie10: "R56.0", snomed: "",
          nombre: "Convulsión febril simple, ya recuperada",
          criterio: "6 meses a 5 años, crisis generalizada de menos de 15 minutos, única en 24 h, recuperación completa, sin signos meníngeos y con foco de la fiebre identificado.",
          tratamiento: [
            { f: "paracetamol", kg: PARACETAMOL, dosis: "10–15 mg/kg VO (máx. 1 g).", cond: true,
              nota: "Es para el confort: el antitérmico no previene una nueva convulsión [SAP]." }
          ],
          receta: [],
          recetaPed: RX_ANTITERMICO,
          medidas: ["Tratar la causa de la fiebre.", "Ropa liviana y líquidos."],
          indicaciones: [
            "Es benigna y no daña el cerebro. Puede repetirse en otro episodio de fiebre.",
            "Si vuelve a convulsionar: acostarlo de costado, no meterle nada en la boca, no sacudirlo y mirar la hora.",
            "Control pediátrico en 24 h."
          ],
          alarma: [
            "Convulsión de más de 5 minutos, o que se repite.",
            "No se despierta bien o sigue muy somnoliento.",
            "Rigidez de cuello, manchas en la piel o vómitos repetidos.",
            "Dificultad para respirar.",
            "Llamar al 107 o al 911."
          ]
        }
      ]
    },

    /* ---------------------------------------------------------------- */
    {
      id: "diarrea_ped", ped: true, cie10: "A09", snomed: "",
      titulo: "Diarrea y vómitos en el niño",
      corto: "Diarrea pediátrica",
      keywords: ["diarrea", "gastroenteritis", "vomitos", "vómitos", "vomita", "deshidratacion", "deshidratación", "deshidratado", "no tolera", "vomita todo", "nene con diarrea", "bebe con diarrea", "bebé con diarrea"],
      fuentes: ["MSAL-DIARREA", "SAP"],
      banderas: [
        { id: "dp1", nivel: "rojo", texto: "Deshidratación grave: letárgico, no puede beber, ojos muy hundidos, pliegue que se borra muy lento (≥ 2 s)", conducta: "[MSAL-DIARREA] Plan C: SF o Ringer 20 ml/kg EV o IO en bolo, reevaluar y traslado." },
        { id: "dp2", nivel: "rojo", texto: "Shock: relleno capilar > 2 s, pulsos débiles, piel fría o moteada", conducta: "[PALS] SF 20 ml/kg en bolo, reevaluar después de cada bolo. Traslado." },
        { id: "dp3", nivel: "rojo", texto: "Diarrea con sangre más palidez, orina escasa o edemas", conducta: "Sospecha de síndrome urémico hemolítico: no dar antibióticos ni antidiarreicos. Traslado." },
        { id: "dp4", nivel: "rojo", texto: "Vómitos que no ceden: no tolera la vía oral", conducta: "Traslado para hidratación." },
        { id: "dp5", nivel: "rojo", texto: "Dolor abdominal intenso, abdomen distendido, vómitos verdes (biliosos) o heces en jalea", conducta: "Sospecha de abdomen quirúrgico o invaginación: traslado." },
        { id: "dp6", nivel: "amarillo", texto: "Algún grado de deshidratación: sed intensa, irritable, ojos hundidos, mucosas secas, pliegue lento", conducta: "[MSAL-DIARREA] Plan B: SRO 50–100 ml/kg en 4 h, supervisado en un centro de salud. Si no se puede supervisar o vomita, trasladar." },
        { id: "dp7", nivel: "amarillo", texto: "Menor de 6 meses o desnutrición", conducta: "Se deshidrata más rápido: preferir traslado o asegurar control en 12–24 h." },
        { id: "dp8", nivel: "amarillo", texto: "Diarrea con sangre sin otros signos", conducta: "Consulta pediátrica en 24 h. No dar antibióticos ni antidiarreicos sin indicación (riesgo de SUH)." }
      ],
      soporte: [
        "Evaluar el grado de deshidratación.",
        "Shock o deshidratación grave: SF 20 ml/kg EV o IO en bolo [PALS].",
        "Glucemia capilar si está letárgico.",
        "Preaviso al centro receptor."
      ],
      diagnosticos: [
        {
          id: "dia_a", cie10: "A09", snomed: "",
          nombre: "Diarrea aguda sin deshidratación (plan A)",
          criterio: "Alerta, bebe con normalidad, ojos y mucosas normales, pliegue que se borra rápido.",
          tratamiento: [],
          receta: [],
          recetaPed: [
            { n: "Sales de rehidratación oral", kg: { mlkg: 10, max: 250, via: "VO, a sorbos o con cucharita", frec: "después de cada deposición líquida" },
              nota: "Si vomita, esperar 10 minutos y seguir más despacio [MSAL-DIARREA]." },
            RX_ANTITERMICO[0]
          ],
          medidas: ["Seguir con la lactancia y la alimentación habitual.", "No usar gaseosas, jugos azucarados ni caldos para hidratar."],
          indicaciones: ["No dar antidiarreicos (loperamida) ni antibióticos sin indicación [SAP].", "Lavado de manos y agua segura.", "Control pediátrico en 24–48 h."],
          alarma: [
            "Vomita todo o no quiere tomar.",
            "Muchas deposiciones líquidas o con sangre.",
            "Orina poco, llora sin lágrimas o tiene la boca seca.",
            "Muy decaído, somnoliento o irritable.",
            "Palidez, hinchazón u orina muy escasa.",
            "Fiebre alta o dolor de panza fuerte.",
            "Llamar al 107 o al 911."
          ]
        },
        {
          id: "gea_vom", cie10: "A08.4", snomed: "",
          nombre: "Gastroenteritis con vómitos, sin deshidratación",
          criterio: "Vómitos con o sin diarrea, sin deshidratación; tolera volúmenes chicos.",
          tratamiento: [
            { f: "ondansetron", kg: { mgkg: [0.15, 0.15], max: 8, via: "EV lento o IM", frec: "dosis única", pres: [{ t: "Ampolla 8 mg/4 ml (2 mg/ml)", c: 2 }] },
              edadMin: 0.5, edadTxt: "Mayores de 6 meses", dosis: "0,15 mg/kg (máx. 8 mg), dosis única.", cond: true,
              nota: "[SAP] Ayuda a sostener la rehidratación oral. No usar metoclopramida en niños." }
          ],
          receta: [],
          recetaPed: [
            { n: "Sales de rehidratación oral", kg: { mlkg: 10, max: 250, via: "VO, a sorbos o con cucharita", frec: "después de cada deposición o vómito" },
              nota: "Empezar con 5 ml cada 2–3 minutos y aumentar si no vomita." }
          ],
          medidas: ["Seguir con la lactancia; volver a la comida habitual cuando deje de vomitar.", "No usar gaseosas, jugos azucarados ni caldos para hidratar."],
          indicaciones: ["No dar antieméticos ni antidiarreicos sin indicación médica.", "Control pediátrico en 24 h."],
          alarma: [
            "Vomita todo durante más de 4 a 6 horas.",
            "Vómitos verdes o con sangre.",
            "Orina poco, llora sin lágrimas o tiene la boca seca.",
            "Muy decaído, somnoliento o irritable.",
            "Dolor de panza fuerte.",
            "Llamar al 107 o al 911."
          ]
        }
      ]
    }
  ];

  window.PROTOCOLOS.push(...PEDIATRICOS);
})();

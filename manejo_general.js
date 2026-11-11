/* =========================================================================
   MANEJO GENERAL — para motivos que no tienen protocolo específico
   -------------------------------------------------------------------------
   Nunca deja al médico sin conducta: el médico elige el o los aparatos
   comprometidos y aparecen sus banderas. Si no hay rojas, ofrece
   tratamiento sintomático con el maletín.
   BORRADOR — REQUIERE VALIDACIÓN DE LA DIRECCIÓN MÉDICA.
   ========================================================================= */
(function () {
  const R = (id, texto, conducta) => ({ id, nivel: "rojo", texto, conducta });
  const A = (id, texto, conducta) => ({ id, nivel: "amarillo", texto, conducta });
  const LLAMAR = "Llamar al 107 o al 911.";

  window.SISTEMAS = [
    { id: "s_resp", nombre: "Respiratorio", banderas: [
      R("gr1", "Disnea en reposo, tiraje o no completa frases", "O₂ y traslado."),
      R("gr2", "Estridor o voz apagada", "Vía aérea en riesgo: traslado."),
      R("gr3", "Hemoptisis", "Traslado."),
      A("gr4", "Tos o catarro con signos vitales normales", "Sintomático y control con su médico si no mejora en 72 h.")
    ] },
    { id: "s_cardio", nombre: "Cardiovascular", banderas: [
      R("gc1", "Dolor torácico opresivo o ECG anormal", "ECG, AAS si corresponde, traslado."),
      R("gc2", "Síncope, palpitaciones sostenidas o arritmia", "Monitor y traslado."),
      R("gc3", "Miembro frío, pálido o sin pulso", "Isquemia aguda: traslado urgente."),
      R("gc4", "Pierna hinchada y dolorosa de un solo lado", "Sospecha de trombosis venosa: traslado."),
      A("gc5", "Factores de riesgo cardiovascular con síntomas atípicos", "ECG obligatorio; ante duda, trasladar.")
    ] },
    { id: "s_neuro", nombre: "Neurológico", banderas: [
      R("gn1", "Foco motor, alteración del habla o asimetría facial", "Código ACV."),
      R("gn2", "Confusión, somnolencia o convulsión", "Glucemia y traslado."),
      R("gn3", "Cefalea súbita e intensa o con fiebre y rigidez de nuca", "Traslado."),
      A("gn4", "Mareo inespecífico con examen neurológico normal", "Sintomático y control en 24–48 h.")
    ] },
    { id: "s_dig", nombre: "Digestivo", banderas: [
      R("gd1", "Abdomen en tabla o defensa", "Traslado."),
      R("gd2", "Sangrado digestivo (vómito con sangre, melena, rectorragia)", "Dos accesos y traslado."),
      R("gd3", "Vómitos incoercibles o deshidratación", "Hidratación EV y traslado."),
      R("gd4", "Ictericia con fiebre o dolor", "Traslado."),
      A("gd5", "Náuseas, diarrea o dolor leve con abdomen blando", "Sintomático, hidratación y control en 24 h.")
    ] },
    { id: "s_uro", nombre: "Renal / urinario", banderas: [
      R("gu1", "Anuria o retención urinaria sin posibilidad de sondaje", "Traslado."),
      R("gu2", "Fiebre con dolor lumbar y vómitos", "Traslado."),
      R("gu3", "Hematuria con coágulos", "Traslado."),
      A("gu4", "Disuria sin fiebre", "Consulta con su médico en 24–48 h.")
    ] },
    { id: "s_piel", nombre: "Piel / partes blandas", banderas: [
      R("gp1", "Lesión que se extiende rápido, crepitación o dolor desproporcionado", "Infección necrotizante posible: traslado."),
      R("gp2", "Petequias o púrpura con fiebre", "Traslado inmediato."),
      R("gp3", "Lesiones con compromiso de mucosas o despegamiento de piel", "Traslado."),
      A("gp4", "Celulitis localizada sin fiebre", "Marcar bordes; antibiótico y control en 48 h.")
    ] },
    { id: "s_psi", nombre: "Psiquiátrico / conducta", banderas: [
      R("gs1", "Riesgo para sí o para terceros, o ideas de muerte", "[Ley 26.657] Traslado a hospital general."),
      R("gs2", "Confusión o desorientación (delirium)", "Causa orgánica probable: traslado."),
      A("gs3", "Angustia o ansiedad sin riesgo", "Contención, sintomático y derivación programada a salud mental.")
    ] },
    { id: "s_osteo", nombre: "Músculo-esquelético / trauma", banderas: [
      R("gk1", "Mecanismo de alta energía", "[PHTLS] XABCDE y traslado."),
      R("gk2", "Deformidad o impotencia funcional", "Inmovilizar y trasladar."),
      R("gk3", "Déficit neurovascular distal", "Traslado."),
      A("gk4", "Dolor muscular o articular sin trauma importante", "Sintomático y control en 48–72 h.")
    ] },
    { id: "s_orl", nombre: "Ojos / ORL", banderas: [
      R("gx1", "Pérdida brusca de la visión u ojo rojo doloroso", "Traslado a centro con oftalmología."),
      R("gx2", "Trauma ocular o cuerpo extraño penetrante", "Cubrir ambos ojos sin presionar y trasladar."),
      R("gx3", "Dificultad para tragar la saliva o respirar", "Traslado."),
      A("gx4", "Conjuntivitis u otalgia leve", "Sintomático y control en 48 h.")
    ] },
    { id: "s_gine", nombre: "Gineco-obstétrico", banderas: [
      R("gg1", "Embarazo con sangrado, dolor, pérdida de líquido o contracciones", "Traslado a maternidad."),
      R("gg2", "Atraso menstrual con dolor abdominal o metrorragia", "Descartar ectópico: traslado."),
      R("gg3", "Metrorragia abundante o con repercusión", "Dos accesos y traslado."),
      A("gg4", "Flujo o dolor pelviano leve sin fiebre", "Consulta ginecológica en 24–48 h.")
    ] },
    { id: "s_metab", nombre: "Metabólico / general", banderas: [
      R("gm1", "Glucemia < 60 que no revierte o > 400", "Ver protocolo de glucemia: traslado."),
      R("gm2", "Fiebre con mal estado general o inmunosupresión", "Traslado."),
      A("gm3", "Fiebre con buen estado general y foco leve", "Antitérmico y control en 24–48 h.")
    ] }
  ];

  /* Tratamiento sintomático: diagnósticos del manejo general */
  window.SINTOMATICOS = [
    {
      id: "sx_dolor", cie10: "R52.9", snomed: "", nombre: "Sintomático: dolor leve a moderado",
      criterio: "Sin banderas rojas. Evitar AINE en adultos mayores, insuficiencia renal, úlcera o anticoagulación.",
      tratamiento: [{ f: "ketorolac", dosis: "30 mg IM.", alt: [{ f: "diclofenac", dosis: "75 mg IM." }, { f: "dipirona", dosis: "1 g IM." }] }],
      receta: ["Paracetamol 1 g VO cada 8 h o ibuprofeno 400 mg VO cada 8 h con comidas, por 3 días."],
      medidas: [], indicaciones: ["Control con su médico en 48–72 h si persiste."],
      alarma: ["Dolor que aumenta o cambia de lugar.", "Fiebre.", LLAMAR]
    },
    {
      id: "sx_colico", cie10: "R10.4", snomed: "", nombre: "Sintomático: dolor cólico",
      criterio: "Dolor cólico con examen tranquilizador.",
      tratamiento: [{ f: "hioscina", dosis: "20 mg IM o EV lento.", alt: [{ f: "hioscina_dipirona", dosis: "1 amp diluida en 100 ml SF EV lento." }] }],
      receta: [], medidas: [], indicaciones: ["Reevaluación en 12–24 h si persiste."],
      alarma: ["Dolor que aumenta o se localiza.", "Vómitos persistentes o fiebre.", LLAMAR]
    },
    {
      id: "sx_fiebre", cie10: "R50.9", snomed: "", nombre: "Sintomático: fiebre",
      criterio: "Fiebre con buen estado general.",
      tratamiento: [{ f: "paracetamol", dosis: "1 g VO.", alt: [{ f: "dipirona", dosis: "1 g IM o EV lento." }] }],
      receta: ["Paracetamol 500 mg–1 g VO cada 6–8 h si T ≥ 38 °C."],
      medidas: ["Hidratación abundante."], indicaciones: ["Consulta si la fiebre dura más de 72 h."],
      alarma: ["Manchas en la piel, rigidez de cuello, confusión.", "Falta de aire.", LLAMAR]
    },
    {
      id: "sx_vomitos", cie10: "R11", snomed: "", nombre: "Sintomático: náuseas y vómitos",
      criterio: "Sin abdomen agudo, tolera líquidos tras el antiemético.",
      tratamiento: [{ f: "metoclopramida", dosis: "10 mg IM o EV lento.", alt: [{ f: "ondansetron", dosis: "4–8 mg IM o EV." }] }],
      receta: ["Sales de rehidratación oral."], medidas: ["Líquidos en sorbos frecuentes."],
      indicaciones: ["Dieta liviana cuando tolere."],
      alarma: ["No retiene líquidos.", "Vómitos con sangre.", "Dolor abdominal intenso.", LLAMAR]
    },
    {
      id: "sx_ansiedad", cie10: "F41.9", snomed: "", nombre: "Sintomático: ansiedad",
      criterio: "Signos vitales normales, sin causa orgánica aparente.",
      tratamiento: [{ f: "lorazepam", dosis: "1 mg SL.", alt: [{ f: "diazepam", dosis: "5 mg VO." }] }],
      receta: [], medidas: ["Ambiente tranquilo."],
      indicaciones: ["No manejar ni tomar alcohol hoy.", "Consulta con su médico o salud mental."],
      alarma: ["Dolor de pecho o falta de aire.", "Ideas de hacerse daño.", LLAMAR]
    },
    {
      id: "sx_prurito", cie10: "L29.9", snomed: "", nombre: "Sintomático: prurito o reacción cutánea leve",
      criterio: "Sin compromiso respiratorio ni hemodinámico.",
      tratamiento: [{ f: "difenhidramina", dosis: "50 mg IM." }],
      receta: ["Loratadina 10 mg VO por día por 5 días."], medidas: [],
      indicaciones: ["Evitar el desencadenante.", "No manejar si tiene somnolencia."],
      alarma: ["Falta de aire o hinchazón de labios o lengua.", LLAMAR]
    }
  ];
})();

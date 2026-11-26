/* =========================================================================
   DIAGNÓSTICOS PRESUNTIVOS — versión 2.1
   -------------------------------------------------------------------------
   BORRADOR — REQUIERE VALIDACIÓN DE LA DIRECCIÓN MÉDICA.
   Criterio de redacción (registro médico y médico-legal):
     · Se escribe primero el diagnóstico sindrómico, que es lo que se puede
       afirmar en el domicilio (ej. "Dolor torácico agudo", no "IAM").
     · Lo que motiva el traslado se escribe como sospecha "a descartar":
       deja constancia del razonamiento sin afirmar lo que no se confirmó.
     · En domicilio, el diagnóstico elegido en la app es el principal.
     · Cada diagnóstico lleva su código CIE-10 (OMS).
   SINDROME[motivo]  = [texto, CIE-10]   diagnóstico sindrómico del motivo
   SOSPECHA[bandera] = [texto, CIE-10]   sospecha que sugiere una bandera
   ========================================================================= */

window.DX_SINDROME = {
  disnea: ["Disnea aguda", "R06.0"],
  abdomen: ["Dolor abdominal agudo", "R10.4"],
  hta: ["Crisis hipertensiva", "I10"],
  neuro: ["Déficit neurológico agudo a estudiar", "R29.8"],
  lumbar: ["Lumbalgia aguda", "M54.5"],
  torax: ["Dolor torácico agudo", "R07.4"],
  fiebre: ["Síndrome febril", "R50.9"],
  hipoglucemia: ["Hipoglucemia", "E16.2"],
  hiperglucemia: ["Hiperglucemia", "R73.9"],
  hipotension: ["Hipotensión arterial", "I95.9"],
  mareo: ["Mareo a estudiar", "R42"],
  calor: ["Agotamiento por calor", "T67.5"],
  trauma_escuela: ["Contusión", "T14.0"],
  tec_adulto: ["Traumatismo encefalocraneano", "S09.9"],
  metrorragia: ["Metrorragia", "N93.9"],
  dolor_general: ["Dolor generalizado a estudiar", "R52.9"],
  alergia: ["Reacción alérgica", "T78.4"],
  cefalea: ["Cefalea", "R51"],
  agitacion: ["Excitación psicomotriz", "R45.1"],
  sincope: ["Síncope", "R55"],
  convulsion: ["Crisis convulsiva", "R56.8"],
  intoxicacion: ["Intoxicación por sustancia a determinar", "T65.9"],
  epistaxis: ["Epistaxis", "R04.0"],
  ansiedad: ["Crisis de ansiedad", "F41.9"],
  itu: ["Síndrome urinario bajo (disuria)", "R30.0"],
  garganta_oido: ["Odinofagia", "R07.0"],
  dental: ["Odontalgia", "K08.8"],
  herida: ["Herida cortante", "T14.1"],
  quemadura: ["Quemadura", "T30.0"],
  hemorragia_dig: ["Hemorragia digestiva", "K92.2"],
  deshidratacion: ["Deshidratación", "E86"],
  caida: ["Traumatismo por caída de propia altura", "T14.0"],
  ic: ["Insuficiencia cardíaca descompensada", "I50.9"],
  palpitaciones: ["Palpitaciones", "R00.2"],
  retencion: ["Retención aguda de orina", "R33"],
  embarazo: ["Complicación del embarazo a estudiar", "O26.9"],
  mordedura: ["Herida por mordedura", "T14.1"],
  picadura: ["Envenenamiento por animal ponzoñoso", "T63.9"],
  fiebre_ped: ["Síndrome febril", "R50.9"],
  laringitis: ["Laringitis aguda (crup)", "J05.0"],
  bronquiolitis: ["Bronquiolitis aguda", "J21.9"],
  conv_febril: ["Convulsión febril", "R56.0"],
  diarrea_ped: ["Gastroenteritis aguda", "A09"],
  sensorio: ["Alteración aguda del sensorio a estudiar", "R41.0"]
};

/* Sospechas que repiten el sindrómico de ese motivo: no se proponen. */
window.DX_OMITIR = { sensorio: ["u_gcs"], hipoglucemia: ["u_gluc"] };

window.DX_SOSPECHA = {
  /* Evaluación primaria XABCDE */
  u_x: ["Shock hemorrágico a descartar", "R57.1"],
  u_b: ["Insuficiencia respiratoria aguda a descartar", "J96.0"],
  u_sat: ["Insuficiencia respiratoria aguda a descartar", "J96.0"],
  u_tas: ["Shock a descartar", "R57.9"],
  u_fc: ["Arritmia a descartar", "I49.9"],
  u_gcs: ["Alteración aguda del sensorio a estudiar", "R40.4"],
  u_d: ["Accidente cerebrovascular a descartar (Código ACV)", "I64"],
  u_e: ["Meningococcemia a descartar", "A39.4"],
  u_gluc: ["Hipoglucemia", "E16.2"],
  u_hipot: ["Hipotermia", "T68"],

  /* Dificultad respiratoria */
  d1: ["Insuficiencia respiratoria aguda a descartar", "J96.0"],
  d2: ["Insuficiencia respiratoria aguda a descartar", "J96.0"],
  d3: ["Insuficiencia respiratoria aguda a descartar", "J96.0"],
  d4: ["Broncoespasmo grave", "J46"],
  d5: ["Edema agudo de pulmón a descartar", "J81"],
  d6: ["Anafilaxia a descartar", "T78.2"],
  d7: ["Tromboembolismo pulmonar a descartar", "I26.9"],
  d8: ["Neumonía grave a descartar", "J18.9"],
  /* Dolor abdominal */
  a1: ["Abdomen agudo quirúrgico a descartar", "R10.0"],
  a2: ["Hemorragia digestiva", "K92.2"],
  a3: ["Obstrucción intestinal a descartar", "K56.6"],
  a4: ["Isquemia mesentérica a descartar", "K55.0"],
  a5: ["Aneurisma de aorta abdominal complicado a descartar", "I71.3"],
  a6: ["Embarazo ectópico a descartar", "O00.9"],
  a8: ["Apendicitis aguda o colangitis a descartar", "K35.9"],
  a9: ["Deshidratación", "E86"],
  /* Pico de presión */
  h1: ["Síndrome coronario agudo o disección aórtica a descartar", "I24.9"],
  h2: ["Edema agudo de pulmón hipertensivo", "J81"],
  h3: ["Accidente cerebrovascular o encefalopatía hipertensiva a descartar", "I67.4"],
  h4: ["Emergencia hipertensiva a descartar", "I10"],
  h5: ["Preeclampsia a descartar", "O14.9"],
  h6: ["Emergencia hipertensiva a descartar", "I10"],
  h7: ["Disección aórtica a descartar", "I71.0"],
  h8: ["Epistaxis refractaria", "R04.0"],
  /* Foco neurológico */
  n1: ["Accidente cerebrovascular a descartar (Código ACV)", "I64"],
  n2: ["Accidente cerebrovascular a descartar (Código ACV)", "I64"],
  n3: ["Hemorragia subaracnoidea a descartar", "I60.9"],
  n4: ["Crisis convulsiva", "R56.8"],
  n5: ["Accidente cerebrovascular de fosa posterior a descartar", "I64"],
  n7: ["Hemorragia intracraneal a descartar", "I62.9"],
  n8: ["Accidente cerebrovascular a descartar (Código ACV)", "I64"],
  /* Dolor lumbar / trauma leve */
  l1: ["Síndrome de cauda equina a descartar", "G83.4"],
  l2: ["Compresión medular o radicular a descartar", "G95.2"],
  l4: ["Aneurisma de aorta abdominal complicado a descartar", "I71.3"],
  l5: ["Lesión de columna vertebral a descartar", "T08"],
  l6: ["Lesión de columna vertebral a descartar", "T08"],
  l7: ["Fractura a descartar", "T14.2"],
  l9: ["Lesión intracraneal traumática a descartar", "S06.9"],
  l10: ["Lesión intracraneal traumática a descartar", "S06.9"],
  /* Dolor torácico */
  t1: ["Síndrome coronario agudo a descartar", "I24.9"],
  t2: ["Síndrome coronario agudo a descartar", "I24.9"],
  t3: ["Síndrome coronario agudo a descartar", "I24.9"],
  t4: ["Disección aórtica a descartar", "I71.0"],
  t5: ["Tromboembolismo pulmonar a descartar", "I26.9"],
  /* Fiebre */
  f1: ["Meningitis o meningococcemia a descartar", "G03.9"],
  f2: ["Sepsis a descartar", "A41.9"],
  f4: ["Dengue con signos de alarma", "A90"],
  f5: ["Deshidratación", "E86"],
  /* Glucemia */
  g1: ["Hipoglucemia recurrente", "E16.2"],
  g2: ["Hipoglucemia por hipoglucemiantes de acción prolongada", "E16.0"],
  g3: ["Alteración del sensorio de otra causa a descartar", "R40.4"],
  g5: ["Hipoglucemia de causa no aclarada", "E16.2"],
  g6: ["Cetoacidosis diabética a descartar", "E14.1"],
  g7: ["Estado hiperosmolar hiperglucémico a descartar", "E87.0"],
  hg2: ["Cetoacidosis diabética a descartar", "E14.1"],
  /* Hipotensión */
  hp1: ["Shock a descartar", "R57.9"],
  hp2: ["Shock a descartar", "R57.9"],
  hp3: ["Shock cardiogénico o arritmia a descartar", "R57.0"],
  hp4: ["Sepsis a descartar", "A41.9"],
  hp5: ["Shock hemorrágico a descartar", "R57.1"],
  hp6: ["Anafilaxia", "T78.2"],
  hp8: ["Síndrome de hipotensión materna", "O26.5"],
  /* Mareo */
  mr1: ["Accidente cerebrovascular a descartar (Código ACV)", "I64"],
  mr2: ["Accidente cerebrovascular de fosa posterior a descartar", "I64"],
  mr3: ["Arritmia a descartar", "I49.9"],
  mr4: ["Arritmia", "I49.9"],
  mr5: ["Shock a descartar", "R57.9"],
  mr6: ["Hemorragia digestiva a descartar", "K92.2"],
  mr7: ["Hemorragia subaracnoidea a descartar", "I60.9"],
  /* Calor */
  gc1: ["Golpe de calor", "T67.0"],
  gc2: ["Deshidratación", "E86"],
  gc3: ["Rabdomiólisis a descartar", "M62.8"],
  /* Trauma en la escuela */
  te1: ["Lesión intracraneal traumática a descartar", "S06.9"],
  te2: ["Lesión intracraneal traumática a descartar", "S06.9"],
  te3: ["Fractura a descartar", "T14.2"],
  te4: ["Lesión de columna cervical a descartar", "S19.9"],
  te5: ["Lesión intratorácica o intraabdominal a descartar", "S36.9"],
  te6: ["Herida que requiere sutura", "T14.1"],
  /* TEC en adulto */
  tc_cchr: ["Lesión intracraneal traumática a descartar (regla canadiense positiva)", "S06.9"],
  tc6: ["Lesión intracraneal traumática a descartar (paciente anticoagulado)", "S06.9"],
  tc7: ["Lesión intracraneal traumática a descartar", "S06.9"],
  tc9: ["Lesión de columna cervical a descartar", "S19.9"],
  tc10: ["Intoxicación alcohólica aguda", "F10.0"],
  tc11: ["Politraumatismo a descartar", "T07"],
  /* Metrorragia */
  mt1: ["Embarazo ectópico o aborto en curso a descartar", "O00.9"],
  mt2: ["Shock hemorrágico a descartar", "R57.1"],
  mt3: ["Hipovolemia por pérdida de sangre", "R57.1"],
  mt6: ["Hemorragia puerperal tardía a descartar", "O72.2"],
  /* Dolor generalizado */
  dg1: ["Meningococcemia a descartar", "A39.4"],
  dg2: ["Sepsis a descartar", "A41.9"],
  dg3: ["Rabdomiólisis a descartar", "M62.8"],
  dg4: ["Síndrome de Guillain-Barré a descartar", "G61.0"],
  /* Reacción alérgica */
  al1: ["Anafilaxia", "T78.2"],
  al2: ["Angioedema", "T78.3"],
  al3: ["Anafilaxia", "T78.2"],
  al4: ["Anafilaxia", "T78.2"],
  al5: ["Anafilaxia", "T78.2"],
  al7: ["Angioedema por IECA", "T78.3"],
  /* Cefalea */
  c1: ["Hemorragia subaracnoidea a descartar", "I60.9"],
  c2: ["Meningitis a descartar", "G03.9"],
  c3: ["Lesión intracraneal a descartar", "G93.9"],
  c5: ["Lesión intracraneal traumática a descartar", "S06.9"],
  c6: ["Preeclampsia a descartar", "O14.9"],
  c8: ["Emergencia hipertensiva a descartar", "I10"],
  /* Agitación */
  ag1: ["Síndrome confusional agudo de causa orgánica a descartar", "F05.9"],
  ag2: ["Síndrome confusional agudo (delirium)", "F05.9"],
  ag3: ["Intoxicación aguda o síndrome de abstinencia a descartar", "F19.0"],
  ag4: ["Riesgo cierto e inminente para sí o terceros", "R45.8"],
  ag5: ["Ideación suicida", "R45.8"],
  ag7: ["Primer episodio psicótico", "F23.9"],
  /* Síncope */
  si1: ["Síncope de causa cardíaca a descartar", "I49.9"],
  si2: ["Síncope de causa cardíaca a descartar", "I49.9"],
  si3: ["Arritmia", "I49.9"],
  si4: ["Síncope de causa cardíaca a descartar", "I49.9"],
  si6: ["Hemorragia digestiva a descartar", "K92.2"],
  si7: ["Crisis convulsiva a descartar", "R56.8"],
  /* Convulsión */
  cv1: ["Estado de mal epiléptico", "G41.9"],
  cv2: ["Primera crisis convulsiva", "R56.8"],
  cv3: ["Lesión intracraneal a descartar", "G93.9"],
  cv4: ["Meningitis o lesión intracraneal a descartar", "G03.9"],
  cv5: ["Eclampsia", "O15.9"],
  /* Caída */
  ca1: ["Lesión intracraneal traumática a descartar", "S06.9"],
  ca2: ["Fractura de cadera a descartar", "S72.0"],
  ca4: ["Fractura vertebral a descartar", "T08"],
  ca5: ["Síncope a estudiar", "R55"],
  ca6: ["Rabdomiólisis a descartar", "M62.8"],
  ca7: ["Fractura a descartar", "T14.2"],
  /* Intoxicación */
  tx2: ["Intoxicación medicamentosa intencional", "T50.9"],
  tx3: ["Intoxicación por monóxido de carbono", "T58"],
  tx5: ["Intoxicación por opioides a descartar", "T40.2"],
  tx7: ["Ingesta de cáusticos", "T54.3"],
  /* Epistaxis */
  ep2: ["Hipovolemia por pérdida de sangre", "R57.1"],
  ep3: ["Epistaxis posterior", "R04.0"],
  /* Ansiedad */
  an1: ["Síndrome coronario agudo a descartar", "I24.9"],
  an3: ["Accidente cerebrovascular a descartar", "I64"],
  an4: ["Riesgo cierto e inminente para sí o terceros", "R45.8"],
  an5: ["Intoxicación a descartar", "T65.9"],
  /* Síntomas urinarios */
  iu1: ["Pielonefritis aguda a descartar", "N10"],
  iu2: ["Sepsis de origen urinario a descartar", "A41.9"],
  iu3: ["Pielonefritis en el embarazo a descartar", "O23.0"],
  iu4: ["Retención aguda de orina", "R33"],
  /* Garganta / oído */
  go1: ["Estridor: obstrucción de vía aérea superior a descartar", "R06.1"],
  go2: ["Absceso periamigdalino o epiglotitis a descartar", "J36"],
  go3: ["Absceso periamigdalino a descartar", "J36"],
  go4: ["Meningitis a descartar", "G03.9"],
  go5: ["Mastoiditis a descartar", "H70.9"],
  /* Dental */
  de1: ["Angina de Ludwig a descartar", "K12.2"],
  de4: ["Celulitis periorbitaria a descartar", "L03.2"],
  /* Herida */
  he1: ["Hemorragia externa activa", "T14.1"],
  he3: ["Lesión vascular o nerviosa a descartar", "T14.5"],
  he4: ["Amputación traumática", "T14.7"],
  /* Quemadura */
  qu4: ["Lesión por inhalación a descartar", "T27.3"],
  qu5: ["Quemadura eléctrica o química", "T30.0"],
  /* Hemorragia digestiva */
  hd1: ["Hemorragia digestiva alta", "K92.0"],
  hd2: ["Hemorragia digestiva alta (melena)", "K92.1"],
  hd3: ["Hemorragia digestiva baja", "K92.2"],
  hd4: ["Shock hemorrágico a descartar", "R57.1"],
  hd6: ["Hemorragia por várices esofágicas a descartar", "I85.0"],
  /* Deshidratación en adulto mayor */
  dh1: ["Síndrome confusional agudo", "F05.9"],
  dh5: ["Sepsis a descartar", "A41.9"],
  /* Insuficiencia cardíaca */
  ic1: ["Edema agudo de pulmón", "J81"],
  ic2: ["Shock cardiogénico a descartar", "R57.0"],
  ic3: ["Síndrome coronario agudo a descartar", "I24.9"],
  ic4: ["Arritmia", "I49.9"],
  /* Palpitaciones */
  pa2: ["Taquiarritmia", "I47.9"],
  pa3: ["Fibrilación auricular de reciente comienzo", "I48"],
  pa4: ["Taquicardia ventricular a descartar", "I47.2"],
  /* Retención urinaria */
  re1: ["Sepsis de origen urinario a descartar", "A41.9"],
  re3: ["Compresión medular a descartar", "G95.2"],
  /* Embarazo */
  em1: ["Hemorragia del embarazo", "O46.9"],
  em3: ["Rotura prematura de membranas a descartar", "O42.9"],
  em5: ["Preeclampsia a descartar", "O14.9"],
  em6: ["Eclampsia", "O15.9"],
  em7: ["Disminución de movimientos fetales", "O36.8"],
  /* Mordedura y picadura */
  mo4: ["Exposición a rabia: indicación de profilaxis antirrábica", "Z20.3"],
  pi1: ["Escorpionismo moderado a grave", "T63.2"],
  pi3: ["Loxoscelismo", "T63.3"],
  pi4: ["Latrodectismo", "T63.3"],
  pi5: ["Anafilaxia", "T78.2"],
  /* Alteración del sensorio */
  se1: ["Coma a estudiar", "R40.2"],
  se2: ["Accidente cerebrovascular a descartar (Código ACV)", "I64"],
  se3: ["Meningitis o sepsis a descartar", "G03.9"],
  se4: ["Intoxicación a descartar", "T65.9"],
  se5: ["Lesión intracraneal traumática a descartar", "S06.9"],
  se7: ["Síndrome confusional agudo (delirium)", "F05.9"],
  se12: ["Efecto adverso de medicación a descartar", "T88.7"],
  se8: ["Estado posictal prolongado", "R56.8"],
  se11: ["Deterioro cognitivo conocido sin cambio agudo", "F03"],
  /* Pediatría */
  fp1: ["Infección bacteriana grave a descartar", "A49.9"],
  fp2: ["Sepsis a descartar", "A41.9"],
  fp3: ["Meningitis o meningococcemia a descartar", "A39.4"],
  fp4: ["Infección respiratoria aguda baja", "J22"],
  fp5: ["Deshidratación", "E86"],
  la1: ["Laringitis aguda moderada a grave", "J05.0"],
  la2: ["Insuficiencia respiratoria aguda a descartar", "J96.0"],
  la3: ["Epiglotitis a descartar", "J05.1"],
  la4: ["Cuerpo extraño en vía aérea a descartar", "T17.9"],
  br1: ["Insuficiencia respiratoria aguda a descartar", "J96.0"],
  br2: ["Insuficiencia respiratoria aguda a descartar", "J96.0"],
  cf1: ["Estado de mal epiléptico", "G41.9"],
  cf2: ["Convulsión febril compleja", "R56.0"],
  cf4: ["Meningitis a descartar", "G03.9"],
  cf6: ["Meningitis o sepsis a descartar", "G03.9"],
  cf7: ["Hipoglucemia", "E16.2"],
  dp1: ["Deshidratación grave", "E86"],
  dp2: ["Shock hipovolémico", "R57.1"],
  dp3: ["Síndrome urémico hemolítico a descartar", "D59.3"],
  dp5: ["Invaginación intestinal u obstrucción a descartar", "K56.1"]
};

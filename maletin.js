/* =========================================================================
   MALETÍN ESTÁNDAR — catálogo base editable
   -------------------------------------------------------------------------
   Cada fármaco tiene un "id" estable: los protocolos lo referencian.
   enStock: valor por defecto. El médico lo cambia desde la pantalla
   "Maletín" y el cambio se guarda en el teléfono (localStorage).
   Las presentaciones son las habituales en Argentina; verificar contra
   el inventario real de cada base/móvil.
   ========================================================================= */
window.MALETIN_BASE = [
  // --- Vía aérea / respiratorio
  { id: "salbutamol_mdi", nombre: "Salbutamol aerosol", presentacion: "100 mcg/disparo + aerocámara", grupo: "Respiratorio", enStock: true },
  { id: "salbutamol_neb", nombre: "Salbutamol solución para nebulizar", presentacion: "0,5 % (5 mg/ml)", grupo: "Respiratorio", enStock: true },
  { id: "ipratropio_neb", nombre: "Bromuro de ipratropio solución", presentacion: "0,025 % (0,25 mg/ml)", grupo: "Respiratorio", enStock: true },
  { id: "oxigeno", nombre: "Oxígeno", presentacion: "Cánula / máscara / reservorio", grupo: "Respiratorio", enStock: true },

  // --- Corticoides / antialérgicos
  { id: "hidrocortisona", nombre: "Hidrocortisona", presentacion: "Fco-amp 100 mg y 500 mg", grupo: "Corticoides y antialérgicos", enStock: true },
  { id: "dexametasona", nombre: "Dexametasona", presentacion: "Amp 8 mg/2 ml", grupo: "Corticoides y antialérgicos", enStock: true },
  { id: "meprednisona", nombre: "Meprednisona", presentacion: "Comp 40 mg", grupo: "Corticoides y antialérgicos", enStock: false },
  { id: "difenhidramina", nombre: "Difenhidramina", presentacion: "Amp inyectable", grupo: "Corticoides y antialérgicos", enStock: true },
  { id: "adrenalina", nombre: "Adrenalina", presentacion: "Amp 1 mg/ml (1:1000)", grupo: "Corticoides y antialérgicos", enStock: true },

  // --- Analgesia / antiespasmódicos
  { id: "dipirona", nombre: "Dipirona", presentacion: "Amp 1 g/2 ml", grupo: "Analgesia", enStock: true },
  { id: "paracetamol", nombre: "Paracetamol", presentacion: "Comp 500 mg", grupo: "Analgesia", enStock: true },
  { id: "diclofenac", nombre: "Diclofenac", presentacion: "Amp 75 mg/3 ml", grupo: "Analgesia", enStock: true },
  { id: "ketorolac", nombre: "Ketorolac", presentacion: "Amp 30 mg/ml y 60 mg/2 ml", grupo: "Analgesia", enStock: true },
  { id: "hioscina", nombre: "Hioscina butilbromuro", presentacion: "Amp 20 mg/ml", grupo: "Analgesia", enStock: true },
  { id: "hioscina_dipirona", nombre: "Hioscina + dipirona", presentacion: "Amp 20 mg + 2,5 g / 5 ml", grupo: "Analgesia", enStock: true },

  // --- Gastrointestinal / vestibular
  { id: "metoclopramida", nombre: "Metoclopramida", presentacion: "Amp 10 mg/2 ml", grupo: "Gastrointestinal", enStock: true },
  { id: "ondansetron", nombre: "Ondansetrón", presentacion: "Amp 8 mg/4 ml", grupo: "Gastrointestinal", enStock: false },
  { id: "dimenhidrinato", nombre: "Dimenhidrinato", presentacion: "Amp 50 mg", grupo: "Gastrointestinal", enStock: true },

  // --- Cardiovascular
  { id: "aas", nombre: "Ácido acetilsalicílico", presentacion: "Comp 100 mg / 500 mg", grupo: "Cardiovascular", enStock: true },
  { id: "dinitrato", nombre: "Dinitrato de isosorbide", presentacion: "Comp sublingual 5 mg", grupo: "Cardiovascular", enStock: true },
  { id: "captopril", nombre: "Captopril", presentacion: "Comp 25 mg", grupo: "Cardiovascular", enStock: true },
  { id: "enalapril", nombre: "Enalapril", presentacion: "Comp 10 mg", grupo: "Cardiovascular", enStock: true },
  { id: "amlodipina", nombre: "Amlodipina", presentacion: "Comp 5 mg", grupo: "Cardiovascular", enStock: false },
  { id: "furosemida", nombre: "Furosemida", presentacion: "Amp 20 mg/2 ml", grupo: "Cardiovascular", enStock: true },
  { id: "atropina", nombre: "Atropina", presentacion: "Amp 1 mg/ml", grupo: "Cardiovascular", enStock: true },
  { id: "amiodarona", nombre: "Amiodarona", presentacion: "Amp 150 mg/3 ml", grupo: "Cardiovascular", enStock: true },
  { id: "adenosina", nombre: "Adenosina", presentacion: "Amp 6 mg/2 ml", grupo: "Cardiovascular", enStock: false },
  { id: "lidocaina", nombre: "Lidocaína 2 %", presentacion: "Fco-amp 20 mg/ml", grupo: "Cardiovascular", enStock: true },

  // --- Neurológico / psiquiátrico
  { id: "diazepam", nombre: "Diazepam", presentacion: "Amp 10 mg/2 ml · Comp 5–10 mg", grupo: "Neurológico", enStock: true },
  { id: "lorazepam", nombre: "Lorazepam", presentacion: "Comp 1 mg / 2 mg", grupo: "Neurológico", enStock: true },
  { id: "midazolam", nombre: "Midazolam", presentacion: "Amp 15 mg/3 ml", grupo: "Neurológico", enStock: true },
  { id: "haloperidol", nombre: "Haloperidol", presentacion: "Amp 5 mg/ml", grupo: "Neurológico", enStock: true },
  { id: "sulfato_mg", nombre: "Sulfato de magnesio", presentacion: "Amp 25 % (2,5 g/10 ml)", grupo: "Neurológico", enStock: true },

  // --- Metabólico / antídotos
  { id: "dextrosa25", nombre: "Dextrosa hipertónica 25 %", presentacion: "Amp / fco", grupo: "Metabólico y antídotos", enStock: true },
  { id: "glucagon", nombre: "Glucagón", presentacion: "Kit 1 mg", grupo: "Metabólico y antídotos", enStock: false },
  { id: "tiamina", nombre: "Tiamina", presentacion: "Amp 100 mg", grupo: "Metabólico y antídotos", enStock: true },
  { id: "naloxona", nombre: "Naloxona", presentacion: "Amp 0,4 mg/ml", grupo: "Metabólico y antídotos", enStock: true },

  { id: "acido_tranexamico", nombre: "Ácido tranexámico", presentacion: "Amp 500 mg/5 ml", grupo: "Metabólico y antídotos", enStock: false },

  // --- Soluciones
  { id: "sf", nombre: "Solución fisiológica 0,9 %", presentacion: "Sachet 500 ml", grupo: "Soluciones", enStock: true },
  { id: "ringer", nombre: "Ringer lactato", presentacion: "Sachet 500 ml", grupo: "Soluciones", enStock: true }
];

# Sirena — Soporte a la decisión prehospitalaria

PWA offline para médicos de ambulancia en la Provincia de Buenos Aires.
Flujo: **código de despacho + motivo → banderas rojas → derivación o resolución domiciliaria**, con cruce automático contra el maletín disponible.

> **Estado: borrador v1.0.** Los protocolos deben ser revisados y aprobados por la Dirección Médica del servicio antes del uso asistencial. Es una herramienta de apoyo: la decisión final es del médico actuante.

## Stack

| Elección | Por qué |
|---|---|
| HTML + CSS + JavaScript sin frameworks | Carga en < 100 KB total, arranque instantáneo en gama media, sin paso de compilación. |
| PWA (manifest + service worker) | Se instala desde Chrome como app, abre a pantalla completa y funciona sin señal. |
| Datos en archivos JS planos | El equipo médico edita protocolos sin tocar la lógica. |
| `localStorage` | El maletín editado queda guardado en el teléfono. |

## Estructura

```
sirena/   (todos los archivos en la raíz, sin carpetas: así se suben fácil desde la web de GitHub)
├── index.html · styles.css · app.js
├── sw.js · manifest.webmanifest · icon-192.png · icon-512.png · icon-maskable-512.png
├── protocolos.js            10 motivos base: banderas, soporte, diagnósticos, tratamientos
├── protocolos_ampliados.js  20 motivos frecuentes más
├── protocolos_pediatricos.js 5 motivos pediátricos con dosis por peso
├── apps_script.gs           Script para la planilla (envío automático; no lo usa la app)
├── manejo_general.js        Banderas por aparato y tratamiento sintomático
├── maletin.js               Catálogo editable del maletín
├── soporte_vital.js         BLS · ACLS · PALS · PHTLS + calculadora pediátrica
└── fichas.js                Fichas: pediatría por peso, intubación, TEC pediátrico, preeclampsia, embarazo
```

## Publicar en GitHub Pages (gratis)

1. Crear una cuenta en https://github.com si no la tenés.
2. Botón **New** (nuevo repositorio) → nombre `sirena` → **Public** → **Create repository**.
3. En el repositorio nuevo: **uploading an existing file** (o *Add file → Upload files*).
4. Descomprimir el ZIP y arrastrar **el contenido** de la carpeta `sirena` (todos los archivos), no la carpeta en sí. **Commit changes**.
5. **Settings → Pages** → en *Build and deployment*, *Source*: **Deploy from a branch** → rama `main`, carpeta `/ (root)` → **Save**.
6. En uno o dos minutos la app queda en `https://<tu-usuario>.github.io/sirena/`.

GitHub Pages es gratis con repositorio público. Para usarlo con un repositorio privado hace falta un plan pago (Pro o superior). El repositorio no contiene datos de pacientes ni el link de la planilla de registro.

**Actualizar la app**: subir los archivos modificados al repositorio (*Add file → Upload files*, reemplazan a los anteriores), cambiar en `sw.js` el número de `const CACHE = "sirena-vN"` y en `version.json` la versión. Los teléfonos muestran el aviso de versión nueva al abrir la app con conexión.

## Instalar en el teléfono

**Android (Chrome)**
1. Abrir `https://<tu-usuario>.github.io/sirena/` en Chrome, con conexión.
2. Menú ⋮ → **Instalar app** (o **Agregar a pantalla principal**).
3. Aparece el ícono de la ambulancia. Desde ahí abre a pantalla completa y funciona sin señal.

**iPhone (Safari)**: abrir el link en Safari → botón Compartir → **Agregar a inicio**.

Primera vez en el teléfono: cargar el maletín real (pantalla Maletín) y pegar el link de la planilla en la pantalla Registro. Ambas cosas quedan guardadas en ese teléfono.

**Prueba local**: `python3 -m http.server 8080` en la carpeta y abrir `http://localhost:8080`.

## Pestañas

- **Atención**: código, motivo, banderas, domicilio o traslado, historia clínica y registro.
- **RCP**: soporte vital (BLS, ACLS, PALS, PHTLS).
- **Fichas**: consulta rápida. Medicación pediátrica por peso, secuencia rápida de intubación, TEC leve pediátrico (PECARN), preeclampsia y eclampsia (MSAL 2010), fármacos del maletín en el embarazo, calculadora de goteo (ml/h, micro y macrogotas, infusión de drogas por dosis).
- **Maletín**: fármacos disponibles. Todas las dosis se cruzan con esta lista.

## Contador de FC y FR

Al tocar FC o FR en los signos vitales, el botón *Contar* abre un contador: se elige 15, 30 o 60 s y se toca la pantalla en cada latido o respiración (el primer toque arranca el reloj). Calcula la frecuencia con el tiempo entre toques, avisa si los intervalos son irregulares, vibra y suena al terminar, y *Usar* carga el valor.

## Cómo decide

- **Bandera roja**: criterio de traslado por sí sola según la guía. Muestra qué indica la guía para esa bandera (p. ej. "Activar Código ACV").
- **Bandera amarilla**: permite quedarse en domicilio cumpliendo la conducta específica de esa bandera (p. ej. "Hacer ECG: si es normal puede continuar").
- No se decide por cantidad de banderas sino por su nivel. Los signos vitales cargados marcan solas las banderas generales.

## Motivos sin protocolo

El buscador reconoce sinónimos y variantes ("convulsionó", "se desmayó", "tomó pastillas"). Si encuentra varios motivos parecidos, los ofrece para elegir. Si no hay protocolo específico, siempre está el **manejo general por aparato**: el médico elige los sistemas comprometidos, aparecen sus banderas y, sin banderas rojas, se ofrece tratamiento sintomático con el maletín.

## Motivos pediátricos

Fiebre en el niño, laringitis, bronquiolitis y sibilancias del lactante, convulsión febril, y diarrea y vómitos. Con el botón *Niño* aparecen primero en la lista y en el buscador. Las dosis se calculan con el peso del paciente, tanto lo que se administra del maletín como lo que se indica para la casa (en mg y en ml de la presentación). Fuentes: SAP (IRAB 2021, fiebre sin foco 2017), MSAL (Programa IRAb 2025, diarrea, dengue), PALS.

## Historia clínica

La pantalla *Historia clínica* sigue el orden de la planilla en papel: antecedentes, signos vitales (TA, FC, FR, ARM, SatO₂, T° axilar, glucemia, Glasgow), hallazgos (cardiovascular, respiratorio, abdomen, neurológico), diagnóstico presuntivo, tratamiento e indicaciones, medicación y descartables, observaciones (RCP / ECG), paciente e internación/derivación. Los datos filiatorios se completan a mano: la app no los guarda.

## Registro de atenciones

Cada atención se guarda en el teléfono como una fila sin datos personales (al tocar *Nuevo caso* o *Guardar en registro*). En la pantalla *Registro*, *Copiar filas* copia todas las pendientes: se pegan en la primera fila vacía de la hoja **Registro** de la planilla de Google Sheets y cada dato cae en su columna. La hoja **Resumen** se calcula sola (motivos frecuentes, % de traslados, domicilio pese a criterio de traslado, diagnósticos con CIE-10, fármacos faltantes). Después de pegar, *Vaciar pendientes* las borra del teléfono.

**Envío automático (opcional)**: en la planilla, *Extensiones → Apps Script*, pegar el contenido de `apps_script.gs` y guardar. *Implementar → Nueva implementación → Aplicación web*, ejecutar como *yo*, acceso *Cualquier persona*. Copiar el link que termina en `/exec` y pegarlo en Sirena → Registro → *Envío automático*. Desde ahí, cada atención guardada y cada nota se envían solas cuando hay señal; si no hay, quedan en el teléfono y se reintenta al volver la conexión. Si se vuelve a guardar la misma atención, se actualiza su fila en vez de duplicarla. El link queda solo en el teléfono.

Códigos: cada motivo y diagnóstico tiene su CIE-10. El campo SNOMED CT está preparado pero vacío: completarlo con el servidor de terminología nacional antes de usarlo.

## Editar contenido

- **Fármacos del móvil**: desde la app, botón *Maletín*. Los que se apagan no se recomiendan; la app busca una alternativa de la guía o lo marca como faltante. Un fármaco agregado puede declararse *equivalente* a uno del catálogo para que los protocolos lo usen.
- **Protocolos**: `protocolos.js`. Cada tratamiento referencia un `id` de `maletin.js` y puede tener `alt` (alternativas en orden de preferencia).
- Después de editar archivos, subir la versión en `sw.js` (`sirena-v5`) para que los teléfonos descarguen el cambio.

## Fuentes de referencia

- Ministerio de Salud de la Nación: GPC EPOC (2016) y guía breve (2017); GPC Hipertensión Arterial (2019); lineamientos ACV; guía Dengue; normas de diarrea aguda.
- SAME CABA / SAME Provincia (Dec. PBA 898/16 y 212/17): procedimientos de atención y traslado.
- Sociedad Argentina de Emergencias (SAE).
- AHA: BLS, ACLS, PALS (versión vigente) · NAEMT: PHTLS.

/* =========================================================================
   Sirena — recepción automática del registro en Google Sheets
   -------------------------------------------------------------------------
   Dónde va: en la planilla "Sirena — Registro de atenciones",
   menú Extensiones → Apps Script. Borrar lo que haya y pegar este código.
   Después: Implementar → Nueva implementación → tipo "Aplicación web"
     · Ejecutar como: yo
     · Quién tiene acceso: Cualquier persona
   Copiar el link que termina en /exec y pegarlo en Sirena → Registro →
   Envío automático.

   Qué hace: recibe filas sin datos personales y las escribe en la hoja
   Registro o Notas. Si una fila con el mismo ID ya existe, la actualiza en
   lugar de duplicarla. Responde con los ID guardados para que el teléfono
   los borre de sus pendientes.
   ========================================================================= */

const HOJAS = { Registro: "Registro", Notas: "Notas" };

/* Prueba de conexión desde la app (botón "Probar conexión"). */
function doGet() {
  return json_({ ok: true, planilla: SpreadsheetApp.getActive().getName() });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents);
    const nombre = HOJAS[d.hoja];
    if (!nombre || !Array.isArray(d.filas)) return json_({ ok: false, error: "datos inválidos" });
    const hoja = SpreadsheetApp.getActive().getSheetByName(nombre);
    if (!hoja) return json_({ ok: false, error: "no existe la hoja " + nombre });

    const ultima = hoja.getLastRow();
    const ids = ultima > 1 ? hoja.getRange(2, 1, ultima - 1, 1).getDisplayValues().map((r) => String(r[0])) : [];
    const guardados = [], nuevas = [];

    d.filas.slice(0, 500).forEach((f) => {
      if (!Array.isArray(f) || !f[0]) return;
      // Texto plano: nada que empiece con = + @ se interpreta como fórmula.
      const fila = f.slice(0, 60).map((x) => {
        const t = String(x == null ? "" : x).slice(0, 2000);
        return /^[=+@]/.test(t) ? "'" + t : t;
      });
      const i = ids.indexOf(String(fila[0]));
      if (i >= 0) hoja.getRange(i + 2, 1, 1, fila.length).setValues([fila]);
      else nuevas.push(fila);
      guardados.push(String(fila[0]));
    });

    if (nuevas.length) {
      const ancho = Math.max.apply(null, nuevas.map((f) => f.length));
      const bloque = nuevas.map((f) => f.concat(new Array(ancho - f.length).fill("")));
      hoja.getRange(hoja.getLastRow() + 1, 1, bloque.length, ancho).setValues(bloque);
    }
    return json_({ ok: true, ids: guardados });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

(() => {
  const $ = id => document.getElementById(id);

  const inputText   = $("inputText");
  const outputText  = $("outputText");
  const analyzeBtn  = $("analyzeBtn");
  const clearBtn    = $("limpiarEditorBtn");
  const fileInput   = $("fileInput");
  const saveBtn     = $("guardarArchivoBtn");
  const tokensTb    = document.querySelector("#tokensTable tbody");
  const errorsTb    = document.querySelector("#errorsTable tbody");
  const consoleOut  = $("consoleOutput");
  const symbolTb    = document.querySelector("#symbolTable tbody"); // opcional

  // Limpiar todo
  clearBtn.onclick = () => {
    inputText.value    = "";
    outputText.value   = "";
    consoleOut.value   = "";
    tokensTb.innerHTML = "";
    errorsTb.innerHTML = "";
    if (symbolTb) symbolTb.innerHTML = "";
  };

  // Cargar archivo .cs
  fileInput.accept = ".cs";
  fileInput.onchange = function (e) {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      inputText.value = ev.target.result;
    };
    reader.readAsText(f);
  };

  // Guardar contenido del editor a archivo
  saveBtn.onclick = () => {
    const blob = new Blob([inputText.value], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "code.cs";
    a.click();
  };

  // Enviar para análisis y poblar resultados
  analyzeBtn.onclick = () => {
    fetch("/analyze", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: inputText.value
    })
    .then(r => r.json())
    .then(d => {
      console.log("📦 Respuesta completa:", d);

      // Mostrar traducción en el área de salida
      outputText.value = typeof d.transpiledCode === "string" ? d.transpiledCode : "";

      // Llenar tablas
      populate(tokensTb, d.tokens, ["typeTokenString", "lexeme", "row", "column"]);
      const allErrors = [...(d.errors ?? []), ...(d.syntacticErrors ?? [])];
      populate(errorsTb, allErrors, ["description", "lexeme", "row", "column"]);

      if (symbolTb) {
        populate(symbolTb, d.symbols, ["name", "value", "row", "column"]);
      }

      // Mostrar salida detallada en consola
      if (typeof d.consoleOutput === "string") {
        consoleOut.value = d.consoleOutput;
      } else {
        const fallback = allErrors.length > 0
          ? `❌ Se encontraron ${allErrors.length} errores.\n\nVer tabla de errores para más detalles.`
          : "✅ Análisis completado sin errores.\n\nCódigo transpilado correctamente.";
        consoleOut.value = fallback;
      }
    })
    .catch(err => {
      console.error("❌ Error en la solicitud /analyze:", err);
      consoleOut.value = "❌ Error al comunicarse con el servidor. ¿Está ejecutándose en localhost:3000?";
    });
  };

  // Función genérica para llenar tablas con validación
  function populate(tbody, arr, keys) {
    tbody.innerHTML = "";
    if (!Array.isArray(arr)) {
      console.warn("⚠️ No se recibió un arreglo para esta tabla:", tbody);
      return;
    }

    arr.forEach((obj, idx) => {
      const row = tbody.insertRow();
      row.insertCell().textContent = String(idx + 1);
      keys.forEach(key => {
        const cell = row.insertCell();
        cell.textContent = String(obj[key] ?? "");
      });
    });
  }
})();
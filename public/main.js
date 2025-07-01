(() => {
  const $ = id => document.getElementById(id);

  const inputText    = $("inputText");
  const outputText   = $("outputText");
  const analyzeBtn   = $("analyzeBtn");
  const clearBtn     = $("limpiarEditorBtn");
  const fileInput    = $("fileInput");
  const saveBtn      = $("guardarArchivoBtn");
  const tokensTb     = document.querySelector("#tokensTable tbody");
  const errorsTb     = document.querySelector("#errorsTable tbody");
  const synErrTb     = document.querySelector("#syntacticErrorsTable tbody");
  const consoleOut   = $("consoleOutput");
  const symbolTb     = document.querySelector("#symbolTable tbody"); // tabla de símbolos

  // Limpiar todo
  clearBtn.onclick = () => {
    inputText.value      = "";
    outputText.value     = "";
    consoleOut.value     = "";
    tokensTb.innerHTML   = "";
    errorsTb.innerHTML   = "";
    if (synErrTb) synErrTb.innerHTML = "";
    if (symbolTb) symbolTb.innerHTML = "";
  };

  // Cargar archivo .cs
  fileInput.accept = ".cs";
  fileInput.onchange = e => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => inputText.value = ev.target.result;
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

      // 1) Mostrar salida detallada en consola (siempre)
      consoleOut.value = typeof d.consoleOutput === "string"
        ? d.consoleOutput
        : "";

      // 2) Mostrar código transpilado (opcional)
      outputText.value = typeof d.transpiledCode === "string"
        ? d.transpiledCode
        : "";

      // 3) Poblar tabla de ERRORES LÉXICOS
      errorsTb.innerHTML = "";
      (d.errors || []).forEach(err => {
        const row = errorsTb.insertRow();
        row.insertCell().textContent = String(err.row);
        row.insertCell().textContent = String(err.column);
        row.insertCell().textContent = err.lexeme;
        row.insertCell().textContent = err.type;
      });

      // 4) Poblar tabla de TOKENS
      tokensTb.innerHTML = "";
      (d.tokens || []).forEach(tok => {
        const row = tokensTb.insertRow();
        row.insertCell().textContent = String(tok.row);
        row.insertCell().textContent = String(tok.column);
        row.insertCell().textContent = tok.lexeme;
        row.insertCell().textContent = tok.type;
      });

      // 5) Poblar tabla de ERRORES SINTÁCTICOS
      if (synErrTb) {
        synErrTb.innerHTML = "";
        (d.syntacticErrors || []).forEach(msg => {
          const row = synErrTb.insertRow();
          const cell = row.insertCell();
          cell.colSpan = 4;
          cell.textContent = msg;
        });
      }

      // 6) Poblar tabla de SÍMBOLOS
      if (symbolTb) {
        symbolTb.innerHTML = "";
        (d.symbols || []).forEach((sym, index) => {
          const row = symbolTb.insertRow();
          row.insertCell().textContent = index + 1;                       // #
          row.insertCell().textContent = sym.name ?? "";                  // Variable
          row.insertCell().textContent = String(sym.value ?? "");         // Valor
          row.insertCell().textContent = sym.type ?? "";                  // Tipo
          row.insertCell().textContent = String(sym.row ?? "");           // Fila
          row.insertCell().textContent = String(sym.column ?? "");        // Columna
        });
      }
    })
    .catch(err => {
      console.error("❌ Error en la solicitud /analyze:", err);
      consoleOut.value = "❌ Error al comunicarse con el servidor.";
    });
  };
})();
// public/main.js
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
  const symbolTb    = document.querySelector("#symbolTable tbody");

  // Limpiar todo
  clearBtn.onclick = () => {
    inputText.value   = "";
    outputText.value  = "";
    consoleOut.value  = "";
    tokensTb.innerHTML  = "";
    errorsTb.innerHTML  = "";
    symbolTb.innerHTML  = "";
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
      // Código transpilado
      outputText.value = d.transpiledCode;

      // Tokens y errores
      populate(tokensTb, d.tokens, ["typeString", "lexeme", "row", "column"]);
      populate(errorsTb, d.errors, ["typeString", "lexeme", "row", "column"]);

      // Salida de consola
      consoleOut.value = d.consoleOutput;

      // Tabla de símbolos
      populate(symbolTb, d.symbols, ["name", "value", "row", "column"]);
    })
    .catch(console.error);
  };

  // Función genérica para llenar tablas
  function populate(tbody, arr, keys) {
    tbody.innerHTML = "";
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

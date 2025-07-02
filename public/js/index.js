document.addEventListener('DOMContentLoaded', () => {

    const button     = document.getElementById('analyze');
    const editor     = document.getElementById('editor');
    const salida     = document.getElementById('salida');
    const consoleOut = document.getElementById('consoleOutput');
    const table      = document.getElementById('tokens');
    const tableError = document.getElementById('errors');
    const clear      = document.getElementById('clear');
    const open       = document.getElementById('open');
    const save       = document.getElementById('save');

    clear.addEventListener('click', () => {
        editor.innerHTML     = '';
        salida.innerText     = '';
        table.innerHTML      = '';
        tableError.innerHTML = '';      // limpiar tabla de errores léxicos
        consoleOut.value     = '';
    });

    open.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type  = 'file';
        fileInput.accept= '.cs';
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                const reader = new FileReader();
                reader.onload = e => editor.innerText = e.target.result;
                reader.readAsText(fileInput.files[0]);
            }
            fileInput.remove();
        });
        fileInput.click();
    });

    save.addEventListener('click', () => {
        const download = document.createElement('a');
        download.href     = `data:text/plain;charset=utf-8,${encodeURIComponent(editor.innerText)}`;
        download.download = 'archivo.cs';
        download.click();
    });

    button.addEventListener('click', async () => {
        // Limpieza previa
        localStorage.clear();
        consoleOut.value     = '';
        table.innerHTML      = '';
        tableError.innerHTML = ''; 

        // Envío al servidor
        const response = await fetch('http://localhost:3000/analyze', {
            method:  'POST',
            headers: { 'Content-Type': 'text/plain' },
            body:    editor.innerText
        });
        const result = await response.json();

        // --- Tokens ---
        let htmlTokens = '';
        result.tokens.forEach((t, i) => {
            htmlTokens += `
            <tr>
                <td>${i + 1}</td>
                <td>${t.typeTokenString}</td>
                <td>${t.lexeme}</td>
                <td>${t.row}</td>
                <td>${t.column}</td>
            </tr>`;
        });
        table.innerHTML = htmlTokens;

        // --- Errores Léxicos ---
        if (result.errors.length > 0) {
            let htmlErrors = '';
            result.errors.forEach((e, i) => {
                htmlErrors += `
                <tr>
                    <td>${i + 1}</td>
                    <td>${e.typeTokenString}</td>
                    <td>${e.lexeme}</td>
                    <td>${e.row}</td>
                    <td>${e.column}</td>
                </tr>`;
            });
            tableError.innerHTML = htmlErrors;
        }

        // Colorear editor
        editor.innerHTML = result.colors;

        // Mostrar traducción (Salida Traducida)
        if (result.syntacticErrors.length === 0) {
            salida.innerText = result.traduction;
        } else {
            alert('La entrada tiene errores sintácticos');
        }

        // --- Salida de consola simulada ---
        const stripTypes = result.traduction
            .replace(/:\s*(number|string|boolean)/g, '')
            .replace(/<\s*number\s*>/g, '')
            .replace(/interface\s+\w+\s*{[^}]*}/g, '');
        const logs = [];
        const savedLog = console.log;
        console.log = (...args) => logs.push(args.join(' '));
        try {
            new Function(stripTypes)();
        } catch (err) {
            logs.push(`Error en ejecución: ${err.message}`);
        }
        console.log = savedLog;
        consoleOut.value = logs.join('\n');
    });

});

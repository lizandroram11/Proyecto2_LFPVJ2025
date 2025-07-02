document.addEventListener('DOMContentLoaded', () => {
  const errorsBody = document.querySelector('#errors tbody');
  const raw = localStorage.getItem('lexErrors');
  if (!raw) {
    errorsBody.innerHTML = '<tr><td colspan="5">No hay errores léxicos registrados.</td></tr>';
    return;
  }

  const errors = JSON.parse(raw);
  if (errors.length === 0) {
    errorsBody.innerHTML = '<tr><td colspan="5">No se detectaron errores léxicos.</td></tr>';
    return;
  }

  errorsBody.innerHTML = errors.map((e, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${String(e.row).padStart(2,'0')}</td>
      <td>${String(e.column).padStart(2,'0')}</td>
      <td>${e.lexeme}</td>
      <td>${e.message || 'Error léxico'}</td>
    </tr>
  `).join('');
});

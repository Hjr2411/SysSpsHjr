const tbody = document.getElementById("tbody");

const chamadosRef = db.ref("app/chamados");

chamadosRef.once("value", snapshot => {
  const dados = snapshot.val();

  if (!dados) {
    console.warn("Nenhum chamado encontrado");
    return;
  }

  Object.values(dados).forEach(chamado => {
    if (chamado.deleted === true) return;

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${chamado.chamado || "-"}</td>
      <td>${chamado.analista || "-"}</td>
      <td>${chamado.cenario || "-"}</td>
      <td>${chamado.equipamento || "-"}</td>
      <td>${chamado.linha || "-"}</td>
      <td>${chamado.prioridade || "-"}</td>
    `;

    tbody.appendChild(tr);
  });
});

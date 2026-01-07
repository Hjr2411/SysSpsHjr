// SysSPS – Chamados
// Versão: v2.1.4

const session = requireAuth();

usuario.value = session.nome || session.username;

// ===== MSISDN =====
msisdn.addEventListener("input", () => {
  let v = msisdn.value.replace(/\D/g, "").slice(0, 11);
  if (v.length > 2) v = v.replace(/^(\d{2})(\d)/, "$1 $2");
  if (v.length > 8) v = v.replace(/^(\d{2}) (\d{5})(\d)/, "$1 $2-$3");
  msisdn.value = v;
});

const normalizarMsisdn = v => v.replace(/\D/g, "").slice(0, 11);

// ===== Listas =====
async function carregarListas() {
  (await db.ref("app/listas/equipamentos").once("value")).val()?.forEach(e =>
    equipamento.innerHTML += `<option>${e}</option>`
  );
  (await db.ref("app/listas/cenarios").once("value")).val()?.forEach(c =>
    cenario.innerHTML += `<option>${c}</option>`
  );
}

// ===== Salvar =====
btnSalvar.onclick = async () => {
  msg.textContent = "";

  const payload = {
    chamado: chamado.value.trim(),
    linha: normalizarMsisdn(msisdn.value),
    equipamento: equipamento.value,
    cenario: cenario.value,
    createdAt: Date.now(),
    createdBy: {
      username: session.username,
      nome: session.nome
    },
    deleted: false
  };

  if (!payload.chamado || payload.linha.length !== 11) {
    msg.textContent = "Dados inválidos";
    return;
  }

  await db.ref("app/chamados").push(payload);

  chamado.value = "";
  msisdn.value = "";
  equipamento.value = "";
  cenario.value = "";

  carregarChamados();
};

// ===== Listagem =====
async function carregarChamados() {
  listaChamados.innerHTML = "";

  const snap = await db.ref("app/chamados").limitToLast(100).once("value");
  const dados = snap.val();
  if (!dados) return;

  Object.values(dados)
    .filter(c => !c.deleted)
    .sort((a,b) => b.createdAt - a.createdAt)
    .forEach(c => {
      listaChamados.innerHTML += `
        <tr>
          <td>${new Date(c.createdAt).toLocaleString()}</td>
          <td>${c.createdBy?.nome || "-"}</td>
          <td>${c.chamado}</td>
          <td>${c.linha}</td>
          <td>${c.equipamento || "-"}</td>
          <td>${c.cenario || "-"}</td>
        </tr>`;
    });
}

// ===== Boot =====
carregarListas();
carregarChamados();

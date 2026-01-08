// SysSPS – Chamados
// Versão: v2.1.5
// JS separado do HTML (layout original mantido)

const session = requireAuth();
const dbRef = firebase.database();

// ====== CAMPOS ======
const form = document.getElementById("formChamado");
const inAnalista = document.getElementById("analista");
const inChamado = document.getElementById("chamado");
const inMsisdn = document.getElementById("msisdn");
const selEquip = document.getElementById("equipamentoSelect");
const selCen = document.getElementById("cenarioSelect");
const tbody = document.querySelector("#tblChamados tbody");

// ====== USUÁRIO VISÍVEL ======
inAnalista.value = session.nome || session.username;

// ====== MSISDN (máscara + normalização) ======
inMsisdn.addEventListener("input", () => {
  let v = inMsisdn.value.replace(/\D/g, "").slice(0, 11);
  if (v.length > 2) v = v.replace(/^(\d{2})(\d)/, "$1 $2");
  if (v.length > 8) v = v.replace(/^(\d{2}) (\d{5})(\d)/, "$1 $2-$3");
  inMsisdn.value = v;
});

const normalizarMsisdn = v => v.replace(/\D/g, "").slice(0, 11);

// ====== CARREGAR LISTAS ======
async function carregarListas() {
  const eqSnap = await dbRef.ref("app/listas/equipamentos").once("value");
  const cenSnap = await dbRef.ref("app/listas/cenarios").once("value");

  selEquip.innerHTML = `<option value="">(selecione)</option>`;
  selCen.innerHTML = `<option value="">(selecione)</option>`;

  (eqSnap.val() || []).forEach(e =>
    selEquip.innerHTML += `<option value="${e}">${e}</option>`
  );

  (cenSnap.val() || []).forEach(c =>
    selCen.innerHTML += `<option value="${c}">${c}</option>`
  );
}

// ====== SALVAR ======
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    chamado: inChamado.value.trim(),
    linha: normalizarMsisdn(inMsisdn.value),
    equipamento: selEquip.value,
    cenario: selCen.value,
    observacoes: document.getElementById("observacoes").value.trim(),

    // AUTOMÁTICOS
    createdAt: Date.now(),
    createdBy: {
      username: session.username,
      nome: session.nome
    },
    deleted: false
  };

  if (!payload.chamado || payload.linha.length !== 11) {
    alert("Preencha corretamente Chamado e MSISDN");
    return;
  }

  await dbRef.ref("app/chamados").push(payload);
  form.reset();
  inAnalista.value = session.nome || session.username;
  carregarChamados();
});

// ====== LISTAR CHAMADOS ======
async function carregarChamados() {
  tbody.innerHTML = "";

  const snap = await dbRef.ref("app/chamados").limitToLast(100).once("value");
  const dados = snap.val();
  if (!dados) return;

  Object.values(dados)
    .filter(c => !c.deleted)
    .sort((a, b) => b.createdAt - a.createdAt)
    .forEach(c => {
      tbody.innerHTML += `
        <tr>
          <td>${new Date(c.createdAt).toLocaleString()}</td>
          <td>${c.analista}</td>
          <td>${c.chamado}</td>
          <td>${c.linha}</td>
          <td>${c.equipamento || "-"}</td>
          <td>${c.cenario || "-"}</td>
        </tr>
      `;
    });
}

// ====== LOGOUT ======
document.getElementById("logoutBtn").onclick = () => logout();

// ====== BOOT ======
carregarListas();
carregarChamados();

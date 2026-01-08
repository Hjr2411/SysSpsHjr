// SysSpsHjr – Chamados
// Versão: v2.1.7
// Correção FINAL: analista sempre salvo corretamente

const session = requireAuth();
const dbRef = firebase.database();

/* ===== CAMPOS ===== */
const form = document.getElementById("formChamado");
const inAnalista = document.getElementById("analista");
const inChamado = document.getElementById("chamado");
const inMsisdn = document.getElementById("msisdn");
const selEquip = document.getElementById("equipamentoSelect");
const selCen = document.getElementById("cenarioSelect");
const inObs = document.getElementById("observacoes");
const tbody = document.querySelector("#tblChamados tbody");

/* ===== ANALISTA VISÍVEL =====
   Igual ao ORIGINAL:
   o input é a fonte da verdade
*/
inAnalista.value = session.nome || session.username || "";

/* ===== MSISDN (máscara + normalização) ===== */
inMsisdn.addEventListener("input", () => {
  let v = inMsisdn.value.replace(/\D/g, "").slice(0, 11);
  if (v.length > 2) v = v.replace(/^(\d{2})(\d)/, "$1 $2");
  if (v.length > 8) v = v.replace(/^(\d{2}) (\d{5})(\d)/, "$1 $2-$3");
  inMsisdn.value = v;
});

function normalizarMsisdn(v) {
  return v.replace(/\D/g, "").slice(0, 11);
}

/* ===== CARREGAR LISTAS ===== */
async function carregarListas() {
  const eqSnap = await dbRef.ref("app/listas/equipamentos").once("value");
  const cenSnap = await dbRef.ref("app/listas/cenarios").once("value");

  selEquip.innerHTML = `<option value="">(selecione)</option>`;
  selCen.innerHTML = `<option value="">(selecione)</option>`;

  (eqSnap.val() || []).forEach(e => {
    selEquip.innerHTML += `<option value="${e}">${e}</option>`;
  });

  (cenSnap.val() || []).forEach(c => {
    selCen.innerHTML += `<option value="${c}">${c}</option>`;
  });
}

/* ===== SALVAR CHAMADO ===== */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const analista = inAnalista.value.trim(); // 🔥 FONTE CORRETA
  const chamado = inChamado.value.trim();
  const linha = normalizarMsisdn(inMsisdn.value);

  if (!analista || !chamado || linha.length !== 11) {
    alert("Preencha Analista, Chamado e MSISDN corretamente");
    return;
  }

  const payload = {
    analista,              // 🔥 NUNCA undefined
    chamado,
    linha,
    equipamento: selEquip.value,
    cenario: selCen.value,
    observacoes: inObs.value.trim(),

    createdAt: Date.now(),
    deleted: false
  };

  try {
    await dbRef.ref("app/chamados").push(payload);
    form.reset();
    inAnalista.value = analista; // mantém após reset
    carregarChamados();
  } catch (err) {
    console.error(err);
    alert("Erro ao salvar chamado");
  }
});

/* ===== LISTAR CHAMADOS ===== */
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

/* ===== LOGOUT ===== */
document.getElementById("logoutBtn").onclick = () => logout();

/* ===== BOOT ===== */
carregarListas();
carregarChamados();

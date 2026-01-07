// chamados.js
// SysSPS – Insert Chamados
// Versão: v2.1.0

const session = requireAuth();

const msg = document.getElementById("msg");

document.getElementById("btnSalvar").onclick = async () => {
  msg.textContent = "Salvando...";

  const titulo = document.getElementById("titulo").value.trim();
  const linha = document.getElementById("linha").value.trim();
  const equipamento = document.getElementById("equipamento").value.trim();
  const cenario = document.getElementById("cenario").value.trim();
  const descricao = document.getElementById("descricao").value.trim();

  if (!titulo || !linha) {
    msg.textContent = "Chamado e MSISDN são obrigatórios";
    return;
  }

  const novoChamado = {
    titulo,
    linha,
    equipamento,
    cenario,
    descricao,
    createdAt: Date.now(),
    createdBy: {
      username: session.username,
      nome: session.nome
    },
    deleted: false
  };

  try {
    await db.ref("app/chamados").push(novoChamado);

    msg.textContent = "✅ Chamado registrado";
    document.querySelectorAll("input, textarea").forEach(el => el.value = "");
  } catch (e) {
    console.error(e);
    msg.textContent = "❌ Erro ao salvar";
  }
};

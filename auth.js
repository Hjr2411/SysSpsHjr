// auth.js
// SysSPS – Autenticação
// Versão: v2.0.0

const SESSION_KEY = "sps_session";

/* ===== Sessão ===== */
function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

function setSession(data) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

/* ===== Login ===== */
async function login(username, password) {
  const snap = await db.ref(`app/users/${username}`).once("value");
  if (!snap.exists()) throw new Error("Usuário não encontrado");

  const user = snap.val();

  if (!user.ativo) throw new Error("Usuário inativo");
  if (user.password !== password) throw new Error("Senha inválida");

  const session = {
    username,
    nome: user.nome,
    admin: !!user.admin,
    loginAt: Date.now()
  };

  setSession(session);
  return session;
}

/* ===== Proteção de páginas ===== */
function requireAuth() {
  const session = getSession();
  if (!session) {
    window.location.href = "./index.html";
    throw new Error("Não autenticado");
  }
  return session;
}

/* ===== Logout ===== */
function logout() {
  clearSession();
  window.location.href = "./index.html";
}

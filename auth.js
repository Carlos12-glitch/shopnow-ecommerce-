const API_USERS = "/api/usuarios";

// ===== HELPERS =====
function showAlert(msg, type = "error") {
  const el = document.getElementById("authAlert");
  if (!el) return;
  el.className = `auth-alert show ${type}`;
  const icon = type === "success" ? "fa-circle-check" : "fa-circle-exclamation";
  el.innerHTML = `<i class="fa-solid ${icon}"></i> ${msg}`;
  setTimeout(() => el.classList.remove("show"), 5000);
}

function showSocialNotice() {
  showAlert("Los accesos con Google y Facebook estarán disponibles próximamente.", "error");
}

function setFieldError(inputId, errorId, hasError) {
  const input = document.getElementById(inputId);
  const err   = document.getElementById(errorId);
  if (input) input.classList.toggle("error", hasError);
  if (err)   err.classList.toggle("show", hasError);
}

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const icon  = btn.querySelector("i");
  if (input.type === "password") {
    input.type = "text";
    icon.className = "fa-solid fa-eye-slash";
  } else {
    input.type = "password";
    icon.className = "fa-solid fa-eye";
  }
}

function setLoading(btn, on) {
  const text = btn.querySelector(".btn-text");
  const icon = btn.querySelector("i:not(.spin)");
  btn.disabled = on;
  if (on) {
    if (icon) icon.style.display = "none";
    if (text) text.textContent = "Procesando...";
    if (!btn.querySelector(".spin")) {
      const s = document.createElement("span");
      s.className = "spin";
      btn.insertBefore(s, btn.firstChild);
    }
  } else {
    if (icon) icon.style.display = "";
    if (text) text.textContent = btn.id === "submitBtn" && document.getElementById("loginForm") ? "Iniciar Sesión" : "Crear Cuenta";
    const s = btn.querySelector(".spin");
    if (s) s.remove();
  }
}

// ===== PASSWORD STRENGTH =====
function checkStrength(pw) {
  const wrap  = document.getElementById("pwStrength");
  const fill  = document.getElementById("pwFill");
  const label = document.getElementById("pwLabel");
  if (!wrap) return;
  wrap.classList.toggle("show", pw.length > 0);
  let score = 0;
  if (pw.length >= 8)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { pct: "25%",  bg: "#e53935", text: "Muy débil",  color: "#e53935" },
    { pct: "50%",  bg: "#fb8c00", text: "Débil",      color: "#fb8c00" },
    { pct: "75%",  bg: "#f5b800", text: "Buena",      color: "#f5b800" },
    { pct: "100%", bg: "#43a047", text: "Muy fuerte", color: "#43a047" },
  ];
  const l = levels[Math.max(0, score - 1)];
  fill.style.width      = l.pct;
  fill.style.background = l.bg;
  label.textContent     = l.text;
  label.style.color     = l.color;
}

// ===== SESSION =====
function saveSession(user) {
  localStorage.setItem("shopnow_session", JSON.stringify(user));
}
function getSession() {
  try { return JSON.parse(localStorage.getItem("shopnow_session")); }
  catch { return null; }
}
function clearSession() {
  localStorage.removeItem("shopnow_session");
}

// ===== LOCAL USER STORE (fallback when server is offline) =====
function getLocalUsers() {
  try { return JSON.parse(localStorage.getItem("shopnow_users") || "[]"); }
  catch { return []; }
}
function saveLocalUser(user) {
  const users = getLocalUsers();
  users.push(user);
  localStorage.setItem("shopnow_users", JSON.stringify(users));
}

// ===== REGISTER =====
async function handleRegister(e) {
  e.preventDefault();
  let valid = true;

  const nombre   = document.getElementById("nombre")?.value.trim()  || "";
  const apellido = document.getElementById("apellido")?.value.trim() || "";
  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirm  = document.getElementById("confirmPassword")?.value || "";
  const terms    = document.getElementById("terms")?.checked;

  setFieldError("nombre",          "nombreError",   !nombre);
  setFieldError("apellido",        "apellidoError", !apellido);
  setFieldError("email",           "emailError",    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  setFieldError("password",        "passwordError", password.length < 8);
  setFieldError("confirmPassword", "confirmError",  password !== confirm);

  if (!nombre || !apellido)                              valid = false;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))        valid = false;
  if (password.length < 8)                               valid = false;
  if (password !== confirm)                              valid = false;
  if (!terms) {
    showAlert("Debes aceptar los Términos y Condiciones.", "error");
    valid = false;
  }
  if (!valid) return;

  const btn = document.getElementById("submitBtn");
  setLoading(btn, true);

  try {
    const res  = await fetch(`${API_USERS}/registro`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ nombre, apellido, correo: email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al registrar.");
    showAlert("¡Cuenta creada! Redirigiendo...", "success");
    setTimeout(() => { window.location.href = "login.html?registered=1"; }, 1500);
  } catch {
    // Fallback: store in localStorage
    const users = getLocalUsers();
    if (users.find(u => u.correo === email)) {
      showAlert("Ya existe una cuenta con ese correo.", "error");
      setLoading(btn, false);
      return;
    }
    saveLocalUser({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      nombre, apellido, correo: email, password,
    });
    showAlert("¡Cuenta creada! Redirigiendo...", "success");
    setTimeout(() => { window.location.href = "login.html?registered=1"; }, 1500);
  } finally {
    setLoading(btn, false);
  }
}

// ===== LOGIN =====
async function handleLogin(e) {
  e.preventDefault();
  let valid = true;

  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  setFieldError("email",    "emailError",    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  setFieldError("password", "passwordError", !password);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) valid = false;
  if (!password) valid = false;
  if (!valid) return;

  const btn = document.getElementById("submitBtn");
  setLoading(btn, true);

  try {
    const res  = await fetch(`${API_USERS}/login`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ correo: email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Credenciales incorrectas.");
    saveSession({ id: data.id, nombre: data.nombre, apellido: data.apellido, correo: data.correo });
    window.location.href = "index.html";
  } catch {
    // Fallback: check localStorage users
    const users = getLocalUsers();
    const user  = users.find(u => u.correo === email && u.password === password);
    if (user) {
      saveSession({ id: user.id, nombre: user.nombre, apellido: user.apellido, correo: user.correo });
      window.location.href = "index.html";
    } else {
      showAlert("Correo o contraseña incorrectos.", "error");
      setLoading(btn, false);
    }
  }
}

// ===== LOGOUT (also used from navbar in index.html) =====
function logout() {
  clearSession();
  window.location.href = "index.html";
}

// ===== ON LOAD =====
window.addEventListener("DOMContentLoaded", () => {
  // Show success banner if redirected from registration
  if (new URLSearchParams(window.location.search).get("registered") === "1") {
    showAlert("¡Cuenta creada exitosamente! Ya puedes iniciar sesión.", "success");
  }

  // Already logged in → skip these pages
  const session = getSession();
  const path = window.location.pathname;
  if (session && (path.includes("login") || path.includes("register"))) {
    window.location.href = "index.html";
  }
});

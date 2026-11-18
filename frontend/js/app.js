const API_URL = window.API_URL || 'http://localhost:5000/api';

function getAuth() {
  return JSON.parse(localStorage.getItem('nyaysetu_auth') || 'null');
}

function authHeaders() {
  const auth = getAuth();
  return auth?.token ? { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function renderNavigation() {
  const auth = getAuth();
  const nav = document.querySelector('[data-nav]');
  if (!nav) return;
  nav.innerHTML = `
    <a href="index.html">Home</a>
    <a href="lawyers.html">Find Lawyers</a>
    <a href="news.html">Legal News</a>
    <a href="ai-assistant.html">AI Assistant</a>
    ${auth ? `<a href="chat.html">Chat</a><button class="nav-button" onclick="logout()">Logout</button>` : '<a class="nav-button" href="login.html">Login</a>'}
  `;
}

function logout() {
  localStorage.removeItem('nyaysetu_auth');
  window.location.href = 'index.html';
}

function requireRole(role) {
  const auth = getAuth();
  if (!auth || (role && auth.user.role !== role)) {
    window.location.href = 'login.html';
  }
}

document.addEventListener('DOMContentLoaded', renderNavigation);

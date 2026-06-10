
const API_URL = 'http://localhost:3001/api';


const API = {
  
  getToken() { return sessionStorage.getItem('pv_token'); },
  setToken(t) { t ? sessionStorage.setItem('pv_token', t) : sessionStorage.removeItem('pv_token'); },

  
  headers(extra = {}) {
    const h = { 'Content-Type': 'application/json', ...extra };
    const token = API.getToken();
    if (token) h['Authorization'] = 'Bearer ' + token;
    return h;
  },

  
  async request(path, options = {}) {
    const res = await fetch(API_URL + path, {
      headers: API.headers(),
      ...options,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
    return data;
  },

  
  async login(email, password) {
    const data = await API.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    API.setToken(data.token);
    DB.setCurrentUser(data.user);
    return data;
  },

  async register(payload) {
    const data = await API.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    API.setToken(data.token);
    DB.setCurrentUser(data.user);
    return data;
  },

  async getMe() {
    return API.request('/auth/me');
  },

  
  async getPins({ page = 1, limit = 20, category, search } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (category && category !== 'Todos') params.set('category', category);
    if (search) params.set('search', search);
    return API.request('/pins?' + params.toString());
  },

  async getPin(id) {
    return API.request('/pins/' + id);
  },

  async createPin(payload) {
    return API.request('/pins', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async likePin(id) {
    return API.request('/pins/' + id + '/like', { method: 'POST' });
  },

  async savePin(id) {
    return API.request('/pins/' + id + '/save', { method: 'POST' });
  },

  
  async getComments(pinId) {
    return API.request('/pins/' + pinId + '/comments');
  },

  async postComment(pinId, text) {
    return API.request('/pins/' + pinId + '/comments', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  
  async getUser(username) {
    return API.request('/users/' + username);
  },

  async getUserPins(username) {
    return API.request('/users/' + username + '/pins');
  },

  async getUserSaved(username) {
    return API.request('/users/' + username + '/saved');
  },

  async updateProfile(payload) {
    return API.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};


const DB = {
  getCurrentUser() {
    return JSON.parse(sessionStorage.getItem('pv_session') || 'null');
  },
  setCurrentUser(u) {
    u
      ? sessionStorage.setItem('pv_session', JSON.stringify(u))
      : sessionStorage.removeItem('pv_session');
  },
  logout() {
    sessionStorage.removeItem('pv_session');
    sessionStorage.removeItem('pv_token');
  },
};


const Utils = {
  formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' });
  },
  timeAgo(dateStr) {
    const d = new Date(dateStr);
    const diff = (Date.now() - d) / 1000;
    if (diff < 60) return 'justo ahora';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `hace ${Math.floor(diff / 86400)} d`;
    return Utils.formatDate(dateStr);
  },
  formatNum(n) {
    if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k';
    return String(n);
  },
  getInitials(name) {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  },
  avatarGradient(seed) {
    const gradients = [
      'linear-gradient(135deg,#e8445a,#a855f7)',
      'linear-gradient(135deg,#3b82f6,#06b6d4)',
      'linear-gradient(135deg,#f59e0b,#ef4444)',
      'linear-gradient(135deg,#10b981,#3b82f6)',
      'linear-gradient(135deg,#8b5cf6,#ec4899)',
      'linear-gradient(135deg,#f97316,#eab308)',
    ];
    const idx = seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % gradients.length;
    return gradients[idx];
  },
  showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container') ||
      (() => { const c = document.createElement('div'); c.id = 'toast-container'; c.className = 'toast-container'; document.body.appendChild(c); return c; })();
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">${type === 'success' ? '<polyline points="20 6 9 17 4 12"></polyline>' : '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>'}</svg>${msg}`;
    container.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  },
};


function renderNavbar(activePage = '') {
  const user = DB.getCurrentUser();
  const nav = document.getElementById('navbar');
  if (!nav) return;

  nav.innerHTML = `
    <a class="nav-logo" href="index.html">
      <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="28" height="28" rx="8" fill="#e8445a"/>
        <path d="M14 6 C14 6, 8 6, 8 12 C8 17, 14 22, 14 22 C14 22, 20 17, 20 12 C20 6, 14 6" fill="white" opacity="0.9"/>
        <circle cx="14" cy="12" r="3" fill="#e8445a"/>
      </svg>
      PinVault
    </a>
    <div class="nav-search">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      <input type="text" placeholder="Buscar ideas, personas, temas…" id="nav-search-input">
    </div>
    <div class="nav-actions">
      ${user ? `
        <a href="index.html#upload" class="btn btn-primary" id="upload-btn" style="padding:7px 14px;font-size:13px">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Crear
        </a>
        <a href="usuario.html" class="avatar" style="background:${Utils.avatarGradient(user.displayName)};text-decoration:none">${Utils.getInitials(user.displayName)}</a>
      ` : `
        <a href="login.html" class="btn btn-ghost">Iniciar sesión</a>
        <a href="register.html" class="btn btn-primary">Registrarse</a>
      `}
    </div>
  `;

  const searchInput = document.getElementById('nav-search-input');
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.value.trim()) {
        window.location.href = `index.html?q=${encodeURIComponent(e.target.value.trim())}`;
      }
    });
  }
}


function renderPinCard(pin) {
  const user = DB.getCurrentUser();
  const saved = pin.isSaved || false;
  
  const pinId = pin.id || pin._id;
  return `
    <a class="pin-card" href="detalle.html?id=${pinId}">
      <div class="pin-img-wrap">
        <img src="${pin.imageUrl}" alt="${pin.title}" loading="lazy">
        <div class="pin-overlay">
          <button class="pin-save-btn" onclick="handleSave(event,'${pinId}')" style="${saved ? 'opacity:1;background:#333' : ''}">
            ${saved ? '✓ Guardado' : 'Guardar'}
          </button>
        </div>
      </div>
      <div class="pin-info">
        <p class="pin-title">${pin.title}</p>
        <div class="pin-author">
          <div class="avatar pin-author-avatar" style="background:${Utils.avatarGradient(pin.displayName)}">${Utils.getInitials(pin.displayName)}</div>
          <span class="pin-author-name">@${pin.username}</span>
        </div>
        <div class="pin-stats">
          <span class="pin-stat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            ${Utils.formatNum(pin.likes)}
          </span>
          <span class="pin-stat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
            ${Utils.formatNum(pin.saves)}
          </span>
        </div>
      </div>
    </a>
  `;
}

async function handleSave(e, pinId) {
  e.preventDefault();
  e.stopPropagation();
  const user = DB.getCurrentUser();
  if (!user) { window.location.href = 'login.html'; return; }
  try {
    const { saved } = await API.savePin(pinId);
    const btn = e.currentTarget;
    btn.textContent = saved ? '✓ Guardado' : 'Guardar';
    btn.style.background = saved ? '#333' : '';
    Utils.showToast(saved ? 'Pin guardado' : 'Pin eliminado de guardados');
  } catch (err) {
    Utils.showToast(err.message, 'error');
  }
}

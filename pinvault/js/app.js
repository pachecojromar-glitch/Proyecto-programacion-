// ─── UTILS ───────────────────────────────────────────────
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
  }
};

// ─── MOCK DB (localStorage) ───────────────────────────────
const DB = {
  getUsers() { return JSON.parse(localStorage.getItem('pv_users') || '[]'); },
  setUsers(u) { localStorage.setItem('pv_users', JSON.stringify(u)); },
  getPins() { return JSON.parse(localStorage.getItem('pv_pins') || JSON.stringify(SEED_PINS)); },
  setPins(p) { localStorage.setItem('pv_pins', JSON.stringify(p)); },
  getComments() { return JSON.parse(localStorage.getItem('pv_comments') || JSON.stringify(SEED_COMMENTS)); },
  setComments(c) { localStorage.setItem('pv_comments', JSON.stringify(c)); },
  getCurrentUser() { return JSON.parse(sessionStorage.getItem('pv_session') || 'null'); },
  setCurrentUser(u) { u ? sessionStorage.setItem('pv_session', JSON.stringify(u)) : sessionStorage.removeItem('pv_session'); },
  getSaves() { return JSON.parse(localStorage.getItem('pv_saves') || '{}'); },
  toggleSave(userId, pinId) {
    const s = DB.getSaves();
    if (!s[userId]) s[userId] = [];
    const i = s[userId].indexOf(pinId);
    if (i === -1) s[userId].push(pinId); else s[userId].splice(i, 1);
    localStorage.setItem('pv_saves', JSON.stringify(s));
    return i === -1;
  },
  isSaved(userId, pinId) {
    const s = DB.getSaves();
    return (s[userId] || []).includes(pinId);
  },
  addPin(pin) {
    const pins = DB.getPins();
    pins.unshift(pin);
    DB.setPins(pins);
  },
  addComment(comment) {
    const comments = DB.getComments();
    comments.push(comment);
    DB.setComments(comments);
    return comment;
  },
  getCommentsForPin(pinId) {
    return DB.getComments().filter(c => c.pinId === pinId);
  },
  register(user) {
    const users = DB.getUsers();
    if (users.find(u => u.email === user.email)) return { error: 'Este correo ya está en uso.' };
    if (users.find(u => u.username === user.username)) return { error: 'Ese nombre de usuario ya existe.' };
    user.id = 'u_' + Date.now();
    user.createdAt = new Date().toISOString();
    user.bio = '';
    user.followers = 0;
    user.following = 0;
    users.push(user);
    DB.setUsers(users);
    return { user };
  },
  login(email, password) {
    const user = DB.getUsers().find(u => u.email === email && u.password === password);
    if (!user) return { error: 'Correo o contraseña incorrectos.' };
    return { user };
  }
};

// ─── SEED DATA ─────────────────────────────────────────────
const SEED_PINS = [
  { id: 'p001', userId: 'demo', username: 'alexmoreno', displayName: 'Alex Moreno', title: 'Arquitectura minimalista en Japón', description: 'Diseño interior de una residencia en Kyoto que fusiona el wabi-sabi con el modernismo contemporáneo. Uso de madera natural y luz difusa.', category: 'Arquitectura', tags: ['minimalismo','japón','diseño'], imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80', likes: 2341, saves: 892, createdAt: '2025-03-10T10:00:00Z' },
  { id: 'p002', userId: 'demo2', username: 'sofiavalencia', displayName: 'Sofía Valencia', title: 'Paleta otoñal para branding', description: 'Exploración de colores cálidos para identidad de marca. Terracota, mostaza y verde salvia como protagonistas.', category: 'Diseño', tags: ['branding','color','otoño'], imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', likes: 1876, saves: 654, createdAt: '2025-03-08T14:30:00Z' },
  { id: 'p003', userId: 'demo', username: 'alexmoreno', displayName: 'Alex Moreno', title: 'Receta: pasta al limón con alcaparras', description: 'Una receta sencilla pero elegante para el almuerzo del domingo. El secreto está en el aceite de oliva extra virgen.', category: 'Gastronomía', tags: ['pasta','receta','italiano'], imageUrl: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600&q=80', likes: 3201, saves: 1102, createdAt: '2025-03-06T09:15:00Z' },
  { id: 'p004', userId: 'demo3', username: 'carlosquito', displayName: 'Carlos Q.', title: 'Fotografía callejera — Quito antiguo', description: 'Recorrido fotográfico por el Centro Histórico de Quito al amanecer. Luz dorada sobre la piedra colonial.', category: 'Fotografía', tags: ['quito','calle','amanecer'], imageUrl: 'https://images.unsplash.com/photo-1558618047-3c4a13eb6e2e?w=600&q=80', likes: 4512, saves: 2001, createdAt: '2025-03-05T07:45:00Z' },
  { id: 'p005', userId: 'demo2', username: 'sofiavalencia', displayName: 'Sofía Valencia', title: 'Setup de trabajo remoto minimalista', description: 'Un escritorio limpio potencia la concentración. Monitor ultrawide, teclado mecánico silencioso y planta de escritorio.', category: 'Tecnología', tags: ['setup','productividad','remote'], imageUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80', likes: 5832, saves: 3410, createdAt: '2025-03-04T16:00:00Z' },
  { id: 'p006', userId: 'demo4', username: 'lunaarts', displayName: 'Luna Arts', title: 'Ilustración — formas orgánicas en tinta', description: 'Serie de ilustraciones usando tinta y acuarela sobre papel de algodón. Formas que evocan el movimiento del agua.', category: 'Arte', tags: ['ilustración','tinta','acuarela'], imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80', likes: 6741, saves: 4200, createdAt: '2025-03-03T11:20:00Z' },
  { id: 'p007', userId: 'demo3', username: 'carlosquito', displayName: 'Carlos Q.', title: 'Senderismo en el Cotopaxi', description: 'Ruta de acceso al refugio del Cotopaxi a 4800 msnm. Equipo esencial y guía de preparación física.', category: 'Aventura', tags: ['senderismo','ecuador','volcán'], imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80', likes: 2980, saves: 1320, createdAt: '2025-03-02T08:00:00Z' },
  { id: 'p008', userId: 'demo4', username: 'lunaarts', displayName: 'Luna Arts', title: 'Moda sostenible — lino natural', description: 'Looks para el día a día usando telas naturales y tintes vegetales. Moda que cuida el planeta sin sacrificar estilo.', category: 'Moda', tags: ['sostenible','lino','moda'], imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80', likes: 3887, saves: 1750, createdAt: '2025-03-01T15:30:00Z' },
  { id: 'p009', userId: 'demo', username: 'alexmoreno', displayName: 'Alex Moreno', title: 'Dashboard UI — dark mode', description: 'Exploración de interfaz analítica con modo oscuro. Jerarquía clara, gráficos limpios y microinteracciones sutiles.', category: 'Diseño', tags: ['ui','dashboard','darkmode'], imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80', likes: 7123, saves: 5001, createdAt: '2025-02-28T10:00:00Z' },
  { id: 'p010', userId: 'demo2', username: 'sofiavalencia', displayName: 'Sofía Valencia', title: 'Jardín vertical interior', description: 'Cómo crear un muro verde en espacios pequeños. Plantas suculentas y helechos en estructura modular de madera.', category: 'Hogar', tags: ['plantas','hogar','diy'], imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80', likes: 4321, saves: 2100, createdAt: '2025-02-27T13:00:00Z' },
  { id: 'p011', userId: 'demo3', username: 'carlosquito', displayName: 'Carlos Q.', title: 'Café specialty en Cuenca', description: 'Los mejores cafés de especialidad en Cuenca, Ecuador. Proceso, origen y notas de cata de granos locales.', category: 'Gastronomía', tags: ['café','cuenca','specialty'], imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80', likes: 2156, saves: 876, createdAt: '2025-02-26T09:00:00Z' },
  { id: 'p012', userId: 'demo4', username: 'lunaarts', displayName: 'Luna Arts', title: 'Tipografía editorial — portadas', description: 'Composiciones tipográficas para portadas de revista. Contraste entre serif clásico y sans-serif geométrico.', category: 'Diseño', tags: ['tipografía','editorial','diseño'], imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80', likes: 5432, saves: 3200, createdAt: '2025-02-25T11:00:00Z' },
];

const SEED_COMMENTS = [
  { id: 'c001', pinId: 'p001', userId: 'demo2', username: 'sofiavalencia', displayName: 'Sofía Valencia', text: '¡Impresionante! La forma en que la luz entra por las celosías crea esa atmósfera tan única del wabi-sabi.', createdAt: '2025-03-10T12:00:00Z', likes: 24 },
  { id: 'c002', pinId: 'p001', userId: 'demo3', username: 'carlosquito', displayName: 'Carlos Q.', text: 'Viví en Kyoto 6 meses y esto captura perfectamente la esencia del diseño residencial japonés. El minimalismo no es vacío, es control.', createdAt: '2025-03-11T08:30:00Z', likes: 18 },
  { id: 'c003', pinId: 'p001', userId: 'demo4', username: 'lunaarts', displayName: 'Luna Arts', text: '¿Sabes el nombre del arquitecto? Me gustaría ver más proyectos de este estilo.', createdAt: '2025-03-12T14:00:00Z', likes: 7 },
  { id: 'c004', pinId: 'p005', userId: 'demo', username: 'alexmoreno', displayName: 'Alex Moreno', text: '¿Qué monitor es ese? La relación de aspecto parece perfecta para desarrollo.', createdAt: '2025-03-04T18:00:00Z', likes: 31 },
  { id: 'c005', pinId: 'p005', userId: 'demo3', username: 'carlosquito', displayName: 'Carlos Q.', text: 'El cable management está impecable. ¿Usaste pasacables o simplemente organización?', createdAt: '2025-03-05T09:00:00Z', likes: 15 },
];

// ─── NAVBAR RENDERER ──────────────────────────────────────
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

// ─── PIN CARD RENDERER ────────────────────────────────────
function renderPinCard(pin) {
  const user = DB.getCurrentUser();
  const saved = user ? DB.isSaved(user.id, pin.id) : false;
  return `
    <a class="pin-card" href="detalle.html?id=${pin.id}">
      <div class="pin-img-wrap">
        <img src="${pin.imageUrl}" alt="${pin.title}" loading="lazy">
        <div class="pin-overlay">
          <button class="pin-save-btn" onclick="handleSave(event,'${pin.id}')" style="${saved ? 'opacity:1;background:#333' : ''}">
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

function handleSave(e, pinId) {
  e.preventDefault();
  e.stopPropagation();
  const user = DB.getCurrentUser();
  if (!user) { window.location.href = 'login.html'; return; }
  const saved = DB.toggleSave(user.id, pinId);
  const btn = e.currentTarget;
  btn.textContent = saved ? '✓ Guardado' : 'Guardar';
  btn.style.background = saved ? '#333' : '';
  Utils.showToast(saved ? 'Pin guardado' : 'Pin eliminado de guardados');
}
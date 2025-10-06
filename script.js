document.addEventListener('DOMContentLoaded', function () {
  const sheetUrl_leosystem =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vT2KKQ1I06_ekwmIsCuwiliRbqu44Y9pBpSO2HuGpxQLv485PlDZ4tyDUlDjJGu3UJeXJQdLuPNxdkA/pub?output=csv';

  const landingPage = document.getElementById('landing-page-leosystem');
  const membersPage = document.getElementById('members-page-leosystem');
  const enterBtn = document.getElementById('enter-btn-leosystem');
  const backBtn = document.getElementById('back-to-landing-btn-leosystem');
  const leaderGrid = document.querySelector('.leader-grid-leosystem');
  const memberGrid = document.querySelector('#members-section-leosystem .member-grid-leosystem');
  const searchInput = document.getElementById('searchInput-leosystem');
  const pageInfo = document.getElementById('pageInfo-leosystem');
  const pagination = document.querySelector('.pagination-controls-leosystem');
  const audioContainer = document.getElementById('audio-player-container-leosystem');
  const canvas = document.getElementById('canvas-bg-leosystem');
  const ctx = canvas.getContext('2d');

  let W, H;
  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const lines = Array.from({ length: 80 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    len: 300 + Math.random() * 400,
    speed: 0.8 + Math.random() * 1.5,
    angle: Math.random() * Math.PI * 2,
    alpha: 0.05 + Math.random() * 0.1,
  }));

  const particles = Array.from({ length: 100 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.5,
    a: Math.random() * Math.PI * 2,
  }));

  let scan = 0;
  function animateBG() {
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 0.6;
    for (const l of lines) {
      const x2 = l.x + Math.cos(l.angle) * l.len;
      const y2 = l.y + Math.sin(l.angle) * l.len;
      const grad = ctx.createLinearGradient(l.x, l.y, x2, y2);
      grad.addColorStop(0, `rgba(255,255,255,${l.alpha * 0.8})`);
      grad.addColorStop(1, `rgba(255,255,255,${l.alpha})`);
      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(l.x, l.y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      l.x += Math.cos(l.angle) * l.speed;
      l.y += Math.sin(l.angle) * l.speed;
      if (l.x < -l.len || l.x > W + l.len || l.y < -l.len || l.y > H + l.len) {
        l.x = Math.random() * W;
        l.y = Math.random() * H;
        l.angle = Math.random() * Math.PI * 2;
      }
    }

    for (const p of particles) {
      ctx.beginPath();
      const b = 0.3 + 0.7 * Math.abs(Math.sin(p.a));
      ctx.fillStyle = `rgba(255,255,255,${b * 0.08})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      p.a += 0.05;
    }

    const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 1.2);
    g.addColorStop(0, 'rgba(255,255,255,0.05)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    scan += 1;
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(0, scan % H, W, 1);

    requestAnimationFrame(animateBG);
  }
  animateBG();

  const glitchText = document.getElementById('glitch-text-leosystem');
  if (glitchText) {
    setInterval(() => {
      glitchText.style.opacity = Math.random() > 0.85 ? 0.4 : 1;
      glitchText.style.transform = `skew(${Math.random() * 2 - 1}deg) translate(${Math.random() * 2 - 1}px, ${Math.random() * 2 - 1}px)`;
      glitchText.style.textShadow = `
        ${Math.random() * 2}px 0 #fff,
        -${Math.random() * 2}px 0 #999
      `;
    }, 80);
  }

  function parseCSVLine(line) {
    const pattern = /(".*?"|[^",]+)(?=\s*,|\s*$)/g;
    const matches = [...line.matchAll(pattern)].map(m => m[0].replace(/^"|"$/g, '').trim());
    return matches;
  }

  let allMembers = [];
  let debounce;

  async function loadMembers() {
    try {
      const res = await fetch(sheetUrl_leosystem);
      const csv = await res.text();
      const rows = csv.trim().split(/\r?\n/);
      rows.shift();
      allMembers = rows.map(row => {
        const [name, facebook, role, pic] = parseCSVLine(row);
        return { name, facebook, role, pic };
      });
      renderPage();
    } catch {
      memberGrid.innerHTML = '<p>ไม่สามารถโหลดข้อมูลได้</p>';
    }
  }

  function cleanLink(url) {
    if (!url) return '#';
    let s = url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
    if (!s.includes('profile.php?id=')) s = s.replace(/(\.\d+|#|\/)$/g, '');
    if (s.length > 35) s = s.slice(0, 35) + '...';
    return s;
  }

  function createCard(m) {
    const short = cleanLink(m.facebook || '#');
    const img = `<img src="${m.pic || 'https://via.placeholder.com/150'}" alt="Profile" class="profile-pic-leosystem" loading="lazy" onerror="this.src='https://via.placeholder.com/150'">`;
    return `
      <div class="member-card-leosystem">
        ${img}
        <div class="member-info-leosystem">
          <h3>${m.name || 'Unknown'}</h3>
          <a href="${m.facebook}" target="_blank">${short}</a>
        </div>
      </div>`;
  }

  function renderPage() {
    const filter = searchInput.value.toLowerCase();
    const leaders = [], members = [];

    for (const m of allMembers) {
      if (m.name.toLowerCase().includes(filter)) {
        (m.role.toLowerCase() === 'leader' ? leaders : members).push(m);
      }
    }

    const fragLeader = document.createDocumentFragment();
    const fragMember = document.createDocumentFragment();

    leaders.forEach(m => {
      const div = document.createElement('div');
      div.innerHTML = createCard(m);
      fragLeader.appendChild(div.firstElementChild);
    });

    members.forEach(m => {
      const div = document.createElement('div');
      div.innerHTML = createCard(m);
      fragMember.appendChild(div.firstElementChild);
    });

    leaderGrid.innerHTML = '';
    memberGrid.innerHTML = '';
    leaderGrid.appendChild(fragLeader);
    memberGrid.appendChild(fragMember);

    pageInfo.textContent = `Leader: ${leaders.length} | Members: ${members.length}`;
    pagination.style.display = 'none';
  }

  searchInput.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => requestAnimationFrame(renderPage), 250);
  });

  const audio = document.getElementById('gang-music-leosystem');
  const vol = document.getElementById('volume-slider-leosystem');

  enterBtn.addEventListener('click', () => {
    landingPage.style.display = 'none';
    membersPage.style.display = 'block';
    audioContainer.style.display = 'flex';
    backBtn.style.display = 'flex';
    audio.volume = 0.1;
    audio.play().catch(() => {});
    loadMembers();
  });

  vol.addEventListener('input', e => (audio.volume = e.target.value));

  backBtn.addEventListener('click', () => {
    audio.pause();
    window.location.reload();
  });
});
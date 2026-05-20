/* =========================================
   UITS IT CLUB — script.js
   ========================================= */

const FORMSPREE_URL = 'https://formspree.io/f/xlgaoabv';

// ─── 1. THEME TOGGLE (Dark ↔ Light) ────────────────────────────────────────
const modeBtn   = document.getElementById('dark-mode-toggle');
const modeIcon  = modeBtn?.querySelector('.mode-icon');
const body      = document.body;

// Default = dark. Light = toggled state.
function applyTheme(theme) {
    if (theme === 'light') {
        body.classList.add('light-mode');
        if (modeIcon) modeIcon.textContent = '🌙';
    } else {
        body.classList.remove('light-mode');
        if (modeIcon) modeIcon.textContent = '☀️';
    }
}

const savedTheme = localStorage.getItem('uits-theme') || 'dark';
applyTheme(savedTheme);

modeBtn?.addEventListener('click', () => {
    const isLight = body.classList.contains('light-mode');
    const next    = isLight ? 'dark' : 'light';
    localStorage.setItem('uits-theme', next);
    applyTheme(next);
});


// ─── 2. MOBILE HAMBURGER MENU ───────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger?.addEventListener('click', () => {
    navLinks?.classList.toggle('open');
    const isOpen = navLinks?.classList.contains('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
});

// Close menu on nav link click
navLinks?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
    });
});


// ─── 3. NAVBAR SCROLL HIGHLIGHT ─────────────────────────────────────────────
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
        navbar?.classList.add('scrolled');
    } else {
        navbar?.classList.remove('scrolled');
    }
}, { passive: true });


// ─── 4. BACK-TO-TOP BUTTON ──────────────────────────────────────────────────
const topBtn = document.getElementById('topBtn');

window.addEventListener('scroll', () => {
    if (topBtn) {
        topBtn.style.display = window.scrollY > 400 ? 'flex' : 'none';
    }
}, { passive: true });

topBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});


// ─── 5. SCROLL REVEAL ANIMATIONS ────────────────────────────────────────────
function initReveal() {
    // Section-level reveals
    document.querySelectorAll('.section-label, .section-heading, .section-sub, .convenor-grid, .convenor-message, .contact-grid, .contact-info').forEach(el => {
        el.classList.add('reveal');
    });

    // Card stagger reveals
    const staggerSelectors = [
        '.team-grid .team-card',
        '.programs-grid .program-card',
        '.activities-grid .activity-card',
        '.mentors-grid .mentor-card',
    ];

    staggerSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach((el, i) => {
            el.style.transitionDelay = `${i * 80}ms`;
        });
    });
}

function onIntersect(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}

const observer = new IntersectionObserver(onIntersect, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
});

initReveal();
document.querySelectorAll('.reveal, .team-card, .program-card, .activity-card, .mentor-card').forEach(el => {
    observer.observe(el);
});


// ─── 6. ACTIVE NAV LINK HIGHLIGHTING ────────────────────────────────────────
const sections = document.querySelectorAll('section[id], main[id]');

const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            document.querySelectorAll('.nav-links a').forEach(a => {
                a.classList.remove('active');
                if (a.getAttribute('href') === `#${id}`) {
                    a.classList.add('active');
                }
            });
        }
    });
}, { threshold: 0.4 });

sections.forEach(sec => navObserver.observe(sec));


// ─── 7. CONTACT FORM (Formspree) ────────────────────────────────────────────
const form      = document.getElementById('it-club-form');
const submitBtn = document.getElementById('submit-btn');
const btnText   = document.getElementById('btn-text');
const btnIcon   = document.getElementById('btn-icon');

form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Loading state
    if (submitBtn) submitBtn.disabled = true;
    if (btnText)   btnText.textContent = 'Sending…';
    if (btnIcon)   btnIcon.textContent = '⏳';

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        // 1. Send to Formspree (Primary)
        const res = await fetch(form.action, {
            method:  'POST',
            body:    formData,
            headers: { 'Accept': 'application/json' },
        });

        // 2. Try to save to local backend (Secondary - Silent failure)
        try {
            await fetch(`${API_BASE_URL}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            console.log('Message saved to local database');
        } catch (localErr) {
            console.warn('Local database storage failed, but Formspree was used.');
        }

        if (res.ok) {
            showToast('✅ Message sent! We\'ll be in touch soon.', 'success');
            form.reset();
        } else {
            showToast('⚠️ Something went wrong. Please try again.', 'error');
        }
    } catch (err) {
        showToast('⚠️ Network error. Please try again.', 'error');
    } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (btnText)   btnText.textContent = 'Send Message';
        if (btnIcon)   btnIcon.textContent = '→';
    }
});


// ─── 8. TOAST NOTIFICATIONS ─────────────────────────────────────────────────
function showToast(message, type = 'success') {
    // Remove existing toast
    document.querySelectorAll('.toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    Object.assign(toast.style, {
        position:     'fixed',
        bottom:       '32px',
        left:         '50%',
        transform:    'translateX(-50%) translateY(20px)',
        background:   type === 'success' ? 'linear-gradient(135deg,#211951,#4d2db7)' : '#7f1d1d',
        color:        '#fff',
        padding:      '14px 28px',
        borderRadius: '12px',
        fontFamily:   '\'DM Sans\', sans-serif',
        fontSize:     '0.9rem',
        fontWeight:   '500',
        zIndex:       '9999',
        boxShadow:    '0 20px 50px rgba(0,0,0,0.4)',
        border:       '1px solid rgba(34,211,238,0.35)',
        transition:   'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        opacity:      '0',
        whiteSpace:   'nowrap',
    });

    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.style.opacity      = '1';
            toast.style.transform    = 'translateX(-50%) translateY(0)';
        });
    });

    // Animate out & remove
    setTimeout(() => {
        toast.style.opacity   = '0';
        toast.style.transform = 'translateX(-50%) translateY(10px)';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}
// ─── 9. BACKEND API INTEGRATION ───────────────────────────────────────────
const API_BASE_URL = '/api';

// Fetch and Render Events
async function fetchEvents() {
    try {
        const response = await fetch(`${API_BASE_URL}/events`);
        const events = await response.json();
        
        if (Array.isArray(events) && events.length > 0) {
            renderEvents(events);
        }
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

function renderEvents(events) {
    const programsGrid = document.querySelector('.programs-grid');
    if (!programsGrid) return;

    // Clear static placeholders to show database events
    programsGrid.innerHTML = '';
    
    events.forEach((event, i) => {
        const card = document.createElement('div');
        card.className = 'program-card';
        card.style.transitionDelay = `${i * 80}ms`;
        card.innerHTML = `
            <div class="program-img">
                <img src="${event.image || 'images/club.png'}" alt="${event.title}" onerror="this.src='images/club.png'">
                <div class="program-overlay"><span>${event.category || 'Event'}</span></div>
            </div>
            <div class="program-body">
                <h3>${event.title}</h3>
                <p style="font-size:0.8rem;color:var(--gold);margin-bottom:8px;font-family:'DM Sans',sans-serif;font-weight:500;">
                    📅 ${new Date(event.date).toLocaleDateString()} &nbsp;·&nbsp; 📍 ${event.location || 'Online'}
                </p>
                <p>${event.description}</p>
            </div>
        `;
        programsGrid.appendChild(card);
        if (typeof observer !== 'undefined') {
            observer.observe(card);
        }
    });
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    fetchEvents();
});

// Contact form handling is consolidated above in Section 7.

// ─── 10. AUTH MODAL LOGIC ──────────────────────────────────────────────────
const authTrigger = document.getElementById('auth-trigger');
const authModal   = document.getElementById('auth-modal');
const modalClose  = document.getElementById('modal-close');
const toggleBtns  = document.querySelectorAll('.toggle-btn');
const authForms   = document.querySelectorAll('.auth-form');

// Open Modal
authTrigger?.addEventListener('click', () => {
    authModal?.classList.add('open');
    document.body.style.overflow = 'hidden'; // Prevent scroll
});

// Close Modal
const closeModal = () => {
    authModal?.classList.remove('open');
    document.body.style.overflow = '';
};

modalClose?.addEventListener('click', closeModal);
authModal?.addEventListener('click', (e) => {
    if (e.target === authModal) closeModal();
});

// Toggle between Login and Register
toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        
        // Update buttons
        toggleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update forms
        authForms.forEach(form => {
            form.classList.remove('active');
            if (form.id === targetId) {
                form.classList.add('active');
            }
        });
    });
});

// Handle Auth Form Submissions
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok) {
            showToast('✅ Welcome back!', 'success');
            localStorage.setItem('uits-token', data.token);
            
            // Send login notification to Formspree
            fetch(FORMSPREE_URL, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: 'New Login Alert',
                    email: email,
                    action: 'User Logged In',
                    timestamp: new Date().toLocaleString()
                })
            }).catch(err => console.warn('Formspree notification failed', err));

            setTimeout(() => location.reload(), 1500);
        } else {
            showToast(`⚠️ ${data.error || 'Login failed'}`, 'error');
        }
    } catch (err) {
        showToast('⚠️ Server connection failed', 'error');
    }
});

registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const type = document.querySelector('input[name="reg-type"]:checked')?.value;

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role: 'General Member', type })
        });
        const data = await res.json();

        if (res.ok) {
            showToast('✅ Account created! Welcome to the club.', 'success');
            localStorage.setItem('uits-token', data.token);

            // Send registration notification to Formspree
            fetch(FORMSPREE_URL, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: 'New User Registration',
                    name: name,
                    email: email,
                    type: type,
                    action: 'New Account Created',
                    timestamp: new Date().toLocaleString()
                })
            }).catch(err => console.warn('Formspree notification failed', err));

            setTimeout(() => location.reload(), 1500);
        } else {
            showToast(`⚠️ ${data.error || 'Registration failed'}`, 'error');
        }
    } catch (err) {
        showToast('⚠️ Server connection failed', 'error');
    }
});

// ─── 11. CHECK AUTH STATE ON LOAD ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('uits-token');
    const authTriggerBtn = document.getElementById('auth-trigger');
    const navLinksContainer = document.getElementById('navLinks');

    if (token) {
        // Change Sign In to Sign Out
        if (authTriggerBtn) {
            authTriggerBtn.textContent = 'Sign Out';
            // Remove previous event listeners by cloning
            const newBtn = authTriggerBtn.cloneNode(true);
            authTriggerBtn.parentNode.replaceChild(newBtn, authTriggerBtn);
            
            newBtn.addEventListener('click', () => {
                localStorage.removeItem('uits-token');
                window.location.reload();
            });
        }

        // Check if Admin
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.role === 'Admin' && navLinksContainer) {
                const adminLink = document.createElement('a');
                adminLink.href = 'admin.html';
                adminLink.textContent = 'Admin Dashboard';
                adminLink.style.color = 'var(--gold)';
                adminLink.style.fontWeight = '700';
                navLinksContainer.appendChild(adminLink);
            }
        } catch (e) {
            console.error('Invalid token payload');
        }
    }

    // Fetch and render approved roadmaps if roadmap list exists
    const roadmapList = document.getElementById('roadmap-list');
    const categoryEl = document.getElementById('category');
    if (roadmapList && categoryEl) {
        loadRoadmaps(categoryEl.value, roadmapList);
    }
});

async function loadRoadmaps(category, listContainer) {
    try {
        const res = await fetch(`${API_BASE_URL}/roadmaps/${category}`);
        if (!res.ok) throw new Error('Failed to fetch roadmaps');
        const roadmaps = await res.json();
        
        roadmaps.forEach(r => {
            const card = document.createElement('div');
            card.className = 'activity-card';
            
            const escape = (str) => {
                if (!str) return '';
                return str.replace(/&/g, '&amp;')
                          .replace(/</g, '&lt;')
                          .replace(/>/g, '&gt;')
                          .replace(/"/g, '&quot;')
                          .replace(/'/g, '&#039;');
            };

            card.innerHTML = `
                <div class="activity-icon">🔗</div>
                <h3>${escape(r.title)}</h3>
                <p>${escape(r.description)}</p>
                <div class="activity-footer">
                    <a href="${r.link}" target="_blank" class="member-email" style="text-decoration: underline; margin-bottom: 5px; display: inline-block;">Open Roadmap ↗</a>
                    <small style="display: block; color: var(--text-muted); font-size: 0.75rem; font-family: 'DM Sans', sans-serif;">
                        Submitted by: ${escape(r.submittedBy ? r.submittedBy.name : 'Anonymous')}
                    </small>
                </div>
            `;
            listContainer.appendChild(card);
            if (typeof observer !== 'undefined') {
                observer.observe(card);
            }
        });
    } catch (err) {
        console.error('Error loading roadmaps:', err);
    }
}

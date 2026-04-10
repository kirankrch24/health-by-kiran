// =====================
// CONFIG
// =====================
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyCHWtntMcdfK-btEnTeT4adoAxZN9dEpYFesF2SbWn-4to03OiaXXF3D5sFhhC4hyrdg/exec';
const FOOD_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyRGeiqcoB53XCSYP-Gj8-DrmKwlUy9lojSBCevBnp-PgWk6IVMNHOz8dMYKVO1qlCMpQ/exec';

const QUOTES = [
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "We are what we repeatedly do. Excellence is not an act, but a habit.", author: "Aristotle" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
];

// =====================
// LOGIN
// =====================
function handleLogin() {
  const user = document.getElementById('username')?.value.trim();
  const pass = document.getElementById('password')?.value.trim();
  if (user === 'admin' && pass === '1234') {
    sessionStorage.setItem('loggedIn', 'true');
    window.location.href = 'dashboard.html';
  } else {
    alert('Invalid Credentials. Please try again.');
  }
}

function logout() {
  sessionStorage.removeItem('loggedIn');
}

// =====================
// AUTH GUARD
// =====================
(function() {
  const protect = ['dashboard.html', '75hard.html', 'food.html'];
  const page = window.location.pathname.split('/').pop();
  if (protect.includes(page) && !sessionStorage.getItem('loggedIn')) {
    window.location.href = 'index.html';
  }
})();

// =====================
// NAV DROPDOWN
// =====================
function toggleNav() {
  document.getElementById('navMenu')?.classList.toggle('open');
}
document.addEventListener('click', function(e) {
  const menu = document.getElementById('navMenu');
  const toggle = document.querySelector('.nav-toggle');
  if (menu && toggle && !menu.contains(e.target) && !toggle.contains(e.target)) {
    menu.classList.remove('open');
  }
});

// =====================
// DATE & DASHBOARD
// =====================
function formatDate(d) {
  return d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function getTodayISO() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

// Dashboard init
const dashDate = document.getElementById('dashDate');
if (dashDate) dashDate.textContent = formatDate(new Date());

const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
if (quoteText) {
  const q = QUOTES[new Date().getDate() % QUOTES.length];
  quoteText.textContent = `"${q.text}"`;
  quoteAuthor.textContent = `— ${q.author}`;
}

// Streak from localStorage
const streakEl = document.getElementById('streakDays');
if (streakEl) {
  streakEl.textContent = localStorage.getItem('streak_days') || '0';
}

// 75Hard page init
const todayDateEl = document.getElementById('todayDate');
if (todayDateEl) todayDateEl.value = getTodayISO();

const dayBadge = document.getElementById('dayBadge');
if (dayBadge) {
  const challengeStartDate = '2026-04-11';
  localStorage.setItem('challenge_start', challengeStartDate); // Keep localStorage consistent
  const diff = Math.floor((new Date() - new Date(challengeStartDate)) / (1000 * 60 * 60 * 24)) + 1;
  dayBadge.textContent = `Day ${diff} of 75`;
}

// Food Log init
const foodDateEl = document.getElementById('foodDate');
if (foodDateEl) foodDateEl.value = getTodayISO();
const foodTimeEl = document.getElementById('foodTime');
if (foodTimeEl) {
  const now = new Date();
  foodTimeEl.value = now.toTimeString().substring(0, 5);
}

// =====================
// TASK TOGGLE
// =====================
function toggleTask(el, id) {
  el.classList.toggle('done');
  const cb = document.getElementById(id);
  if (cb) cb.checked = el.classList.contains('done');
  updateProgress();
}

function updateProgress() {
  const tasks = document.querySelectorAll('.task-item');
  const done = document.querySelectorAll('.task-item.done').length;
  const fill = document.getElementById('progressFill');
  const count = document.getElementById('doneCount');
  if (fill) fill.style.width = (done / tasks.length * 100) + '%';
  if (count) count.textContent = done;
}

// =====================
// SUBMIT TO GOOGLE SHEETS
// =====================
async function submitChallenge() {
  const btn = document.getElementById('submitBtn');
  const status = document.getElementById('submitStatus');

  const data = {
    date: document.getElementById('todayDate')?.value || getTodayISO(),
    nofap: document.getElementById('nofap')?.checked ? 'YES' : 'NO',
    meals: document.getElementById('meals')?.checked ? 'YES' : 'NO',
    exercise: document.getElementById('exercise')?.checked ? 'YES' : 'NO',
    study: document.getElementById('study')?.checked ? 'YES' : 'NO',
    reading: document.getElementById('reading')?.checked ? 'YES' : 'NO',
  };

  btn.textContent = 'Submitting...';
  btn.disabled = true;
  status.className = 'submit-status';

  // Save to localStorage backup
  localStorage.setItem('last_log_' + data.date, JSON.stringify(data));

  // Count streak
  const allKeys = Object.keys(localStorage).filter(k => k.startsWith('last_log_'));
  localStorage.setItem('streak_days', allKeys.length);

  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
    status.className = 'submit-status success';
    status.textContent = '✅ Saved locally! (Add your Google Apps Script URL to enable Sheets sync.)';
    btn.textContent = 'Submit Today\'s Log →';
    btn.disabled = false;
    return;
  }

  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    status.className = 'submit-status success';
    status.textContent = '✅ Today\'s log submitted to Google Sheets!';
  } catch (err) {
    status.className = 'submit-status error';
    status.textContent = '❌ Failed to submit. Saved locally as backup.';
  }

  btn.textContent = 'Submit Today\'s Log →';
  btn.disabled = false;
}

// =====================
// FOOD LOG
// =====================
function toggleFoodItems() {
  const count = parseInt(document.getElementById('noOfFoodItems')?.value || 1);
  for (let i = 1; i <= 5; i++) {
    const group = document.getElementById('foodItem' + i + 'Group');
    if (group) {
      group.style.display = i <= count ? 'flex' : 'none';
    }
  }
}

function togglePriceField() {
  const source = document.getElementById('foodSource')?.value;
  const priceGroup = document.getElementById('priceGroup');
  const shopGroup = document.getElementById('shopGroup');
  if (source === 'Grocery' || source === 'Takeaway' || source === 'Restaurant') {
    if (priceGroup) priceGroup.style.display = 'block';
    if (shopGroup) shopGroup.style.display = 'block';
  } else {
    if (priceGroup) priceGroup.style.display = 'none';
    if (shopGroup) shopGroup.style.display = 'none';
  }
}

async function submitFoodLog() {
  const btn = document.getElementById('submitFoodBtn');
  const status = document.getElementById('submitFoodStatus');

  const data = {
    logType: 'FOOD_LOG',
    date: document.getElementById('foodDate')?.value || getTodayISO(),
    time: document.getElementById('foodTime')?.value || '',
    mealType: document.getElementById('foodMealType')?.value || '',
    noOfItems: document.getElementById('noOfFoodItems')?.value || '1',
    foodItem1: document.getElementById('foodItem1')?.value || '',
    foodItem2: document.getElementById('foodItem2')?.value || '',
    foodItem3: document.getElementById('foodItem3')?.value || '',
    foodItem4: document.getElementById('foodItem4')?.value || '',
    foodItem5: document.getElementById('foodItem5')?.value || '',
    source: document.getElementById('foodSource')?.value || '',
    shop: document.getElementById('shopGroup')?.style.display !== 'none' ? document.getElementById('foodShop')?.value : '',
    price: document.getElementById('priceGroup')?.style.display !== 'none' ? document.getElementById('foodPrice')?.value : '',
    portionSize: document.getElementById('foodPortion')?.value || '',
    hunger: document.getElementById('foodHunger')?.value || '',
    required: document.getElementById('foodRequired')?.value || '',
    notes: document.getElementById('foodNotes')?.value || ''
  };

  btn.textContent = 'Submitting...';
  btn.disabled = true;
  status.className = 'submit-status';

  // Save to localStorage backup
  localStorage.setItem('food_log_' + Date.now(), JSON.stringify(data));

  if (!FOOD_APPS_SCRIPT_URL || FOOD_APPS_SCRIPT_URL === 'YOUR_FOOD_GOOGLE_APPS_SCRIPT_URL_HERE') {
    status.className = 'submit-status success';
    status.textContent = '✅ Saved locally! (Add your Google Apps Script URL to enable Sheets sync.)';
    btn.textContent = 'Submit Food Log →';
    btn.disabled = false;
    return;
  }

  try {
    const res = await fetch(FOOD_APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    status.className = 'submit-status success';
    status.textContent = '✅ Food log submitted to Google Sheets!';
  } catch (err) {
    status.className = 'submit-status error';
    status.textContent = '❌ Failed to submit. Saved locally as backup.';
  }

  btn.textContent = 'Submit Food Log →';
  btn.disabled = false;
}

// Enter key on login
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && document.getElementById('username')) handleLogin();
});
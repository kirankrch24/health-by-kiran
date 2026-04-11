// =====================
// CONFIG
// =====================
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz6AoW4MHLPG_K2gXiuPHyKlcsCvWEqzm5GkjlEor1D2FQIFKZT9G6N6HhvAGPPEEXXDA/exec';
const FOOD_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyTkaPFnoBZAVb4w1WU8eAROITLea2JyRyqiQhArcnRFnkp8i1wuBmcou5aXpPpLrrExQ/exec';
const BODY_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw9ZLRxo1N8ptv1dL91nlxrs78LP_FGq0bvHmVTEF0eTEDzu8suAHsIWep1rxM5QqEv/exec';
const QUOTES = [
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "We are what we repeatedly do. Excellence is not an act, but a habit.", author: "Aristotle" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
];

async function hashString(str) {
  const msgUint8 = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function handleLogin() {
  const user = document.getElementById('username')?.value.trim().toLowerCase();
  const pass = document.getElementById('password')?.value.trim();
  
  if (!user || !pass) {
    alert('Invalid Credentials. Please try again.');
    return;
  }
  
  const u = await hashString(user);
  const p = await hashString(pass);
  
  if (u === 'ccbd0a7fa962bc1bd152984bfdaecf339b88231a0d013e927b764b744a9261fc' && p === '66372dabaca91e253afdbf588fdc32a44eed338b219cc164f26ad821ec992e1b') {
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
(function () {
  const protect = ['dashboard.html', '75hard.html', 'food.html', 'body.html'];
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
document.addEventListener('click', function (e) {
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
// UI FEEDBACK & RESETS
// =====================
function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 500);
  }, 3500);
}

function resetChallengeForm() {
  document.querySelectorAll('.task-item').forEach(el => el.classList.remove('done'));
  document.querySelectorAll('.hidden-check').forEach(el => el.checked = false);
  updateProgress();
  const todayDateEl = document.getElementById('todayDate');
  if (todayDateEl) todayDateEl.value = getTodayISO();
  const noteEl = document.getElementById('challengeNote');
  if (noteEl) noteEl.value = '';
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
    note: document.getElementById('challengeNote')?.value || ''
  };

  btn.textContent = 'Submitting...';
  btn.disabled = true;
  if (status) status.className = 'submit-status'; // Hide old inline status

  // Save to localStorage backup
  localStorage.setItem('last_log_' + data.date, JSON.stringify(data));

  // Count streak
  const allKeys = Object.keys(localStorage).filter(k => k.startsWith('last_log_'));
  localStorage.setItem('streak_days', allKeys.length);

  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
    showToast('✅ Saved locally! (Add Google Sheets URL to sync)', 'success');
    btn.textContent = 'Submit Today\'s Log →';
    resetChallengeForm();
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
    showToast('🎉 Awesome! Today\'s log is saved to Sheets.', 'success');
    resetChallengeForm();
  } catch (err) {
    showToast('❌ Failed to submit. Saved locally as backup.', 'error');
  }

  btn.textContent = 'Submit Today\'s Log →';
  btn.disabled = false;
}

// =====================
// FOOD LOG
// =====================
function resetFoodForm() {
  ['foodItem1', 'foodItem2', 'foodItem3', 'foodItem4', 'foodItem5', 'foodShop', 'foodPrice', 'foodPortion', 'foodNotes'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const mealType = document.getElementById('foodMealType'); if (mealType) mealType.value = 'Breakfast';
  const noItems = document.getElementById('noOfFoodItems'); if (noItems) noItems.value = '1';
  toggleFoodItems();
  const source = document.getElementById('foodSource'); if (source) source.value = 'Homemade';
  togglePriceField();
  const hunger = document.getElementById('foodHunger'); if (hunger) hunger.value = 'Medium';
  const req = document.getElementById('foodRequired'); if (req) req.value = 'Yes';
  const foodDateEl = document.getElementById('foodDate'); if (foodDateEl) foodDateEl.value = getTodayISO();
  const foodTimeEl = document.getElementById('foodTime');
  if (foodTimeEl) {
    foodTimeEl.value = new Date().toTimeString().substring(0, 5);
  }
}

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
  if (status) status.className = 'submit-status';

  // Save to localStorage backup
  localStorage.setItem('food_log_' + Date.now(), JSON.stringify(data));

  if (!FOOD_APPS_SCRIPT_URL || FOOD_APPS_SCRIPT_URL === 'YOUR_FOOD_GOOGLE_APPS_SCRIPT_URL_HERE') {
    showToast('✅ Saved locally! (Add Google Sheets URL to sync)', 'success');
    btn.textContent = 'Submit Food Log →';
    resetFoodForm();
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
    showToast('🍽️ Delicious! Food log submitted successfully.', 'success');
    resetFoodForm();
  } catch (err) {
    showToast('❌ Failed to submit. Saved locally as backup.', 'error');
  }

  btn.textContent = 'Submit Food Log →';
  btn.disabled = false;
}

// Enter key on login
document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && document.getElementById('username')) handleLogin();
});

// =====================
// BODY METRICS LOG
// =====================
async function fetchLatestBodyMetrics() {
  if (!BODY_APPS_SCRIPT_URL) return;
  try {
    // If URL is present, perform a GET request
    const response = await fetch(BODY_APPS_SCRIPT_URL);
    if (!response.ok) return;

    const data = await response.json();
    if (data && data.weight && data.height) {
      // Overwrite local storage with the cloud version
      localStorage.setItem('current_weight', data.weight);
      localStorage.setItem('current_height', data.height);
      updateDashboardBodyMetrics(); // Update UI
    }
  } catch (err) {
    console.error("Error fetching body metrics:", err);
  }
}

function updateDashboardBodyMetrics() {
  const weightStr = localStorage.getItem('current_weight');
  const heightStr = localStorage.getItem('current_height');
  
  // BMI & New Micro Stats
  const bmiDisplay = document.getElementById('currentBMIDisplay');
  if (bmiDisplay && weightStr && heightStr) {
    const weight = parseFloat(weightStr);
    const heightM = parseFloat(heightStr) / 100;
    const bmi = (weight / (heightM * heightM)).toFixed(1);
    bmiDisplay.textContent = bmi;
    
    if (bmi < 18.5) bmiDisplay.style.color = "#ffb8b8";
    else if (bmi >= 18.5 && bmi <= 24.9) bmiDisplay.style.color = "#b5e8c4";
    else if (bmi >= 25 && bmi <= 29.9) bmiDisplay.style.color = "#ffd8b8";
    else bmiDisplay.style.color = "#ff8888";
  }

  // Weight Goal Progress Bar
  const dashWeightVal = document.getElementById('dashWeightVal');
  const weightProgressBar = document.getElementById('weightProgressBar');
  if (dashWeightVal && weightStr) {
    const currentW = parseFloat(weightStr);
    dashWeightVal.innerHTML = `${currentW} <span style="font-size: 0.8rem;">kg</span>`;
    
    // Calculate simple visually pleasing progress
    // Assume start weight was around 120kg, target is 75kg
    if (weightProgressBar) {
      const target = 75;
      const start = 120; // Hardcoded start for progress visual scaling
      
      let percentage = 0;
      if (currentW <= target) {
        percentage = 100;
      } else if (currentW >= start) {
        percentage = 5; // minimum visible bar
      } else {
        // e.g. 118 -> (120 - 118) / (120 - 75) = 2 / 45 = ~4.4%
        percentage = ((start - currentW) / (start - target)) * 100;
        if (percentage < 0) percentage = 0;
        if (percentage > 100) percentage = 100;
      }
      
      const distanceEl = document.getElementById('dashDistance');
      if (distanceEl) {
        let diff = (currentW - target).toFixed(1);
        if (diff < 0) diff = 0;
        distanceEl.innerText = `${diff} kg remaining`;
      }
      
      const ptEl = document.getElementById('dashPercentVal');
      if (ptEl) {
        ptEl.innerText = `${Math.round(percentage)}%`;
      }
      
      // Delay to allow CSS transition to happen smoothly on load
      setTimeout(() => {
        weightProgressBar.style.width = percentage + '%';
      }, 100);
    }
  }
}

if (document.getElementById('dashWeightVal') || document.getElementById('currentBMIDisplay')) {
  // First render purely from localStorage
  updateDashboardBodyMetrics();
  // Then kick off background fetch to ensure it is in sync with sheets
  fetchLatestBodyMetrics();
}

function resetBodyForm() {
  const dt = document.getElementById('bodyDate'); if (dt) dt.value = getTodayISO();
  const tm = document.getElementById('bodyTime'); if (tm) tm.value = new Date().toTimeString().substring(0, 5);
  const wt = document.getElementById('bodyWeight'); if (wt) wt.value = '';
}

async function submitBodyLog() {
  const btn = document.getElementById('submitBodyBtn');
  const wtEl = document.getElementById('bodyWeight');
  const htEl = document.getElementById('bodyHeight');

  if (!wtEl?.value || !htEl?.value) {
    showToast('❌ Please enter both weight and height.', 'error');
    return;
  }

  const data = {
    logType: 'BODY_METRICS',
    date: document.getElementById('bodyDate')?.value || getTodayISO(),
    time: document.getElementById('bodyTime')?.value || '',
    weight: wtEl.value,
    height: htEl.value
  };

  btn.textContent = 'Saving...';
  btn.disabled = true;

  localStorage.setItem('current_weight', data.weight);
  localStorage.setItem('current_height', data.height);
  localStorage.setItem('body_log_' + Date.now(), JSON.stringify(data));

  if (!BODY_APPS_SCRIPT_URL || BODY_APPS_SCRIPT_URL === '') {
    showToast('✅ Saved locally! (Add Google Sheets URL to sync)', 'success');
    setTimeout(() => {
      btn.textContent = 'Save Body Metrics →';
      btn.disabled = false;
      resetBodyForm();
    }, 1000);
    return;
  }

  try {
    await fetch(BODY_APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    showToast('⚖️ Body metrics successfully saved to Sheets.', 'success');
  } catch (err) {
    showToast('❌ Failed to push. Saved locally as backup.', 'error');
  }

  setTimeout(() => {
    btn.textContent = 'Save Body Metrics →';
    btn.disabled = false;
    resetBodyForm();
  }, 1000);
}

// Quick Action Toggle Checkmark Logic
function toggleActionStatus(e, element) {
  e.preventDefault();
  e.stopPropagation();
  element.classList.toggle('done');
}

// Body Form init
const bodyDateEl = document.getElementById('bodyDate');
if (bodyDateEl) bodyDateEl.value = getTodayISO();
const bodyTimeEl = document.getElementById('bodyTime');
if (bodyTimeEl) {
  bodyTimeEl.value = new Date().toTimeString().substring(0, 5);
}
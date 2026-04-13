// =====================
// CONFIG
// =====================
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyNo1DgoumxPVuqHL3IJt11g0T3yH09KjlQ5TVNZ0gfv6hGk39uyLl702z_MBu79CSc9Q/exec';
const FOOD_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwtGgER3Z0Ekw3YI-YEf8Xc0I7fYh7Fl-wogbXsIMGXBRLctn_JrWIIyJojm1PXvx2L7Q/exec';
const BODY_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw9ZLRxo1N8ptv1dL91nlxrs78LP_FGq0bvHmVTEF0eTEDzu8suAHsIWep1rxM5QqEv/exec';
const QUOTES = [
  { text: "Comfort is the enemy of progress. If it's not hurting, you aren't changing. JUST DO IT.", author: "The Grind ✔️" }
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

const todaysFoodList = document.getElementById('todaysFoodList');
if (todaysFoodList) {
  const dashFoodDate = document.getElementById('dashboardFoodDate');
  if (dashFoodDate) dashFoodDate.value = getTodayISO();
  loadTodaysFood();
}

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
if (dayBadge || document.getElementById('dash75HardCurrentDay')) {
  const challengeStartDate = '2026-04-13';
  localStorage.setItem('challenge_start', challengeStartDate); // Keep localStorage consistent
  const diff = Math.floor((new Date() - new Date(challengeStartDate)) / (1000 * 60 * 60 * 24)) + 1;

  if (dayBadge) {
    dayBadge.textContent = `Day ${diff} of 75`;
  }

  // Dashboard Visual Progress Bar
  const dashCurrentDay = document.getElementById('dash75HardCurrentDay');
  if (dashCurrentDay) {
    // clamp diff between 0 and 75 so the UI doesn't break
    const safeDiff = Math.max(0, Math.min(75, diff));
    const remaining = 75 - safeDiff;

    dashCurrentDay.textContent = `Day ${safeDiff}`;
    document.getElementById('dash75HardDaysLeft').textContent = `${remaining} DAYS REMAINING. NO EXCUSES.`;

    const percentage = (safeDiff / 75) * 100;
    document.getElementById('dash75HardPercentVal').textContent = `${Math.round(percentage)}%`;

    setTimeout(() => {
      document.getElementById('dash75HardProgressBar').style.width = percentage + '%';
    }, 100);
  }
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
// SELFIE COMPRESSION
// =====================
let currentSelfieBase64 = '';
const selfieInput = document.getElementById('selfieUpload');
if (selfieInput) {
  selfieInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    // We resize on the client side so Google Apps Script doesn't crash 
    const reader = new FileReader();
    reader.onload = function (event) {
      const imgTemplate = new Image();
      imgTemplate.onload = function () {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        let scaleSize = 1;
        if (imgTemplate.width > MAX_WIDTH) {
          scaleSize = MAX_WIDTH / imgTemplate.width;
        }
        canvas.width = imgTemplate.width * scaleSize;
        canvas.height = imgTemplate.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgTemplate, 0, 0, canvas.width, canvas.height);

        // compress as JPEG
        currentSelfieBase64 = canvas.toDataURL('image/jpeg', 0.6);

        const previewWrap = document.getElementById('selfiePreview');
        const imgEl = document.getElementById('selfieImg');
        if (previewWrap && imgEl) {
          previewWrap.style.display = 'block';
          imgEl.src = currentSelfieBase64;
        }
      };
      imgTemplate.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
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

  const selfieInput = document.getElementById('selfieUpload');
  if (selfieInput) selfieInput.value = '';
  const previewWrap = document.getElementById('selfiePreview');
  if (previewWrap) previewWrap.style.display = 'none';
  currentSelfieBase64 = '';
}

// =====================
// SUBMIT TO GOOGLE SHEETS
// =====================
async function submitChallenge() {
  const btn = document.getElementById('submitBtn');
  const status = document.getElementById('submitStatus');

  const submitDate = document.getElementById('todayDate')?.value || getTodayISO();
  const challengeStart = localStorage.getItem('challenge_start') || '2026-04-13';
  const diff = Math.floor((new Date(submitDate) - new Date(challengeStart)) / (1000 * 60 * 60 * 24)) + 1;

  const data = {
    date: submitDate,
    day: diff,
    nofap: document.getElementById('nofap')?.checked ? 'YES' : 'NO',
    meals: document.getElementById('meals')?.checked ? 'YES' : 'NO',
    exercise: document.getElementById('exercise')?.checked ? 'YES' : 'NO',
    study: document.getElementById('study')?.checked ? 'YES' : 'NO',
    reading: document.getElementById('reading')?.checked ? 'YES' : 'NO',
    note: document.getElementById('challengeNote')?.value || '',
    selfie: currentSelfieBase64
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
    showToast('❌ Failed to push. Saved locally as backup.', 'error');
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

      const distanceEl = document.getElementById('heroDistanceText');
      if (distanceEl) {
        let diff = (currentW - target).toFixed(1);
        if (diff < 0) diff = 0;
        distanceEl.innerText = `${diff} KG REMAINING. NO EXCUSES.`;
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



// Body Form init
const bodyDateEl = document.getElementById('bodyDate');
if (bodyDateEl) bodyDateEl.value = getTodayISO();
const bodyTimeEl = document.getElementById('bodyTime');
if (bodyTimeEl) {
  bodyTimeEl.value = new Date().toTimeString().substring(0, 5);
}

// =====================
// DASHBOARD - FOOD LOGS
// =====================
async function loadTodaysFood() {
  const container = document.getElementById('todaysFoodList');
  if (!container) return;

  const dateInput = document.getElementById('dashboardFoodDate');
  const targetIso = dateInput && dateInput.value ? dateInput.value : getTodayISO();

  // Show loading state to indicate it's fetching purely from the cloud
  container.innerHTML = `
    <div class="card" style="padding: 16px;">
      <div class="action-desc" style="text-align:center; width:100%; margin-top:0;">Loading your meals from Google Sheets...</div>
    </div>
  `;

  // Define render helper
  const renderData = (logs) => {
    // Deduplicate logic just in case remote has same items accidentally
    let uniqueLogsMap = new Map();
    logs.forEach(log => {
      // Use time + mealtype as a unique enough key for the same day
      const key = `${log.time || ''}-${log.mealType || log.mealtype || ''}-${log.source || ''}`;
      uniqueLogsMap.set(key, log);
    });

    let uniqueLogs = Array.from(uniqueLogsMap.values());

    if (uniqueLogs.length === 0) {
      container.innerHTML = `<div class="card action-card" style="padding: 16px; justify-content: center; background: #fff; border: 1.5px dashed #ccc;">
        <div class="action-desc" style="text-align:center; width: 100%; margin-top: 0; color: #888;">No meals found for this date.</div>
      </div>`;
      return;
    }

    // Sort by time (ascending)
    uniqueLogs.sort((a, b) => {
      return (a.time || '').localeCompare(b.time || '');
    });

    container.innerHTML = '<div style="display: flex; flex-direction: column; gap: 14px;">';

    let renderedCount = 0;
    uniqueLogs.forEach((log) => {
      const items = [];
      // Defensively check both camelCase and lowercase (Google Sheets column names)
      if (log.foodItem1 || log.fooditem1) items.push(log.foodItem1 || log.fooditem1);
      if (log.foodItem2 || log.fooditem2) items.push(log.foodItem2 || log.fooditem2);
      if (log.foodItem3 || log.fooditem3) items.push(log.foodItem3 || log.fooditem3);
      if (log.foodItem4 || log.fooditem4) items.push(log.foodItem4 || log.fooditem4);
      if (log.foodItem5 || log.fooditem5) items.push(log.foodItem5 || log.fooditem5);

      // Skip logging accidental empty test entries
      if (items.length === 0 && !(log.notes || log.Notes)) return;
      renderedCount++;

      const itemsStr = items.join(', ');

      const sourceVal = log.source || log.Source || '';
      const shopVal = log.shop || log.Shop || '';

      let locationStr = sourceVal === 'Homemade' ? 'Homemade' : (shopVal ? shopVal : sourceVal || 'Unknown');

      const card = document.createElement('div');
      card.style.display = 'flex';
      card.style.gap = '12px';
      card.style.alignItems = 'flex-start';

      const mealType = log.mealType || log.mealtype || 'Meal';
      const timeVal = log.time || '--:--';

      // Sometimes time comes back from Sheets as full ISO timestamp 
      // Handle Google Sheets date text extraction
      let displayTime = timeVal;
      if (typeof displayTime === 'string' && displayTime.length > 5) {
        // Try strict regex match HH:MM for Google sheets weird Date strings (e.g. "Sat Dec 30 1899 12:23:00 GMT+0000")
        const timeMatch = displayTime.match(/(\d{2}:\d{2}):\d{2}/);
        if (timeMatch) {
          displayTime = timeMatch[1];
        } else if (displayTime.includes('T')) {
          displayTime = new Date(displayTime).toTimeString().substring(0, 5);
        }
      }

      const notes = log.notes || log.Notes || '';

      card.innerHTML = `
        <div style="background: rgba(0, 0, 0, 0.05); color: #000; padding: 6px 12px; border-radius: 8px; font-weight: 700; font-size: 0.85rem; min-width: 65px; text-align: center; border: 1px solid rgba(0,0,0,0.1);">
          ${displayTime}
        </div>
        <div style="flex: 1; background: #fff; border: 1.5px solid #e8e8e8; border-radius: 12px; padding: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); transition: transform 0.2s; position: relative;">
          <div style="position: absolute; left: -18px; top: 16px; width: 8px; height: 8px; border-radius: 50%; background: #000;"></div>
          
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div style="font-weight: 700; font-size: 0.95rem; color: #111;">${mealType}</div>
            <div style="font-size: 0.75rem; background: rgba(46, 125, 50, 0.1); color: #2e7d32; padding: 3px 8px; border-radius: 6px; font-weight: 600;">
              📍 ${locationStr}
            </div>
          </div>
          <div style="font-size: 0.9rem; color: #333; line-height: 1.5; font-weight: 500;">
            ${itemsStr}
          </div>
          ${notes ? `<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #f0f0f0; font-size: 0.8rem; color: #777; font-style: italic;">📝 "${notes}"</div>` : ''}
        </div>
      `;
      container.appendChild(card);
    });
    container.innerHTML += '</div>';
  };

  // 2. Fetch Strictly from Google Sheets
  if (FOOD_APPS_SCRIPT_URL && FOOD_APPS_SCRIPT_URL !== 'YOUR_FOOD_GOOGLE_APPS_SCRIPT_URL_HERE') {
    try {
      const resp = await fetch(FOOD_APPS_SCRIPT_URL);
      if (resp.ok) {
        const text = await resp.text();
        let remoteData = null;
        try { remoteData = JSON.parse(text); } catch (e) { }

        if (remoteData && Array.isArray(remoteData)) {
          // Filter remote data for today
          const remoteToday = remoteData.filter(item => {
            // Handle raw date strings from sheets
            let d = item.date || item.Date;
            if (!d) return false;

            // Convert any Google formats "Mon Apr 13 2026..." or timestamps into proper local YYYY-MM-DD
            if (typeof d === 'string') {
              if (d.startsWith(targetIso)) return true; // Direct match

              // If it's a long google date string, try parsing it securely
              const parsedDate = new Date(d);
              if (!isNaN(parsedDate.getTime())) {
                const isoLike = parsedDate.getFullYear() + '-' + String(parsedDate.getMonth() + 1).padStart(2, '0') + '-' + String(parsedDate.getDate()).padStart(2, '0');
                return isoLike === targetIso;
              }
            }
            return false;
          });

          renderData(remoteToday);
        } else {
          renderData([]);
        }
      } else {
        renderData([]);
      }
    } catch (e) {
      console.warn("Could not fetch remote food logs", e);
      renderData([]);
    }
  } else {
    renderData([]);
  }
}
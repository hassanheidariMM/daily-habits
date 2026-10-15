/* ============================================
   Daily Habits - Main
   بخش ۱ از ۲ — همه ترجمه‌شده
   ============================================ */

let currentTab = 'home';
let selectedIcon = '';
let appInitialized = false;
let habitFilter = 'today';
let habitCategoryFilter = 'all';
let timerInterval = null;
let timerSeconds = 25 * 60;
let timerRunning = false;
let timerTotal = 25 * 60;

// ============ راه‌اندازی ============
function init() {
  console.log('🚀 Daily Habits در حال راه‌اندازی...');
  try {
    loadData();
    const data = getData();
    if (!data.language) { data.language = detectBrowserLang(); saveData(); }
    if (!data.selectedDate) { data.selectedDate = getToday(); saveData(); }
    checkTodayChallenge();
    checkTodayReward();
    applyLanguage(data.language);
    applyTheme(data.colorTheme || 'indigo');
    if (data.passwordLockEnabled && data.password) {
      showLockScreen();
    } else {
      hideLockScreen();
      startApp();
    }
    console.log('✅ init کامل شد');
  } catch (e) {
    console.error('❌ خطا در init:', e);
    showFatalError(e);
  }
}

function showFatalError(err) {
  const splash = document.getElementById('splash');
  if (splash) splash.classList.add('hide');
  const app = document.getElementById('app');
  if (app) app.classList.remove('hidden');
  const errBox = document.createElement('div');
  errBox.style.cssText = 'position:fixed;inset:0;background:#0f172a;color:#fff;padding:20px;z-index:99999;font-family:monospace;direction:ltr;text-align:left;overflow:auto;';
  errBox.innerHTML = '<h2 style="color:#ef4444">❌ خطا</h2><p style="color:#94a3b8">' + err.message + '</p><pre style="background:#1e293b;padding:15px;border-radius:8px;font-size:12px">' + (err.stack || '').split('\n').slice(0, 8).join('\n') + '</pre>';
  document.body.appendChild(errBox);
}

function startApp() {
  setTimeout(function() {
    const splash = document.getElementById('splash');
    if (splash) splash.classList.add('hide');
  }, 1500);
  const app = document.getElementById('app');
  if (app) {
    setTimeout(function() {
      app.classList.remove('hidden');
      app.classList.add('fade-in');
    }, 1500);
  }
  try {
    setupTabs();
    setupHomeTab();
    setupStatsTab();
    setupAnalysisTab();
    setupTrackerTab();
    setupDreamsTab();
    setupRewardsTab();
    setupNoteTab();
    setupMoreTab();
    setupReportTab();
    setupDayNavigation();
    setupFilterBar();
  } catch (e) { console.error('❌ خطا در setup:', e); }
  try { if (typeof initSettings === 'function') initSettings(); } catch (e) { console.error('Settings:', e); }
  try { if (typeof initNotifications === 'function') initNotifications(); } catch (e) {}
  try { if (typeof initBackup === 'function') initBackup(); } catch (e) {}
  try { if (typeof initDiaryNav === 'function') initDiaryNav(); } catch (e) {}
  try { if (typeof setupDiaryAutoSave === 'function') setupDiaryAutoSave(); } catch (e) {}
  try { if (typeof initPremium === 'function') initPremium(); } catch (e) {}
  try { if (typeof initAds === 'function') setTimeout(initAds, 5000); } catch (e) {}
  updateHeader();
  updateLevelBox();
  updateMotivation();
  renderChallengeCard();
  renderRewardCard();
  renderWaterCard();
  renderBookCard();
  renderAllItems();
  updateOverallProgress();
  setTimeout(function() {
    if (typeof updateHeader === 'function') updateHeader();
  }, 2000);
  try { if (typeof clearOldData === 'function') clearOldData(); } catch (e) {}
  try { if (typeof checkAchievements === 'function') checkAchievements(); } catch (e) {}
  console.log('✅ اپ راه‌اندازی شد');
}

function showLockScreen() {
  const splash = document.getElementById('splash');
  const lockScreen = document.getElementById('lockScreen');
  setTimeout(function() {
    if (splash) splash.classList.add('hide');
    if (lockScreen) lockScreen.classList.remove('hidden');
    const input = document.getElementById('lockPassword');
    const btn = document.getElementById('lockSubmit');
    if (input) {
      input.focus();
      input.addEventListener('keypress', function(e) { if (e.key === 'Enter') checkPassword(); });
    }
    if (btn) btn.addEventListener('click', checkPassword);
  }, 1500);
}

function hideLockScreen() {
  const lockScreen = document.getElementById('lockScreen');
  if (lockScreen) lockScreen.classList.add('hidden');
}

function checkPassword() {
  const input = document.getElementById('lockPassword');
  const error = document.getElementById('lockError');
  const data = getData();
  if (!input) return;
  if (input.value === data.password) { hideLockScreen(); startApp(); }
  else {
    if (error) { error.classList.remove('hidden'); setTimeout(function() { error.classList.add('hidden'); }, 2000); }
    input.value = '';
    input.classList.add('shake');
    setTimeout(function() { input.classList.remove('shake'); }, 500);
    if (typeof playErrorSound === 'function') playErrorSound();
  }
}

// ============ چالش روزانه ============
function checkTodayChallenge() {
  const data = getData();
  const today = getToday();
  if (data.todayChallenge && data.todayChallenge.date === today) return;
  if (data.todayChallenge && data.todayChallenge.date !== today) data.todayChallenge = null;
  if (typeof DAILY_CHALLENGES !== 'undefined' && DAILY_CHALLENGES && DAILY_CHALLENGES.length > 0) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * DAILY_CHALLENGES.length);
    } while (DAILY_CHALLENGES.length > 1 && data.todayChallenge && data.todayChallenge.text === DAILY_CHALLENGES[randomIndex]);
    data.todayChallenge = {
      id: randomIndex,
      text: DAILY_CHALLENGES[randomIndex],
      date: today,
      done: false,
      doneAt: null
    };
    data.lastChallengeDate = today;
    saveData();
  }
}

function toggleChallenge() {
  const data = getData();
  if (!data.todayChallenge) return;
  if (data.todayChallenge.date !== getToday()) return;
  if (data.todayChallenge.done) {
    if (typeof showToast === 'function') showToast(t('challengeAlreadyDone'), 'info');
    return;
  }
  data.todayChallenge.done = true;
  data.todayChallenge.doneAt = new Date().toISOString();
  data.points = (data.points || 0) + 30;
  saveData();
  if (typeof playAchievementSound === 'function') playAchievementSound();
  if (typeof showConfetti === 'function') showConfetti();
  if (typeof showToast === 'function') showToast('🎉 ' + t('challengeSuccess'), 'success');
  renderChallengeCard();
  updateLevelBox();
  if (typeof checkAchievements === 'function') checkAchievements();
}

function renderChallengeCard() {
  const container = document.getElementById('challengeCard');
  if (!container) return;
  const data = getData();
  const challenge = data.todayChallenge;
  if (!challenge) { container.style.display = 'none'; return; }
  container.style.display = 'block';
  const isDone = challenge.done;
  container.innerHTML = 
    '<div class="challenge-header">' +
      '<span class="challenge-icon">🎯</span>' +
      '<span class="challenge-title">' + t('challengeTitle') + '</span>' +
      (isDone ? '<span class="challenge-status done">✅ ' + t('challengeStatus') + '</span>' : '<span class="challenge-points">+۳۰</span>') +
    '</div>' +
    '<div class="challenge-text">' + escapeHtml(challenge.text) + '</div>' +
    (isDone ? 
      '<div class="challenge-done-msg">🎉 ' + t('challengeNext') + '</div>'
      :
      '<button class="challenge-btn" id="challengeDoneBtn">✅ ' + t('challengeDone') + '</button>'
    );
  const doneBtn = document.getElementById('challengeDoneBtn');
  if (doneBtn) doneBtn.addEventListener('click', toggleChallenge);
}

// ============ جایزه امروز ============
function checkTodayReward() {
  const data = getData();
  const today = getToday();
  if (data.todayReward && data.todayReward.date === today) return;
  data.todayReward = null;
  if (data.rewardsList && data.rewardsList.length > 0) {
    const randomReward = data.rewardsList[Math.floor(Math.random() * data.rewardsList.length)];
    data.todayReward = {
      text: randomReward.text,
      date: today,
      revealed: false
    };
    data.lastRewardPickDate = today;
    saveData();
  }
}

function isRewardUnlocked() {
  const progress = getDayProgress(getToday());
  return progress.pct >= 50;
}

function revealTodayReward() {
  const data = getData();
  if (!data.todayReward) { if (typeof showToast === 'function') showToast('⚠️ ' + t('noData'), 'info'); return; }
  if (data.todayReward.revealed) return;
  if (!isRewardUnlocked()) {
    const progress = getDayProgress(getToday());
    if (typeof showToast === 'function') showToast('🔒 ' + t('rewardUnlockHint') + ' (' + toLocalNum(progress.pct) + '٪)', 'warning');
    if (typeof playErrorSound === 'function') playErrorSound();
    return;
  }
  data.todayReward.revealed = true;
  saveData();
  if (typeof playRewardBoxSound === 'function') playRewardBoxSound();
  if (typeof showConfetti === 'function') showConfetti();
  if (typeof showToast === 'function') showToast('🎁 ' + t('rewardCongrats'), 'success');
  renderRewardCard();
}

function renderRewardCard() {
  const container = document.getElementById('rewardTodayCard');
  if (!container) return;
  const data = getData();
  const reward = data.todayReward;
  if (!reward) { container.style.display = 'none'; return; }
  container.style.display = 'block';
  const unlocked = isRewardUnlocked();
  const revealed = reward.revealed;
  const progress = getDayProgress(getToday());
  if (revealed) {
    container.innerHTML = 
      '<div class="reward-today-header">' +
        '<span class="reward-today-icon">🎁</span>' +
        '<span class="reward-today-title">' + t('todayReward') + '</span>' +
      '</div>' +
      '<div class="reward-today-text">' + escapeHtml(reward.text) + '</div>' +
      '<div class="reward-today-done">🎉 ' + t('rewardCongrats') + '</div>';
  } else if (unlocked) {
    container.innerHTML = 
      '<div class="reward-today-header">' +
        '<span class="reward-today-icon">🎁</span>' +
        '<span class="reward-today-title">' + t('rewardReadyTitle') + '</span>' +
      '</div>' +
      '<button class="reward-today-btn" id="revealRewardBtn">🎁 ' + t('rewardOpen') + '</button>';
    const btn = document.getElementById('revealRewardBtn');
    if (btn) btn.addEventListener('click', revealTodayReward);
  } else {
    container.innerHTML = 
      '<div class="reward-today-header">' +
        '<span class="reward-today-icon">🔒</span>' +
        '<span class="reward-today-title">' + t('todayReward') + '</span>' +
      '</div>' +
      '<div class="reward-today-locked">' +
        t('rewardUnlockHint') +
        '<div class="reward-progress-bar"><div class="reward-progress-fill" style="width:' + progress.pct + '%"></div></div>' +
        '<div class="reward-progress-text">' + toLocalNum(progress.pct) + '٪ / ۵۰٪</div>' +
      '</div>';
  }
}

// ============ آب ============
function getTodayWater() {
  const data = getData();
  const today = getToday();
  if (!data.water) data.water = {};
  if (!data.water[today]) data.water[today] = { cups: 0, ml: 0 };
  return data.water[today];
}

function addWaterCup(count) {
  count = count || 1;
  const data = getData();
  const today = getToday();
  const cupSize = data.cupSize || 250;
  if (!data.water) data.water = {};
  if (!data.water[today]) data.water[today] = { cups: 0, ml: 0 };
  data.water[today].cups += count;
  data.water[today].ml = data.water[today].cups * cupSize;
  data.lastWaterDate = today;
  saveData();
  if (typeof playTickSound === 'function') playTickSound();
  const goal = data.waterGoal || 8;
  if (data.water[today].cups === goal) {
    if (typeof playAchievementSound === 'function') playAchievementSound();
    if (typeof showConfetti === 'function') showConfetti();
    if (typeof showToast === 'function') showToast('🎉 ' + t('waterGoalReached'), 'success');
  } else {
    if (typeof showToast === 'function') showToast('💧 ' + t('waterAdded'), 'success');
  }
  renderWaterCard();
}

function removeWaterCup() {
  const data = getData();
  const today = getToday();
  const cupSize = data.cupSize || 250;
  if (!data.water || !data.water[today]) return;
  if (data.water[today].cups <= 0) return;
  data.water[today].cups -= 1;
  data.water[today].ml = data.water[today].cups * cupSize;
  saveData();
  if (typeof playTickSound === 'function') playTickSound();
  renderWaterCard();
}

function resetWaterToday() {
  const data = getData();
  const today = getToday();
  if (!data.water) data.water = {};
  data.water[today] = { cups: 0, ml: 0 };
  saveData();
  if (typeof showToast === 'function') showToast('🔄 ' + t('waterResetDone'), 'info');
  renderWaterCard();
}

function changeCupSize(size) {
  const data = getData();
  data.cupSize = size;
  const today = getToday();
  if (data.water && data.water[today]) {
    data.water[today].ml = data.water[today].cups * size;
  }
  saveData();
  renderWaterCard();
  if (typeof showToast === 'function') showToast('☕ ' + t('waterSettings'), 'success');
}

function changeWaterGoal(goal) {
  const data = getData();
  data.waterGoal = goal;
  saveData();
  renderWaterCard();
  if (typeof showToast === 'function') showToast('🎯 ' + t('waterGoalLabel'), 'success');
}

function renderWaterCard() {
  const container = document.getElementById('waterCard');
  if (!container) return;
  const data = getData();
  const today = getToday();
  const water = data.water || {};
  const todayWater = water[today] || { cups: 0, ml: 0 };
  const goal = data.waterGoal || 8;
  const cups = todayWater.cups;
  const ml = todayWater.ml;
  const progress = Math.min(100, Math.round((cups / goal) * 100));
  const isComplete = cups >= goal;
  let cupsHtml = '';
  const maxDisplay = Math.max(goal, 12);
  for (let i = 0; i < maxDisplay; i++) {
    const filled = i < cups;
    const isGoal = i < goal;
    cupsHtml += '<div class="water-cup ' + (filled ? 'filled' : '') + ' ' + (isGoal ? 'in-goal' : 'extra') + '" data-cup-index="' + i + '">💧</div>';
  }
  container.innerHTML = 
    '<div class="water-header">' +
      '<div class="water-header-left">' +
        '<span class="water-icon">💧</span>' +
        '<span class="water-title">' + t('waterTitle') + '</span>' +
      '</div>' +
      '<div class="water-header-right ' + (isComplete ? 'complete' : '') + '">' +
        toLocalNum(cups) + ' / ' + toLocalNum(goal) +
      '</div>' +
    '</div>' +
    '<div class="water-ml">' +
      toLocalNum(ml) + ' ' + t('waterMl') +
      (isComplete ? ' <span class="water-complete-badge">✅ ' + t('waterComplete') + '</span>' : '') +
    '</div>' +
    '<div class="water-progress-bar">' +
      '<div class="water-progress-fill ' + (isComplete ? 'complete' : '') + '" style="width:' + progress + '%"></div>' +
    '</div>' +
    '<div class="water-cups-grid" id="waterCupsGrid">' + cupsHtml + '</div>' +
    '<div class="water-actions">' +
      '<button class="water-btn water-btn-minus" id="waterMinus">➖</button>' +
      '<button class="water-btn water-btn-plus" id="waterPlus">➕ ' + t('waterAddCup') + '</button>' +
      '<button class="water-btn water-btn-plus-multi" id="waterPlusPlus">➕➕</button>' +
    '</div>' +
    '<div class="water-footer">' +
      '<button class="water-reset-btn" id="waterReset">🔄 ' + t('waterReset') + '</button>' +
    '</div>';
  const plusBtn = document.getElementById('waterPlus');
  const minusBtn = document.getElementById('waterMinus');
  const plusPlusBtn = document.getElementById('waterPlusPlus');
  const resetBtn = document.getElementById('waterReset');
  if (plusBtn) plusBtn.addEventListener('click', function() { addWaterCup(1); });
  if (minusBtn) minusBtn.addEventListener('click', removeWaterCup);
  if (plusPlusBtn) plusPlusBtn.addEventListener('click', function() { addWaterCup(2); });
  if (resetBtn) resetBtn.addEventListener('click', function() {
    if (confirm(t('confirmDelete'))) resetWaterToday();
  });
  container.querySelectorAll('.water-cup').forEach(function(cup) {
    cup.addEventListener('click', function() {
      const idx = parseInt(cup.dataset.cupIndex);
      const data = getData();
      const today = getToday();
      if (!data.water[today]) data.water[today] = { cups: 0, ml: 0 };
      if (idx < data.water[today].cups) data.water[today].cups = idx;
      else data.water[today].cups = idx + 1;
      data.water[today].ml = data.water[today].cups * (data.cupSize || 250);
      saveData();
      if (typeof playTickSound === 'function') playTickSound();
      renderWaterCard();
    });
  });
}

// ============ کتاب ============
function getTodayBooks() {
  const data = getData();
  const today = getToday();
  if (!data.books) data.books = {};
  if (!data.books[today]) data.books[today] = { pages: 0, books: 0 };
  return data.books[today];
}

function addBookPages(count) {
  count = count || 1;
  const data = getData();
  const today = getToday();
  if (!data.books) data.books = {};
  if (!data.books[today]) data.books[today] = { pages: 0, books: 0 };
  data.books[today].pages += count;
  data.points = (data.points || 0) + count;
  saveData();
  if (typeof playTickSound === 'function') playTickSound();
  if (typeof showToast === 'function') showToast('📖 ' + toLocalNum(count) + ' ' + t('bookAdded'), 'success');
  renderBookCard();
  updateLevelBox();
  if (typeof checkAchievements === 'function') checkAchievements();
}

function addCompleteBook() {
  const data = getData();
  const today = getToday();
  if (!data.books) data.books = {};
  if (!data.books[today]) data.books[today] = { pages: 0, books: 0 };
  data.books[today].books += 1;
  data.points = (data.points || 0) + 50;
  saveData();
  if (typeof playAchievementSound === 'function') playAchievementSound();
  if (typeof showConfetti === 'function') showConfetti();
  if (typeof showToast === 'function') showToast('📕 ' + t('bookCompleteNotif'), 'success');
  renderBookCard();
  updateLevelBox();
  if (typeof checkAchievements === 'function') checkAchievements();
}

function resetBooksToday() {
  const data = getData();
  const today = getToday();
  if (!data.books) data.books = {};
  data.books[today] = { pages: 0, books: 0 };
  saveData();
  if (typeof showToast === 'function') showToast('🔄 ' + t('bookResetDone'), 'info');
  renderBookCard();
}

function renderBookCard() {
  const container = document.getElementById('bookCard');
  if (!container) return;
  const data = getData();
  const today = getToday();
  const books = data.books || {};
  const todayBooks = books[today] || { pages: 0, books: 0 };
  let weekPages = 0, monthPages = 0, yearPages = 0;
  for (let i = 0; i < 7; i++) {
    const d = getDateAgoISO(i);
    if (books[d]) weekPages += books[d].pages || 0;
  }
  for (let i = 0; i < 30; i++) {
    const d = getDateAgoISO(i);
    if (books[d]) monthPages += books[d].pages || 0;
  }
  for (let i = 0; i < 365; i++) {
    const d = getDateAgoISO(i);
    if (books[d]) yearPages += books[d].pages || 0;
  }
  
  container.innerHTML = 
    '<div class="book-header">' +
      '<div class="book-header-left">' +
        '<span class="book-icon">📚</span>' +
        '<span class="book-title">' + t('bookTitle') + '</span>' +
      '</div>' +
      '<div class="book-header-right">' +
        '<span class="book-pages-today">' + toLocalNum(todayBooks.pages) + ' ' + t('bookPage') + '</span>' +
      '</div>' +
    '</div>' +
    '<div class="book-today">' +
      '<div class="book-today-item">' +
        '<span class="book-today-value">' + toLocalNum(todayBooks.pages) + '</span>' +
        '<span class="book-today-label">' + t('bookPagesToday') + '</span>' +
      '</div>' +
      '<div class="book-today-item">' +
        '<span class="book-today-value">' + toLocalNum(todayBooks.books) + '</span>' +
        '<span class="book-today-label">' + t('bookBooksToday') + '</span>' +
      '</div>' +
    '</div>' +
    '<div class="book-quick-actions">' +
      '<button class="book-quick-btn" data-pages="1">+۱</button>' +
      '<button class="book-quick-btn" data-pages="5">+۵</button>' +
      '<button class="book-quick-btn" data-pages="10">+۱۰</button>' +
      '<button class="book-quick-btn" data-pages="50">+۵۰</button>' +
      '<button class="book-quick-btn" data-pages="100">+۱۰۰</button>' +
    '</div>' +
    '<div class="book-main-actions">' +
      '<button class="book-btn book-btn-add" id="bookAddCustom">➕ ' + t('bookCustomPage') + '</button>' +
      '<button class="book-btn book-btn-complete" id="bookComplete">📕 ' + t('bookComplete') + '</button>' +
    '</div>' +
    '<div class="book-stats-grid">' +
      '<div class="book-stat">' +
        '<div class="book-stat-icon">📅</div>' +
        '<div class="book-stat-value">' + toLocalNum(weekPages) + '</div>' +
        '<div class="book-stat-label">' + t('bookWeek') + '</div>' +
      '</div>' +
      '<div class="book-stat">' +
        '<div class="book-stat-icon">📆</div>' +
        '<div class="book-stat-value">' + toLocalNum(monthPages) + '</div>' +
        '<div class="book-stat-label">' + t('bookMonth') + '</div>' +
      '</div>' +
      '<div class="book-stat">' +
        '<div class="book-stat-icon">🗓️</div>' +
        '<div class="book-stat-value">' + toLocalNum(yearPages) + '</div>' +
        '<div class="book-stat-label">' + t('bookYear') + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="book-footer">' +
      '<button class="book-reset-btn" id="bookReset">🔄 ' + t('bookReset') + '</button>' +
    '</div>';
  container.querySelectorAll('.book-quick-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const pages = parseInt(btn.dataset.pages);
      addBookPages(pages);
    });
  });
  const customBtn = document.getElementById('bookAddCustom');
  if (customBtn) {
    customBtn.addEventListener('click', function() {
      const input = prompt(t('bookCustomPrompt'), '20');
      if (input === null) return;
      const pages = parseInt(input);
      if (isNaN(pages) || pages <= 0) {
        if (typeof showToast === 'function') showToast('❌ ' + t('bookInvalid'), 'error');
        return;
      }
      addBookPages(pages);
    });
  }
  const completeBtn = document.getElementById('bookComplete');
  if (completeBtn) completeBtn.addEventListener('click', addCompleteBook);
  const resetBtn = document.getElementById('bookReset');
  if (resetBtn) resetBtn.addEventListener('click', function() {
    if (confirm(t('confirmDelete'))) resetBooksToday();
  });
}

// ============ تب‌ها ============
function setupTabs() {
  document.querySelectorAll('.nav-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      switchTab(btn.dataset.tab);
      if (typeof playClickSound === 'function') playClickSound();
    });
  });
}

function switchTab(tab) {
  document.querySelectorAll('.nav-btn').forEach(function(b) { b.classList.remove('active'); });
  document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
  const navBtn = document.querySelector('.nav-btn[data-tab="' + tab + '"]');
  if (navBtn) navBtn.classList.add('active');
  const content = document.getElementById('tab-' + tab);
  if (content) content.classList.add('active');
  currentTab = tab;
  refreshTab(tab);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function refreshTab(tab) {
  try {
    switch (tab) {
      case 'home':
        renderAllItems();
        updateOverallProgress();
        updateDayNav();
        break;
      case 'tracker':
        renderChallengeCard();
        renderRewardCard();
        renderWaterCard();
        renderBookCard();
        break;
      case 'stats':
        if (typeof renderBarChart === 'function') renderBarChart('weekChart');
        if (typeof renderLineChart === 'function') renderLineChart('monthlyChart', 30);
        if (typeof renderHeatmap === 'function') renderHeatmap('heatmap');
        if (typeof renderRecords === 'function') renderRecords('recordsBox');
        break;
      case 'analysis':
        if (typeof renderAnalysis === 'function') renderAnalysis('analysisBox');
        break;
      case 'report':
        if (typeof renderReport === 'function') renderReport('reportBox');
        break;
      case 'note':
        renderNote();
        break;
      case 'settings':
        if (typeof renderThemes === 'function') renderThemes();
        renderCategoriesList();
        break;
    }
  } catch (e) { console.error('خطا در refreshTab:', e); }
}

function refreshAllTabs() { refreshTab(currentTab); }

// ============ هدر ============
function updateHeader() {
  const data = getData();
  const userNameEl = document.getElementById('headerUserName');
  if (userNameEl) {
    let headerText = data.userName ? '👤 ' + data.userName : '';
    if (typeof isPremium === 'function' && isPremium()) {
      headerText += ' <span class="premium-badge" title="Premium">👑</span>';
    }
    userNameEl.innerHTML = headerText;
  }
  const dateEl = document.getElementById('headerDate');
  if (dateEl) dateEl.textContent = formatDateWithDay(new Date());
  const hijriEl = document.getElementById('headerHijriDate');
  if (hijriEl) {
    const type = data.calendarType || 'jalali';
    if (type === 'jalali') hijriEl.textContent = formatDate(new Date(), 'hijri');
    else hijriEl.textContent = formatDate(new Date(), 'jalali');
  }
  const dateBtn = document.getElementById('dateBtn');
  if (dateBtn && !dateBtn.dataset.bound) {
    dateBtn.dataset.bound = '1';
    dateBtn.addEventListener('click', function() {
      const types = ['jalali', 'gregorian', 'hijri'];
      const current = data.calendarType || 'jalali';
      const next = types[(types.indexOf(current) + 1) % types.length];
      data.calendarType = next;
      saveData();
      updateHeader();
      renderAllItems();
      if (typeof showToast === 'function') showToast('📅 ' + t(next), 'success');
      if (typeof playClickSound === 'function') playClickSound();
    });
  }
  updateDayNav();
}

function updateLevelBox() {
  if (typeof getUserLevel !== 'function') return;
  const level = getUserLevel();
  const iconEl = document.getElementById('levelIcon');
  const nameEl = document.getElementById('levelName');
  const fillEl = document.getElementById('levelProgressFill');
  const pointsEl = document.getElementById('levelPoints');
  if (iconEl) iconEl.textContent = level.icon;
  if (nameEl) nameEl.textContent = level.name;
  if (fillEl) fillEl.style.width = level.progress + '%';
  if (pointsEl) pointsEl.textContent = toLocalNum(level.points) + ' ' + t('points');
}

function updateMotivation() {
  const data = getData();
  const el = document.getElementById('motivationText');
  const editBtn = document.getElementById('motivationEditBtn');
  if (!el) return;
  el.textContent = data.selfMessage || (data.customMotivation || 'امروز روز توئه! 💪');
  if (editBtn && !editBtn.dataset.bound) {
    editBtn.dataset.bound = '1';
    editBtn.addEventListener('click', editMotivation);
  }
}

function editMotivation() {
  const data = getData();
  const current = data.selfMessage || '';
  const newMsg = prompt(t('motivation'), current);
  if (newMsg !== null) {
    data.selfMessage = newMsg.trim();
    saveData();
    updateMotivation();
    if (typeof showToast === 'function') showToast('✏️ ' + t('msgSaved'), 'success');
  }
}

// ============ ناوبری روز ============
function setupDayNavigation() {
  const prevBtn = document.getElementById('dayPrev');
  const nextBtn = document.getElementById('dayNext');
  const currentBtn = document.getElementById('dayCurrent');
  const backBtn = document.getElementById('backToToday');
  if (prevBtn) prevBtn.addEventListener('click', function() {
    setSelectedDate(getPrevDay(getSelectedDate()));
    updateDayNav();
    renderAllItems();
    updateOverallProgress();
    if (typeof playClickSound === 'function') playClickSound();
  });
  if (nextBtn) nextBtn.addEventListener('click', function() {
    const next = getNextDay(getSelectedDate());
    if (next <= getToday()) {
      setSelectedDate(next);
      updateDayNav();
      renderAllItems();
      updateOverallProgress();
      if (typeof playClickSound === 'function') playClickSound();
    } else {
      if (typeof showToast === 'function') showToast('⏩ ' + t('today'), 'info');
    }
  });
  if (currentBtn) currentBtn.addEventListener('click', openDatePicker);
  if (backBtn) backBtn.addEventListener('click', function() {
    setSelectedDate(getToday());
    updateDayNav();
    renderAllItems();
    updateOverallProgress();
  });
  updateDayNav();
}

function updateDayNav() {
  const selected = getSelectedDate();
  const today = getToday();
  const yesterday = getDateAgoISO(1);
  const label = document.getElementById('dayLabel');
  const nextBtn = document.getElementById('dayNext');
  const backBtn = document.getElementById('backToToday');
  let labelText = '';
  if (selected === today) labelText = '✨ ' + t('dayLabelToday');
  else if (selected === yesterday) labelText = '📅 ' + t('dayLabelYesterday') + ' — ' + formatDate(isoToDate(selected));
  else labelText = '📅 ' + formatDateWithDay(isoToDate(selected));
  if (label) label.textContent = labelText;
  if (nextBtn) nextBtn.disabled = selected >= today;
  if (backBtn) {
    if (selected !== today) backBtn.classList.remove('hidden');
    else backBtn.classList.add('hidden');
  }
}

// ============ انتخابگر تاریخ ============
function openDatePicker() {
  const existing = document.querySelector('.date-picker-overlay');
  if (existing) existing.remove();
  const selected = getSelectedDate();
  const type = getData().calendarType || 'jalali';
  let currentYear, currentMonth;
  const d = isoToDate(selected);
  if (type === 'jalali') {
    const pos = toJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
    currentYear = pos[0]; currentMonth = pos[1];
  } else if (type === 'hijri') {
    const pos = toHijri(d.getFullYear(), d.getMonth() + 1, d.getDate());
    currentYear = pos[0]; currentMonth = pos[1];
  } else {
    currentYear = d.getFullYear(); currentMonth = d.getMonth() + 1;
  }
  const overlay = document.createElement('div');
  overlay.className = 'date-picker-overlay';
  overlay.innerHTML = '<div class="date-picker-box" id="datePickerBox"></div>';
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
  renderDatePicker(currentYear, currentMonth);
}

function renderDatePicker(year, month) {
  const box = document.getElementById('datePickerBox');
  if (!box) return;
  const type = getData().calendarType || 'jalali';
  let monthName, daysInMonth, startDay;
  const dayNames = getDayNamesShort();
  if (type === 'jalali') {
    monthName = getJalaliMonths()[month - 1];
    daysInMonth = getJalaliMonthDays(year, month);
    startDay = getDayOfWeekForCalendar(getFirstDayOfJalaliMonth(year, month));
  } else if (type === 'hijri') {
    monthName = getHijriMonths()[month - 1];
    daysInMonth = getHijriMonthDays(year, month);
    startDay = getDayOfWeekForCalendar(getFirstDayOfHijriMonth(year, month));
  } else {
    monthName = getGregorianMonths()[month - 1];
    daysInMonth = getGregorianMonthDays(year, month);
    startDay = getDayOfWeekForCalendar(new Date(year, month - 1, 1));
  }
  const today = getToday();
  const selected = getSelectedDate();
  let html = '<h3>📅 ' + monthName + ' ' + toLocalNum(year) + '</h3>';
  html += '<div class="date-picker-nav">' +
    '<button id="dpPrev">◀</button>' +
    '<span class="date-picker-month">' + monthName + '</span>' +
    '<button id="dpNext">▶</button>' +
  '</div>';
  html += '<div class="date-picker-grid">';
  dayNames.forEach(function(name) { html += '<div class="date-picker-day-name">' + name + '</div>'; });
  for (let i = 0; i < startDay; i++) html += '<div></div>';
  for (let day = 1; day <= daysInMonth; day++) {
    let isoStr;
    if (type === 'jalali') {
      const g = jalaliToGregorian(year, month, day);
      isoStr = new Date(g[0], g[1] - 1, g[2]).toISOString().split('T')[0];
    } else if (type === 'hijri') {
      const hg = hijriToGregorian(year, month, day);
      isoStr = new Date(hg[0], hg[1] - 1, hg[2]).toISOString().split('T')[0];
    } else {
      isoStr = new Date(year, month - 1, day).toISOString().split('T')[0];
    }
    const isToday = isoStr === today;
    const isSelected = isoStr === selected;
    let cls = 'date-picker-day';
    if (isToday) cls += ' today';
    if (isSelected) cls += ' selected';
    html += '<button class="' + cls + '" data-date="' + isoStr + '">' + toLocalNum(day) + '</button>';
  }
  html += '</div>';
  html += '<div class="date-picker-actions">' +
    '<button class="date-picker-today" id="dpToday">✨ ' + t('today') + '</button>' +
    '<button class="date-picker-cancel" id="dpCancel">' + t('cancel') + '</button>' +
  '</div>';
  box.innerHTML = html;
  box.querySelectorAll('.date-picker-day').forEach(function(btn) {
    btn.addEventListener('click', function() {
      setSelectedDate(btn.dataset.date);
      updateDayNav();
      renderAllItems();
      updateOverallProgress();
      const ov = document.querySelector('.date-picker-overlay');
      if (ov) ov.remove();
    });
  });
  const prevBtn = document.getElementById('dpPrev');
  const nextBtn = document.getElementById('dpNext');
  const todayBtn = document.getElementById('dpToday');
  const cancelBtn = document.getElementById('dpCancel');
  if (prevBtn) prevBtn.addEventListener('click', function() { if (month === 1) renderDatePicker(year - 1, 12); else renderDatePicker(year, month - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function() { if (month === 12) renderDatePicker(year + 1, 1); else renderDatePicker(year, month + 1); });
  if (todayBtn) todayBtn.addEventListener('click', function() {
    setSelectedDate(getToday());
    updateDayNav();
    renderAllItems();
    updateOverallProgress();
    const ov = document.querySelector('.date-picker-overlay');
    if (ov) ov.remove();
  });
  if (cancelBtn) cancelBtn.addEventListener('click', function() {
    const ov = document.querySelector('.date-picker-overlay');
    if (ov) ov.remove();
  });
}

// ============ انتخابگر تاریخ برای مودال ============
function openDatePickerForModal(callback) {
  const existing = document.querySelector('.date-picker-overlay');
  if (existing) existing.remove();
  const type = getData().calendarType || 'jalali';
  const today = new Date();
  let currentYear, currentMonth;
  if (type === 'jalali') {
    const pos = toJalali(today.getFullYear(), today.getMonth() + 1, today.getDate());
    currentYear = pos[0]; currentMonth = pos[1];
  } else if (type === 'hijri') {
    const pos = toHijri(today.getFullYear(), today.getMonth() + 1, today.getDate());
    currentYear = pos[0]; currentMonth = pos[1];
  } else {
    currentYear = today.getFullYear(); currentMonth = today.getMonth() + 1;
  }
  const overlay = document.createElement('div');
  overlay.className = 'date-picker-overlay';
  overlay.style.zIndex = '100000';
  overlay.innerHTML = '<div class="date-picker-box" id="datePickerBoxModal"></div>';
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
  renderDatePickerForModal(currentYear, currentMonth, callback);
}

function renderDatePickerForModal(year, month, callback) {
  const box = document.getElementById('datePickerBoxModal');
  if (!box) return;
  const type = getData().calendarType || 'jalali';
  let monthName, daysInMonth, startDay;
  const dayNames = getDayNamesShort();
  if (type === 'jalali') {
    monthName = getJalaliMonths()[month - 1];
    daysInMonth = getJalaliMonthDays(year, month);
    startDay = getDayOfWeekForCalendar(getFirstDayOfJalaliMonth(year, month));
  } else if (type === 'hijri') {
    monthName = getHijriMonths()[month - 1];
    daysInMonth = getHijriMonthDays(year, month);
    startDay = getDayOfWeekForCalendar(getFirstDayOfHijriMonth(year, month));
  } else {
    monthName = getGregorianMonths()[month - 1];
    daysInMonth = getGregorianMonthDays(year, month);
    startDay = getDayOfWeekForCalendar(new Date(year, month - 1, 1));
  }
  const today = getToday();
  let html = '<h3>📅 ' + monthName + ' ' + toLocalNum(year) + '</h3>';
  html += '<div class="date-picker-nav">' +
    '<button id="dpPrevModal">◀</button>' +
    '<span class="date-picker-month">' + monthName + '</span>' +
    '<button id="dpNextModal">▶</button>' +
  '</div>';
  html += '<div class="date-picker-grid">';
  dayNames.forEach(function(name) { html += '<div class="date-picker-day-name">' + name + '</div>'; });
  for (let i = 0; i < startDay; i++) html += '<div></div>';
  for (let day = 1; day <= daysInMonth; day++) {
    let isoStr;
    if (type === 'jalali') {
      const g = jalaliToGregorian(year, month, day);
      isoStr = new Date(g[0], g[1] - 1, g[2]).toISOString().split('T')[0];
    } else if (type === 'hijri') {
      const hg = hijriToGregorian(year, month, day);
      isoStr = new Date(hg[0], hg[1] - 1, hg[2]).toISOString().split('T')[0];
    } else {
      isoStr = new Date(year, month - 1, day).toISOString().split('T')[0];
    }
    const isToday = isoStr === today;
    let cls = 'date-picker-day';
    if (isToday) cls += ' today';
    html += '<button class="' + cls + '" data-date="' + isoStr + '">' + toLocalNum(day) + '</button>';
  }
  html += '</div>';
  html += '<div class="date-picker-actions">' +
    '<button class="date-picker-today" id="dpTodayModal">✨ ' + t('today') + '</button>' +
    '<button class="date-picker-cancel" id="dpCancelModal">' + t('cancel') + '</button>' +
  '</div>';
  box.innerHTML = html;
  box.querySelectorAll('.date-picker-day').forEach(function(btn) {
    btn.addEventListener('click', function() {
      if (callback) callback(btn.dataset.date);
      const ov = document.querySelector('.date-picker-overlay');
      if (ov) ov.remove();
    });
  });
  const prevBtn = document.getElementById('dpPrevModal');
  const nextBtn = document.getElementById('dpNextModal');
  const todayBtn = document.getElementById('dpTodayModal');
  const cancelBtn = document.getElementById('dpCancelModal');
  if (prevBtn) prevBtn.addEventListener('click', function() { if (month === 1) renderDatePickerForModal(year - 1, 12, callback); else renderDatePickerForModal(year, month - 1, callback); });
  if (nextBtn) nextBtn.addEventListener('click', function() { if (month === 12) renderDatePickerForModal(year + 1, 1, callback); else renderDatePickerForModal(year, month + 1, callback); });
  if (todayBtn) todayBtn.addEventListener('click', function() {
    if (callback) callback(getToday());
    const ov = document.querySelector('.date-picker-overlay');
    if (ov) ov.remove();
  });
  if (cancelBtn) cancelBtn.addEventListener('click', function() {
    const ov = document.querySelector('.date-picker-overlay');
    if (ov) ov.remove();
  });
}

// ============ فیلتر ============
function setupFilterBar() {
  const filterToday = document.getElementById('filterToday');
  const filterAll = document.getElementById('filterAll');
  const categoryFilter = document.getElementById('categoryFilter');
  if (filterToday) filterToday.addEventListener('click', function() {
    habitFilter = 'today';
    filterToday.classList.add('active');
    if (filterAll) filterAll.classList.remove('active');
    renderAllItems();
    updateOverallProgress();
  });
  if (filterAll) filterAll.addEventListener('click', function() {
    habitFilter = 'all';
    filterAll.classList.add('active');
    if (filterToday) filterToday.classList.remove('active');
    renderAllItems();
    updateOverallProgress();
  });
  if (categoryFilter) {
    const cats = getVisibleCategories();
    let optionsHtml = '<option value="all">' + t('allCategories') + '</option>';
    cats.forEach(function(c) { optionsHtml += '<option value="' + c.id + '">' + c.icon + ' ' + c.name + '</option>'; });
    categoryFilter.innerHTML = optionsHtml;
    categoryFilter.addEventListener('change', function(e) {
      habitCategoryFilter = e.target.value;
      renderAllItems();
    });
  }
}

function getFilterOptions() {
  return { showAll: habitFilter === 'all', category: habitCategoryFilter };
}

// ============ تب خانه ============
function setupHomeTab() {
  const addHabitBtn = document.getElementById('addHabitBtn');
  const habitInput = document.getElementById('habitInput');
  const habitTime = document.getElementById('habitTime');
  if (addHabitBtn) addHabitBtn.addEventListener('click', function() {
    const text = habitInput.value.trim();
    if (!text) { if (typeof showToast === 'function') showToast('❌ ' + t('msgEmpty'), 'error'); return; }
    addItem('habits', text, { time: habitTime.value || '', icon: selectedIcon });
    habitInput.value = ''; habitTime.value = ''; selectedIcon = '';
    if (typeof playSuccessSound === 'function') playSuccessSound();
    if (typeof showToast === 'function') showToast('✅ ' + t('msgAdded'), 'success');
    renderAllItems();
    updateOverallProgress();
  });
  if (habitInput) habitInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') addHabitBtn.click(); });
  const addTaskBtn = document.getElementById('addTaskBtn');
  const taskInput = document.getElementById('taskInput');
  const taskTime = document.getElementById('taskTime');
  if (addTaskBtn) addTaskBtn.addEventListener('click', function() {
    const text = taskInput.value.trim();
    if (!text) { if (typeof showToast === 'function') showToast('❌ ' + t('msgEmpty'), 'error'); return; }
    addItem('tasks', text, { time: taskTime.value || '' });
    taskInput.value = ''; taskTime.value = '';
    if (typeof playSuccessSound === 'function') playSuccessSound();
    if (typeof showToast === 'function') showToast('✅ ' + t('msgAdded'), 'success');
    renderAllItems();
    updateOverallProgress();
  });
  if (taskInput) taskInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') addTaskBtn.click(); });
  const addAvoidBtn = document.getElementById('addAvoidBtn');
  const avoidInput = document.getElementById('avoidInput');
  if (addAvoidBtn) addAvoidBtn.addEventListener('click', function() {
    const text = avoidInput.value.trim();
    if (!text) { if (typeof showToast === 'function') showToast('❌ ' + t('msgEmpty'), 'error'); return; }
    addItem('avoids', text);
    avoidInput.value = '';
    if (typeof playSuccessSound === 'function') playSuccessSound();
    if (typeof showToast === 'function') showToast('✅ ' + t('msgAdded'), 'success');
    renderAllItems();
    updateOverallProgress();
  });
  if (avoidInput) avoidInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') addAvoidBtn.click(); });
}

// ============ رندر آیتم‌ها ============
function renderAllItems() {
  renderItemsList('habits', 'habitsList');
  renderItemsList('tasks', 'tasksList');
  renderItemsList('avoids', 'avoidsList');
  updateMiniStats();
}

function renderItemsList(type, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const selectedDate = getSelectedDate();
  const options = (type === 'habits') ? getFilterOptions() : {};
  const items = getTodayItems(type, selectedDate, options);
  if (items.length === 0) {
    const emptyText = type === 'habits' ? t('noHabitsToday') : t('noData');
    container.innerHTML = '<div class="empty">' + emptyText + '</div>';
    return;
  }
  container.innerHTML = items.map(function(entry, pos) {
    const item = entry.item;
    const index = entry.index;
    const done = isItemDone(type, index, selectedDate);
    const isFirst = pos === 0;
    const isLast = pos === items.length - 1;
    let extras = '';
    if (type === 'habits') {
      if (item.cat) {
        const cat = getCategoryById(item.cat);
        if (cat) extras += '<span class="cat-badge" style="background:' + cat.color + '">' + cat.icon + ' ' + cat.name + '</span>';
      }
      if (item.days && item.days.length > 0 && item.days.length < 7) {
        extras += '<span class="days-badge">' + getDaysText(item.days) + '</span>';
      }
      if (item.startDate && item.endDate) {
        extras += '<span class="goal-badge">🎯 ' + getGoalText(item) + '</span>';
      }
    }
    return '<div class="item ' + (done ? 'done' : '') + '" data-type="' + type + '" data-index="' + index + '">' +
      '<input type="checkbox" ' + (done ? 'checked' : '') + ' data-action="toggle">' +
      '<div class="item-content">' +
        '<div class="item-title">' +
          (item.icon ? '<span class="icon-badge">' + item.icon + '</span>' : '') +
          '<span class="text">' + escapeHtml(item.text) + '</span>' +
          (item.time ? '<span class="time-badge">' + formatTime(item.time) + '</span>' : '') +
        '</div>' +
        (extras ? '<div class="item-extras">' + extras + '</div>' : '') +
      '</div>' +
      '<div class="item-priority">' +
        '<button class="priority-btn" data-action="up" ' + (isFirst ? 'disabled' : '') + '>▲</button>' +
        '<button class="priority-btn" data-action="down" ' + (isLast ? 'disabled' : '') + '>▼</button>' +
      '</div>' +
      '<div class="item-actions">' +
        (type === 'habits' ? '<button class="edit-btn" data-action="edit">✏️</button>' : '') +
        '<button class="delete-btn" data-action="delete">🗑️</button>' +
      '</div>' +
    '</div>';
  }).join('');
  container.querySelectorAll('.item').forEach(function(el) {
    const type = el.dataset.type;
    const index = parseInt(el.dataset.index);
    const checkbox = el.querySelector('input[type="checkbox"]');
    const deleteBtn = el.querySelector('[data-action="delete"]');
    const editBtn = el.querySelector('[data-action="edit"]');
    const upBtn = el.querySelector('[data-action="up"]');
    const downBtn = el.querySelector('[data-action="down"]');
    if (checkbox) checkbox.addEventListener('change', function() {
      toggleItem(type, index, getSelectedDate());
      if (typeof playTickSound === 'function') playTickSound();
      el.classList.toggle('done', checkbox.checked);
      updateMiniStats();
      updateLevelBox();
      updateOverallProgress();
      renderRewardCard();
      if (typeof checkAchievements === 'function') checkAchievements();
    });
    if (deleteBtn) deleteBtn.addEventListener('click', function() {
      if (confirm(t('confirmDelete'))) {
        deleteItem(type, index);
        renderAllItems();
        updateOverallProgress();
        renderRewardCard();
        if (typeof showToast === 'function') showToast('🗑️ ' + t('msgDeleted'), 'info');
      }
    });
    if (editBtn) editBtn.addEventListener('click', function() { openEditHabitModal(index); });
    if (upBtn && !upBtn.disabled) upBtn.addEventListener('click', function() { moveItemPriority(type, index, 'up'); renderAllItems(); });
    if (downBtn && !downBtn.disabled) downBtn.addEventListener('click', function() { moveItemPriority(type, index, 'down'); renderAllItems(); });
  });
}

function updateMiniStats() {
  const selectedDate = getSelectedDate();
  const options = getFilterOptions();
  ['habits', 'tasks', 'avoids'].forEach(function(type) {
    const opts = (type === 'habits') ? options : {};
    const progress = getProgress(type, selectedDate, opts);
    const doneEl = document.getElementById(type + 'Done');
    const totalEl = document.getElementById(type + 'Total');
    const fillEl = document.getElementById(type + 'Fill');
    if (doneEl) doneEl.textContent = toLocalNum(progress.done);
    if (totalEl) totalEl.textContent = toLocalNum(progress.total);
    if (fillEl) fillEl.style.width = progress.pct + '%';
  });
}

function updateOverallProgress() {
  const selectedDate = getSelectedDate();
  const progress = getDayProgress(selectedDate);
  const ring = document.getElementById('overallRing');
  const percentEl = document.getElementById('overallPercent');
  if (ring) {
    const circumference = 2 * Math.PI * 42;
    const offset = circumference - (progress.pct / 100) * circumference;
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = offset;
  }
  if (percentEl) percentEl.textContent = toLocalNum(progress.pct) + '٪';
  const statsEl = document.getElementById('overallStats');
  if (statsEl) {
    statsEl.innerHTML = 
      '<div class="stat-row"><span class="stat-label">' + t('todayHabits') + '</span><span class="stat-value">' + toLocalNum(progress.habits.done) + ' / ' + toLocalNum(progress.habits.total) + '</span></div>' +
      '<div class="stat-row"><span class="stat-label">' + t('todayTasks') + '</span><span class="stat-value">' + toLocalNum(progress.tasks.done) + ' / ' + toLocalNum(progress.tasks.total) + '</span></div>' +
      '<div class="stat-row"><span class="stat-label">' + t('myAvoids') + '</span><span class="stat-value">' + toLocalNum(progress.avoids.done) + ' / ' + toLocalNum(progress.avoids.total) + '</span></div>' +
      '<div class="stat-row"><span class="stat-label">' + t('done') + '</span><span class="stat-value">' + toLocalNum(progress.done) + ' / ' + toLocalNum(progress.total) + '</span></div>';
  }
}
// ============ تب‌های دیگر ============
function setupStatsTab() {}
function setupAnalysisTab() {}
function setupReportTab() {}
function setupMoreTab() {
  document.querySelectorAll('.more-item').forEach(function(btn) {
    btn.addEventListener('click', function() { if (btn.dataset.tab) switchTab(btn.dataset.tab); });
  });
}

// ============ تب ردیابی (تایمر) ============
function setupTrackerTab() {
  const startBtn = document.getElementById('timerStart');
  const pauseBtn = document.getElementById('timerPause');
  const resetBtn = document.getElementById('timerReset');
  const presets = document.querySelectorAll('.timer-presets button');
  const customBtn = document.getElementById('timerCustom');
  
  if (startBtn) startBtn.addEventListener('click', startTimer);
  if (pauseBtn) pauseBtn.addEventListener('click', pauseTimer);
  if (resetBtn) resetBtn.addEventListener('click', resetTimer);
  
  presets.forEach(function(btn) {
    btn.addEventListener('click', function() {
      if (btn.id === 'timerCustom') return;
      const min = parseInt(btn.dataset.min);
      if (isNaN(min)) return;
      setTimer(min);
      presets.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
    });
  });
  
  if (customBtn) {
    customBtn.addEventListener('click', function() {
      const input = prompt(t('timerCustomPrompt'), '30');
      if (input === null) return;
      const min = parseInt(input);
      if (isNaN(min) || min < 1 || min > 999) {
        if (typeof showToast === 'function') showToast('❌ ' + t('timerInvalid'), 'error');
        return;
      }
      setTimer(min);
      presets.forEach(function(b) { b.classList.remove('active'); });
      customBtn.classList.add('active');
      if (typeof showToast === 'function') showToast('⏱️ ' + toLocalNum(min) + ' ' + t('timerSet'), 'success');
    });
  }
  
  updateTimerDisplay();
  updateFocusTotal();
}

function setTimer(minutes) {
  timerTotal = minutes * 60;
  timerSeconds = timerTotal;
  timerRunning = false;
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  updateTimerDisplay();
}

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  timerInterval = setInterval(function() {
    timerSeconds--;
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      timerRunning = false;
      timerSeconds = 0;
      updateTimerDisplay();
      onTimerEnd();
      return;
    }
    updateTimerDisplay();
  }, 1000);
  if (typeof showToast === 'function') showToast('⏱️ ' + t('timerStarted'), 'info');
}

function pauseTimer() {
  if (!timerRunning) return;
  timerRunning = false;
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  if (typeof showToast === 'function') showToast('⏸️ ' + t('timerPaused'), 'info');
}

function resetTimer() {
  timerRunning = false;
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  timerSeconds = timerTotal;
  updateTimerDisplay();
}

function onTimerEnd() {
  const minutes = Math.round(timerTotal / 60);
  const data = getData();
  data.focusMinutes = (data.focusMinutes || 0) + minutes;
  data.points = (data.points || 0) + minutes * 2;
  saveData();
  updateFocusTotal();
  updateLevelBox();
  if (typeof playTimerEndSound === 'function') playTimerEndSound();
  if (typeof showConfetti === 'function') showConfetti();
  if (typeof showToast === 'function') showToast('🎉 ' + toLocalNum(minutes) + ' ' + t('timerCompleted'), 'success');
  if (typeof showNotification === 'function' && typeof hasNotificationPermission === 'function' && hasNotificationPermission()) {
    showNotification('⏱️ ' + t('timerCompleted'), toLocalNum(minutes) + ' ' + t('timerMinutes') + ' 🎯');
  }
  if (typeof checkAchievements === 'function') checkAchievements();
  setTimeout(resetTimer, 2000);
}

function updateTimerDisplay() {
  const display = document.getElementById('timerDisplay');
  if (!display) return;
  const min = Math.floor(timerSeconds / 60);
  const sec = timerSeconds % 60;
  display.textContent = toLocalNum(String(min).padStart(2, '0')) + ':' + toLocalNum(String(sec).padStart(2, '0'));
  display.style.color = (timerSeconds <= 10 && timerSeconds > 0 && timerRunning) ? 'var(--red)' : '';
}

function updateFocusTotal() {
  const el = document.getElementById('focusTotal');
  if (el) el.textContent = toLocalNum(getData().focusMinutes || 0);
}

// ============ آرزوها ============
function setupDreamsTab() {
  ['today', 'week', 'month', 'year'].forEach(function(type) {
    const inputId = 'dream' + capitalize(type) + 'Input';
    const btnId = 'addDream' + capitalize(type) + 'Btn';
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    if (btn && input) {
      btn.addEventListener('click', function() {
        const text = input.value.trim();
        if (!text) return;
        addDream(type, text);
        input.value = '';
        if (typeof playSuccessSound === 'function') playSuccessSound();
        renderDreams();
      });
      input.addEventListener('keypress', function(e) { if (e.key === 'Enter') btn.click(); });
    }
  });
  renderDreams();
}

function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

function renderDreams() {
  ['today', 'week', 'month', 'year'].forEach(function(type) {
    const containerId = 'dreams' + capitalize(type);
    const container = document.getElementById(containerId);
    if (!container) return;
    const dreams = getData().dreams[type] || [];
    if (dreams.length === 0) {
      container.innerHTML = '<div class="empty">' + t('noData') + '</div>';
      return;
    }
    container.innerHTML = dreams.map(function(dream, index) {
      return '<div class="item ' + (dream.done ? 'done' : '') + '" data-dream-type="' + type + '" data-dream-index="' + index + '">' +
        '<input type="checkbox" ' + (dream.done ? 'checked' : '') + ' data-action="toggle-dream">' +
        '<span class="text">' + escapeHtml(dream.text) + '</span>' +
        (dream.done && dream.doneDate ? '<span class="time-badge">✅ ' + dream.doneDate + '</span>' : '') +
        '<div class="item-actions"><button class="delete-btn" data-action="delete-dream">🗑️</button></div>' +
      '</div>';
    }).join('');
    container.querySelectorAll('.item').forEach(function(el) {
      const dreamType = el.dataset.dreamType;
      const dreamIndex = parseInt(el.dataset.dreamIndex);
      const checkbox = el.querySelector('[data-action="toggle-dream"]');
      const deleteBtn = el.querySelector('[data-action="delete-dream"]');
      if (checkbox) checkbox.addEventListener('change', function() {
        toggleDream(dreamType, dreamIndex);
        if (checkbox.checked) {
          if (typeof playAchievementSound === 'function') playAchievementSound();
          if (typeof showConfetti === 'function') showConfetti();
          if (typeof showToast === 'function') showToast('🎯 +۱۰ ' + t('points'), 'success');
        } else {
          if (typeof playTickSound === 'function') playTickSound();
        }
        renderDreams();
        updateLevelBox();
        if (typeof checkAchievements === 'function') checkAchievements();
      });
      if (deleteBtn) deleteBtn.addEventListener('click', function() {
        if (confirm(t('confirmDelete'))) { deleteDream(dreamType, dreamIndex); renderDreams(); }
      });
    });
  });
}

// ============ جایزه ============
function setupRewardsTab() {
  const input = document.getElementById('rewardInput');
  const addBtn = document.getElementById('addRewardBtn');
  const openBoxBtn = document.getElementById('openRewardBox');
  if (addBtn && input) {
    addBtn.addEventListener('click', function() {
      const text = input.value.trim();
      if (!text) return;
      const data = getData();
      if (!data.rewardsList) data.rewardsList = [];
      data.rewardsList.push({ text: text, createdAt: new Date().toISOString() });
      saveData();
      input.value = '';
      renderRewards();
      if (typeof playSuccessSound === 'function') playSuccessSound();
      checkTodayReward();
      renderRewardCard();
    });
    input.addEventListener('keypress', function(e) { if (e.key === 'Enter') addBtn.click(); });
  }
  if (openBoxBtn) openBoxBtn.addEventListener('click', openRewardBox);
  renderRewards();
}

function renderRewards() {
  const container = document.getElementById('rewardsList');
  if (!container) return;
  const rewards = getData().rewardsList || [];
  if (rewards.length === 0) {
    container.innerHTML = '<div class="empty">' + t('noData') + '</div>';
    return;
  }
  container.innerHTML = rewards.map(function(reward, index) {
    return '<div class="item" data-reward-index="' + index + '">' +
      '<span class="text">🎁 ' + escapeHtml(reward.text) + '</span>' +
      '<div class="item-actions"><button class="delete-btn" data-action="delete-reward">🗑️</button></div>' +
    '</div>';
  }).join('');
  container.querySelectorAll('.item').forEach(function(el) {
    const index = parseInt(el.dataset.rewardIndex);
    const deleteBtn = el.querySelector('[data-action="delete-reward"]');
    if (deleteBtn) deleteBtn.addEventListener('click', function() {
      if (confirm(t('confirmDelete'))) {
        getData().rewardsList.splice(index, 1);
        saveData();
        renderRewards();
      }
    });
  });
}

function openRewardBox() {
  const data = getData();
  const rewards = data.rewardsList || [];
  if (rewards.length === 0) { if (typeof showToast === 'function') showToast('⚠️ ' + t('noData'), 'info'); return; }
  const cost = 50;
  if ((data.points || 0) < cost) {
    if (typeof showToast === 'function') showToast('❌ ' + toLocalNum(cost) + ' ' + t('points'), 'error');
    if (typeof playErrorSound === 'function') playErrorSound();
    return;
  }
  const boxBtn = document.getElementById('openRewardBox');
  if (boxBtn) boxBtn.classList.add('opening');
  if (typeof playRewardBoxSound === 'function') playRewardBoxSound();
  setTimeout(function() {
    if (boxBtn) boxBtn.classList.remove('opening');
    data.points -= cost;
    data.lastRewardDate = getToday();
    saveData();
    
    let reward;
    if (typeof isPremium === 'function' && isPremium() && rewards.length > 1) {
      if (Math.random() < 0.6) {
        const sortedRewards = rewards.slice().sort(function(a, b) {
          return (b.text || '').length - (a.text || '').length;
        });
        reward = sortedRewards[Math.floor(Math.random() * Math.ceil(sortedRewards.length / 2))];
      } else {
        reward = rewards[Math.floor(Math.random() * rewards.length)];
      }
    } else {
      reward = rewards[Math.floor(Math.random() * rewards.length)];
    }
    
    const resultEl = document.getElementById('rewardResult');
    if (resultEl) {
      resultEl.classList.remove('hidden');
      resultEl.innerHTML = '<div class="reward-won">' +
        '<div class="reward-emoji">🎉</div>' +
        '<div class="reward-text">' + t('rewardIs') + ':</div>' +
        '<div class="reward-name">🎁 ' + escapeHtml(reward.text) + '</div>' +
      '</div>';
    }
    if (typeof showConfetti === 'function') showConfetti();
    if (typeof playAchievementSound === 'function') playAchievementSound();
    updateLevelBox();
  }, 1500);
}

// ============ یادداشت ============
function setupNoteTab() {
  const textarea = document.getElementById('noteText');
  const tagsInput = document.getElementById('noteTags');
  const saveBtn = document.getElementById('saveNoteBtn');
  const pinBtn = document.getElementById('pinNoteBtn');
  const searchInput = document.getElementById('searchInput');
  if (textarea) textarea.addEventListener('input', function() {
    clearTimeout(window.noteAutoSaveTimer);
    window.noteAutoSaveTimer = setTimeout(saveNote, 2000);
  });
  if (saveBtn) saveBtn.addEventListener('click', function() {
    saveNote();
    if (typeof showToast === 'function') showToast('💾 ' + t('msgSaved'), 'success');
    if (typeof playSuccessSound === 'function') playSuccessSound();
  });
  if (pinBtn) pinBtn.addEventListener('click', function() {
    const today = getToday();
    const data = getData();
    if (!data.pinnedNotes) data.pinnedNotes = [];
    const idx = data.pinnedNotes.indexOf(today);
    if (idx > -1) { data.pinnedNotes.splice(idx, 1); if (typeof showToast === 'function') showToast('📍 ' + t('unpinned'), 'info'); }
    else { data.pinnedNotes.push(today); if (typeof showToast === 'function') showToast('📌 ' + t('pinned'), 'success'); }
    saveData();
  });
  if (searchInput) searchInput.addEventListener('input', function() {
    const q = searchInput.value.trim();
    if (q.length < 2) { const r = document.getElementById('searchResults'); if (r) r.innerHTML = ''; return; }
    performSearch(q);
  });
  renderNote();
}

function saveNote() {
  const textarea = document.getElementById('noteText');
  const tagsInput = document.getElementById('noteTags');
  if (!textarea) return;
  const data = getData();
  const today = getToday();
  if (!data.notes) data.notes = {};
  if (!data.noteTags) data.noteTags = {};
  const text = textarea.value.trim();
  if (!text) { delete data.notes[today]; delete data.noteTags[today]; }
  else {
    data.notes[today] = text;
    if (tagsInput && tagsInput.value.trim()) data.noteTags[today] = tagsInput.value.split(',').map(function(tg) { return tg.trim(); }).filter(Boolean);
  }
  saveData();
}

function renderNote() {
  const textarea = document.getElementById('noteText');
  const tagsInput = document.getElementById('noteTags');
  if (!textarea) return;
  const data = getData();
  const today = getToday();
  textarea.value = data.notes[today] || '';
  if (tagsInput) tagsInput.value = (data.noteTags[today] || []).join(', ');
  renderPinnedNotes();
}

function renderPinnedNotes() {
  const container = document.getElementById('searchResults');
  if (!container || (container.innerHTML && container.innerHTML !== '')) return;
  const data = getData();
  const pinned = data.pinnedNotes || [];
  if (pinned.length === 0) return;
  container.innerHTML = pinned.slice(0, 5).map(function(date) {
    const note = data.notes[date];
    if (!note) return '';
    return '<div class="search-result-item">' +
      '<div class="search-result-type">📌 ' + formatDate(isoToDate(date)) + '</div>' +
      '<div class="search-result-text">' + escapeHtml(note.substring(0, 100)) + (note.length > 100 ? '...' : '') + '</div>' +
    '</div>';
  }).join('');
}

function performSearch(query) {
  const container = document.getElementById('searchResults');
  if (!container) return;
  const q = query.toLowerCase();
  const results = [];
  const data = getData();
  data.habits.forEach(function(h) { if (h.text.toLowerCase().includes(q)) results.push({ type: '📌', text: h.text }); });
  data.tasks.forEach(function(tk) { if (tk.text.toLowerCase().includes(q)) results.push({ type: '✅', text: tk.text }); });
  data.avoids.forEach(function(a) { if (a.text.toLowerCase().includes(q)) results.push({ type: '🚫', text: a.text }); });
  Object.keys(data.dreams).forEach(function(type) {
    (data.dreams[type] || []).forEach(function(d) { if (d.text.toLowerCase().includes(q)) results.push({ type: '🎯', text: d.text }); });
  });
  Object.keys(data.notes || {}).forEach(function(date) {
    if (data.notes[date].toLowerCase().includes(q)) results.push({ type: '📝', text: formatDate(isoToDate(date)) + ': ' + data.notes[date].substring(0, 80) });
  });
  Object.keys(data.diary || {}).forEach(function(date) {
    if (data.diary[date].text.toLowerCase().includes(q)) results.push({ type: '📔', text: formatDate(isoToDate(date)) + ': ' + data.diary[date].text.substring(0, 80) });
  });
  if (results.length === 0) { container.innerHTML = '<div class="empty">' + t('noResults') + '</div>'; return; }
  container.innerHTML = results.slice(0, 20).map(function(r) {
    return '<div class="search-result-item">' +
      '<div class="search-result-type">' + r.type + '</div>' +
      '<div class="search-result-text">' + escapeHtml(r.text) + '</div>' +
    '</div>';
  }).join('');
}

// ============ مودال ویرایش عادت ============
function openEditHabitModal(index) {
  const data = getData();
  const habit = data.habits[index];
  if (!habit) return;
  const existing = document.getElementById('editHabitModal');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'editHabitModal';
  modal.className = 'modal-overlay';
  const dayNames = getDayNames();
  const daysHtml = dayNames.map(function(name, i) {
    const isSelected = habit.days && habit.days.includes(i);
    return '<button class="day-toggle ' + (isSelected ? 'selected' : '') + '" data-day="' + i + '">' + name + '</button>';
  }).join('');
  const categories = getVisibleCategories();
  const catOptions = '<option value="">' + t('noCategory') + '</option>' + categories.map(function(c) {
    return '<option value="' + c.id + '" ' + (habit.cat === c.id ? 'selected' : '') + '>' + c.icon + ' ' + c.name + '</option>';
  }).join('');
  const defaultStart = habit.startDate || '';
  const defaultEnd = habit.endDate || '';
  const startDisplay = defaultStart ? formatDate(isoToDate(defaultStart)) : t('selectDate');
  const endDisplay = defaultEnd ? formatDate(isoToDate(defaultEnd)) : t('selectDate');
  
  modal.innerHTML = 
    '<div class="modal-content edit-habit-modal">' +
      '<button class="modal-close" id="editHabitClose">✕</button>' +
      '<h2>✏️ ' + t('editHabit') + '</h2>' +
      '<label class="edit-row"><span>' + t('editHabitText') + '</span><input type="text" id="editHabitText" value="' + escapeHtml(habit.text) + '"></label>' +
      '<label class="edit-row"><span>' + t('editHabitIcon') + '</span><input type="text" id="editHabitIcon" value="' + (habit.icon || '') + '" maxlength="2" placeholder="' + t('editHabitIconPlaceholder') + '"></label>' +
      '<label class="edit-row"><span>' + t('editHabitTime') + '</span><input type="time" id="editHabitTime" value="' + (habit.time || '') + '"></label>' +
      '<label class="edit-row"><span>' + t('editHabitCategory') + '</span><select id="editHabitCat">' + catOptions + '</select></label>' +
      '<div class="edit-section">' +
        '<div class="edit-section-title">📅 ' + t('editHabitDays') + '</div>' +
        '<div class="edit-hint">' + t('editHabitDaysHint') + '</div>' +
        '<div class="days-grid" id="editHabitDays">' + daysHtml + '</div>' +
        '<button class="quick-days-btn" id="quickEveryDay">' + t('quickEveryDay') + '</button>' +
        '<button class="quick-days-btn" id="quickWeekdays">' + t('quickWeekdays') + '</button>' +
        '<button class="quick-days-btn" id="quickWeekend">' + t('quickWeekend') + '</button>' +
      '</div>' +
      '<div class="edit-section">' +
        '<div class="edit-section-title">🎯 ' + t('editHabitChallenge') + '</div>' +
        '<div class="edit-hint">' + t('editHabitChallengeHint') + '</div>' +
        '<label class="edit-row"><span>' + t('editHabitFrom') + '</span>' +
          '<button type="button" class="date-picker-btn" id="pickStartDate">' + startDisplay + '</button>' +
          '<input type="hidden" id="editHabitStart" value="' + defaultStart + '">' +
        '</label>' +
        '<label class="edit-row"><span>' + t('editHabitTo') + '</span>' +
          '<button type="button" class="date-picker-btn" id="pickEndDate">' + endDisplay + '</button>' +
          '<input type="hidden" id="editHabitEnd" value="' + defaultEnd + '">' +
        '</label>' +
        '<div class="quick-challenge-btns">' +
          '<button class="quick-days-btn" data-days="7">' + t('quick7Days') + '</button>' +
          '<button class="quick-days-btn" data-days="21">' + t('quick21Days') + '</button>' +
          '<button class="quick-days-btn" data-days="30">' + t('quick30Days') + '</button>' +
          '<button class="quick-days-btn" data-days="66">' + t('quick66Days') + '</button>' +
          '<button class="quick-days-btn" data-days="100">' + t('quick100Days') + '</button>' +
          '<button class="quick-days-btn" data-clear>' + t('quickClear') + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="modal-actions">' +
        '<button class="btn-save" id="editHabitSave">💾 ' + t('save') + '</button>' +
        '<button class="btn-delete" id="editHabitDelete">🗑️ ' + t('delete') + '</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);
  setTimeout(function() { modal.classList.add('show'); }, 10);
  
  modal.querySelector('#editHabitClose').addEventListener('click', closeEditModal);
  modal.addEventListener('click', function(e) { if (e.target === modal) closeEditModal(); });
  
  modal.querySelectorAll('.day-toggle').forEach(function(btn) {
    btn.addEventListener('click', function() { btn.classList.toggle('selected'); });
  });
  modal.querySelector('#quickEveryDay').addEventListener('click', function() {
    modal.querySelectorAll('.day-toggle').forEach(function(b) { b.classList.add('selected'); });
  });
  modal.querySelector('#quickWeekdays').addEventListener('click', function() {
    modal.querySelectorAll('.day-toggle').forEach(function(b) {
      const day = parseInt(b.dataset.day);
      b.classList.toggle('selected', day >= 0 && day <= 4);
    });
  });
  modal.querySelector('#quickWeekend').addEventListener('click', function() {
    modal.querySelectorAll('.day-toggle').forEach(function(b) {
      const day = parseInt(b.dataset.day);
      b.classList.toggle('selected', day >= 5);
    });
  });
  
  const startBtn = modal.querySelector('#pickStartDate');
  const endBtn = modal.querySelector('#pickEndDate');
  const startInput = modal.querySelector('#editHabitStart');
  const endInput = modal.querySelector('#editHabitEnd');
  
  if (startBtn) {
    startBtn.addEventListener('click', function() {
      openDatePickerForModal(function(date) {
        startInput.value = date;
        startBtn.textContent = formatDate(isoToDate(date));
      });
    });
  }
  if (endBtn) {
    endBtn.addEventListener('click', function() {
      openDatePickerForModal(function(date) {
        endInput.value = date;
        endBtn.textContent = formatDate(isoToDate(date));
      });
    });
  }
  
  modal.querySelectorAll('.quick-challenge-btns .quick-days-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      if (btn.dataset.clear !== undefined) {
        startInput.value = '';
        endInput.value = '';
        startBtn.textContent = t('selectDate');
        endBtn.textContent = t('selectDate');
        return;
      }
      const days = parseInt(btn.dataset.days);
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + days - 1);
      const startISO = start.toISOString().split('T')[0];
      const endISO = end.toISOString().split('T')[0];
      startInput.value = startISO;
      endInput.value = endISO;
      startBtn.textContent = formatDate(isoToDate(startISO));
      endBtn.textContent = formatDate(isoToDate(endISO));
    });
  });
  
  modal.querySelector('#editHabitSave').addEventListener('click', function() {
    const newText = modal.querySelector('#editHabitText').value.trim();
    if (!newText) { if (typeof showToast === 'function') showToast('❌ ' + t('msgEmpty'), 'error'); return; }
    const selectedDays = [];
    modal.querySelectorAll('.day-toggle.selected').forEach(function(b) { selectedDays.push(parseInt(b.dataset.day)); });
    const startDate = startInput.value || null;
    const endDate = endInput.value || null;
    editItem('habits', index, {
      text: newText,
      icon: modal.querySelector('#editHabitIcon').value.trim(),
      time: modal.querySelector('#editHabitTime').value,
      cat: modal.querySelector('#editHabitCat').value,
      days: selectedDays,
      startDate: startDate,
      endDate: endDate
    });
    if (typeof showToast === 'function') showToast('💾 ' + t('msgSaved'), 'success');
    if (typeof playSuccessSound === 'function') playSuccessSound();
    closeEditModal();
    renderAllItems();
    updateOverallProgress();
    updateMiniStats();
  });
  
  modal.querySelector('#editHabitDelete').addEventListener('click', function() {
    if (confirm(t('confirmDelete'))) {
      deleteItem('habits', index);
      if (typeof showToast === 'function') showToast('🗑️ ' + t('msgDeleted'), 'info');
      closeEditModal();
      renderAllItems();
      updateOverallProgress();
    }
  });
}

function closeEditModal() {
  const modal = document.getElementById('editHabitModal');
  if (!modal) return;
  modal.classList.remove('show');
  setTimeout(function() { modal.remove(); }, 300);
}

// ============ دسته‌بندی‌ها ============
function renderCategoriesList() {
  const container = document.getElementById('categoriesList');
  if (!container) return;
  const categories = getVisibleCategories();
  const data = getData();
  if (categories.length === 0) { container.innerHTML = '<div class="empty">' + t('noData') + '</div>'; return; }
  container.innerHTML = categories.map(function(cat) {
    const isCustom = cat.isCustom === true;
    const habitsCount = data.habits.filter(function(h) { return h.cat === cat.id; }).length;
    return '<div class="category-item">' +
      '<span class="category-color-dot" style="background:' + cat.color + '"></span>' +
      '<span class="category-icon">' + cat.icon + '</span>' +
      '<span class="category-name">' + cat.name + '</span>' +
      '<span class="category-count">' + toLocalNum(habitsCount) + '</span>' +
      '<button class="category-delete-btn" data-cat-del="' + cat.id + '">' + (isCustom ? '🗑️' : '👁️') + '</button>' +
    '</div>';
  }).join('');
  container.querySelectorAll('[data-cat-del]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const catId = btn.dataset.catDel;
      const cat = getCategoryById(catId);
      if (!cat) return;
      if (cat.isCustom) {
        if (confirm(t('confirmDelete'))) {
          deleteCategory(catId);
          renderCategoriesList();
          refreshCategoryFilter();
          if (typeof showToast === 'function') showToast('🗑️ ' + t('msgDeleted'), 'info');
        }
      } else {
        if (confirm(t('confirmDelete'))) {
          hideCategory(catId);
          renderCategoriesList();
          refreshCategoryFilter();
          if (typeof showToast === 'function') showToast('👁️ ' + t('msgDeleted'), 'info');
        }
      }
    });
  });
  const addBtn = document.getElementById('addCategoryBtn');
  if (addBtn && !addBtn.dataset.bound) {
    addBtn.dataset.bound = '1';
    addBtn.addEventListener('click', openAddCategoryModal);
  }
}

function refreshCategoryFilter() {
  const select = document.getElementById('categoryFilter');
  if (!select) return;
  const cats = getVisibleCategories();
  let html = '<option value="all">' + t('allCategories') + '</option>';
  cats.forEach(function(c) { html += '<option value="' + c.id + '"' + (habitCategoryFilter === c.id ? ' selected' : '') + '>' + c.icon + ' ' + c.name + '</option>'; });
  select.innerHTML = html;
}

function openAddCategoryModal() {
  const existing = document.getElementById('addCategoryModal');
  if (existing) existing.remove();
  const EMOJIS = ['✨', '🏃', '📚', '🧘', '💼', '🥗', '👨‍👩‍👧', '🎯', '💪', '🎨', '🎵', '💻', '🌱', '🔬', '🏠', '🚗', '✈️', '💰', '🧠', '❤️'];
  const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#06b6d4', '#64748b', '#f97316', '#8b5cf6'];
  const modal = document.createElement('div');
  modal.id = 'addCategoryModal';
  modal.className = 'modal-overlay';
  modal.innerHTML = 
    '<div class="modal-content edit-habit-modal">' +
      '<button class="modal-close" id="addCatClose">✕</button>' +
      '<h2>➕ ' + t('newCategory') + '</h2>' +
      '<label class="edit-row"><span>' + t('newCategoryName') + '</span><input type="text" id="newCatName" placeholder="' + t('newCategoryNamePlaceholder') + '"></label>' +
      '<div class="edit-section">' +
        '<div class="edit-section-title">' + t('newCategoryIcon') + '</div>' +
        '<div class="emoji-grid" id="emojiGrid">' +
          EMOJIS.map(function(e, i) { return '<button class="emoji-btn ' + (i === 0 ? 'selected' : '') + '" data-emoji="' + e + '">' + e + '</button>'; }).join('') +
        '</div>' +
      '</div>' +
      '<div class="edit-section">' +
        '<div class="edit-section-title">' + t('newCategoryColor') + '</div>' +
        '<div class="color-grid" id="colorGrid">' +
          COLORS.map(function(c, i) { return '<button class="color-btn ' + (i === 0 ? 'selected' : '') + '" data-color="' + c + '" style="background:' + c + '"></button>'; }).join('') +
        '</div>' +
      '</div>' +
      '<div class="modal-actions">' +
        '<button class="btn-save" id="addCatSave">💾 ' + t('save') + '</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);
  setTimeout(function() { modal.classList.add('show'); }, 10);
  let selectedEmoji = EMOJIS[0];
  let selectedColor = COLORS[0];
  modal.querySelector('#addCatClose').addEventListener('click', function() { modal.classList.remove('show'); setTimeout(function() { modal.remove(); }, 300); });
  modal.addEventListener('click', function(e) { if (e.target === modal) { modal.classList.remove('show'); setTimeout(function() { modal.remove(); }, 300); } });
  modal.querySelectorAll('.emoji-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      modal.querySelectorAll('.emoji-btn').forEach(function(b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
      selectedEmoji = btn.dataset.emoji;
    });
  });
  modal.querySelectorAll('.color-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      modal.querySelectorAll('.color-btn').forEach(function(b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
      selectedColor = btn.dataset.color;
    });
  });
  modal.querySelector('#addCatSave').addEventListener('click', function() {
    const name = modal.querySelector('#newCatName').value.trim();
    if (!name) { if (typeof showToast === 'function') showToast('❌ ' + t('msgEmpty'), 'error'); return; }
    addCategory(name, selectedEmoji, selectedColor);
    if (typeof showToast === 'function') showToast('✅ ' + t('msgAdded'), 'success');
    if (typeof playSuccessSound === 'function') playSuccessSound();
    modal.classList.remove('show');
    setTimeout(function() { modal.remove(); }, 300);
    renderCategoriesList();
    refreshCategoryFilter();
  });
}

// ============ Toast ============
function showToast(message, type, duration) {
  type = type || 'info';
  duration = duration || 2500;
  const box = document.getElementById('toastBox');
  if (!box) return;
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.textContent = message;
  box.appendChild(toast);
  setTimeout(function() {
    toast.classList.add('removing');
    setTimeout(function() { toast.remove(); }, 300);
  }, duration);
}

// ============ Confetti ============
function showConfetti(count) {
  count = count || 30;
  const box = document.getElementById('confettiBox');
  if (!box) return;
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#fbbf24', '#10b981', '#ef4444', '#06b6d4'];
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = Math.random() * 0.5 + 's';
    piece.style.animationDuration = (2 + Math.random() * 2) + 's';
    piece.style.width = (5 + Math.random() * 10) + 'px';
    piece.style.height = (5 + Math.random() * 10) + 'px';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    box.appendChild(piece);
    setTimeout(function() { piece.remove(); }, 5000);
  }
}

// ============ Escape HTML ============
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============ خطاها ============
window.addEventListener('error', function(e) { console.error('❌ خطا:', e.error); });
window.addEventListener('unhandledrejection', function(e) { console.error('❌ Promise:', e.reason); });

// ============ Visibility ============
document.addEventListener('visibilitychange', function() {
  if (!document.hidden && appInitialized) {
    try {
      updateHeader();
      updateLevelBox();
      updateOverallProgress();
      checkNewDay();
    } catch (e) {}
  }
});

function checkNewDay() {
  const data = getData();
  const today = getToday();
  if (data.lastOpen && data.lastOpen.split('T')[0] !== today) {
    if (typeof clearOldData === 'function') clearOldData();
    checkTodayChallenge();
    checkTodayReward();
    updateHeader();
    renderAllItems();
    updateOverallProgress();
    renderChallengeCard();
    renderRewardCard();
    renderWaterCard();
    renderBookCard();
  }
  data.lastOpen = new Date().toISOString();
  saveData();
}

// ============ Back button ============
window.addEventListener('popstate', function(e) {
  const modals = document.querySelectorAll('.modal-overlay.show, .date-picker-overlay');
  if (modals.length > 0) {
    modals.forEach(function(m) { m.remove(); });
    e.preventDefault();
    history.pushState(null, '', location.href);
    return;
  }
  if (currentTab !== 'home') {
    switchTab('home');
    e.preventDefault();
    history.pushState(null, '', location.href);
  }
});

history.pushState(null, '', location.href);

window.addEventListener('beforeunload', function() {
  saveData();
  if (typeof saveNote === 'function') saveNote();
});

document.addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveData();
    if (typeof saveNote === 'function') saveNote();
    showToast('💾 ' + t('msgSaved'), 'success');
  }
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.show, .date-picker-overlay').forEach(function(m) { m.remove(); });
  }
});

// ============ قفل‌های پرمیوم ============
function checkChartsAccess() {
  if (typeof canUseAdvancedCharts !== 'function') return true;
  if (canUseAdvancedCharts()) return true;
  const lineChart = document.getElementById('monthlyChart');
  const heatmap = document.getElementById('heatmap');
  const records = document.getElementById('recordsBox');
  const lockHTML = 
    '<div class="premium-lock-panel">' +
      '<div class="premium-lock-icon">🔒</div>' +
      '<div class="premium-lock-title">' + t('premiumLockTitle') + '</div>' +
      '<div class="premium-lock-desc">' + t('premiumLockDesc') + '</div>' +
      '<button class="premium-lock-btn" onclick="if(typeof showPremiumModal === \'function\') showPremiumModal();">👑 ' + t('premiumViewBtn') + '</button>' +
    '</div>';
  if (lineChart) lineChart.innerHTML = lockHTML;
  if (heatmap) heatmap.innerHTML = lockHTML;
  if (records) records.innerHTML = lockHTML;
  return false;
}

function checkPDFAccess() {
  if (typeof canUsePDF !== 'function') return true;
  if (canUsePDF()) return true;
  if (typeof showToast === 'function') showToast('👑 ' + t('premiumLockDesc'), 'info');
  if (typeof showPremiumModal === 'function') showPremiumModal();
  return false;
}

setTimeout(function() {
  if (typeof renderLineChart === 'function') {
    const _renderLineChart = renderLineChart;
    window.renderLineChart = function(containerId, days) {
      if (!checkChartsAccess()) return;
      return _renderLineChart(containerId, days);
    };
  }
  if (typeof renderHeatmap === 'function') {
    const _renderHeatmap = renderHeatmap;
    window.renderHeatmap = function(containerId) {
      if (!checkChartsAccess()) return;
      return _renderHeatmap(containerId);
    };
  }
  if (typeof renderRecords === 'function') {
    const _renderRecords = renderRecords;
    window.renderRecords = function(containerId) {
      if (!checkChartsAccess()) return;
      return _renderRecords(containerId);
    };
  }
  if (typeof downloadDiaryPDF === 'function') {
    const _downloadDiaryPDF = downloadDiaryPDF;
    window.downloadDiaryPDF = function() {
      if (!checkPDFAccess()) return;
      return _downloadDiaryPDF();
    };
  }
  console.log('🔒 Premium locks applied');
}, 500);

// ============ Safe Init ============
function safeInit() {
  if (appInitialized) return;
  appInitialized = true;
  try { init(); } catch (e) { console.error('❌ خطا در init:', e); showFatalError(e); }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', safeInit);
} else {
  setTimeout(safeInit, 100);
}

// ============ PWA ============
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('sw.js')
      .then(function() { console.log('✅ SW ثبت شد'); })
      .catch(function(err) { console.log('⚠️ SW:', err); });
  });
}

console.log('%c🌿 Daily Habits v2.0.0', 'color: #6366f1; font-size: 18px; font-weight: bold;');
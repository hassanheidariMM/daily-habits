/* ============================================
   Daily Habits - Notifications
   یادآوری‌ها و اعلان‌ها
   ============================================ */

// ============ بررسی پشتیبانی ============
function isNotificationSupported() {
  return 'Notification' in window;
}

// ============ درخواست اجازه ============
async function requestNotificationPermission() {
  if (!isNotificationSupported()) {
    console.warn('Notifications پشتیبانی نمی‌شود');
    return false;
  }
  
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (e) {
    console.error('خطا در درخواست اجازه اعلان:', e);
    return false;
  }
}

// ============ چک کردن اجازه ============
function hasNotificationPermission() {
  return isNotificationSupported() && Notification.permission === 'granted';
}

// ============ نمایش اعلان ============
function showNotification(title, body, options = {}) {
  if (!hasNotificationPermission()) return false;
  
  try {
    const notif = new Notification(title, {
      body: body,
      icon: 'icons/icon-192.png',
      badge: 'icons/icon-192.png',
      tag: options.tag || 'daily-habits',
      requireInteraction: options.requireInteraction || false,
      silent: options.silent || false,
      ...options
    });
    
    notif.onclick = function() {
      window.focus();
      if (options.onClick) options.onClick();
      notif.close();
    };
    
    setTimeout(() => {
      try { notif.close(); } catch (e) {}
    }, 10000);
    
    return true;
  } catch (e) {
    console.error('خطا در نمایش اعلان:', e);
    return false;
  }
}

// ============ بررسی یادآوری خواب ============
function checkSleepReminder() {
  const data = getData();
  if (!data.sleepEnabled) return;
  if (!hasNotificationPermission()) return;
  
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const sleepTime = data.sleepTime || '23:00';
  const today = getToday();
  
  if (currentTime === sleepTime && data.notifiedSleepDate !== today) {
    showNotification(
      '🌙 ' + t('sleepReminder'),
      data.sleepMessage || 'وقت خوابه!',
      { tag: 'sleep-reminder', requireInteraction: true }
    );
    
    data.notifiedSleepDate = today;
    saveData();
  }
}

// ============ بررسی یادآوری عادت‌ها ============
function checkHabitReminders() {
  const data = getData();
  if (!data.habitReminders) return;
  if (!hasNotificationPermission()) return;
  
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const today = getToday();
  
  if (!data.notifiedHabits) data.notifiedHabits = {};
  if (!data.notifiedHabits[today]) data.notifiedHabits[today] = [];
  
  // عادت‌های امروز
  const habits = getTodayItems('habits');
  
  habits.forEach(({ item, index }) => {
    if (!item.time) return;
    if (item.time !== currentTime) return;
    if (data.notifiedHabits[today].includes(index)) return;
    if (isItemDone('habits', index)) return;
    
    showNotification(
      '⏰ ' + (item.icon || '📌') + ' ' + item.text,
      t('todayHabits') + ' — ' + t('done') + '؟',
      { tag: 'habit-' + index + '-' + today }
    );
    
    data.notifiedHabits[today].push(index);
  });
  
  // پاک کردن اعلان‌های قدیمی
  Object.keys(data.notifiedHabits).forEach(date => {
    if (date !== today) delete data.notifiedHabits[date];
  });
  
  saveData();
}

// ============ بررسی یادآوری کارها ============
function checkTaskReminders() {
  const data = getData();
  if (!data.taskReminders) return;
  if (!hasNotificationPermission()) return;
  
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const today = getToday();
  
  if (!data.notifiedTasks) data.notifiedTasks = {};
  if (!data.notifiedTasks[today]) data.notifiedTasks[today] = [];
  
  const tasks = getTodayItems('tasks');
  
  tasks.forEach(({ item, index }) => {
    if (!item.time) return;
    if (item.time !== currentTime) return;
    if (data.notifiedTasks[today].includes(index)) return;
    if (isItemDone('tasks', index)) return;
    
    showNotification(
      '📝 ' + item.text,
      t('todayTasks'),
      { tag: 'task-' + index + '-' + today }
    );
    
    data.notifiedTasks[today].push(index);
  });
  
  Object.keys(data.notifiedTasks).forEach(date => {
    if (date !== today) delete data.notifiedTasks[date];
  });
  
  saveData();
}

// ============ یادآوری آب خوردن ============
function checkWaterReminder() {
  const data = getData();
  if (!data.waterReminder) return;
  if (!hasNotificationPermission()) return;
  
  const now = Date.now();
  const intervalMs = (data.waterInterval || 60) * 60 * 1000;
  const lastNotif = data.lastWaterNotif || 0;
  
  if (now - lastNotif >= intervalMs) {
    // بررسی ساعت بیداری (۸ صبح تا ۱۰ شب)
    const hour = new Date().getHours();
    if (hour < 8 || hour >= 22) return;
    
    showNotification(
      '💧 ' + t('waterReminder'),
      'یه لیوان آب بخور! 💙',
      { tag: 'water-reminder' }
    );
    
    data.lastWaterNotif = now;
    saveData();
  }
}

// ============ بررسی‌کننده اصلی ============
let notifCheckerInterval = null;

function startNotificationChecker() {
  // چک کردن هر دقیقه
  if (notifCheckerInterval) clearInterval(notifCheckerInterval);
  
  // اولین بررسی بعد از ۵ ثانیه
  setTimeout(runAllChecks, 5000);
  
  notifCheckerInterval = setInterval(runAllChecks, 60000);
}

function runAllChecks() {
  try {
    checkSleepReminder();
    checkHabitReminders();
    checkTaskReminders();
    checkWaterReminder();
  } catch (e) {
    console.error('خطا در بررسی اعلان‌ها:', e);
  }
}

// ============ توقف بررسی ============
function stopNotificationChecker() {
  if (notifCheckerInterval) {
    clearInterval(notifCheckerInterval);
    notifCheckerInterval = null;
  }
}

// ============ اعلان تست ============
async function testNotification() {
  const granted = await requestNotificationPermission();
  if (!granted) {
    if (typeof showToast === 'function') {
      showToast('❌ اجازه اعلان داده نشد', 'error');
    }
    return;
  }
  
  showNotification(
    '🔔 ' + (t('appName') || 'Daily Habits'),
    'این یه اعلان تستیه! اگه می‌بینی‌اش، همه چیز درسته ✅',
    { tag: 'test' }
  );
  
  if (typeof showToast === 'function') {
    showToast('🔔 اعلان تست ارسال شد', 'success');
  }
}

// ============ اعلان یادآوری خاص ============
function sendReminderNotification(title, body) {
  if (!hasNotificationPermission()) return;
  showNotification(title, body, { tag: 'reminder-' + Date.now() });
}

// ============ چک کردن اینکه اپ در حال اجراست ============
function isAppActive() {
  return !document.hidden;
}

// ============ اعلان دستاورد ============
function notifyAchievement(achievement) {
  if (!hasNotificationPermission()) return;
  
  showNotification(
    achievement.icon + ' ' + achievement.name,
    achievement.desc,
    { tag: 'achievement-' + achievement.id, requireInteraction: true }
  );
}

// ============ اعلان تشویقی ============
function sendMotivationalNotification() {
  const messages = [
    '💪 امروز روز توئه!',
    '🌟 یه قدم کوچیک هم پیشرفته',
    '🔥 ادامه بده، داری عالی پیش می‌ری',
    '🎯 هدف‌هات منتظرن!',
    '⭐ تو می‌تونی!',
    '🚀 امروز بهتر از دیروز باش',
    '💎 هر روز یه قدم به موفقیت نزدیک‌تر'
  ];
  
  const msg = messages[Math.floor(Math.random() * messages.length)];
  
  showNotification(
    '🔔 ' + (t('appName') || 'Daily Habits'),
    msg,
    { tag: 'motivation' }
  );
}

// ============ زمان‌بندی یادآوری روزانه ============
function scheduleDailyReminder() {
  const now = new Date();
  const target = new Date();
  target.setHours(9, 0, 0, 0);
  
  if (now > target) {
    target.setDate(target.getDate() + 1);
  }
  
  const delay = target - now;
  
  setTimeout(() => {
    sendMotivationalNotification();
    scheduleDailyReminder();
  }, delay);
}

// ============ ذخیره‌سازی زمان‌بندی ============
function saveNotificationSettings(settings) {
  const data = getData();
  if (settings.sleepEnabled !== undefined) data.sleepEnabled = settings.sleepEnabled;
  if (settings.sleepTime !== undefined) data.sleepTime = settings.sleepTime;
  if (settings.sleepMessage !== undefined) data.sleepMessage = settings.sleepMessage;
  if (settings.habitReminders !== undefined) data.habitReminders = settings.habitReminders;
  if (settings.taskReminders !== undefined) data.taskReminders = settings.taskReminders;
  if (settings.waterReminder !== undefined) data.waterReminder = settings.waterReminder;
  if (settings.waterInterval !== undefined) data.waterInterval = settings.waterInterval;
  saveData();
}

// ============ راه‌اندازی ============
function initNotifications() {
  if (!isNotificationSupported()) {
    console.log('⚠️ Notifications پشتیبانی نمی‌شود');
    return;
  }
  
  // شروع بررسی
  startNotificationChecker();
  
  // زمان‌بندی یادآوری روزانه
  scheduleDailyReminder();
  
  // بررسی اولیه اجازه
  if (Notification.permission === 'default') {
    console.log('💡 برای دریافت یادآوری‌ها، اجازه اعلان بده');
  }
  
  console.log('✅ Notifications راه‌اندازی شد');
}

// ============ اعلان ورود به اپ ============
function notifyWelcomeBack() {
  const data = getData();
  const today = getToday();
  
  if (data.lastOpen && data.lastOpen.split('T')[0] !== today) {
    // کاربر دیروز وارد شده
    const yesterday = getDateAgoISO(1);
    const streak = getOverallStreak();
    
    if (streak > 0) {
      console.log(`🔥 استریک تو: ${streak} روز`);
    }
  }
}

console.log('✅ notifications.js بارگذاری شد');
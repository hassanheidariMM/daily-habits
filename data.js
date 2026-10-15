/* ============================================
   Daily Habits - Data
   ============================================ */

const DEFAULT_DATA = {
  habits: [],
  tasks: [],
  avoids: [],
  dreams: { today: [], week: [], month: [], year: [] },
  history: {},
  notes: {},
  noteTags: {},
  pinnedNotes: [],
  rewardsList: [],
  lastRewardDate: null,
  diary: {},
  points: 0,
  focusMinutes: 0,
  userName: '',
  password: null,
  passwordLockEnabled: false,
  bgImage: null,
  colorTheme: 'indigo',
  font: '',
  darkMode: true,
  calendarType: 'jalali',
  language: 'fa',
  soundType: 'tick1',
  soundEnabled: true,
  vibrateEnabled: true,
  vibrateMs: 30,
  sleepEnabled: false,
  sleepTime: '23:00',
  sleepMessage: 'وقت خوابه! 🌙',
  notifiedSleepDate: null,
  notifiedHabits: {},
  notifiedTasks: {},
  habitReminders: true,
  taskReminders: true,
  waterReminder: false,
  waterInterval: 60,
  lastWaterNotif: null,
  musicOn: false,
  selfMessage: '',
  customMotivation: null,
  moods: {},
  water: {},
  cupSize: 250,
  waterGoal: 8,
  waterReminderEnabled: false,
  lastWaterDate: null,
  books: {},
  booksTotal: 0,
  autoBackup: false,
  lastBackupDate: null,
  lastResetDate: null,
  isPremium: false,
  premiumType: null,
  premiumDate: null,
  premiumActivatedAt: null,
  adsEnabled: true,
  adsRemoved: false,
  appVersion: '2.0.0',
  firstLaunch: null,
  lastOpen: null,
  unlockedAchievements: [],
  selectedDate: null,
  customCategories: [],
  hiddenCategories: [],
  todayChallenge: null,
  lastChallengeDate: null,
  todayReward: null,
  lastRewardPickDate: null
};

// ============ ۵۵ چالش روزانه ============
const DAILY_CHALLENGES = [
  '🚶 امروز ۳۰ دقیقه پیاده‌روی کن',
  '💧 امروز ۸ لیوان آب بخور',
  '🥗 امروز یه وعده سالم بخور',
  '🏃 امروز ۲۰ دقیقه ورزش کن',
  '😴 امشب زودتر از همیشه بخواب',
  '🧘 امروز ۱۰ دقیقه مدیتیشن کن',
  '🍎 امروز یه میوه تازه بخور',
  '🚫 امروز نوشابه نخور',
  '🧗 امروز از پله‌ها استفاده کن، نه آسانسور',
  '🌅 امروز صبح زود بیدار شو',
  '🍵 امروز یه چای سبز بخور',
  '🥜 امروز یه مشت آجیل سالم بخور',
  '📖 امروز ۱۰ صفحه کتاب بخون',
  '🎓 امروز یه چیز جدید یاد بگیر',
  '✍️ امروز یه صفحه بنویس',
  '🎧 امروز یه پادکست آموزشی گوش کن',
  '🌐 امروز ۵ لغت جدید انگلیسی یاد بگیر',
  '📝 چیزی که امروز یاد گرفتی رو بنویس',
  '🎥 امروز یه ویدیوی آموزشی ببین',
  '🧠 یه معما یا سودوکو حل کن',
  '📰 امروز یه خبر خوب بخون',
  '🎨 امروز یه چیز خلاقانه بساز',
  '👨‍👩‍👧 امروز با خانواده وقت بگذرون',
  '📞 به یه دوست قدیمی زنگ بزن',
  '💌 به یه نفر پیام محبت‌آمیز بفرست',
  '🎁 به یه نفر یه هدیه کوچیک بده',
  '🍽️ امروز با خانواده شام بخور',
  '🤝 امروز به یه نفر کمک کن',
  '👂 به حرف کسی با دقت گوش کن',
  '💐 امروز به مامان یا بابات یه کار خوب بکن',
  '👶 امروز با بچه‌ها بازی کن',
  '☕ یه دوست رو به چای دعوت کن',
  '🚫 امروز اصلاً تنبلی نکن',
  '🙏 امروز شکرگزاری کن — ۵ چیز رو بنویس',
  '📔 امروز تو دفتر خاطرات بنویس',
  '🎯 امروز یه هدف کوچیک تعیین کن',
  '🧹 اتاقت رو امروز مرتب کن',
  '📱 امروز کمتر با گوشی کار کن',
  '💭 امروز ۵ دقیقه سکوت و تمرکز کن',
  '🎵 امروز به موسیقی آرام گوش بده',
  '🌳 امروز یه ذره تو طبیعت وقت بگذرون',
  '💤 امروز یه چرت کوتاه ۲۰ دقیقه‌ای بزن',
  '😊 امروز به ۳ نفر لبخند بزن',
  '📋 امروز یه لیست کار بنویس',
  '✅ سخت‌ترین کارت رو اول انجام بده',
  '📵 امروز یه ساعت بدون گوشی کار کن',
  '🗂️ ایمیل‌هات رو امروز مرتب کن',
  '🎯 امروز فقط روی یه کار تمرکز کن',
  '⏰ امروز کارت رو زودتر تموم کن',
  '📅 فردات رو الان برنامه‌ریزی کن',
  '💰 امروز یه ذره پس‌انداز کن',
  '🗑️ یه چیزی رو که لازم نداری ببخش',
  '🎨 امروز یه نقاشی بکش',
  '✍️ امروز یه شعر یا داستان کوتاه بنویس',
  '🎵 یه آهنگ جدید یاد بگیر'
];

let appData = null;
const STORAGE_KEY = 'dailyHabitsData_v2';

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      appData = deepMerge(JSON.parse(JSON.stringify(DEFAULT_DATA)), parsed);
    } else {
      appData = JSON.parse(JSON.stringify(DEFAULT_DATA));
      appData.firstLaunch = new Date().toISOString();
    }
    ensureDataStructure();
    appData.lastOpen = new Date().toISOString();
    if (!appData.selectedDate) appData.selectedDate = getToday();
    return appData;
  } catch (e) {
    console.error('خطا در بارگذاری:', e);
    appData = JSON.parse(JSON.stringify(DEFAULT_DATA));
    return appData;
  }
}

function ensureDataStructure() {
  if (!appData.dreams) appData.dreams = { today: [], week: [], month: [], year: [] };
  ['today','week','month','year'].forEach(function(k) {
    if (!appData.dreams[k]) appData.dreams[k] = [];
  });
  if (!appData.history) appData.history = {};
  if (!appData.notes) appData.notes = {};
  if (!appData.noteTags) appData.noteTags = {};
  if (!appData.pinnedNotes) appData.pinnedNotes = [];
  if (!appData.diary) appData.diary = {};
  if (!appData.rewardsList) appData.rewardsList = [];
  if (!appData.moods) appData.moods = {};
  if (!appData.water) appData.water = {};
  if (!appData.books) appData.books = {};
  if (!appData.notifiedHabits) appData.notifiedHabits = {};
  if (!appData.notifiedTasks) appData.notifiedTasks = {};
  if (!appData.unlockedAchievements) appData.unlockedAchievements = [];
  if (!appData.customCategories) appData.customCategories = [];
  if (!appData.hiddenCategories) appData.hiddenCategories = [];
  if (!Array.isArray(appData.habits)) appData.habits = [];
  if (!Array.isArray(appData.tasks)) appData.tasks = [];
  if (!Array.isArray(appData.avoids)) appData.avoids = [];
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    return true;
  } catch (e) {
    console.error('خطا در ذخیره:', e);
    return false;
  }
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && source[key] !== null) {
        result[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  return result;
}

function clearAllData() {
  localStorage.removeItem(STORAGE_KEY);
  appData = JSON.parse(JSON.stringify(DEFAULT_DATA));
  appData.firstLaunch = new Date().toISOString();
  appData.selectedDate = getToday();
  saveData();
}

function getData() {
  if (!appData) loadData();
  return appData;
}

function updateData(key, value) {
  if (!appData) loadData();
  appData[key] = value;
  saveData();
}

function getField(key) {
  if (!appData) loadData();
  return appData[key];
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getDateAgo(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function getTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function getSelectedDate() {
  const data = getData();
  return data.selectedDate || getToday();
}

function setSelectedDate(dateStr) {
  const data = getData();
  data.selectedDate = dateStr;
  saveData();
}

function toFa(num) { return String(num).replace(/\d/g, function(d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; }); }
function toAr(num) { return String(num).replace(/\d/g, function(d) { return '٠١٢٣٤٥٦٧٨٩'[d]; }); }
function toHi(num) { return String(num).replace(/\d/g, function(d) { return '०१२३४५६७८९'[d]; }); }

function toLocalNum(num) {
  const lang = getData().language || 'fa';
  switch (lang) {
    case 'fa': return toFa(num);
    case 'ar': return toAr(num);
    case 'hi': return toHi(num);
    default: return String(num);
  }
}

function parseLocalNum(str) {
  return String(str)
    .replace(/[۰-۹]/g, function(d) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); })
    .replace(/[٠-٩]/g, function(d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); })
    .replace(/[०-९]/g, function(d) { return '०१२३४५६७८९'.indexOf(d); });
}

function ensureHistoryDay(dateStr) {
  const data = getData();
  if (!data.history[dateStr]) {
    data.history[dateStr] = { habits: [], tasks: [], avoids: [], dreamsToday: [] };
  }
  if (!data.history[dateStr].habits) data.history[dateStr].habits = [];
  if (!data.history[dateStr].tasks) data.history[dateStr].tasks = [];
  if (!data.history[dateStr].avoids) data.history[dateStr].avoids = [];
  if (!data.history[dateStr].dreamsToday) data.history[dateStr].dreamsToday = [];
  return data.history[dateStr];
}

function getHistoryDay(dateStr) {
  const data = getData();
  return data.history[dateStr] || { habits: [], tasks: [], avoids: [], dreamsToday: [] };
}

function getAppVersion() { return '2.0.0'; }
function isFirstLaunch() {
  const data = getData();
  return !data.firstLaunch || data.firstLaunch === null;
}

loadData();
console.log('✅ data.js بارگذاری شد');
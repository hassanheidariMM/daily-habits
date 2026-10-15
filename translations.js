// ============ اتصال و توابع ترجمه ============

// همه‌ی آبجکت‌ها رو توی یه جا جمع می‌کنیم
window.translations = {
  fa: window.translations_fa,
  en: window.translations_en,
  ar: window.translations_ar,
  de: window.translations_de,
  es: window.translations_es,
  fr: window.translations_fr,
  it: window.translations_it,
  pt: window.translations_pt,
  ru: window.translations_ru,
  tr: window.translations_tr,
  zh: window.translations_zh,
  ja: window.translations_ja,
  ko: window.translations_ko,
  hi: window.translations_hi,
  uk: window.translations_uk
};

// ============ اطلاعات زبان‌ها ============
window.languages = [
  { code: 'fa', name: 'فارسی',        flag: '🇮🇷', dir: 'rtl', calendar: 'jalali' },
  { code: 'en', name: 'English',      flag: '🇬🇧', dir: 'ltr', calendar: 'gregorian' },
  { code: 'ar', name: 'العربية',      flag: '🇸🇦', dir: 'rtl', calendar: 'hijri' },
  { code: 'tr', name: 'Türkçe',       flag: '🇹🇷', dir: 'ltr', calendar: 'gregorian' },
  { code: 'de', name: 'Deutsch',      flag: '🇩🇪', dir: 'ltr', calendar: 'gregorian' },
  { code: 'es', name: 'Español',      flag: '🇪🇸', dir: 'ltr', calendar: 'gregorian' },
  { code: 'fr', name: 'Français',     flag: '🇫🇷', dir: 'ltr', calendar: 'gregorian' },
  { code: 'it', name: 'Italiano',     flag: '🇮🇹', dir: 'ltr', calendar: 'gregorian' },
  { code: 'pt', name: 'Português',    flag: '🇵🇹', dir: 'ltr', calendar: 'gregorian' },
  { code: 'ru', name: 'Русский',      flag: '🇷🇺', dir: 'ltr', calendar: 'gregorian' },
  { code: 'zh', name: '中文',          flag: '🇨🇳', dir: 'ltr', calendar: 'gregorian' },
  { code: 'ja', name: '日本語',        flag: '🇯🇵', dir: 'ltr', calendar: 'gregorian' },
  { code: 'ko', name: '한국어',        flag: '🇰🇷', dir: 'ltr', calendar: 'gregorian' },
  { code: 'hi', name: 'हिन्दी',         flag: '🇮🇳', dir: 'ltr', calendar: 'gregorian' },
  { code: 'uk', name: 'Українська',   flag: '🇺🇦', dir: 'ltr', calendar: 'gregorian' }
];

// alias برای سازگاری با settings.js
window.SUPPORTED_LANGS = window.languages;

// ============ زبان فعلی ============
// اول از localStorage، بعد از data.language (اگه data آماده باشه)
window.currentLang = localStorage.getItem('lang') || 'fa';

// ============ گرفتن ترجمه ============
window.t = function(key, lang) {
  const l = lang || window.currentLang || 'fa';
  const dict = window.translations[l] || window.translations.fa;
  return dict[key] !== undefined ? dict[key] : (window.translations.fa[key] || key);
};

// ============ گرفتن آرایه ============
window.tArr = function(key, lang) {
  const l = lang || window.currentLang || 'fa';
  const dict = window.translations[l] || window.translations.fa;
  return Array.isArray(dict[key]) ? dict[key] : (window.translations.fa[key] || []);
};

// ============ تنظیم زبان ============
window.setLanguage = function(lang) {
  if (!window.translations[lang]) lang = 'fa';
  window.currentLang = lang;
  localStorage.setItem('lang', lang);

  // ذخیره توی data هم (برای اینکه رفرش یادش بمونه)
  try {
    if (typeof getData === 'function' && typeof saveData === 'function') {
      const data = getData();
      if (data) {
        data.language = lang;
        saveData();
      }
    }
  } catch(e) { console.warn('setLanguage: save failed', e); }

  // تنظیم جهت صفحه
  const langInfo = window.languages.find(x => x.code === lang);
  const dir = langInfo ? langInfo.dir : 'rtl';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', lang);

  // اپدیت همه‌ی متن‌ها
  window.applyLanguage();

  // اگه تابع renderAll هست، صدا بزن
  if (typeof window.renderAll === 'function') {
    try { window.renderAll(); } catch(e) {}
  }

  // اپدیت سلکت زبان
  const sel = document.getElementById('settingLanguage');
  if (sel) sel.value = lang;
};

// ============ اعمال ترجمه روی DOM ============
window.applyLanguage = function(lang) {
  // حالت اول: آرگومان گرفت → setLanguage
  if (lang && window.translations[lang] && lang !== window.currentLang) {
    return window.setLanguage(lang);
  }

  // حالت دوم: فقط UI رو آپدیت کن
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = window.t(key);
    if (val !== undefined && val !== null) el.textContent = val;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const val = window.t(key);
    if (val) el.setAttribute('placeholder', val);
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const val = window.t(key);
    if (val) el.setAttribute('title', val);
  });
};

// alias قدیمی
window.applyTranslations = window.applyLanguage;

// ============ پر کردن سلکت زبان ============
window.fillLanguageSelect = function() {
  const sel = document.getElementById('settingLanguage');
  if (!sel) return;
  sel.innerHTML = '';
  window.languages.forEach(lang => {
    const opt = document.createElement('option');
    opt.value = lang.code;
    opt.textContent = lang.flag + ' ' + lang.name;
    if (lang.code === window.currentLang) opt.selected = true;
    sel.appendChild(opt);
  });
};

// ============ راه‌اندازی اولیه ============
document.addEventListener('DOMContentLoaded', () => {
  // هماهنگی بین localStorage و data.language
  try {
    if (typeof getData === 'function') {
      const data = getData();
      const storedLang = localStorage.getItem('lang');
      // اگه توی localStorage هست ولی data نداره یا فرق داره → localStorage رو ترجیح بده
      if (storedLang && window.translations[storedLang]) {
        window.currentLang = storedLang;
        if (data && data.language !== storedLang) {
          data.language = storedLang;
          if (typeof saveData === 'function') saveData();
        }
      } else if (data && data.language && window.translations[data.language]) {
        // اگه data داره ولی localStorage نداره → از data بردار
        window.currentLang = data.language;
        localStorage.setItem('lang', data.language);
      }
    }
  } catch(e) { console.warn('lang sync failed', e); }

  // جهت اولیه
  const langInfo = window.languages.find(x => x.code === window.currentLang);
  const dir = langInfo ? langInfo.dir : 'rtl';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', window.currentLang);

  // پر کردن سلکت زبان
  window.fillLanguageSelect();

  // اولین اعمال ترجمه
  setTimeout(() => window.applyLanguage(), 50);
});
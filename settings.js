/* ============================================
   Daily Habits - Settings
   تنظیمات + تم + فونت + ترجمه
   ============================================ */

// ============ اعمال تم ============
function applyTheme(themeName) {
  if (!themeName) themeName = 'indigo';
  const data = getData();
  data.colorTheme = themeName;
  document.body.className = document.body.className.split(' ').filter(function(c) { return !c.startsWith('theme-'); }).join(' ').trim();
  document.body.classList.add('theme-' + themeName);
  if (data.darkMode === false) document.body.classList.add('light');
  else document.body.classList.remove('light');
  if (data.bgImage) {
    document.body.classList.add('has-bg-image');
    document.body.style.backgroundImage = 'url(' + data.bgImage + ')';
  } else {
    document.body.classList.remove('has-bg-image');
    document.body.style.backgroundImage = '';
  }
  const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme && themeColor) metaTheme.content = themeColor;
  saveData();
  updateThemeSelection();
}

// ============ تم‌ها ============
const THEMES = [
  { id: 'indigo', name: 'نیلی', premium: false },
  { id: 'blue', name: 'آبی', premium: false },
  { id: 'purple', name: 'بنفش', premium: false },
  { id: 'green', name: 'سبز', premium: false },
  { id: 'pink', name: 'صورتی', premium: false },
  { id: 'orange', name: 'نارنجی', premium: false },
  { id: 'teal', name: 'فیروزه‌ای', premium: false },
  { id: 'red', name: 'قرمز', premium: false },
  { id: 'yellow', name: 'زرد', premium: false },
  { id: 'rose', name: 'رز', premium: false },
  { id: 'cyan', name: 'سایان', premium: false },
  { id: 'lime', name: 'لیمویی', premium: false },
  { id: 'amber', name: 'کهربایی', premium: false },
  { id: 'emerald', name: 'زمرد', premium: false },
  { id: 'sky', name: 'آسمان', premium: false },
  { id: 'violet', name: 'بنفشه', premium: false },
  { id: 'fuchsia', name: 'سرخابی', premium: false },
  { id: 'slate', name: 'خاکستری', premium: false },
  { id: 'coral', name: 'مرجانی', premium: false },
  { id: 'mint', name: 'نعنایی', premium: false },
  { id: 'ramadan', name: 'رمضان 🌙', premium: false },
  { id: 'muharram', name: 'محرم 🕌', premium: false },
  { id: 'nowruz', name: 'نوروز 🌷', premium: false },
  { id: 'space', name: 'فضا 🌌', premium: false },
  { id: 'fire', name: 'آتش 🔥', premium: false },
  { id: 'gold', name: 'طلایی 👑', premium: true },
  { id: 'diamond', name: 'الماس 💎', premium: true },
  { id: 'royal', name: 'سلطنتی 👑', premium: true },
  { id: 'galaxy', name: 'کهکشان 🌌', premium: true },
  { id: 'ocean', name: 'اقیانوس 🌊', premium: true },
  { id: 'sunset', name: 'غروب 🌅', premium: true },
  { id: 'aurora', name: 'شفق ✨', premium: true },
  { id: 'lava', name: 'گدازه 🌋', premium: true },
  { id: 'winter', name: 'زمستان ❄️', premium: true },
  { id: 'spring', name: 'بهار 🌸', premium: true },
  { id: 'autumn', name: 'پاییز 🍁', premium: true },
  { id: 'christmas', name: 'کریسمس 🎄', premium: true },
  { id: 'halloween', name: 'هالووین 🎃', premium: true },
  { id: 'valentine', name: 'ولنتاین 💖', premium: true },
  { id: 'eid', name: 'عید فطر 🎉', premium: true },
  { id: 'yalda', name: 'یلدا 🍉', premium: true }
];

function renderThemes() {
  const container = document.getElementById('themePreview');
  if (!container) return;
  const data = getData();
  const currentTheme = data.colorTheme || 'indigo';
  const isPremiumUser = data.isPremium || false;
  container.innerHTML = THEMES.map(function(theme) {
    const isLocked = theme.premium && !isPremiumUser;
    const isActive = theme.id === currentTheme;
    return '<div class="theme-option ' + (isActive ? 'active' : '') + ' ' + (isLocked ? 'premium-locked' : '') + '" data-theme="' + theme.id + '" title="' + theme.name + '"></div>';
  }).join('');
  container.querySelectorAll('.theme-option').forEach(function(el) {
    el.addEventListener('click', function() {
      const themeId = el.dataset.theme;
      const theme = THEMES.find(function(t) { return t.id === themeId; });
      if (theme.premium && !getData().isPremium) {
        if (typeof showToast === 'function') showToast('👑 ' + t('themePremium'), 'info');
        if (typeof showPremiumModal === 'function') showPremiumModal();
        return;
      }
      applyTheme(themeId);
      if (typeof playClickSound === 'function') playClickSound();
      if (typeof showToast === 'function') showToast('🎨 ' + t('themeChanged'), 'success');
    });
  });
}

function updateThemeSelection() {
  const container = document.getElementById('themePreview');
  if (!container) return;
  const currentTheme = getData().colorTheme || 'indigo';
  container.querySelectorAll('.theme-option').forEach(function(el) {
    el.classList.toggle('active', el.dataset.theme === currentTheme);
  });
}

function toggleDarkMode(enabled) {
  const data = getData();
  data.darkMode = enabled;
  saveData();
  applyTheme(data.colorTheme);
}

// ============ زبان ============
function changeLanguage(lang) {
  const data = getData();
  data.language = lang;
  saveData();
  applyLanguage(lang);
  updateSelectsValues();
  renderThemes();
  renderFontSelect();
  renderSoundSettings();
  renderVibrateSettings();
  renderCategoriesList();
  if (typeof updateHeader === 'function') updateHeader();
  if (typeof renderChallengeCard === 'function') renderChallengeCard();
  if (typeof renderRewardCard === 'function') renderRewardCard();
  if (typeof renderWaterCard === 'function') renderWaterCard();
  if (typeof renderBookCard === 'function') renderBookCard();
  if (typeof renderAllItems === 'function') renderAllItems();
  if (typeof updateOverallProgress === 'function') updateOverallProgress();
  if (typeof renderDreams === 'function') renderDreams();
  if (typeof renderRewards === 'function') renderRewards();
  if (typeof renderNote === 'function') renderNote();
  if (typeof updateDayNav === 'function') updateDayNav();
  if (typeof showToast === 'function') showToast('🌍 ' + t('language'), 'success');
}

function renderLanguageSelect() {
  const select = document.getElementById('settingLanguage');
  if (!select) return;
  const currentLang = getData().language || 'fa';
  select.innerHTML = SUPPORTED_LANGS.map(function(lang) {
    return '<option value="' + lang.code + '" ' + (lang.code === currentLang ? 'selected' : '') + '>' + lang.flag + ' ' + lang.name + '</option>';
  }).join('');
  select.addEventListener('change', function(e) { changeLanguage(e.target.value); });
}

// ============ تقویم ============
function changeCalendar(type) {
  const data = getData();
  data.calendarType = type;
  saveData();
  if (typeof updateHeader === 'function') updateHeader();
  if (typeof refreshAllTabs === 'function') refreshAllTabs();
  if (typeof showToast === 'function') showToast('📅 ' + t('calendarType'), 'success');
}

function renderCalendarSelect() {
  const select = document.getElementById('settingCalendar');
  if (!select) return;
  select.value = getData().calendarType || 'jalali';
  select.addEventListener('change', function(e) { changeCalendar(e.target.value); });
}

// ============ نام کاربر ============
function changeUserName(name) {
  const data = getData();
  data.userName = name.trim();
  saveData();
  if (typeof updateHeader === 'function') updateHeader();
}

function renderNameInput() {
  const input = document.getElementById('settingName');
  if (!input) return;
  input.value = getData().userName || '';
  input.addEventListener('change', function(e) { changeUserName(e.target.value); });
}

// ============ پسورد ============
function togglePasswordLock(enabled) {
  const data = getData();
  data.passwordLockEnabled = enabled;
  if (!enabled) data.password = null;
  saveData();
  if (typeof showToast === 'function') showToast(enabled ? '🔒 ✓' : '🔓 ✓', 'success');
}

function setPassword(pass) {
  if (!pass || pass.length < 4) {
    if (typeof showToast === 'function') showToast('❌ 4+', 'error');
    return false;
  }
  const data = getData();
  data.password = pass;
  data.passwordLockEnabled = true;
  saveData();
  if (typeof showToast === 'function') showToast('🔒 ✓', 'success');
  return true;
}

function renderLockSettings() {
  const checkbox = document.getElementById('settingLock');
  const input = document.getElementById('settingPassword');
  if (!checkbox) return;
  const data = getData();
  checkbox.checked = data.passwordLockEnabled || false;
  checkbox.addEventListener('change', function(e) {
    if (e.target.checked) {
      if (data.password) togglePasswordLock(true);
      else { if (input) input.focus(); e.target.checked = false; }
    } else {
      togglePasswordLock(false);
    }
  });
  if (input) {
    input.addEventListener('change', function(e) {
      const pass = e.target.value.trim();
      if (pass) {
        setPassword(pass);
        if (checkbox) checkbox.checked = true;
        e.target.value = '';
      }
    });
  }
}

// ============ فونت‌ها ============
const FONTS = [
  { id: 'default', name: 'پیش‌فرض / Default', family: "'Vazirmatn', 'Segoe UI', Tahoma, sans-serif", lang: 'fa', premium: false },
  { id: 'vazir', name: 'وزیرمتن', family: "'Vazirmatn', sans-serif", lang: 'fa', premium: false },
  { id: 'sahel', name: 'ساحل', family: "'Sahel', Tahoma, sans-serif", lang: 'fa', premium: false },
  { id: 'yekan', name: 'یکان', family: "'Yekan', Tahoma, sans-serif", lang: 'fa', premium: false },
  { id: 'kalameh', name: 'کلمه', family: "'Kalameh', Tahoma, sans-serif", lang: 'fa', premium: false },
  { id: 'dana', name: 'دانا', family: "'Dana', Tahoma, sans-serif", lang: 'fa', premium: false },
  { id: 'tahoma', name: 'تاهوما / Tahoma', family: "Tahoma, sans-serif", lang: 'fa', premium: false },
  { id: 'shabnam', name: 'شبنم 👑', family: "'Shabnam', Tahoma, sans-serif", lang: 'fa', premium: true },
  { id: 'samim', name: 'صمیم 👑', family: "'Samim', Tahoma, sans-serif", lang: 'fa', premium: true },
  { id: 'tanha', name: 'تنها 👑', family: "'Tanha', Tahoma, sans-serif", lang: 'fa', premium: true },
  { id: 'gandom', name: 'گندم 👑', family: "'Gandom', Tahoma, sans-serif", lang: 'fa', premium: true },
  { id: 'nazanin', name: 'نازنین 👑', family: "'Nazanin', 'B Nazanin', Tahoma, sans-serif", lang: 'fa', premium: true },
  { id: 'iranian-sans', name: 'ایرانیان سنس 👑', family: "'IRANSans', Tahoma, sans-serif", lang: 'fa', premium: true },
  { id: 'estedad', name: 'استعداد 👑', family: "'Estedad', Tahoma, sans-serif", lang: 'fa', premium: true },
  { id: 'peyda', name: 'پیدا 👑', family: "'Peyda', Tahoma, sans-serif", lang: 'fa', premium: true },
  { id: 'en-default', name: 'English — Default', family: "'Inter', Arial, sans-serif", lang: 'en', premium: false },
  { id: 'en-roboto', name: 'English — Roboto', family: "'Roboto', Arial, sans-serif", lang: 'en', premium: false },
  { id: 'en-poppins', name: 'English — Poppins', family: "'Poppins', Arial, sans-serif", lang: 'en', premium: false },
  { id: 'en-lato', name: 'English — Lato', family: "'Lato', Arial, sans-serif", lang: 'en', premium: false },
  { id: 'en-serif', name: 'English — Serif', family: "Georgia, 'Times New Roman', serif", lang: 'en', premium: false }
];

function renderFontSelect() {
  const select = document.getElementById('settingFont');
  if (!select) return;
  const data = getData();
  const current = data.font || 'default';
  const isPremiumUser = data.isPremium || false;
  const faFonts = FONTS.filter(function(f) { return f.lang === 'fa'; });
  const enFonts = FONTS.filter(function(f) { return f.lang === 'en'; });
  let html = '';
  html += '<optgroup label="🇮🇷 فارسی">';
  faFonts.forEach(function(f) {
    html += '<option value="' + f.id + '" ' + (f.id === current ? 'selected' : '') + '>' + f.name + '</option>';
  });
  html += '</optgroup>';
  html += '<optgroup label="🌍 English">';
  enFonts.forEach(function(f) {
    html += '<option value="' + f.id + '" ' + (f.id === current ? 'selected' : '') + '>' + f.name + '</option>';
  });
  html += '</optgroup>';
  select.innerHTML = html;
  select.addEventListener('change', function(e) {
    const fontId = e.target.value;
    const font = FONTS.find(function(f) { return f.id === fontId; });
    if (!font) return;
    if (font.premium && !getData().isPremium) {
      if (typeof showToast === 'function') showToast('👑 ' + t('fontPremium'), 'info');
      if (typeof showPremiumModal === 'function') showPremiumModal();
      select.value = current;
      return;
    }
    data.font = fontId;
    saveData();
    if (font.family) {
      document.documentElement.style.setProperty('--font', font.family);
      if (typeof showToast === 'function') showToast('✒️ ' + t('fontChanged'), 'success');
    }
  });
}

// ============ پس‌زمینه ============
function renderBackgroundSettings() {
  const input = document.getElementById('bgImageInput');
  const removeBtn = document.getElementById('removeBgBtn');
  if (input) {
    input.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        if (typeof showToast === 'function') showToast('❌ 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = function(ev) {
        const data = getData();
        data.bgImage = ev.target.result;
        saveData();
        applyTheme(data.colorTheme);
        if (typeof showToast === 'function') showToast('🖼️ ' + t('msgSaved'), 'success');
      };
      reader.readAsDataURL(file);
    });
  }
  if (removeBtn) {
    removeBtn.addEventListener('click', function() {
      const data = getData();
      data.bgImage = null;
      saveData();
      applyTheme(data.colorTheme);
      if (typeof showToast === 'function') showToast('🗑️ ' + t('msgDeleted'), 'info');
    });
  }
}

// ============ صدا ============
function renderSoundSettings() {
  const select = document.getElementById('settingSound');
  const testBtn = document.getElementById('testSoundBtn');
  if (select) {
    const sounds = getSoundList();
    const current = getData().soundType || 'tick1';
    select.innerHTML = sounds.map(function(s) {
      return '<option value="' + s.id + '" ' + (s.id === current ? 'selected' : '') + '>' + s.name + '</option>';
    }).join('');
    select.addEventListener('change', function(e) {
      getData().soundType = e.target.value;
      saveData();
      if (typeof testSound === 'function') testSound(e.target.value);
    });
  }
  if (testBtn) {
    testBtn.addEventListener('click', function() {
      if (typeof testSound === 'function') testSound(getData().soundType);
    });
  }
}

// ============ ویبره ============
function renderVibrateSettings() {
  const container = document.getElementById('vibrateSettings');
  if (!container) return;
  const data = getData();
  const currentLevel = data.vibrateMs || 30;
  const currentPercent = Math.round((currentLevel / 60) * 100);
  let html = '<label class="setting-row">' +
    '<span>' + t('vibrate') + '</span>' +
    '<input type="checkbox" id="settingVibrate" ' + (data.vibrateEnabled !== false ? 'checked' : '') + '>' +
  '</label>';
  html += '<div class="setting-row" style="flex-direction:column;align-items:stretch;gap:8px">' +
    '<div style="display:flex;justify-content:space-between;align-items:center">' +
      '<span>' + t('vibrateLevel') + '</span>' +
      '<span id="vibrateValue" style="color:var(--primary-light);font-weight:bold">' + toLocalNum(currentPercent) + '٪</span>' +
    '</div>' +
    '<input type="range" id="settingVibrateLevel" min="0" max="100" step="5" value="' + currentPercent + '" style="width:100%;accent-color:var(--primary)">' +
    '<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-mute);margin-top:-4px">' +
      '<span>' + t('off') + '</span><span>' + t('vibrate') + '</span><span>' + t('on') + '</span>' +
    '</div>' +
  '</div>';
  html += '<div class="sound-test-row"><button id="testVibrateBtn">📳 ' + t('testVibrate') + '</button></div>';
  container.innerHTML = html;
  const checkbox = document.getElementById('settingVibrate');
  const slider = document.getElementById('settingVibrateLevel');
  const valueEl = document.getElementById('vibrateValue');
  const testBtn = document.getElementById('testVibrateBtn');
  if (checkbox) {
    checkbox.addEventListener('change', function(e) {
      getData().vibrateEnabled = e.target.checked;
      saveData();
      if (typeof showToast === 'function') showToast(e.target.checked ? '📳 ' + t('on') : '🔕 ' + t('off'), 'success');
    });
  }
  if (slider) {
    slider.addEventListener('input', function(e) {
      const percent = parseInt(e.target.value);
      if (valueEl) valueEl.textContent = toLocalNum(percent) + '٪';
    });
    slider.addEventListener('change', function(e) {
      const percent = parseInt(e.target.value);
      const vibrateMs = Math.round((percent / 100) * 60);
      getData().vibrateMs = vibrateMs;
      saveData();
      if (typeof showToast === 'function') showToast('📳 ' + toLocalNum(percent) + '٪', 'success');
    });
  }
  if (testBtn) {
    testBtn.addEventListener('click', function() {
      if (typeof vibrate === 'function') vibrate();
      else if (navigator.vibrate) {
        const ms = getData().vibrateMs || 30;
        try { navigator.vibrate(ms); } catch (e) {}
      }
    });
  }
}

// ============ خواب ============
function renderSleepSettings() {
  const checkbox = document.getElementById('settingSleep');
  const timeInput = document.getElementById('settingSleepTime');
  if (checkbox) {
    checkbox.checked = getData().sleepEnabled || false;
    checkbox.addEventListener('change', function(e) {
      getData().sleepEnabled = e.target.checked;
      saveData();
      if (e.target.checked && typeof requestNotificationPermission === 'function') requestNotificationPermission();
    });
  }
  if (timeInput) {
    timeInput.value = getData().sleepTime || '23:00';
    timeInput.addEventListener('change', function(e) {
      getData().sleepTime = e.target.value;
      saveData();
    });
  }
}

function updateSelectsValues() {
  const data = getData();
  const langSelect = document.getElementById('settingLanguage');
  if (langSelect) langSelect.value = data.language || 'fa';
  const calSelect = document.getElementById('settingCalendar');
  if (calSelect) calSelect.value = data.calendarType || 'jalali';
  const soundSelect = document.getElementById('settingSound');
  if (soundSelect) soundSelect.value = data.soundType || 'tick1';
}

// ============ تنظیمات آب ============
function initWaterSettings() {
  const goalInput = document.getElementById('settingWaterGoal');
  const cupInput = document.getElementById('settingCupSize');
  const data = getData();
  if (goalInput) {
    goalInput.value = data.waterGoal || 8;
    goalInput.addEventListener('change', function(e) {
      const val = parseInt(e.target.value);
      if (val >= 1 && val <= 20) changeWaterGoal(val);
    });
  }
  if (cupInput) {
    cupInput.value = data.cupSize || 250;
    cupInput.addEventListener('change', function(e) {
      const val = parseInt(e.target.value);
      if (val >= 50 && val <= 1000) changeCupSize(val);
    });
  }
}

// ============ راه‌اندازی ============
function initSettings() {
  renderLanguageSelect();
  renderCalendarSelect();
  renderNameInput();
  renderThemes();
  renderLockSettings();
  renderFontSelect();
  renderBackgroundSettings();
  renderSoundSettings();
  renderVibrateSettings();
  renderSleepSettings();
  const darkCheckbox = document.getElementById('settingDark');
  if (darkCheckbox) {
    darkCheckbox.checked = getData().darkMode !== false;
    darkCheckbox.addEventListener('change', function(e) { toggleDarkMode(e.target.checked); });
  }
  initWaterSettings();
  initBackupLink();
  console.log('✅ Settings راه‌اندازی شد');
}

function initBackupLink() {
  const generateBtn = document.getElementById('generateBackupLink');
  const copyBtn = document.getElementById('copyBackupLink');
  const restoreBtn = document.getElementById('restoreBackupLink');
  const linkInput = document.getElementById('backupLinkInput');
  if (generateBtn) {
    generateBtn.addEventListener('click', function() {
      const link = generateBackupLink();
      if (linkInput) linkInput.value = link;
      if (typeof showToast === 'function') showToast('🔗 ✓', 'success');
    });
  }
  if (copyBtn) {
    copyBtn.addEventListener('click', function() {
      const input = document.getElementById('backupLinkInput');
      if (!input || !input.value) {
        if (typeof showToast === 'function') showToast('❌ ' + t('msgEmpty'), 'error');
        return;
      }
      if (navigator.clipboard) {
        navigator.clipboard.writeText(input.value).then(function() {
          if (typeof showToast === 'function') showToast('📋 ✓', 'success');
        }).catch(function() {
          input.select();
          document.execCommand('copy');
          if (typeof showToast === 'function') showToast('📋 ✓', 'success');
        });
      } else {
        input.select();
        document.execCommand('copy');
        if (typeof showToast === 'function') showToast('📋 ✓', 'success');
      }
    });
  }
  if (restoreBtn) {
    restoreBtn.addEventListener('click', function() {
      const input = document.getElementById('backupLinkInput');
      if (!input || !input.value.trim()) {
        if (typeof showToast === 'function') showToast('❌ ' + t('msgEmpty'), 'error');
        return;
      }
      const confirmed = confirm(t('confirmDelete'));
      if (!confirmed) return;
      const success = restoreFromBackupLink(input.value.trim());
      if (success) {
        if (typeof showToast === 'function') showToast('✅ ✓', 'success');
        setTimeout(function() { location.reload(); }, 1500);
      } else {
        if (typeof showToast === 'function') showToast('❌', 'error');
      }
    });
  }
}

console.log('✅ settings.js بارگذاری شد');
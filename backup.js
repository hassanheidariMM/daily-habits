/* ============================================
   Daily Habits - Backup
   پشتیبان‌گیری و بازیابی + لینک آنلاین
   ============================================ */

// ============ گرفتن پشتیبان (JSON) ============
function exportBackup() {
  const data = getData();
  const backup = {
    _meta: {
      app: 'DailyHabits',
      version: getAppVersion(),
      date: new Date().toISOString(),
      device: navigator.userAgent || 'unknown'
    },
    data: data
  };
  return JSON.stringify(backup, null, 2);
}

// ============ دانلود پشتیبان ============
function downloadBackup() {
  try {
    const json = exportBackup();
    const data = getData();
    const userName = data.userName ? '-' + data.userName : '';
    const filename = 'daily-habits-backup' + userName + '-' + getToday() + '.json';
    
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
    
    getData().lastBackupDate = new Date().toISOString();
    saveData();
    
    if (typeof showToast === 'function') showToast('💾 پشتیبان دانلود شد', 'success');
    if (typeof playSuccessSound === 'function') playSuccessSound();
    
    return true;
  } catch (e) {
    console.error('خطا در دانلود پشتیبان:', e);
    if (typeof showToast === 'function') showToast('❌ خطا در پشتیبان‌گیری', 'error');
    return false;
  }
}

// ============ ساخت لینک پشتیبان (Base64 فشرده) ============
function generateBackupLink() {
  try {
    const data = getData();
    
    // داده‌ها رو با JSON.stringify + فشرده‌سازی ساده
    const jsonStr = JSON.stringify(data);
    
    // تبدیل به Base64 (با پشتیبانی یونیکد)
    const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
    
    // اضافه کردن پیشوند برای شناسایی
    const code = 'DH2-' + base64;
    
    return code;
  } catch (e) {
    console.error('خطا در ساخت لینک:', e);
    return null;
  }
}

// ============ بازیابی از لینک ============
function restoreFromBackupLink(code) {
  try {
    if (!code || !code.startsWith('DH2-')) {
      return false;
    }
    
    // حذف پیشوند
    const base64 = code.substring(4);
    
    // تبدیل از Base64 به JSON
    const jsonStr = decodeURIComponent(escape(atob(base64)));
    const backupData = JSON.parse(jsonStr);
    
    if (!backupData) return false;
    
    // ادغام با داده‌های پیش‌فرض
    const merged = deepMerge(JSON.parse(JSON.stringify(DEFAULT_DATA)), backupData);
    
    appData = merged;
    ensureDataStructure();
    saveData();
    
    return true;
  } catch (e) {
    console.error('خطا در بازیابی:', e);
    return false;
  }
}

// ============ بازیابی از فایل ============
function importBackup(file) {
  return new Promise(function(resolve, reject) {
    if (!file) {
      reject(new Error('فایلی انتخاب نشد'));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
      try {
        const text = e.target.result;
        const parsed = JSON.parse(text);
        
        let backupData;
        if (parsed._meta && parsed.data) backupData = parsed.data;
        else if (parsed.habits || parsed.tasks || parsed.points !== undefined) backupData = parsed;
        else {
          reject(new Error('فرمت فایل نامعتبر است'));
          return;
        }
        
        const confirmed = confirm('⚠️ این کار همه داده‌های فعلی رو با فایل پشتیبان جایگزین می‌کنه.\n\nمطمئنی؟');
        if (!confirmed) {
          reject(new Error('لغو شد'));
          return;
        }
        
        const merged = deepMerge(JSON.parse(JSON.stringify(DEFAULT_DATA)), backupData);
        appData = merged;
        ensureDataStructure();
        saveData();
        
        if (typeof showToast === 'function') showToast('✅ پشتیبان بازیابی شد', 'success');
        if (typeof playAchievementSound === 'function') playAchievementSound();
        
        setTimeout(function() { location.reload(); }, 1000);
        resolve(true);
      } catch (err) {
        console.error('خطا در بازیابی:', err);
        reject(new Error('فایل نامعتبر یا خراب است'));
      }
    };
    
    reader.onerror = function() { reject(new Error('خطا در خواندن فایل')); };
    reader.readAsText(file);
  });
}

// ============ راه‌اندازی آپلود ============
function initBackupUpload() {
  const input = document.getElementById('backupUpload');
  const btn = document.getElementById('backupUploadBtn');
  
  if (!input || !btn) return;
  
  btn.addEventListener('click', function() { input.click(); });
  
  input.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    importBackup(file).catch(function(err) {
      if (err.message !== 'لغو شد') {
        if (typeof showToast === 'function') showToast('❌ ' + err.message, 'error');
      }
    }).finally(function() {
      input.value = '';
    });
  });
}

// ============ پشتیبان خودکار ============
function checkAutoBackup() {
  const data = getData();
  if (!data.autoBackup) return;
  
  const today = getToday();
  const lastBackup = data.lastBackupDate ? data.lastBackupDate.split('T')[0] : null;
  
  if (lastBackup !== today) {
    try {
      const backupKey = 'dailyHabits_autoBackup_' + today;
      localStorage.setItem(backupKey, exportBackup());
      
      for (let i = 8; i < 30; i++) {
        const oldKey = 'dailyHabits_autoBackup_' + getDateAgoISO(i);
        if (localStorage.getItem(oldKey)) localStorage.removeItem(oldKey);
      }
      
      data.lastBackupDate = new Date().toISOString();
      saveData();
    } catch (e) {}
  }
}

// ============ لیست پشتیبان‌های خودکار ============
function getAutoBackups() {
  const backups = [];
  for (let i = 0; i < 30; i++) {
    const dateStr = getDateAgoISO(i);
    const key = 'dailyHabits_autoBackup_' + dateStr;
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        backups.push({
          date: dateStr,
          size: (data.length / 1024).toFixed(1) + ' KB',
          meta: parsed._meta || {}
        });
      } catch (e) {}
    }
  }
  return backups;
}

// ============ بازیابی از خودکار ============
function restoreAutoBackup(dateStr) {
  const key = 'dailyHabits_autoBackup_' + dateStr;
  const raw = localStorage.getItem(key);
  if (!raw) return false;
  
  try {
    const parsed = JSON.parse(raw);
    const backupData = parsed.data || parsed;
    
    const confirmed = confirm('⚠️ بازیابی از پشتیبان ' + formatDate(isoToDate(dateStr)) + '\n\nمطمئنی؟');
    if (!confirmed) return false;
    
    const merged = deepMerge(JSON.parse(JSON.stringify(DEFAULT_DATA)), backupData);
    appData = merged;
    ensureDataStructure();
    saveData();
    
    if (typeof showToast === 'function') showToast('✅ بازیابی شد', 'success');
    setTimeout(function() { location.reload(); }, 1000);
    return true;
  } catch (e) { return false; }
}

// ============ اطلاعات پشتیبان ============
function getBackupInfo() {
  const data = getData();
  const lastBackup = data.lastBackupDate;
  
  let lastBackupText = 'هنوز پشتیبان نگرفتی';
  if (lastBackup) lastBackupText = formatDateWithDay(new Date(lastBackup));
  
  return {
    autoBackup: data.autoBackup || false,
    lastBackup: lastBackupText,
    autoBackups: getAutoBackups(),
    totalSize: getDataSize()
  };
}

// ============ حجم داده ============
function getDataSize() {
  try {
    const json = JSON.stringify(getData());
    const bytes = new Blob([json]).size;
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  } catch (e) { return '—'; }
}

// ============ اشتراک‌گذاری ============
async function shareBackup() {
  try {
    const json = exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const file = new File([blob], 'daily-habits-backup-' + getToday() + '.json', { type: 'application/json' });
    
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Daily Habits Backup',
        text: 'پشتیبان اپ Daily Habits'
      });
      return true;
    } else {
      return downloadBackup();
    }
  } catch (e) {
    if (e.name !== 'AbortError') console.error('خطا در اشتراک‌گذاری:', e);
    return false;
  }
}

// ============ کپی به کلیپ‌بورد ============
async function copyBackupToClipboard() {
  try {
    const json = exportBackup();
    await navigator.clipboard.writeText(json);
    if (typeof showToast === 'function') showToast('📋 پشتیبان کپی شد', 'success');
    return true;
  } catch (e) {
    if (typeof showToast === 'function') showToast('❌ خطا در کپی', 'error');
    return false;
  }
}

// ============ پاک کردن همه ============
function confirmClearAll() {
  const confirmed = confirm(
    '⚠️⚠️ هشدار ⚠️⚠️\n\n' +
    'این کار همه داده‌هات رو پاک می‌کنه:\n' +
    '• همه عادت‌ها، کارها، پرهیزها\n' +
    '• همه آرزوها\n' +
    '• همه تاریخچه\n' +
    '• همه خاطرات و یادداشت‌ها\n' +
    '• همه امتیازها و دستاوردها\n\n' +
    'آیا مطمئنی؟'
  );
  
  if (!confirmed) return false;
  
  const doubleCheck = confirm('🛑 آخرین هشدار!\n\nواقعاً پاک کنم؟');
  if (!doubleCheck) return false;
  
  clearAllData();
  if (typeof showToast === 'function') showToast('🗑️ همه داده‌ها پاک شد', 'info');
  setTimeout(function() { location.reload(); }, 800);
  return true;
}

// ============ راه‌اندازی ============
function initBackup() {
  const dlBtn = document.getElementById('backupDownload');
  if (dlBtn) dlBtn.addEventListener('click', downloadBackup);
  
  initBackupUpload();
  
  const clearBtn = document.getElementById('clearAllBtn');
  if (clearBtn) clearBtn.addEventListener('click', confirmClearAll);
  
  checkAutoBackup();
  
  console.log('✅ Backup راه‌اندازی شد');
}

console.log('✅ backup.js بارگذاری شد');
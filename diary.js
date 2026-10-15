/* ============================================
   Daily Habits - Diary
   دفتر خاطرات + خروجی PDF
   ============================================ */

// ============ ذخیره خاطره ============
function saveDiaryEntry(dateStr, text) {
  const data = getData();
  if (!data.diary) data.diary = {};
  
  if (!text || !text.trim()) {
    delete data.diary[dateStr];
  } else {
    if (!data.diary[dateStr]) {
      data.diary[dateStr] = {
        text: '',
        createdAt: new Date().toISOString(),
        updatedAt: null
      };
    }
    data.diary[dateStr].text = text.trim();
    data.diary[dateStr].updatedAt = new Date().toISOString();
  }
  
  saveData();
  return true;
}

// ============ گرفتن خاطره روز ============
function getDiaryEntry(dateStr) {
  const data = getData();
  if (!data.diary || !data.diary[dateStr]) return null;
  return data.diary[dateStr];
}

// ============ حذف خاطره ============
function deleteDiaryEntry(dateStr) {
  const data = getData();
  if (!data.diary || !data.diary[dateStr]) return false;
  
  delete data.diary[dateStr];
  saveData();
  return true;
}

// ============ همه خاطرات (مرتب‌شده) ============
function getAllDiaryEntries() {
  const data = getData();
  if (!data.diary) return [];
  
  return Object.keys(data.diary)
    .sort((a, b) => b.localeCompare(a))
    .map(date => ({
      date,
      ...data.diary[date]
    }));
}

// ============ تعداد خاطرات ============
function getDiaryCount() {
  const data = getData();
  return data.diary ? Object.keys(data.diary).length : 0;
}

// ============ جستجو در خاطرات ============
function searchDiary(query) {
  if (!query || !query.trim()) return [];
  
  const q = query.trim().toLowerCase();
  const entries = getAllDiaryEntries();
  
  return entries.filter(entry => 
    entry.text.toLowerCase().includes(q) ||
    formatDate(isoToDate(entry.date)).toLowerCase().includes(q)
  );
}

// ============ خروجی PDF (استفاده از پنجره چاپ مرورگر) ============
function downloadDiaryPDF() {
  const entries = getAllDiaryEntries();
  
  if (entries.length === 0) {
    if (typeof showToast === 'function') {
      showToast(t('noDiary'), 'info');
    }
    return;
  }
  
  const data = getData();
  const userName = data.userName || '';
  const appName = t('appName') || 'Daily Habits';
  const rtl = getLangInfo(data.language || 'fa').rtl;
  
  // ساخت HTML
  let html = `
<!DOCTYPE html>
<html lang="${data.language || 'fa'}" dir="${rtl ? 'rtl' : 'ltr'}">
<head>
<meta charset="UTF-8">
<title>${t('myDiary')} — ${appName}</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: ${getLangInfo(data.language || 'fa').font};
    padding: 30px;
    max-width: 800px;
    margin: 0 auto;
    color: #1a1a1a;
    line-height: 1.8;
    background: #fff;
  }
  .header {
    text-align: center;
    border-bottom: 3px solid #6366f1;
    padding-bottom: 20px;
    margin-bottom: 30px;
  }
  .header h1 {
    color: #6366f1;
    margin: 0 0 8px 0;
    font-size: 28px;
  }
  .header .meta {
    color: #666;
    font-size: 14px;
  }
  .entry {
    background: #f8f9fc;
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 20px;
    border-right: 4px solid #6366f1;
    page-break-inside: avoid;
  }
  ${rtl ? '' : '.entry { border-right: none; border-left: 4px solid #6366f1; }'}
  .entry-date {
    font-size: 18px;
    font-weight: bold;
    color: #6366f1;
    margin-bottom: 8px;
  }
  .entry-text {
    white-space: pre-wrap;
    word-wrap: break-word;
    color: #333;
    font-size: 15px;
  }
  .footer {
    text-align: center;
    color: #999;
    font-size: 12px;
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }
  @media print {
    body { padding: 15px; }
    .entry { background: #fff; border: 1px solid #ddd; }
  }
</style>
</head>
<body>

<div class="header">
  <h1>📔 ${t('myDiary')}</h1>
  ${userName ? `<div class="meta">${userName}</div>` : ''}
  <div class="meta">${appName} • ${entries.length} ${t('diary') || 'خاطره'}</div>
  <div class="meta">${formatDateWithDay(new Date())}</div>
</div>
`;
  
  entries.forEach(entry => {
    const dateObj = isoToDate(entry.date);
    const dateFormatted = formatDateWithDay(dateObj);
    
    html += `
<div class="entry">
  <div class="entry-date">📅 ${dateFormatted}</div>
  <div class="entry-text">${escapeHtml(entry.text)}</div>
</div>
`;
  });
  
  html += `
<div class="footer">
  ساخته شده با ${appName} 💙
</div>

<script>
  window.onload = function() {
    setTimeout(function() {
      window.print();
    }, 500);
  };
<\/script>

</body>
</html>
`;
  
  // باز کردن پنجره جدید
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    if (typeof showToast === 'function') {
      showToast('❌ پاپ‌آپ بلاک شده — لطفاً اجازه بده', 'error');
    }
    return;
  }
  
  printWindow.document.write(html);
  printWindow.document.close();
}

// ============ escape کردن HTML ============
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============ خروجی متنی خاطرات ============
function exportDiaryText() {
  const entries = getAllDiaryEntries();
  if (entries.length === 0) return '';
  
  let text = '📔 ' + t('myDiary') + '\n';
  text += '='.repeat(40) + '\n\n';
  
  entries.forEach(entry => {
    const dateObj = isoToDate(entry.date);
    text += '📅 ' + formatDateWithDay(dateObj) + '\n';
    text += '-'.repeat(40) + '\n';
    text += entry.text + '\n\n';
  });
  
  return text;
}

// ============ دانلود به صورت فایل متنی ============
function downloadDiaryText() {
  const text = exportDiaryText();
  if (!text) {
    if (typeof showToast === 'function') showToast(t('noDiary'), 'info');
    return;
  }
  
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `diary-${getToday()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ============ خاطرات این ماه ============
function getDiaryThisMonth() {
  const entries = getAllDiaryEntries();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  return entries.filter(entry => {
    const d = isoToDate(entry.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

// ============ خاطرات این هفته ============
function getDiaryThisWeek() {
  const entries = getAllDiaryEntries();
  const week = getCurrentWeek();
  return entries.filter(entry => week.includes(entry.date));
}

// ============ رندر صفحه خاطرات ============
function renderDiary(dateStr) {
  const textarea = document.getElementById('diaryText');
  const label = document.getElementById('diaryDateLabel');
  if (!textarea || !label) return;
  
  const date = dateStr || getToday();
  const entry = getDiaryEntry(date);
  
  textarea.value = entry ? entry.text : '';
  
  const dateObj = isoToDate(date);
  const isToday = date === getToday();
  const isYesterday = date === getDateAgoISO(1);
  
  let labelText = formatDateWithDay(dateObj);
  if (isToday) labelText = '✨ ' + t('today') + ' — ' + labelText;
  else if (isYesterday) labelText = '📅 دیروز — ' + labelText;
  
  label.textContent = labelText;
  label.dataset.date = date;
}

// ============ ناوبری روز ============
let currentDiaryDate = null;

function initDiaryNav() {
  const prevBtn = document.getElementById('diaryPrev');
  const nextBtn = document.getElementById('diaryNext');
  const textarea = document.getElementById('diaryText');
  const saveBtn = document.getElementById('saveDiaryBtn');
  
  currentDiaryDate = getToday();
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentDiaryDate = getPrevDay(currentDiaryDate);
      renderDiary(currentDiaryDate);
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const next = getNextDay(currentDiaryDate);
      if (next <= getToday()) {
        currentDiaryDate = next;
        renderDiary(currentDiaryDate);
      }
    });
  }
  
  if (saveBtn && textarea) {
    saveBtn.addEventListener('click', () => {
      saveDiaryEntry(currentDiaryDate, textarea.value);
      if (typeof showToast === 'function') {
        showToast('📔 ' + t('saved'), 'success');
      }
      if (typeof playSuccessSound === 'function') playSuccessSound();
    });
  }
  
  renderDiary(currentDiaryDate);
}

// ============ ذخیره خودکار ============
let diaryAutoSaveTimer = null;

function setupDiaryAutoSave() {
  const textarea = document.getElementById('diaryText');
  if (!textarea) return;
  
  textarea.addEventListener('input', () => {
    clearTimeout(diaryAutoSaveTimer);
    diaryAutoSaveTimer = setTimeout(() => {
      if (currentDiaryDate) {
        saveDiaryEntry(currentDiaryDate, textarea.value);
      }
    }, 2000);
  });
}

console.log('✅ diary.js بارگذاری شد');
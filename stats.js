/* ============================================
   Daily Habits - Stats
   نمودارها و آمار
   ============================================ */

// ============ تاریخچه هفته ============
function getWeekHistory(dateStr = null) {
  const days = [];
  const today = dateStr || getToday();
  
  for (let i = 6; i >= 0; i--) {
    const d = isoToDate(today);
    d.setDate(d.getDate() - i);
    const isoStr = d.toISOString().split('T')[0];
    
    const progress = getDayProgress(isoStr);
    days.push({
      date: isoStr,
      dateObj: d,
      label: getDayNamesShort()[getIranianDayOfWeek(d)],
      fullLabel: formatDate(d),
      ...progress
    });
  }
  
  return days;
}

// ============ میانگین هفته ============
function getWeekAverage() {
  const week = getWeekHistory();
  if (week.length === 0) return 0;
  
  const sum = week.reduce((acc, d) => acc + d.pct, 0);
  return Math.round(sum / week.length);
}

// ============ بهترین روز هفته ============
function getBestDayOfWeek() {
  const week = getWeekHistory();
  if (week.length === 0) return null;
  
  return week.reduce((best, d) => d.pct > best.pct ? d : best, week[0]);
}

// ============ بدترین روز هفته ============
function getWorstDayOfWeek() {
  const week = getWeekHistory();
  if (week.length === 0) return null;
  
  return week.reduce((worst, d) => d.pct < worst.pct ? d : worst, week[0]);
}

// ============ میانگین N روز ============
function getAverageNDays(n) {
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const dateStr = getDateAgoISO(i);
    sum += getDayProgress(dateStr).pct;
  }
  return Math.round(sum / n);
}

// ============ بهترین روز N روز ============
function getBestDayNDays(n) {
  let best = { date: null, pct: -1 };
  for (let i = 0; i < n; i++) {
    const dateStr = getDateAgoISO(i);
    const pct = getDayProgress(dateStr).pct;
    if (pct > best.pct) {
      best = { date: dateStr, pct };
    }
  }
  return best;
}

// ============ استریک کلی ============
function getOverallStreak() {
  const data = getData();
  let streak = 0;
  
  for (let i = 0; i < 365; i++) {
    const dateStr = getDateAgoISO(i);
    const pct = getDayProgress(dateStr).pct;
    
    if (pct > 0) {
      streak++;
    } else {
      if (i === 0) continue;
      break;
    }
  }
  
  return streak;
}

// ============ بهترین استریک کلی ============
function getBestOverallStreak() {
  const data = getData();
  const dates = Object.keys(data.history).sort();
  
  let best = 0;
  let current = 0;
  let prevDate = null;
  
  dates.forEach(dateStr => {
    const pct = getDayProgress(dateStr).pct;
    
    if (pct > 0) {
      if (prevDate) {
        const prev = isoToDate(prevDate);
        const curr = isoToDate(dateStr);
        const diff = Math.round((curr - prev) / 86400000);
        if (diff === 1) {
          current++;
        } else {
          current = 1;
        }
      } else {
        current = 1;
      }
      if (current > best) best = current;
      prevDate = dateStr;
    } else {
      current = 0;
      prevDate = null;
    }
  });
  
  return best;
}

// ============ آمار کلی ============
function getOverallStats() {
  const data = getData();
  
  let totalDays = 0;
  let totalHabitsDone = 0;
  let totalTasksDone = 0;
  let totalAvoidsDone = 0;
  let perfectDays = 0;
  
  Object.keys(data.history).forEach(dateStr => {
    const day = data.history[dateStr];
    if (!day) return;
    
    const habitsCount = (day.habits || []).length;
    const tasksCount = (day.tasks || []).length;
    const avoidsCount = (day.avoids || []).length;
    
    if (habitsCount + tasksCount + avoidsCount > 0) {
      totalDays++;
      totalHabitsDone += habitsCount;
      totalTasksDone += tasksCount;
      totalAvoidsDone += avoidsCount;
      
      const progress = getDayProgress(dateStr);
      if (progress.pct === 100) perfectDays++;
    }
  });
  
  return {
    totalDays,
    totalHabitsDone,
    totalTasksDone,
    totalAvoidsDone,
    perfectDays,
    points: data.points || 0,
    focusMinutes: data.focusMinutes || 0,
    habitsCount: data.habits.length,
    tasksCount: data.tasks.length,
    avoidsCount: data.avoids.length,
    dreamsCount: Object.values(data.dreams).reduce((sum, arr) => sum + arr.length, 0),
    dreamsDone: Object.values(data.dreams).reduce((sum, arr) => sum + arr.filter(d => d.done).length, 0),
    diaryCount: Object.keys(data.diary || {}).length,
    notesCount: Object.keys(data.notes || {}).length
  };
}

// ============ رندر نمودار میله‌ای (۷ روز) ============
function renderBarChart(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const week = getWeekHistory();
  const maxPct = 100;
  
  container.innerHTML = '';
  container.className = 'bar-chart';
  
  week.forEach(day => {
    const bar = document.createElement('div');
    bar.className = 'bar-col';
    
    const pct = day.pct;
    const heightPct = (pct / maxPct) * 100;
    
    let colorClass = 'bar-low';
    if (pct >= 80) colorClass = 'bar-high';
    else if (pct >= 50) colorClass = 'bar-mid';
    
    bar.innerHTML = `
      <div class="bar-value">${toLocalNum(pct)}٪</div>
      <div class="bar-wrapper">
        <div class="bar-fill ${colorClass}" style="height:${heightPct}%"></div>
      </div>
      <div class="bar-label">${day.label}</div>
    `;
    
    bar.title = day.fullLabel;
    container.appendChild(bar);
  });
}

// ============ رندر نمودار خطی (۳۰ روز) ============
function renderLineChart(containerId, days = 30) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const dataPoints = [];
  for (let i = days - 1; i >= 0; i--) {
    const dateStr = getDateAgoISO(i);
    dataPoints.push(getDayProgress(dateStr).pct);
  }
  
  const maxPct = 100;
  const width = 100;
  const height = 100;
  const step = width / (dataPoints.length - 1);
  
  let pathD = '';
  dataPoints.forEach((pct, i) => {
    const x = i * step;
    const y = height - (pct / maxPct) * height;
    pathD += (i === 0 ? 'M' : 'L') + x + ',' + y + ' ';
  });
  
  const areaD = pathD + `L${width},${height} L0,${height} Z`;
  
  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" class="line-svg">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="var(--primary)" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="${areaD}" fill="url(#lineGrad)"/>
      <path d="${pathD}" fill="none" stroke="var(--primary)" stroke-width="1.5" vector-effect="non-scaling-stroke"/>
    </svg>
    <div class="line-labels">
      <span>${toLocalNum(days)} روز قبل</span>
      <span>${t('today')}</span>
    </div>
  `;
}

// ============ رندر Heatmap (مثل گیت‌هاب) ============
function renderHeatmap(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const data = getData();
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364);
  
  // شروع از شنبه
  const startDay = (startDate.getDay() + 1) % 7;
  startDate.setDate(startDate.getDate() - startDay);
  
  const cells = [];
  const current = new Date(startDate);
  
  while (current <= today) {
    const isoStr = current.toISOString().split('T')[0];
    const pct = getDayProgress(isoStr).pct;
    
    let level = 0;
    if (pct > 0) level = 1;
    if (pct >= 25) level = 2;
    if (pct >= 50) level = 3;
    if (pct >= 75) level = 4;
    if (pct === 100) level = 5;
    
    cells.push({
      date: isoStr,
      level,
      pct,
      day: current.getDay()
    });
    
    current.setDate(current.getDate() + 1);
  }
  
  // ساخت گرید
  let html = '<div class="heatmap-grid">';
  cells.forEach(cell => {
    html += `<div class="heatmap-cell level-${cell.level}" title="${formatDate(isoToDate(cell.date))} — ${toLocalNum(cell.pct)}٪"></div>`;
  });
  html += '</div>';
  
  // لژاند
  html += `
    <div class="heatmap-legend">
      <span>${t('off') || 'کم'}</span>
      <div class="heatmap-cell level-0"></div>
      <div class="heatmap-cell level-1"></div>
      <div class="heatmap-cell level-2"></div>
      <div class="heatmap-cell level-3"></div>
      <div class="heatmap-cell level-4"></div>
      <div class="heatmap-cell level-5"></div>
      <span>${t('on') || 'زیاد'}</span>
    </div>
  `;
  
  container.innerHTML = html;
}

// ============ رندر Pie Chart ============
function renderPieChart(containerId, segments) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) {
    container.innerHTML = `<div class="empty">${t('noData')}</div>`;
    return;
  }
  
  let currentAngle = -90;
  let paths = '';
  
  segments.forEach(seg => {
    const angle = (seg.value / total) * 360;
    const endAngle = currentAngle + angle;
    
    const startRad = (currentAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);
    
    const largeArc = angle > 180 ? 1 : 0;
    
    const d = `M50,50 L${x1},${y1} A40,40 0 ${largeArc} 1 ${x2},${y2} Z`;
    
    paths += `<path d="${d}" fill="${seg.color}" opacity="0.9"/>`;
    currentAngle = endAngle;
  });
  
  container.innerHTML = `
    <div class="pie-wrapper">
      <svg viewBox="0 0 100 100" class="pie-svg">${paths}</svg>
    </div>
    <div class="pie-legend">
      ${segments.map(s => `
        <div class="legend-item">
          <span class="legend-color" style="background:${s.color}"></span>
          <span class="legend-label">${s.label}</span>
          <span class="legend-value">${toLocalNum(s.value)}</span>
        </div>
      `).join('')}
    </div>
  `;
}

// ============ رندر رکوردها ============
function renderRecords(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const stats = getOverallStats();
  const bestDay = getBestDayNDays(30);
  const overallStreak = getOverallStreak();
  const bestStreak = getBestOverallStreak();
  const avg7 = getAverageNDays(7);
  const avg30 = getAverageNDays(30);
  
  const records = [
    { icon: '🔥', label: t('streak'), value: toLocalNum(overallStreak) + ' ' + (t('days') || 'روز') },
    { icon: '🏆', label: 'بهترین استریک', value: toLocalNum(bestStreak) + ' ' + (t('days') || 'روز') },
    { icon: '⭐', label: 'روزهای کامل', value: toLocalNum(stats.perfectDays) },
    { icon: '📅', label: 'میانگین ۷ روز', value: toLocalNum(avg7) + '٪' },
    { icon: '📆', label: 'میانگین ۳۰ روز', value: toLocalNum(avg30) + '٪' },
    { icon: '✅', label: 'عادت‌های انجام شده', value: toLocalNum(stats.totalHabitsDone) },
    { icon: '📝', label: 'کارهای انجام شده', value: toLocalNum(stats.totalTasksDone) },
    { icon: '🚫', label: 'پرهیزهای موفق', value: toLocalNum(stats.totalAvoidsDone) },
    { icon: '🎯', label: 'آرزوهای محقق‌شده', value: toLocalNum(stats.dreamsDone) },
    { icon: '⏱️', label: 'دقیقه تمرکز', value: toLocalNum(stats.focusMinutes) },
    { icon: '💎', label: 'امتیاز کل', value: toLocalNum(stats.points) },
    { icon: '📔', label: 'خاطرات نوشته‌شده', value: toLocalNum(stats.diaryCount) }
  ];
  
  container.innerHTML = records.map(r => `
    <div class="record-item">
      <span class="record-icon">${r.icon}</span>
      <span class="record-label">${r.label}</span>
      <span class="record-value">${r.value}</span>
    </div>
  `).join('');
}

// ============ تحلیل هوشمند ============
function getSmartAnalysis() {
  const data = getData();
  const analysis = [];
  
  // بهترین عادت
  const best = getBestHabit();
  if (best && best.score > 0) {
    analysis.push({
      icon: '🏆',
      type: 'success',
      title: t('bestHabit'),
      text: `"${best.habit.text}" با ${toLocalNum(best.score)}٪ پیشرفت در ۳۰ روز اخیر`
    });
  }
  
  // ضعیف‌ترین عادت
  const worst = getWorstHabit();
  if (worst && worst.score < 100 && data.habits.length > 1) {
    analysis.push({
      icon: '⚠️',
      type: 'warning',
      title: t('worstHabit'),
      text: `"${worst.habit.text}" فقط ${toLocalNum(worst.score)}٪ — سعی کن بیشتر بهش توجه کنی`
    });
  }
  
  // مقایسه هفته
  const thisWeek = getWeekAverage();
  let lastWeekSum = 0;
  for (let i = 7; i < 14; i++) {
    const dateStr = getDateAgoISO(i);
    lastWeekSum += getDayProgress(dateStr).pct;
  }
  const lastWeek = Math.round(lastWeekSum / 7);
  const diff = thisWeek - lastWeek;
  
  if (diff > 5) {
    analysis.push({
      icon: '📈',
      type: 'success',
      title: 'بهتر از هفته قبل',
      text: `${toLocalNum(diff)}٪ بهتر از هفته گذشته‌ات عمل کردی!`
    });
  } else if (diff < -5) {
    analysis.push({
      icon: '📉',
      type: 'warning',
      title: 'کمی افت',
      text: `${toLocalNum(Math.abs(diff))}٪ کمتر از هفته قبل. بیا جبران کنیم!`
    });
  } else {
    analysis.push({
      icon: '➡️',
      type: 'info',
      title: 'ثابت',
      text: 'عملکردت تقریباً مثل هفته قبل بوده.'
    });
  }
  
  // پیش‌بینی موفقیت
  const avg30 = getAverageNDays(30);
  let prediction = 'عالی';
  let predictionIcon = '🌟';
  if (avg30 < 30) { prediction = 'نیاز به تلاش بیشتر'; predictionIcon = '💪'; }
  else if (avg30 < 60) { prediction = 'خوب'; predictionIcon = '👍'; }
  else if (avg30 < 80) { prediction = 'خیلی خوب'; predictionIcon = '🎯'; }
  
  analysis.push({
    icon: predictionIcon,
    type: 'info',
    title: t('prediction'),
    text: `با میانگین ${toLocalNum(avg30)}٪، روند تو "${prediction}" است`
  });
  
  // پیشنهاد
  if (worst && worst.score < 50) {
    analysis.push({
      icon: '💡',
      type: 'tip',
      title: t('suggestion'),
      text: `امروز فقط روی "${worst.habit.text}" تمرکز کن — همین یه کار!`
    });
  } else if (best && best.score >= 80) {
    analysis.push({
      icon: '💡',
      type: 'tip',
      title: t('suggestion'),
      text: `عالی پیش می‌ری! یه عادت جدید اضافه کن و اپت رو گسترش بده.`
    });
  }
  
  return analysis;
}

// ============ رندر تحلیل ============
function renderAnalysis(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const analysis = getSmartAnalysis();
  
  if (analysis.length === 0) {
    container.innerHTML = `<div class="empty">${t('noData')}</div>`;
    return;
  }
  
  container.innerHTML = analysis.map(a => `
    <div class="analysis-item ${a.type}">
      <span class="analysis-icon">${a.icon}</span>
      <div class="analysis-content">
        <div class="analysis-title">${a.title}</div>
        <div class="analysis-text">${a.text}</div>
      </div>
    </div>
  `).join('');
}

// ============ رندر آمار عادت‌ها ============
function renderHabitsStats(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const data = getData();
  
  if (data.habits.length === 0) {
    container.innerHTML = `<div class="empty">${t('noHabitsToday')}</div>`;
    return;
  }
  
  container.innerHTML = data.habits.map((habit, index) => {
    const progress = getHabitProgress30Days(index);
    const streak = calculateStreak(index);
    
    return `
      <div class="habit-stat">
        <div class="habit-stat-header">
          <span class="habit-stat-name">${habit.icon || '📌'} ${habit.text}</span>
          <span class="habit-stat-streak">🔥 ${toLocalNum(streak)}</span>
        </div>
        <div class="mini-bar">
          <div class="mini-fill fill-blue" style="width:${progress}%"></div>
        </div>
        <div class="habit-stat-footer">
          <span>${toLocalNum(progress)}٪ در ۳۰ روز</span>
        </div>
      </div>
    `;
  }).join('');
}

// ============ رندر گزارش ============
function renderReport(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const stats = getOverallStats();
  const avg7 = getAverageNDays(7);
  const avg30 = getAverageNDays(30);
  const streak = getOverallStreak();
  
  container.innerHTML = `
    <div class="report-grid">
      <div class="report-card">
        <div class="report-icon">🔥</div>
        <div class="report-value">${toLocalNum(streak)}</div>
        <div class="report-label">${t('streak')}</div>
      </div>
      <div class="report-card">
        <div class="report-icon">📊</div>
        <div class="report-value">${toLocalNum(avg7)}٪</div>
        <div class="report-label">میانگین ۷ روز</div>
      </div>
      <div class="report-card">
        <div class="report-icon">📈</div>
        <div class="report-value">${toLocalNum(avg30)}٪</div>
        <div class="report-label">میانگین ۳۰ روز</div>
      </div>
      <div class="report-card">
        <div class="report-icon">⭐</div>
        <div class="report-value">${toLocalNum(stats.perfectDays)}</div>
        <div class="report-label">روز کامل</div>
      </div>
      <div class="report-card">
        <div class="report-icon">✅</div>
        <div class="report-value">${toLocalNum(stats.totalHabitsDone)}</div>
        <div class="report-label">عادت انجام‌شده</div>
      </div>
      <div class="report-card">
        <div class="report-icon">💎</div>
        <div class="report-value">${toLocalNum(stats.points)}</div>
        <div class="report-label">امتیاز</div>
      </div>
    </div>
  `;
}

// ============ خروجی گزارش متنی ============
function generateReportText() {
  const stats = getOverallStats();
  const avg7 = getAverageNDays(7);
  const avg30 = getAverageNDays(30);
  const streak = getOverallStreak();
  
  return `
📊 گزارش Daily Habits

🔥 استریک فعلی: ${streak} روز
📅 میانگین ۷ روز: ${avg7}٪
📆 میانگین ۳۰ روز: ${avg30}٪
⭐ روزهای کامل: ${stats.perfectDays}
✅ عادت‌های انجام‌شده: ${stats.totalHabitsDone}
📝 کارهای انجام‌شده: ${stats.totalTasksDone}
🚫 پرهیزهای موفق: ${stats.totalAvoidsDone}
🎯 آرزوهای محقق‌شده: ${stats.dreamsDone}
⏱️ دقیقه تمرکز: ${stats.focusMinutes}
💎 امتیاز کل: ${stats.points}
📔 خاطرات: ${stats.diaryCount}

تاریخ: ${formatDate(new Date())}
  `.trim();
}

console.log('✅ stats.js بارگذاری شد');
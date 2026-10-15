/* ============================================
   Daily Habits - Items
   عادت‌ها، کارها، پرهیزها، آرزوها
   ============================================ */

// ============ اضافه کردن آیتم ============
function addItem(type, text, options) {
  options = options || {};
  const data = getData();
  if (!text || !text.trim()) return false;
  
  const maxPriority = data[type].length > 0
    ? Math.max.apply(null, data[type].map(function(i) { return i.priority || 0; })) + 1
    : 1;
  
  const item = {
    text: text.trim(),
    time: options.time || '',
    cat: options.cat || '',
    priority: options.priority !== undefined ? options.priority : maxPriority,
    days: options.days || [],
    goal: options.goal || 0,
    icon: options.icon || '',
    startDate: options.startDate || null,
    endDate: options.endDate || null,
    createdAt: new Date().toISOString()
  };
  
  data[type].push(item);
  saveData();
  return true;
}

// ============ حذف آیتم ============
function deleteItem(type, index) {
  const data = getData();
  if (index < 0 || index >= data[type].length) return false;
  
  data[type].splice(index, 1);
  
  // اصلاح ایندکس در همه روزهای تاریخچه
  Object.keys(data.history).forEach(function(date) {
    if (data.history[date][type]) {
      data.history[date][type] = data.history[date][type]
        .filter(function(i) { return i !== index; })
        .map(function(i) { return i > index ? i - 1 : i; });
    }
  });
  
  saveData();
  return true;
}

// ============ ویرایش آیتم ============
function editItem(type, index, newData) {
  const data = getData();
  if (index < 0 || index >= data[type].length) return false;
  
  const item = data[type][index];
  const keys = ['text', 'time', 'cat', 'priority', 'days', 'goal', 'icon', 'startDate', 'endDate'];
  
  keys.forEach(function(key) {
    if (newData[key] !== undefined) {
      item[key] = key === 'text' ? newData[key].trim() : newData[key];
    }
  });
  
  saveData();
  return true;
}

// ============ گرفتن آیتم با ایندکس ============
function getItem(type, index) {
  const data = getData();
  if (index < 0 || index >= data[type].length) return null;
  return data[type][index];
}

// ============ تیک زدن ============
function toggleItem(type, index, dateStr) {
  const data = getData();
  const date = dateStr || getSelectedDate();
  
  ensureHistoryDay(date);
  
  const arr = data.history[date][type];
  const idx = arr.indexOf(index);
  
  if (idx > -1) {
    arr.splice(idx, 1);
    data.points = Math.max(0, (data.points || 0) - 2);
  } else {
    arr.push(index);
    data.points = (data.points || 0) + 2;
    
    if (typeof checkAchievements === 'function') checkAchievements();
  }
  
  saveData();
  return true;
}

// ============ چک تیک خوردن ============
function isItemDone(type, index, dateStr) {
  const data = getData();
  const date = dateStr || getSelectedDate();
  
  if (!data.history[date]) return false;
  if (!data.history[date][type]) return false;
  
  return data.history[date][type].includes(index);
}

// ============ چک کردن اینکه عادت در این تاریخ فعاله ============
function isHabitActiveOnDate(habit, dateStr) {
  if (!habit) return false;
  
  const dateObj = isoToDate(dateStr);
  const dayOfWeek = getDayOfWeekForCalendar(dateObj);
  
  // چک روزهای هفته
  if (habit.days && habit.days.length > 0) {
    if (!habit.days.includes(dayOfWeek)) return false;
  }
  
  // چک بازه شروع
  if (habit.startDate && dateStr < habit.startDate) return false;
  
  // چک بازه پایان
  if (habit.endDate && dateStr > habit.endDate) return false;
  
  return true;
}

// ============ آیتم‌های یک روز ============
function getTodayItems(type, dateStr, options) {
  options = options || {};
  const data = getData();
  const date = dateStr || getSelectedDate();
  
  let items = data[type].map(function(item, index) {
    return { item: item, index: index };
  });
  
  // برای عادت‌ها: فیلتر بر اساس روز هفته + بازه
  if (type === 'habits') {
    // اگه showAll فعاله، همه رو نشون بده
    if (options.showAll) {
      // فقط مرتب‌سازی
    } else {
      items = items.filter(function(entry) {
        return isHabitActiveOnDate(entry.item, date);
      });
    }
  }
  
  // فیلتر بر اساس دسته
  if (options.category && options.category !== 'all') {
    items = items.filter(function(entry) {
      return entry.item.cat === options.category;
    });
  }
  
  // مرتب‌سازی بر اساس اولویت
  items.sort(function(a, b) {
    const pa = a.item.priority !== undefined ? a.item.priority : 999;
    const pb = b.item.priority !== undefined ? b.item.priority : 999;
    return pa - pb;
  });
  
  return items;
}

// ============ تغییر اولویت ============
function moveItemPriority(type, index, direction) {
  const data = getData();
  if (index < 0 || index >= data[type].length) return false;
  
  const items = data[type];
  const currentPriority = items[index].priority !== undefined ? items[index].priority : index;
  
  if (direction === 'up') {
    let targetIndex = -1;
    let closestPriority = -1;
    
    items.forEach(function(item, i) {
      const p = item.priority !== undefined ? item.priority : i;
      if (p < currentPriority && p > closestPriority) {
        closestPriority = p;
        targetIndex = i;
      }
    });
    
    if (targetIndex >= 0) {
      const temp = items[index].priority;
      items[index].priority = items[targetIndex].priority;
      items[targetIndex].priority = temp;
      saveData();
      return true;
    }
  } else if (direction === 'down') {
    let targetIndex = -1;
    let closestPriority = 999999;
    
    items.forEach(function(item, i) {
      const p = item.priority !== undefined ? item.priority : i;
      if (p > currentPriority && p < closestPriority) {
        closestPriority = p;
        targetIndex = i;
      }
    });
    
    if (targetIndex >= 0) {
      const temp = items[index].priority;
      items[index].priority = items[targetIndex].priority;
      items[targetIndex].priority = temp;
      saveData();
      return true;
    }
  }
  
  return false;
}

// ============ شمارش ============
function countDone(type, dateStr) {
  const data = getData();
  const date = dateStr || getSelectedDate();
  if (!data.history[date]) return 0;
  if (!data.history[date][type]) return 0;
  return data.history[date][type].length;
}

function countTotal(type, dateStr, options) {
  const date = dateStr || getSelectedDate();
  return getTodayItems(type, date, options).length;
}

function getProgress(type, dateStr, options) {
  const total = countTotal(type, dateStr, options);
  const done = countDone(type, dateStr);
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return { total: total, done: done, pct: pct };
}

function getDayProgress(dateStr) {
  const habits = getProgress('habits', dateStr);
  const tasks = getProgress('tasks', dateStr);
  const avoids = getProgress('avoids', dateStr);
  
  const total = habits.total + tasks.total + avoids.total;
  const done = habits.done + tasks.done + avoids.done;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  
  return { total: total, done: done, pct: pct, habits: habits, tasks: tasks, avoids: avoids };
}

// ============ محاسبه روزهای هفته به متن ============
function getDaysText(days) {
  if (!days || days.length === 0) return 'هر روز';
  if (days.length === 7) return 'هر روز';
  
  const dayNames = getDayNames();
  return days.map(function(d) { return dayNames[d]; }).join('، ');
}

// ============ محاسبه هدف به متن ============
function getGoalText(habit) {
  if (!habit) return '';
  
  if (habit.startDate && habit.endDate) {
    const start = isoToDate(habit.startDate);
    const end = isoToDate(habit.endDate);
    const daysDiff = Math.round((end - start) / 86400000) + 1;
    return daysDiff + ' روز چالش';
  }
  
  if (habit.goal > 0) {
    return habit.goal + ' روز';
  }
  
  return '';
}

// ============ آرزوها ============
function addDream(type, text) {
  const data = getData();
  if (!text || !text.trim()) return false;
  if (!data.dreams[type]) data.dreams[type] = [];
  
  data.dreams[type].push({
    text: text.trim(),
    done: false,
    doneDate: null,
    createdAt: new Date().toISOString()
  });
  saveData();
  return true;
}

function toggleDream(type, index) {
  const data = getData();
  if (!data.dreams[type] || index < 0 || index >= data.dreams[type].length) return false;
  
  const dream = data.dreams[type][index];
  dream.done = !dream.done;
  
  if (dream.done) {
    dream.doneDate = formatDate(new Date(), data.calendarType || 'jalali');
    data.points = (data.points || 0) + 10;
    if (typeof checkAchievements === 'function') checkAchievements();
  } else {
    dream.doneDate = null;
    data.points = Math.max(0, (data.points || 0) - 10);
  }
  saveData();
  return true;
}

function deleteDream(type, index) {
  const data = getData();
  if (!data.dreams[type] || index < 0 || index >= data.dreams[type].length) return false;
  data.dreams[type].splice(index, 1);
  saveData();
  return true;
}

// ============ استریک ============
function calculateStreak(habitIndex) {
  const data = getData();
  let streak = 0;
  
  for (let i = 0; i < 365; i++) {
    const dateStr = getDateAgoISO(i);
    const habit = data.habits[habitIndex];
    if (!habit) break;
    
    // چک کن آیا این عادت در این روز فعاله
    if (!isHabitActiveOnDate(habit, dateStr)) continue;
    
    if (!data.history[dateStr] || !data.history[dateStr].habits) {
      if (i === 0) continue;
      break;
    }
    
    if (data.history[dateStr].habits.includes(habitIndex)) {
      streak++;
    } else {
      if (i === 0) continue;
      break;
    }
  }
  return streak;
}

function getHabitProgress30Days(habitIndex) {
  const data = getData();
  let doneCount = 0, shouldCount = 0;
  
  for (let i = 0; i < 30; i++) {
    const dateStr = getDateAgoISO(i);
    const habit = data.habits[habitIndex];
    if (!habit) break;
    
    if (!isHabitActiveOnDate(habit, dateStr)) continue;
    
    shouldCount++;
    if (data.history[dateStr] && data.history[dateStr].habits && data.history[dateStr].habits.includes(habitIndex)) {
      doneCount++;
    }
  }
  return shouldCount === 0 ? 0 : Math.round((doneCount / shouldCount) * 100);
}

function getHabitProgressNDays(habitIndex, n) {
  const data = getData();
  let doneCount = 0, shouldCount = 0;
  
  for (let i = 0; i < n; i++) {
    const dateStr = getDateAgoISO(i);
    const habit = data.habits[habitIndex];
    if (!habit) break;
    
    if (!isHabitActiveOnDate(habit, dateStr)) continue;
    
    shouldCount++;
    if (data.history[dateStr] && data.history[dateStr].habits && data.history[dateStr].habits.includes(habitIndex)) {
      doneCount++;
    }
  }
  return shouldCount === 0 ? 0 : Math.round((doneCount / shouldCount) * 100);
}

function getBestHabit() {
  const data = getData();
  if (data.habits.length === 0) return null;
  let best = null, bestScore = -1;
  data.habits.forEach(function(habit, index) {
    const score = getHabitProgress30Days(index);
    if (score > bestScore) { bestScore = score; best = { habit: habit, index: index, score: score }; }
  });
  return best;
}

function getWorstHabit() {
  const data = getData();
  if (data.habits.length === 0) return null;
  let worst = null, worstScore = 101;
  data.habits.forEach(function(habit, index) {
    const score = getHabitProgress30Days(index);
    if (score < worstScore) { worstScore = score; worst = { habit: habit, index: index, score: score }; }
  });
  return worst;
}

// ============ پاک کردن هوشمند ============
function clearOldData() {
  const data = getData();
  const today = getToday();
  
  if (data.lastResetDate !== today) {
    // اول تو history ذخیره کن
    if (data.lastResetDate) {
      ensureHistoryDay(data.lastResetDate);
      data.history[data.lastResetDate].tasks = data.tasks.map(function(_, i) { return i; });
      data.history[data.lastResetDate].avoids = data.avoids.map(function(_, i) { return i; });
      data.history[data.lastResetDate].dreamsToday = data.dreams.today.map(function(_, i) { return i; });
    }
    
    // حالا پاک کن
    data.tasks = [];
    data.avoids = [];
    data.dreams.today = [];
    data.lastResetDate = today;
    saveData();
  }
  return true;
}

// ============ امتیاز ============
function addPoints(amount) {
  const data = getData();
  data.points = Math.max(0, (data.points || 0) + amount);
  saveData();
  return data.points;
}

// ============ سطح کاربر ============
function getUserLevel() {
  const data = getData();
  const points = data.points || 0;
  
  const levels = [
    { name: 'تازه‌کار', icon: '🌱', min: 0, max: 50 },
    { name: 'مبتدی', icon: '🌿', min: 50, max: 150 },
    { name: 'کوشا', icon: '🍀', min: 150, max: 300 },
    { name: 'فعال', icon: '🔥', min: 300, max: 500 },
    { name: 'کوشنده', icon: '⚡', min: 500, max: 800 },
    { name: 'متعهد', icon: '💪', min: 800, max: 1200 },
    { name: 'پیگیر', icon: '🎯', min: 1200, max: 1800 },
    { name: 'پیشرفته', icon: '🚀', min: 1800, max: 2500 },
    { name: 'ماهر', icon: '⭐', min: 2500, max: 3500 },
    { name: 'حرفه‌ای', icon: '🏆', min: 3500, max: 5000 },
    { name: 'نخبه', icon: '💎', min: 5000, max: 7000 },
    { name: 'استاد', icon: '👑', min: 7000, max: 10000 },
    { name: 'افسانه‌ای', icon: '🌟', min: 10000, max: 15000 },
    { name: 'قهرمان', icon: '🏅', min: 15000, max: 25000 },
    { name: 'جاودانه', icon: '🔥', min: 25000, max: 999999 }
  ];
  
  for (let i = 0; i < levels.length; i++) {
    const lv = levels[i];
    if (points >= lv.min && points < lv.max) {
      const progress = Math.round(((points - lv.min) / (lv.max - lv.min)) * 100);
      return { name: lv.name, icon: lv.icon, min: lv.min, max: lv.max, progress: progress, points: points };
    }
  }
  return { name: 'جاودانه', icon: '🔥', min: 25000, max: 999999, progress: 100, points: points };
}

// ============ دسته‌بندی‌ها ============
const DEFAULT_CATEGORIES = [
  { id: 'sport', name: 'ورزش', icon: '🏃', color: '#ef4444' },
  { id: 'study', name: 'مطالعه', icon: '📚', color: '#3b82f6' },
  { id: 'health', name: 'سلامت روحی', icon: '🧘', color: '#a855f7' },
  { id: 'work', name: 'کار/تحصیل', icon: '💼', color: '#f59e0b' },
  { id: 'food', name: 'تغذیه', icon: '🥗', color: '#22c55e' },
  { id: 'family', name: 'خانواده', icon: '👨‍👩‍👧', color: '#ec4899' },
  { id: 'other', name: 'متفرقه', icon: '✨', color: '#64748b' }
];

function getCategories() {
  const data = getData();
  const custom = data.customCategories || [];
  return DEFAULT_CATEGORIES.concat(custom);
}

function addCategory(name, icon, color) {
  const data = getData();
  if (!data.customCategories) data.customCategories = [];
  
  const id = 'custom_' + Date.now();
  data.customCategories.push({
    id: id,
    name: name,
    icon: icon || '✨',
    color: color || '#64748b',
    isCustom: true
  });
  saveData();
  return id;
}

function deleteCategory(id) {
  const data = getData();
  if (!data.customCategories) return false;
  
  const idx = data.customCategories.findIndex(function(c) { return c.id === id; });
  if (idx === -1) return false;
  
  data.customCategories.splice(idx, 1);
  saveData();
  return true;
}

function hideCategory(id) {
  const data = getData();
  if (!data.hiddenCategories) data.hiddenCategories = [];
  if (!data.hiddenCategories.includes(id)) {
    data.hiddenCategories.push(id);
    saveData();
  }
  return true;
}

function getVisibleCategories() {
  const data = getData();
  const hidden = data.hiddenCategories || [];
  return getCategories().filter(function(c) { return !hidden.includes(c.id); });
}

function getCategoryById(id) {
  return getCategories().find(function(c) { return c.id === id; });
}

// ============ دستاوردها ============
const ACHIEVEMENTS = [
  { id: 'first_step', icon: '👣', name: 'اولین قدم', desc: 'اولین عادتت رو تیک بزن', check: function(d) {
    return Object.keys(d.history).some(function(k) { return d.history[k].habits && d.history[k].habits.length > 0; });
  }},
  { id: 'streak_7', icon: '🔥', name: 'هفت روز پیوسته', desc: '۷ روز متوالی', check: function(d) {
    return d.habits.some(function(_, i) { return calculateStreak(i) >= 7; });
  }},
  { id: 'streak_30', icon: '💪', name: 'یک ماه پرقدرت', desc: '۳۰ روز متوالی', check: function(d) {
    return d.habits.some(function(_, i) { return calculateStreak(i) >= 30; });
  }},
  { id: 'dream_1', icon: '🎯', name: 'رویاپرداز', desc: 'اولین آرزوت رو تیک بزن', check: function(d) {
    return Object.values(d.dreams).some(function(arr) { return arr.some(function(dr) { return dr.done; }); });
  }},
  { id: 'points_100', icon: '💯', name: 'صد تایی', desc: '۱۰۰ امتیاز بگیر', check: function(d) { return (d.points || 0) >= 100; }},
  { id: 'points_1000', icon: '🏆', name: 'هزار تایی', desc: '۱۰۰۰ امتیاز بگیر', check: function(d) { return (d.points || 0) >= 1000; }},
  { id: 'focus_60', icon: '⏱️', name: 'تمرکز یک ساعته', desc: '۶۰ دقیقه تمرکز کن', check: function(d) { return (d.focusMinutes || 0) >= 60; }},
  { id: 'diary_1', icon: '📔', name: 'خاطره‌نویس', desc: 'اولین خاطره‌ت رو بنویس', check: function(d) { return Object.keys(d.diary || {}).length > 0; }}
];

function checkAchievements() {
  const data = getData();
  if (!data.unlockedAchievements) data.unlockedAchievements = [];
  const newlyUnlocked = [];
  
  ACHIEVEMENTS.forEach(function(ach) {
    if (!data.unlockedAchievements.includes(ach.id)) {
      try {
        if (ach.check(data)) {
          data.unlockedAchievements.push(ach.id);
          newlyUnlocked.push(ach);
        }
      } catch (e) {}
    }
  });
  
  if (newlyUnlocked.length > 0) {
    saveData();
    if (typeof showToast === 'function') {
      newlyUnlocked.forEach(function(ach) { showToast(ach.icon + ' ' + ach.name, 'success'); });
    }
    if (typeof showConfetti === 'function') showConfetti();
  }
  return newlyUnlocked;
}

function getUnlockedAchievements() {
  const data = getData();
  const unlocked = data.unlockedAchievements || [];
  return ACHIEVEMENTS.filter(function(a) { return unlocked.includes(a.id); });
}

function getItemsCount(type) { return getData()[type].length; }

console.log('✅ items.js بارگذاری شد');
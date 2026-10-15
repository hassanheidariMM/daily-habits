/* ============================================
   Daily Habits - Calendar
   تقویم شمسی، میلادی، قمری
   ============================================ */

// ============ تبدیل میلادی به شمسی ============
function toJalali(gy, gm, gd) {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = (gy <= 1600) ? 0 : 979;
  gy -= (gy <= 1600) ? 621 : 1600;
  const gy2 = (gm > 2) ? (gy + 1) : gy;
  let days = (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) - 80 + gd + g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) { jy += Math.floor((days - 1) / 365); days = (days - 1) % 365; }
  const jm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
  return [jy, jm, jd];
}

// ============ تبدیل شمسی به میلادی ============
function jalaliToGregorian(jy, jm, jd) {
  jy += 1595;
  let days = -355668 + (365 * jy) + (Math.floor(jy / 33) * 8) + Math.floor(((jy % 33) + 3) / 4) + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
  let gy = 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) { gy += 100 * Math.floor(--days / 36524); days %= 36524; if (days >= 365) days++; }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) { gy += Math.floor((days - 1) / 365); days = (days - 1) % 365; }
  let gd = days + 1;
  const sal_a = [0, 31, (gy % 4 === 0 && (gy % 100 !== 0 || gy % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  for (gm = 0; gm < 13; gm++) { const v = sal_a[gm]; if (gd <= v) break; gd -= v; }
  return [gy, gm, gd];
}

// ============ تبدیل میلادی به قمری ============
function toHijri(gy, gm, gd) {
  const jd = Math.floor((gy * 365.25) + (gm * 30.6) + gd) - 1948440;
  const hYear = Math.floor((30 * jd + 10646) / 10631);
  const hMonth = Math.min(12, Math.max(1, Math.ceil((jd - 29 - 30 * Math.ceil((hYear - 1) * 12 / 30)) / 29.5) + 1));
  const hDay = Math.max(1, Math.min(30, jd - Math.ceil(29.5 * (hMonth - 1)) - 30 * Math.ceil((hYear - 1) * 12 / 30) + 1));
  return [hYear, hMonth, hDay];
}

// ============ تبدیل قمری به میلادی ============
function hijriToGregorian(hy, hm, hd) {
  const jd = Math.floor((11 * hy + 3) / 30) + 354 * hy + 30 * hm - Math.floor((hm - 1) / 2) + hd + 1948440 - 385;
  let gy = Math.floor((4 * jd + 3) / 1461);
  let gd = jd - Math.floor((1461 * gy) / 4) + 1;
  gy = 100 * Math.floor((gy - 49) / 100) + 49;
  gd = gd + 365 * (gy - 1) - Math.floor(gy / 4) + 1;
  const sal_a = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm;
  for (gm = 1; gm <= 12; gm++) { if (gd <= sal_a[gm]) break; gd -= sal_a[gm]; }
  return [gy, gm, gd];
}

// ============ نام ماه‌ها ============
function getJalaliMonths() {
  return t('jalaliMonths') || ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
}

function getHijriMonths() {
  return t('hijriMonths') || ['محرم', 'صفر', 'ربیع‌الاول', 'ربیع‌الثانی', 'جمادی‌الاول', 'جمادی‌الثانی', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذی‌القعده', 'ذی‌الحجه'];
}

function getGregorianMonths() {
  return t('gregorianMonths') || ['ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن', 'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'];
}

// ============ نام روزهای هفته ============
// ترتیب ایرانی: شنبه=0 ... جمعه=6
function getDayNames() {
  const type = (getData() && getData().calendarType) || 'jalali';
  
  // برای تقویم میلادی: یکشنبه اول
  if (type === 'gregorian') {
    return t('dayNamesGregorian') || ['یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
  }
  
  // برای شمسی/قمری: شنبه اول
  return t('dayNames') || ['شنبه', 'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
}

function getDayNamesShort() {
  const type = (getData() && getData().calendarType) || 'jalali';
  
  if (type === 'gregorian') {
    return t('dayNamesShortGregorian') || ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'];
  }
  
  return t('dayNamesShort') || ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
}

// ============ فرمت تاریخ ============
function formatDate(dateObj, type) {
  if (!dateObj) dateObj = new Date();
  if (!type) type = (getData() && getData().calendarType) || 'jalali';
  
  const gy = dateObj.getFullYear();
  const gm = dateObj.getMonth() + 1;
  const gd = dateObj.getDate();
  
  if (type === 'jalali') {
    const [jy, jm, jd] = toJalali(gy, gm, gd);
    return toLocalNum(jd) + ' ' + getJalaliMonths()[jm - 1] + ' ' + toLocalNum(jy);
  } else if (type === 'hijri') {
    const [hy, hm, hd] = toHijri(gy, gm, gd);
    return toLocalNum(hd) + ' ' + getHijriMonths()[hm - 1] + ' ' + toLocalNum(hy);
  } else {
    return toLocalNum(gd) + ' ' + getGregorianMonths()[gm - 1] + ' ' + toLocalNum(gy);
  }
}

function formatDateWithDay(dateObj, type) {
  if (!dateObj) dateObj = new Date();
  
  const dayNames = getDayNames();
  const dayIndex = getDayOfWeekForCalendar(dateObj);
  const dayName = dayNames[dayIndex] || '';
  
  return dayName + '، ' + formatDate(dateObj, type);
}

function formatDateShort(dateObj, type) {
  if (!dateObj) dateObj = new Date();
  if (!type) type = (getData() && getData().calendarType) || 'jalali';
  
  const gy = dateObj.getFullYear();
  const gm = dateObj.getMonth() + 1;
  const gd = dateObj.getDate();
  
  if (type === 'jalali') {
    const [jy, jm, jd] = toJalali(gy, gm, gd);
    return toLocalNum(jy) + '/' + toLocalNum(String(jm).padStart(2, '0')) + '/' + toLocalNum(String(jd).padStart(2, '0'));
  } else if (type === 'hijri') {
    const [hy, hm, hd] = toHijri(gy, gm, gd);
    return toLocalNum(hy) + '/' + toLocalNum(String(hm).padStart(2, '0')) + '/' + toLocalNum(String(hd).padStart(2, '0'));
  } else {
    return toLocalNum(gy) + '/' + toLocalNum(String(gm).padStart(2, '0')) + '/' + toLocalNum(String(gd).padStart(2, '0'));
  }
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  return toLocalNum(parts[0]) + ':' + toLocalNum(parts[1]);
}

// ============ تاریخ امروز ============
function getTodayISO() {
  return new Date().toISOString().split('T')[0];
}

function getDateAgoISO(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function isoToDate(isoStr) {
  return new Date(isoStr + 'T00:00:00');
}

// ============ روز هفته برای تقویم ============
// بر اساس تقویم انتخاب‌شده، روز هفته رو برمی‌گردونه
// شمسی/قمری: شنبه=0 ... جمعه=6
// میلادی: یکشنبه=0 ... شنبه=6
function getDayOfWeekForCalendar(dateObj) {
  if (!dateObj) dateObj = new Date();
  const type = (getData() && getData().calendarType) || 'jalali';
  
  const jsDay = dateObj.getDay(); // 0=Sunday, 6=Saturday
  
  if (type === 'gregorian') {
    // یکشنبه=0
    return jsDay;
  } else {
    // شنبه=0
    // js: Sun=0, Mon=1, ... Sat=6
    // تبدیل به: Sat=0, Sun=1, Mon=2, ... Fri=6
    return (jsDay + 1) % 7;
  }
}

// ============ سازگاری با کد قدیمی ============
function getIranianDayOfWeek(dateObj) {
  return getDayOfWeekForCalendar(dateObj);
}

// ============ روز هفته امروز ============
function getTodayDayName() {
  const dayNames = getDayNames();
  return dayNames[getDayOfWeekForCalendar()] || '';
}

// ============ بازه‌ها ============
function getNextDay(dateStr) {
  const d = isoToDate(dateStr);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function getPrevDay(dateStr) {
  const d = isoToDate(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function getLastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) days.push(getDateAgoISO(i));
  return days;
}

function getCurrentWeek() {
  const start = getStartOfWeek();
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

// ============ شروع هفته (بر اساس تقویم) ============
function getStartOfWeek(dateObj) {
  const d = dateObj ? new Date(dateObj) : new Date();
  const type = (getData() && getData().calendarType) || 'jalali';
  
  const jsDay = d.getDay();
  
  if (type === 'gregorian') {
    // هفته از یکشنبه شروع می‌شه
    d.setDate(d.getDate() - jsDay);
  } else {
    // هفته از شنبه شروع می‌شه
    const daysFromSaturday = (jsDay + 1) % 7;
    d.setDate(d.getDate() - daysFromSaturday);
  }
  
  d.setHours(0, 0, 0, 0);
  return d;
}

// ============ تعداد روزهای ماه ============
function getJalaliMonthDays(jy, jm) {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  const rem = jy % 33;
  return [1, 5, 9, 13, 17, 22, 26, 30].includes(rem) ? 30 : 29;
}

function getHijriMonthDays(hy, hm) {
  const jd_start = Math.floor((11 * hy + 3) / 30) + 354 * hy + 30 * hm - Math.floor((hm - 1) / 2) + 1 + 1948440 - 385;
  const jd_end = Math.floor((11 * hy + 3) / 30) + 354 * hy + 30 * (hm + 1) - Math.floor(hm / 2) + 1 + 1948440 - 385;
  return jd_end - jd_start;
}

function getGregorianMonthDays(year, month) {
  return new Date(year, month, 0).getDate();
}

// ============ روز اول ماه ============
function getFirstDayOfJalaliMonth(jy, jm) {
  const [gy, gm, gd] = jalaliToGregorian(jy, jm, 1);
  return new Date(gy, gm - 1, gd);
}

function getFirstDayOfHijriMonth(hy, hm) {
  const [gy, gm, gd] = hijriToGregorian(hy, hm, 1);
  return new Date(gy, gm - 1, gd);
}

// ============ امروز در تقویم ============
function getTodayCalendarPos(type) {
  type = type || (getData() && getData().calendarType) || 'jalali';
  const now = new Date();
  
  if (type === 'jalali') {
    const [jy, jm, jd] = toJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
    return { year: jy, month: jm, day: jd };
  } else if (type === 'hijri') {
    const [hy, hm, hd] = toHijri(now.getFullYear(), now.getMonth() + 1, now.getDate());
    return { year: hy, month: hm, day: hd };
  } else {
    return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  }
}

console.log('✅ calendar.js بارگذاری شد');
/* ============================================
   Daily Habits - Premium
   نسخه پرمیوم + کد تخفیف + قابلیت‌های ویژه
   ============================================ */

const PREMIUM_FEATURES = [
  { icon: '🚫', title: 'حذف تبلیغات', desc: 'تجربه‌ای بدون وقفه و مزاحمت' },
  { icon: '🎨', title: '۱۶ تم اختصاصی', desc: 'طلایی، الماس، سلطنتی، کهکشان، فصلی و...' },
  { icon: '✒️', title: '۸ فونت اختصاصی', desc: 'شبنم، صمیم، تنها، گندم و...' },
  { icon: '📊', title: 'نمودارهای پیشرفته', desc: 'نمودار خطی، Heatmap و رکوردها' },
  { icon: '📔', title: 'خروجی PDF خاطرات', desc: 'دانلود دفتر خاطرات به صورت PDF' },
  { icon: '☁️', title: 'پشتیبان خودکار', desc: 'پشتیبان روزانه خودکار از اطلاعات' },
  { icon: '🎵', title: '۸ صدای تیک پرمیوم', desc: 'صدای ستاره، شیشه، دینگ و...' },
  { icon: '💎', title: 'نشان پرمیوم', desc: 'نمایش نشان ویژه در هدر اپ' },
  { icon: '🎁', title: 'جعبه جایزه ویژه', desc: '۲ برابر شانس در دریافت جایزه' },
  { icon: '🔑', title: 'کد تخفیف', desc: 'امکان استفاده از کدهای تخفیف ویژه' }
];

const PREMIUM_PLANS = [
  {
    id: 'monthly',
    title: 'ماهانه',
    price: 87000,
    priceText: '۸۷,۰۰۰ تومان',
    duration: '۱ ماه',
    badge: '',
    discount: 0
  },
  {
    id: 'quarterly',
    title: 'سه ماهه',
    price: 207000,
    priceText: '۲۰۷,۰۰۰ تومان',
    duration: '۳ ماه',
    badge: '۱۰٪ تخفیف',
    discount: 10,
    popular: true
  },
  {
    id: 'yearly',
    title: 'سالانه',
    price: 597000,
    priceText: '۵۹۷,۰۰۰ تومان',
    duration: '۱۲ ماه',
    badge: '۴۰٪ تخفیف',
    discount: 40
  },
  {
    id: 'lifetime',
    title: 'همیشگی',
    price: 1497000,
    priceText: '۱,۴۹۷,۰۰۰ تومان',
    duration: 'برای همیشه',
    badge: 'بهترین ارزش',
    best: true
  }
];

// ============ لیست کدهای تخفیف ============
// ⚠️ این لیست رو می‌تونی هر وقت خواستی ویرایش کنی
const DISCOUNT_CODES = [
  { code: 'WELCOME',  percent: 20,  type: 'percent', maxUses: 999999, used: 0, active: true },
  { code: 'DAILY50',  percent: 50,  type: 'percent', maxUses: 1000,   used: 0, active: true },
  { code: 'VIP100',   percent: 100, type: 'percent', maxUses: 10,     used: 0, active: true },
  { code: 'FREE1M',   percent: 100, type: 'percent', maxUses: 50,     used: 0, active: true }
];

// ============ بررسی پرمیوم ============
function isPremium() {
  const data = getData();
  if (!data.isPremium) return false;
  if (data.premiumType === 'lifetime') return true;
  if (data.premiumDate) {
    const expiry = new Date(data.premiumDate);
    if (expiry > new Date()) return true;
    data.isPremium = false;
    saveData();
    return false;
  }
  return false;
}

// ============ فعال‌سازی پرمیوم ============
function activatePremium(planId, options) {
  options = options || {};
  const data = getData();
  const plan = PREMIUM_PLANS.find(function(p) { return p.id === planId; });
  if (!plan) return false;
  
  const now = new Date();
  let expiry = new Date();
  
  switch (planId) {
    case 'monthly': expiry.setMonth(now.getMonth() + 1); break;
    case 'quarterly': expiry.setMonth(now.getMonth() + 3); break;
    case 'yearly': expiry.setFullYear(now.getFullYear() + 1); break;
    case 'lifetime': expiry = null; break;
  }
  
  data.isPremium = true;
  data.premiumType = planId;
  data.premiumDate = expiry ? expiry.toISOString() : null;
  data.premiumActivatedAt = now.toISOString();
  data.adsRemoved = true;
  if (options.discountCode) data.usedDiscountCode = options.discountCode;
  saveData();
  
  if (typeof showToast === 'function') showToast('👑 پرمیوم فعال شد!', 'success');
  if (typeof showConfetti === 'function') showConfetti();
  if (typeof playAchievementSound === 'function') playAchievementSound();
  
  return true;
}

function deactivatePremium() {
  const data = getData();
  data.isPremium = false;
  data.premiumType = null;
  data.premiumDate = null;
  data.adsRemoved = false;
  saveData();
  if (typeof showToast === 'function') showToast('پرمیوم غیرفعال شد', 'info');
}

function getPremiumInfo() {
  const data = getData();
  if (!isPremium()) {
    return { active: false, type: null, expiry: null, daysLeft: 0 };
  }
  let daysLeft = null;
  if (data.premiumType === 'lifetime') daysLeft = '∞';
  else if (data.premiumDate) {
    const expiry = new Date(data.premiumDate);
    const now = new Date();
    daysLeft = Math.max(0, Math.ceil((expiry - now) / 86400000));
  }
  return {
    active: true,
    type: data.premiumType,
    typeName: PREMIUM_PLANS.find(function(p) { return p.id === data.premiumType; })?.title || '',
    expiry: data.premiumDate,
    expiryText: data.premiumDate ? formatDate(new Date(data.premiumDate)) : 'همیشگی',
    daysLeft: daysLeft,
    activatedAt: data.premiumActivatedAt
  };
}

// ============ کد تخفیف ============
function validateDiscountCode(code) {
  if (!code || !code.trim()) return null;
  const cleanCode = code.trim().toUpperCase();
  const found = DISCOUNT_CODES.find(function(c) {
    return c.code.toUpperCase() === cleanCode && c.active !== false;
  });
  if (!found) return null;
  if (found.used >= found.maxUses) return null;
  if (found.expiry && new Date(found.expiry) < new Date()) return null;
  return found;
}

function applyDiscountCode(code) {
  const discount = validateDiscountCode(code);
  if (!discount) {
    if (typeof showToast === 'function') showToast('❌ کد تخفیف نامعتبر یا منقضی شده', 'error');
    if (typeof playErrorSound === 'function') playErrorSound();
    return { success: false };
  }
  const data = getData();
  data.appliedDiscount = {
    code: discount.code,
    percent: discount.percent,
    type: discount.type,
    appliedAt: new Date().toISOString()
  };
  saveData();
  if (typeof showToast === 'function') showToast('🎉 کد تخفیف اعمال شد! ' + discount.percent + '٪', 'success');
  if (typeof playSuccessSound === 'function') playSuccessSound();
  return { success: true, discount: discount };
}

function getAppliedDiscount() {
  return getData().appliedDiscount || null;
}

function clearAppliedDiscount() {
  const data = getData();
  data.appliedDiscount = null;
  saveData();
}

function useDiscountCode(code) {
  const discount = DISCOUNT_CODES.find(function(c) { return c.code === code; });
  if (discount) discount.used = (discount.used || 0) + 1;
}

// ============ مودال پرمیوم ============
function showPremiumModal() {
  let modal = document.getElementById('premiumModal');
  if (modal) modal.remove();
  
  modal = document.createElement('div');
  modal.id = 'premiumModal';
  modal.className = 'modal-overlay';
  
  const info = getPremiumInfo();
  const appliedDiscount = getAppliedDiscount();
  
  modal.innerHTML = 
    '<div class="modal-content premium-modal">' +
      '<button class="modal-close" id="premiumClose">✕</button>' +
      '<div class="premium-header">' +
        '<div class="premium-crown">👑</div>' +
        '<h2>نسخه پرمیوم</h2>' +
        '<p>تجربه‌ای کامل و بدون محدودیت</p>' +
      '</div>' +
      (info.active ? 
        '<div class="premium-active-box">' +
          '<div class="premium-active-icon">✨</div>' +
          '<div class="premium-active-title">پرمیوم فعاله!</div>' +
          '<div class="premium-active-info">' +
            'نوع: ' + info.typeName + ' ' + (info.daysLeft !== '∞' ? '• ' + toLocalNum(info.daysLeft) + ' روز باقی‌مونده' : '• همیشگی') +
          '</div>' +
        '</div>'
      : 
        '<div class="premium-features">' +
          PREMIUM_FEATURES.map(function(f) {
            return '<div class="premium-feature">' +
              '<span class="premium-feature-icon">' + f.icon + '</span>' +
              '<div class="premium-feature-text">' +
                '<div class="premium-feature-title">' + f.title + '</div>' +
                '<div class="premium-feature-desc">' + f.desc + '</div>' +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>' +
        '<div class="discount-section">' +
          '<div class="discount-input-row">' +
            '<input type="text" id="discountCodeInput" placeholder="کد تخفیف (اختیاری)" class="discount-input">' +
            '<button id="applyDiscountBtn" class="discount-apply-btn">اعمال</button>' +
          '</div>' +
          (appliedDiscount ? 
            '<div class="discount-applied">' +
              '🎉 کد فعال: <b>' + appliedDiscount.code + '</b> — ' + toLocalNum(appliedDiscount.percent) + '٪ تخفیف' +
              ' <button class="discount-clear-btn" id="clearDiscountBtn">✕</button>' +
            '</div>'
            : ''
          ) +
        '</div>' +
        '<div class="premium-plans">' +
          PREMIUM_PLANS.map(function(plan) {
            const finalPrice = appliedDiscount 
              ? Math.round(plan.price * (1 - appliedDiscount.percent / 100))
              : plan.price;
            const finalPriceText = toLocalNum(String(finalPrice).replace(/\B(?=(\d{3})+(?!\d))/g, ',')) + ' تومان';
            return '<div class="premium-plan ' + (plan.popular ? 'popular' : '') + ' ' + (plan.best ? 'best' : '') + '" data-plan="' + plan.id + '">' +
              (plan.badge ? '<div class="plan-badge">' + plan.badge + '</div>' : '') +
              '<div class="plan-title">' + plan.title + '</div>' +
              '<div class="plan-price">' + (appliedDiscount ? '<s>' + plan.priceText + '</s> ' + finalPriceText : plan.priceText) + '</div>' +
              '<div class="plan-duration">' + plan.duration + '</div>' +
            '</div>';
          }).join('') +
        '</div>' +
        '<button class="premium-buy-btn" id="premiumBuyBtn">🛒 خرید پرمیوم</button>' +
        '<p class="premium-note">💙 پرداخت امن • فعال‌سازی فوری</p>'
      ) +
      '<div class="premium-footer"><p>ساخته شده با ❤️ برای تو</p></div>' +
    '</div>';
  
  document.body.appendChild(modal);
  setTimeout(function() { modal.classList.add('show'); }, 10);
  
  const closeBtn = modal.querySelector('#premiumClose');
  if (closeBtn) closeBtn.addEventListener('click', closePremiumModal);
  
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closePremiumModal();
  });
  
  let selectedPlan = 'yearly';
  modal.querySelectorAll('.premium-plan').forEach(function(el) {
    el.addEventListener('click', function() {
      modal.querySelectorAll('.premium-plan').forEach(function(p) { p.classList.remove('selected'); });
      el.classList.add('selected');
      selectedPlan = el.dataset.plan;
      if (typeof playClickSound === 'function') playClickSound();
    });
  });
  
  const defaultPlan = modal.querySelector('[data-plan="yearly"]');
  if (defaultPlan) defaultPlan.classList.add('selected');
  
  const buyBtn = modal.querySelector('#premiumBuyBtn');
  if (buyBtn) {
    buyBtn.addEventListener('click', function() { startPurchase(selectedPlan); });
  }
  
  const applyBtn = modal.querySelector('#applyDiscountBtn');
  const codeInput = modal.querySelector('#discountCodeInput');
  if (applyBtn && codeInput) {
    applyBtn.addEventListener('click', function() {
      const result = applyDiscountCode(codeInput.value);
      if (result.success) {
        closePremiumModal();
        setTimeout(showPremiumModal, 300);
      }
    });
    codeInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') applyBtn.click();
    });
  }
  
  const clearBtn = modal.querySelector('#clearDiscountBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      clearAppliedDiscount();
      closePremiumModal();
      setTimeout(showPremiumModal, 300);
      if (typeof showToast === 'function') showToast('کد تخفیف حذف شد', 'info');
    });
  }
}

function closePremiumModal() {
  const modal = document.getElementById('premiumModal');
  if (!modal) return;
  modal.classList.remove('show');
  setTimeout(function() { modal.remove(); }, 300);
}

// ============ خرید ============
function startPurchase(planId) {
  const plan = PREMIUM_PLANS.find(function(p) { return p.id === planId; });
  if (!plan) return;
  const appliedDiscount = getAppliedDiscount();
  showPaymentMethodModal(plan, appliedDiscount);
}

function showPaymentMethodModal(plan, discount) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay show';
  modal.id = 'paymentModal';
  
  const finalPrice = discount ? Math.round(plan.price * (1 - discount.percent / 100)) : plan.price;
  const finalPriceText = toLocalNum(String(finalPrice).replace(/\B(?=(\d{3})+(?!\d))/g, ',')) + ' تومان';
  
  modal.innerHTML = 
    '<div class="modal-content payment-modal">' +
      '<button class="modal-close" onclick="this.closest(\'.modal-overlay\').remove()">✕</button>' +
      '<h2>روش پرداخت</h2>' +
      '<p class="payment-plan">' + plan.title + ' — ' + finalPriceText + '</p>' +
      '<div class="payment-methods">' +
        '<button class="payment-method" data-method="cafe-bazaar"><span class="payment-icon">🏪</span><span class="payment-name">کافه بازار</span></button>' +
        '<button class="payment-method" data-method="myket"><span class="payment-icon">🛍️</span><span class="payment-name">مایکت</span></button>' +
        '<button class="payment-method" data-method="zarinpal"><span class="payment-icon">💳</span><span class="payment-name">زرین‌پال</span></button>' +
      '</div>' +
      '<p class="payment-note">🎁 در حال حاضر همه قابلیت‌های پرمیوم <b>رایگان</b> در دسترسه!</p>' +
      '<button class="premium-activate-demo" onclick="activatePremiumDemo(\'' + plan.id + '\')">🎉 فعال‌سازی آزمایشی (دمو)</button>' +
    '</div>';
  
  document.body.appendChild(modal);
  
  modal.querySelectorAll('.payment-method').forEach(function(btn) {
    btn.addEventListener('click', function() {
      processPayment(btn.dataset.method, plan);
    });
  });
}

function processPayment(method, plan) {
  if (typeof showToast === 'function') showToast('💳 در حال اتصال به درگاه...', 'info');
  setTimeout(function() {
    if (typeof showToast === 'function') showToast('🚧 درگاه پرداخت به‌زودی فعال می‌شه', 'info');
  }, 1500);
}

window.activatePremiumDemo = function(planId) {
  const discount = getAppliedDiscount();
  activatePremium(planId, { discountCode: discount ? discount.code : null });
  if (discount) {
    useDiscountCode(discount.code);
    clearAppliedDiscount();
  }
  closePremiumModal();
  const paymentModal = document.getElementById('paymentModal');
  if (paymentModal) paymentModal.remove();
  if (typeof renderThemes === 'function') renderThemes();
  if (typeof updateHeader === 'function') updateHeader();
  if (typeof renderFontSelect === 'function') renderFontSelect();
  if (typeof showPremiumModal === 'function') {
    setTimeout(showPremiumModal, 500);
  }
};

// ============ بررسی دسترسی ============
function canUseAdvancedCharts() { return isPremium(); }
function canUsePDF() { return isPremium(); }
function canUseAutoBackup() { return isPremium(); }
function canUsePremiumSounds() { return isPremium(); }
function getPremiumOnlySounds() {
  return ['tick18', 'tick11', 'tick6', 'tick15', 'tick19', 'tick17', 'tick12', 'tick7'];
}

// ============ بررسی انقضا ============
function checkPremiumExpiry() {
  const data = getData();
  if (!data.isPremium || data.premiumType === 'lifetime') return;
  if (!data.premiumDate) return;
  const expiry = new Date(data.premiumDate);
  const now = new Date();
  if (expiry <= now) {
    data.isPremium = false;
    saveData();
    if (typeof showToast === 'function') showToast('⏰ پرمیوم شما منقضی شد', 'info');
  } else {
    const daysLeft = Math.ceil((expiry - now) / 86400000);
    if (daysLeft <= 3 && data.lastExpiryWarning !== getToday()) {
      data.lastExpiryWarning = getToday();
      saveData();
      if (typeof showNotification === 'function' && typeof hasNotificationPermission === 'function' && hasNotificationPermission()) {
        showNotification('⏰ پرمیوم در حال انقضا', 'فقط ' + daysLeft + ' روز تا پایان پرمیومت مونده');
      }
    }
  }
}

// ============ راه‌اندازی ============
function initPremium() {
  const btn = document.getElementById('premiumBtn');
  if (btn) {
    btn.addEventListener('click', showPremiumModal);
    if (isPremium()) {
      btn.textContent = '👑 پرمیوم فعال — مشاهده';
      btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    }
  }
  checkPremiumExpiry();
  console.log('✅ Premium راه‌اندازی شد');
}

console.log('✅ premium.js بارگذاری شد');
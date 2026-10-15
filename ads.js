/* ============================================
   Daily Habits - Ads
   تبلیغات غیرمزاحم (تپسل)
   ============================================ */

// ============ تنظیمات تبلیغات ============
const ADS_CONFIG = {
  // ⚠️ این شناسه‌ها بعداً از پنل تپسل گرفته می‌شن
  tapsellAppKey: '', // کلید اپ در تپسل
  
  // شناسه‌های Zone (جایگاه تبلیغ)
  zones: {
    banner: '',      // بنر پایین صفحه
    interstitial: '', // تبلیغ تمام‌صفحه بین تب‌ها
    rewarded: '',    // تبلیغ جایزه‌دار
    native: ''       // تبلیغ بومی (نیتیو)
  },
  
  // فواصل نمایش
  interstitialCooldown: 5 * 60 * 1000, // ۵ دقیقه بین تبلیغات تمام‌صفحه
  maxInterstitialPerDay: 5,            // حداکثر ۵ بار در روز
  
  // فعال بودن
  enabled: true
};

// ============ تشخیص محیط ============
const IS_MOBILE_APP = typeof window.Capacitor !== 'undefined' ||
                      typeof window.cordova !== 'undefined' ||
                      navigator.userAgent.includes('DailyHabitsApp');

const IS_TApsell_AVAILABLE = typeof window.Tapsell !== 'undefined';

// ============ بررسی نمایش تبلیغ ============
function shouldShowAds() {
  const data = getData();
  
  // پرمیوم: بدون تبلیغ
  if (isPremium()) return false;
  if (data.adsRemoved) return false;
  if (data.adsEnabled === false) return false;
  
  return ADS_CONFIG.enabled;
}

// ============ تبلیغ بنر ============
let bannerAdShown = false;

function showBannerAd() {
  if (!shouldShowAds()) {
    hideBannerAd();
    return;
  }
  
  // اگر بنر از قبل نشون داده شده، کاری نکن
  if (bannerAdShown) return;
  
  // در محیط وب: نمایش تبلیغ نمایشی
  if (!IS_MOBILE_APP || !IS_TApsell_AVAILABLE) {
    showDemoBanner();
    bannerAdShown = true;
    return;
  }
  
  // در اپ موبایل: از تپسل
  try {
    window.Tapsell.showBannerAd({
      zoneId: ADS_CONFIG.zones.banner,
      containerId: 'adBannerContainer',
      bannerSize: 'BANNER_320_50'
    });
    bannerAdShown = true;
  } catch (e) {
    console.warn('خطا در نمایش بنر:', e);
  }
}

// ============ بنر دمو (محیط وب) ============
function showDemoBanner() {
  let container = document.getElementById('adBannerContainer');
  
  if (!container) {
    container = document.createElement('div');
    container.id = 'adBannerContainer';
    container.className = 'ad-banner';
    document.body.appendChild(container);
  }
  
  container.innerHTML = `
    <div class="ad-demo">
      <span class="ad-label">تبلیغ</span>
      <span class="ad-text">🚀 نسخه پرمیوم رو بخر و بدون تبلیغ استفاده کن!</span>
      <button class="ad-close" onclick="hideBannerAd()">✕</button>
    </div>
  `;
  
  container.classList.add('show');
}

// ============ مخفی کردن بنر ============
function hideBannerAd() {
  const container = document.getElementById('adBannerContainer');
  if (container) {
    container.classList.remove('show');
    if (IS_MOBILE_APP && IS_TApsell_AVAILABLE) {
      try {
        window.Tapsell.hideBannerAd({ zoneId: ADS_CONFIG.zones.banner });
      } catch (e) {}
    }
  }
  bannerAdShown = false;
}

// ============ تبلیغ تمام‌صفحه ============
let lastInterstitialTime = 0;
let interstitialCountToday = 0;
let interstitialDate = null;

function showInterstitialAd(callback) {
  if (!shouldShowAds()) {
    if (callback) callback(false);
    return;
  }
  
  // بررسی کول‌داون
  const now = Date.now();
  if (now - lastInterstitialTime < ADS_CONFIG.interstitialCooldown) {
    if (callback) callback(false);
    return;
  }
  
  // بررسی محدودیت روزانه
  const today = getToday();
  if (interstitialDate !== today) {
    interstitialDate = today;
    interstitialCountToday = 0;
  }
  
  if (interstitialCountToday >= ADS_CONFIG.maxInterstitialPerDay) {
    if (callback) callback(false);
    return;
  }
  
  // در محیط وب: پیام دمو
  if (!IS_MOBILE_APP || !IS_TApsell_AVAILABLE) {
    showDemoInterstitial(callback);
    return;
  }
  
  // در اپ موبایل: از تپسل
  try {
    window.Tapsell.showInterstitialAd({
      zoneId: ADS_CONFIG.zones.interstitial,
      onAdShow: () => {
        lastInterstitialTime = Date.now();
        interstitialCountToday++;
      },
      onAdClose: () => {
        if (callback) callback(true);
      },
      onError: (err) => {
        console.warn('خطا در تبلیغ تمام‌صفحه:', err);
        if (callback) callback(false);
      }
    });
  } catch (e) {
    if (callback) callback(false);
  }
}

// ============ تبلیغ دمو تمام‌صفحه ============
function showDemoInterstitial(callback) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay show';
  overlay.style.zIndex = '20000';
  
  overlay.innerHTML = `
    <div class="modal-content ad-interstitial">
      <div class="ad-header">
        <span class="ad-label">تبلیغ</span>
        <button class="ad-skip" id="adSkipBtn">✕ بستن (۵)</button>
      </div>
      
      <div class="ad-content">
        <div class="ad-icon">👑</div>
        <h2>نسخه پرمیوم</h2>
        <p>با خرید پرمیوم، تمام تبلیغات حذف می‌شن و به ۸ تم اختصاصی دسترسی پیدا می‌کنی!</p>
        
        <button class="ad-cta" onclick="closeInterstitial(true); showPremiumModal();">
          🛒 مشاهده پرمیوم
        </button>
      </div>
      
      <div class="ad-footer">
        <span>Powered by Tapsell</span>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // شمارش معکوس
  let countdown = 5;
  const skipBtn = overlay.querySelector('#adSkipBtn');
  if (!skipBtn) return;
  
  const timer = setInterval(() => {
    countdown--;
    if (countdown <= 0) {
      clearInterval(timer);
      skipBtn.textContent = '✕ بستن';
      skipBtn.disabled = false;
    } else {
      skipBtn.textContent = `✕ بستن (${toLocalNum(countdown)})`;
    }
  }, 1000);
  
  skipBtn.disabled = true;
  
  skipBtn.addEventListener('click', () => {
    clearInterval(timer);
    closeInterstitial(true);
  });
  
  lastInterstitialTime = Date.now();
  interstitialCountToday++;
}

// ============ بستن تبلیغ تمام‌صفحه ============
window.closeInterstitial = function(shown) {
  const overlay = document.querySelector('.ad-interstitial')?.closest('.modal-overlay');
  if (overlay) {
    overlay.classList.remove('show');
    setTimeout(() => overlay.remove(), 300);
  }
};

// ============ تبلیغ جایزه‌دار ============
function showRewardedAd(rewardCallback) {
  // تبلیغ جایزه‌دار حتی برای پرمیوم کار می‌کنه (اختیاری)
  const data = getData();
  
  if (!IS_MOBILE_APP || !IS_TApsell_AVAILABLE) {
    // دمو
    const confirmed = confirm(
      '🎁 تبلیغ جایزه‌دار\n\n' +
      'با دیدن این تبلیغ، ۵۰ امتیاز جایزه می‌گیری!\n\n' +
      'مشاهده می‌کنی؟'
    );
    
    if (confirmed) {
      setTimeout(() => {
        addPoints(50);
        if (typeof showToast === 'function') {
          showToast('🎁 ۵۰ امتیاز گرفتی!', 'success');
        }
        if (typeof showConfetti === 'function') showConfetti();
        if (rewardCallback) rewardCallback(true);
      }, 1000);
    } else {
      if (rewardCallback) rewardCallback(false);
    }
    return;
  }
  
  // در اپ موبایل
  try {
    window.Tapsell.showRewardedVideoAd({
      zoneId: ADS_CONFIG.zones.rewarded,
      onAdShow: () => {},
      onRewarded: () => {
        addPoints(50);
        if (typeof showToast === 'function') {
          showToast('🎁 ۵۰ امتیاز گرفتی!', 'success');
        }
        if (rewardCallback) rewardCallback(true);
      },
      onAdClose: () => {},
      onError: (err) => {
        console.warn('خطا در تبلیغ جایزه‌دار:', err);
        if (rewardCallback) rewardCallback(false);
      }
    });
  } catch (e) {
    if (rewardCallback) rewardCallback(false);
  }
}

// ============ تبلیغ بومی (Native) ============
function showNativeAd(containerId) {
  if (!shouldShowAds()) return;
  
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (!IS_MOBILE_APP || !IS_TApsell_AVAILABLE) {
    // دمو
    container.innerHTML = `
      <div class="ad-native">
        <span class="ad-label">تبلیغ</span>
        <div class="ad-native-content">
          <div class="ad-native-icon">👑</div>
          <div class="ad-native-text">
            <div class="ad-native-title">نسخه پرمیوم</div>
            <div class="ad-native-desc">بدون تبلیغ، تم‌های ویژه</div>
          </div>
          <button class="ad-native-btn" onclick="showPremiumModal()">مشاهده</button>
        </div>
      </div>
    `;
    return;
  }
  
  try {
    window.Tapsell.showNativeAd({
      zoneId: ADS_CONFIG.zones.native,
      containerId: containerId,
      template: 'default'
    });
  } catch (e) {
    console.warn('خطا در تبلیغ بومی:', e);
  }
}

// ============ راه‌اندازی SDK تپسل ============
function initTapsellSDK() {
  if (!IS_MOBILE_APP) {
    console.log('💡 حالت وب: تبلیغات نمایشی');
    return;
  }
  
  if (typeof window.Tapsell === 'undefined') {
    console.warn('⚠️ Tapsell SDK بارگذاری نشده');
    return;
  }
  
  try {
    window.Tapsell.initialize(ADS_CONFIG.tapsellAppKey);
    
    // Request Ad
    window.Tapsell.setDebugMode(false);
    
    console.log('✅ Tapsell SDK راه‌اندازی شد');
  } catch (e) {
    console.warn('خطا در راه‌اندازی Tapsell:', e);
  }
}

// ============ آمار تبلیغات ============
function getAdsStats() {
  return {
    interstitialToday: interstitialCountToday,
    interstitialLimit: ADS_CONFIG.maxInterstitialPerDay,
    lastInterstitial: lastInterstitialTime ? new Date(lastInterstitialTime) : null,
    adsEnabled: shouldShowAds(),
    isPremium: isPremium()
  };
}

// ============ راه‌اندازی کلی ============
function initAds() {
  if (!shouldShowAds()) {
    console.log('💎 حالت بدون تبلیغ (پرمیوم)');
    return;
  }
  
  // راه‌اندازی SDK
  initTapsellSDK();
  
  // نمایش بنر بعد از ۳ ثانیه
  setTimeout(() => {
    showBannerAd();
  }, 3000);
  
  // تبلیغ تمام‌صفحه بعد از ۵ تعامل
  let interactionCount = 0;
  document.addEventListener('click', () => {
    interactionCount++;
    
    // هر ۵ کلیک، شانس نمایش تبلیغ
    if (interactionCount % 5 === 0 && interactionCount > 3) {
      showInterstitialAd();
    }
  });
  
  console.log('✅ Ads راه‌اندازی شد');
}

// ============ غیرفعال‌سازی تبلیغات ============
function disableAds() {
  const data = getData();
  data.adsEnabled = false;
  data.adsRemoved = true;
  saveData();
  hideBannerAd();
  
  if (typeof showToast === 'function') {
    showToast('✨ تبلیغات غیرفعال شد', 'success');
  }
}

console.log('✅ ads.js بارگذاری شد');
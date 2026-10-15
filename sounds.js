/* ============================================
   Daily Habits - Sounds
   ۲۱ صدای تیک + صداهای ویژه
   ============================================ */

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { return null; }
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playTone(freq, duration, type, volume) {
  type = type || 'sine';
  volume = volume || 0.15;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

function playChord(freqs, duration, type, volume) {
  type = type || 'sine';
  volume = volume || 0.12;
  freqs.forEach(function(freq) { playTone(freq, duration, type, volume); });
}

function playNoise(duration, volume, filterFreq) {
  volume = volume || 0.08;
  filterFreq = filterFreq || 1000;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    source.stop(ctx.currentTime + duration);
  } catch (e) {}
}

var SOUNDS = {
  tick1: function() { playTone(800, 0.08, 'sine', 0.15); },
  tick2: function() { playTone(600, 0.1, 'sine', 0.12); },
  tick3: function() { playTone(1200, 0.05, 'square', 0.08); },
  tick4: function() { playTone(400, 0.08, 'sine', 0.15); playTone(600, 0.05, 'sine', 0.1); },
  tick5: function() { playTone(880, 0.3, 'sine', 0.12); playTone(1320, 0.2, 'sine', 0.08); },
  tick6: function() { playChord([1046, 1318], 0.2, 'sine', 0.1); },
  tick7: function() { playTone(1568, 0.15, 'triangle', 0.1); },
  tick8: function() { playNoise(0.03, 0.15, 3000); },
  tick9: function() { playTone(200, 0.1, 'square', 0.12); },
  tick10: function() { playTone(300, 0.05, 'sine', 0.1); setTimeout(function() { playTone(500, 0.1, 'sine', 0.12); }, 40); },
  tick11: function() { playChord([523, 659, 784], 0.2, 'sine', 0.1); },
  tick12: function() { playTone(1000, 0.1, 'sine', 0.12); setTimeout(function() { playTone(1400, 0.15, 'sine', 0.1); }, 100); },
  tick13: function() { playTone(2000, 0.03, 'square', 0.06); },
  tick14: function() { playNoise(0.06, 0.12, 800); },
  tick15: function() { playTone(2200, 0.15, 'sine', 0.08); playTone(3000, 0.1, 'sine', 0.05); },
  tick16: function() { playNoise(0.1, 0.1, 500); playTone(150, 0.1, 'sine', 0.1); },
  tick17: function() { playTone(440, 0.15, 'triangle', 0.1); },
  tick18: function() { playChord([1046, 1568, 2093], 0.25, 'sine', 0.08); },
  tick19: function() { playTone(1500, 0.05, 'sine', 0.1); setTimeout(function() { playTone(2000, 0.08, 'sine', 0.08); }, 50); },
  tick20: function() { playTone(880, 0.05, 'square', 0.08); setTimeout(function() { playTone(660, 0.08, 'square', 0.08); }, 50); },
  none: function() {}
};

var SOUND_NAMES = {
  tick1: { fa: 'تیک ساده', en: 'Simple Tick' },
  tick2: { fa: 'تیک نرم', en: 'Soft Tick' },
  tick3: { fa: 'کلیک', en: 'Click' },
  tick4: { fa: 'پاپ', en: 'Pop' },
  tick5: { fa: 'بل', en: 'Bell' },
  tick6: { fa: 'دینگ 👑', en: 'Ding 👑' },
  tick7: { fa: 'زنگ کوچک 👑', en: 'Small Bell 👑' },
  tick8: { fa: 'تیک ساعت', en: 'Clock Tick' },
  tick9: { fa: 'کوبیدن', en: 'Knock' },
  tick10: { fa: 'باز کردن', en: 'Open' },
  tick11: { fa: 'موفقیت 👑', en: 'Success 👑' },
  tick12: { fa: 'پیام 👑', en: 'Message 👑' },
  tick13: { fa: 'تیک تیز', en: 'Sharp Tick' },
  tick14: { fa: 'چوب', en: 'Wood' },
  tick15: { fa: 'شیشه 👑', en: 'Glass 👑' },
  tick16: { fa: 'راکت', en: 'Racket' },
  tick17: { fa: 'بوق نرم 👑', en: 'Soft Horn 👑' },
  tick18: { fa: 'ستاره 👑', en: 'Star 👑' },
  tick19: { fa: 'سوت 👑', en: 'Whistle 👑' },
  tick20: { fa: 'قدیمی', en: 'Retro' },
  none: { fa: 'بی‌صدا', en: 'Silent' }
};

function getPremiumSoundsList() {
  if (typeof getPremiumOnlySounds === 'function') return getPremiumOnlySounds();
  return ['tick18', 'tick11', 'tick6', 'tick15', 'tick19', 'tick17', 'tick12', 'tick7'];
}

function playTickSound() {
  var data = getData();
  if (data.soundEnabled === false) return;
  var soundType = data.soundType || 'tick1';
  var premiumSounds = getPremiumSoundsList();
  var isPremiumUser = typeof isPremium === 'function' && isPremium();
  if (premiumSounds.indexOf(soundType) !== -1 && !isPremiumUser) {
    soundType = 'tick1';
  }
  var fn = SOUNDS[soundType] || SOUNDS.tick1;
  try {
    fn();
    vibrate();
  } catch (e) {}
}

function playSound(name) {
  var fn = SOUNDS[name];
  if (fn) { try { fn(); } catch (e) {} }
}

function vibrate(ms) {
  var data = getData();
  if (data.vibrateEnabled === false) return;
  var duration = ms || data.vibrateMs || 30;
  if (duration > 0 && navigator.vibrate) {
    try { navigator.vibrate(duration); } catch (e) {}
  }
}

function playAchievementSound() {
  var notes = [523, 659, 784, 1046];
  notes.forEach(function(freq, i) {
    setTimeout(function() { playTone(freq, 0.3, 'sine', 0.15); }, i * 100);
  });
  vibrate([50, 30, 50]);
}

function playSuccessSound() {
  playChord([659, 784, 1046], 0.4, 'sine', 0.12);
  vibrate(50);
}

function playErrorSound() {
  playTone(200, 0.2, 'square', 0.1);
  setTimeout(function() { playTone(150, 0.3, 'square', 0.1); }, 100);
  vibrate([30, 50, 30]);
}

function playClickSound() {
  playTone(1000, 0.05, 'sine', 0.08);
  vibrate(15);
}

function playRewardBoxSound() {
  playTone(300, 0.1, 'square', 0.12);
  setTimeout(function() { playTone(400, 0.1, 'square', 0.12); }, 100);
  setTimeout(function() { playTone(500, 0.1, 'square', 0.12); }, 200);
  setTimeout(function() { playChord([659, 784, 1046, 1318], 0.5, 'sine', 0.12); }, 400);
  vibrate([50, 30, 50, 30, 50]);
}

function playTimerEndSound() {
  for (var i = 0; i < 3; i++) {
    (function(idx) {
      setTimeout(function() {
        playTone(880, 0.2, 'sine', 0.15);
        playTone(1320, 0.2, 'sine', 0.1);
      }, idx * 400);
    })(i);
  }
  vibrate([100, 50, 100, 50, 100]);
}

function playTimerTick() { playTone(1200, 0.03, 'square', 0.05); }

function playNotificationSound() {
  playTone(880, 0.15, 'sine', 0.12);
  setTimeout(function() { playTone(1174, 0.2, 'sine', 0.12); }, 150);
  vibrate(50);
}

function testSound(soundName) {
  var name = soundName || getData().soundType || 'tick1';
  var premiumSounds = getPremiumSoundsList();
  var isPremiumUser = typeof isPremium === 'function' && isPremium();
  if (premiumSounds.indexOf(name) !== -1 && !isPremiumUser) {
    if (typeof showToast === 'function') showToast('👑 این صدا مخصوص نسخه پرمیومه', 'info');
    if (typeof showPremiumModal === 'function') showPremiumModal();
    return;
  }
  var fn = SOUNDS[name];
  if (fn) { try { fn(); } catch (e) {} }
}

function getSoundList() {
  var lang = getData().language || 'fa';
  var premiumSounds = getPremiumSoundsList();
  var isPremiumUser = typeof isPremium === 'function' && isPremium();
  var list = [];
  Object.keys(SOUNDS).forEach(function(key) {
    var name = SOUND_NAMES[key] ? (SOUND_NAMES[key][lang] || SOUND_NAMES[key].fa) : key;
    var isPremiumSound = premiumSounds.indexOf(key) !== -1;
    list.push({
      id: key,
      name: name,
      premium: isPremiumSound,
      locked: isPremiumSound && !isPremiumUser
    });
  });
  return list;
}

function initAudio() {
  var initOnce = function() {
    getAudioContext();
    document.removeEventListener('touchstart', initOnce);
    document.removeEventListener('click', initOnce);
  };
  document.addEventListener('touchstart', initOnce, { once: true });
  document.addEventListener('click', initOnce, { once: true });
}

initAudio();

console.log('✅ sounds.js بارگذاری شد — ۲۱ صدا');
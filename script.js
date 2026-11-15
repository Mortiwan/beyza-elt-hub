/* ==========================================================================
   TEACHER BEYZA'S CREATIVE STUDIO - v1.1 (TEK PARÇA TAM SCRIPT.JS)
   ========================================================================== */

const STORAGE_KEYS = {
  ACCOUNTS: 'beyza_v11_student_accounts',
  CURRENT_USER: 'beyza_v11_current_student',
  TEACHER_AUTH: 'beyza_v11_teacher_auth',
  TEACHER_PROFILE: 'beyza_v11_teacher_profile',
  HOST_PERM: 'beyza_v11_student_can_host',
  VISIBLE_CLASS: 'beyza_v11_visible_class',
  LIVE_ROOM: 'beyza_v11_live_game_room',
  NOTES_TEXT: 'beyza_v11_written_notes',
  PAINT_DATA: 'beyza_v11_paint_canvas',
  COMPLAINTS: 'beyza_v11_student_complaints',
  SOUND_ENABLED: 'beyza_v11_sound_enabled'
};

// BEYZA HOCA SABİT GİRİŞ BİLGİLERİ
const TEACHER_CREDENTIALS = {
  username: 'teacherbeyza',
  password: '75395102!b'
};

const studioChannel = ('BroadcastChannel' in window) ? new BroadcastChannel('beyza_studio_v11_sync') : null;
function broadcastStudioUpdate(type) {
  if (studioChannel) studioChannel.postMessage({ type, ts: Date.now() });
}

function isTeacherUrlMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get('teacher') === 'beyza' || params.get('mode') === 'teacher';
}

/* ==========================================================================
   1. BİRBİRİNDEN TAMAMEN FARKLI ÖZEL SES EFEKTLERİ MOTORU
   ========================================================================== */
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function isSoundEnabled() {
  return localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED) !== 'false';
}

function setSoundEnabled(val) {
  localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, val ? 'true' : 'false');
  updateSoundToggleButtonUI();
}

// SES 1: Kağıt / Sayfa Çevirme Sesi (Menüler ve Sayfalar Arası Geçişte)
function playPaperFlipSound() {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const duration = 0.16;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const env = Math.sin((i / bufferSize) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * env * 0.28;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + duration);
    filter.Q.value = 1.4;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  } catch (_) {}
}

// SES 2: KALPLİ KOLYE ÖZEL SESİ (İnce Klips Tıkırtısı + Kristal Müzik Kutusu Arp Notaları)
function playLocketChimeSound(opening = true) {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const claspOsc = ctx.createOscillator();
    const claspGain = ctx.createGain();
    claspOsc.type = 'triangle';
    claspOsc.frequency.setValueAtTime(opening ? 1800 : 1200, ctx.currentTime);
    claspGain.gain.setValueAtTime(0.12, ctx.currentTime);
    claspGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    claspOsc.connect(claspGain);
    claspGain.connect(ctx.destination);
    claspOsc.start();
    claspOsc.stop(ctx.currentTime + 0.035);

    const notes = opening ? [1046.5, 1318.5, 1567.98, 2093.0] : [1318.5, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const startTime = ctx.currentTime + 0.03 + idx * 0.06;
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.11, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.29);
    });
  } catch (_) {}
}

// SES 3: ŞANSLI KALEM ÖZEL ÇARK SESİ (Yavaşlayan "Tık-Tık-Tık-Tık..." Mandal Sesi + Seçim "Ding!" Sesi)
function playWheelSpinSound() {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const tickOffsets = [0, 0.04, 0.085, 0.135, 0.19, 0.255, 0.33, 0.415, 0.51, 0.62];
    tickOffsets.forEach((offset, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      const startTime = ctx.currentTime + offset;
      osc.frequency.setValueAtTime(320 + i * 18, startTime);
      osc.frequency.exponentialRampToValueAtTime(110, startTime + 0.025);
      gain.gain.setValueAtTime(0.14, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.028);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.03);
    });

    const winTime = ctx.currentTime + 0.68;
    const winOsc = ctx.createOscillator();
    const winGain = ctx.createGain();
    winOsc.type = 'triangle';
    winOsc.frequency.setValueAtTime(880, winTime);
    winOsc.frequency.setValueAtTime(1318.5, winTime + 0.08);
    winGain.gain.setValueAtTime(0.2, winTime);
    winGain.gain.exponentialRampToValueAtTime(0.001, winTime + 0.4);
    winOsc.connect(winGain);
    winGain.connect(ctx.destination);
    winOsc.start(winTime);
    winOsc.stop(winTime + 0.42);
  } catch (_) {}
}

// SES 4: DERS SAYACI (CRAYON TIMER) ÖZEL SESLERİ (Kronometre Klik, Saat Tik-Tak, Son 3 Saniye ve Okul Zili)
function playTimerActionSound(type = 'start') {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (type === 'tick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.018);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.02);
    } else if (type === 'countdown') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      gain.gain.setValueAtTime(0.16, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } else {
      [0, 0.055].forEach((offset, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        const st = ctx.currentTime + offset;
        osc.frequency.setValueAtTime(idx === 0 ? 440 : 680, st);
        gain.gain.setValueAtTime(0.12, st);
        gain.gain.exponentialRampToValueAtTime(0.001, st + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(st);
        osc.stop(st + 0.045);
      });
    }
  } catch (_) {}
}

function playSchoolBellSound() {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    for (let i = 0; i < 14; i++) {
      const strikeTime = ctx.currentTime + i * 0.065;
      [1244.5, 1864.6].forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq + (i % 2) * 35, strikeTime);
        gain.gain.setValueAtTime(0.1, strikeTime);
        gain.gain.exponentialRampToValueAtTime(0.008, strikeTime + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(strikeTime);
        osc.stop(strikeTime + 0.062);
      });
    }
  } catch (_) {}
}

// SES 5: Yumuşak Buton Sesi
function playSoftClickSound() {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.045);
    gain.gain.setValueAtTime(0.11, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.055);
  } catch (_) {}
}

function injectSoundToggleButton() {
  const rightBar = document.querySelector('.utility-right');
  if (!rightBar || document.getElementById('soundToggleBtn')) return;

  const btn = document.createElement('button');
  btn.id = 'soundToggleBtn';
  btn.type = 'button';
  btn.className = 'mini-pill-btn sound-toggle-pill';
  rightBar.insertBefore(btn, rightBar.firstChild);

  btn.addEventListener('click', () => {
    const nextState = !isSoundEnabled();
    setSoundEnabled(nextState);
    if (nextState) playSoftClickSound();
  });

  updateSoundToggleButtonUI();
}

function updateSoundToggleButtonUI() {
  const btn = document.getElementById('soundToggleBtn');
  if (!btn) return;
  const on = isSoundEnabled();
  btn.innerHTML = on ? '🔊 Ses: Açık' : '🔇 Ses: Kapalı';
  btn.style.background = on ? '#fef08a' : '#f1f5f9';
}

/* ==========================================================================
   2. KALPLİ KOLYE KONUMU VE CRAYON TIMER RENKLİ ÇUBUK STİLLERİ
   ========================================================================== */
function injectRefinedLocketAndTimerStyles() {
  if (document.getElementById('v11RefinedDynamicStyles')) return;
  const style = document.createElement('style');
  style.id = 'v11RefinedDynamicStyles';
  style.textContent = `
    .utility-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Sol Sütunda Welcome Kutusu ile Sarı Post-it Arasında Kalpli Kolyeye Özel Alan */
    .locket-hanging-stage {
      position: relative !important;
      width: 100% !important;
      height: 190px !important;
      margin: 4px auto 16px auto !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      background: radial-gradient(circle, rgba(255, 237, 213, 0.55) 0%, rgba(255, 255, 255, 0) 72%);
      border-radius: 16px;
      z-index: 5;
    }

    .refined-double-locket {
      position: relative !important;
      width: 184px !important;
      height: 178px !important;
      cursor: pointer;
      transform-origin: top center;
      animation: delicateSwing 4.5s ease-in-out infinite;
      user-select: none;
      margin: 0 auto;
    }

    @keyframes delicateSwing {
      0%, 100% { transform: rotate(-1.6deg); }
      50% { transform: rotate(1.6deg); }
    }

    .fine-chain-left, .fine-chain-right {
      position: absolute;
      top: 0;
      width: 2px;
      height: 34px;
      background: repeating-linear-gradient(to bottom, #64748b 0px, #64748b 3px, transparent 3px, transparent 5px);
      z-index: 1;
    }
    .fine-chain-left { left: 72px; transform: rotate(20deg); }
    .fine-chain-right { right: 72px; transform: rotate(-20deg); }

    .fine-chain-ring {
      position: absolute;
      top: 22px;
      left: 50%;
      transform: translateX(-50%);
      width: 12px;
      height: 12px;
      border: 2px solid #1e293b;
      border-radius: 50%;
      background: #fef08a;
      z-index: 4;
    }

    .heart-locket-frame {
      position: absolute;
      top: 30px;
      left: 50%;
      transform: translateX(-50%);
      width: 176px;
      height: 144px;
      perspective: 900px;
    }

    .heart-inner-base {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
    }

    .heart-inner-svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 4px 6px rgba(30, 41, 59, 0.14));
    }

    /* Kalbin Ortasındaki Beyaz Boş Çerçeve + Ortasında Link + Yanında Kopyala Tuşu */
    .heart-white-link-frame {
      position: relative;
      z-index: 2;
      background: #ffffff;
      border: 2px solid #1e293b;
      border-radius: 10px;
      padding: 5px 7px;
      width: 148px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 5px;
      box-shadow: 0 2px 0 #1e293b;
      margin-top: -8px;
    }

    .heart-white-link-text {
      flex: 1;
      text-align: center;
      font-size: 0.63rem;
      font-weight: 800;
      color: #1e293b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .heart-inline-copy-btn {
      background: #f97316;
      color: #ffffff;
      border: 1.5px solid #1e293b;
      border-radius: 7px;
      padding: 3px 6px;
      font-family: 'Fredoka', sans-serif;
      font-size: 0.64rem;
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .heart-inline-copy-btn:hover {
      background: #ea580c;
    }

    /* ÇİFT KAPAK: SOL VE SAĞ KANAT AYNI ANDA İKİ YANA AÇILIR */
    .heart-wing {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 3;
      transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
      backface-visibility: hidden;
    }

    .heart-wing-left {
      clip-path: polygon(0 0, 50.3% 0, 50.3% 100%, 0 100%);
      transform-origin: 18% 50%;
    }

    .heart-wing-right {
      clip-path: polygon(49.7% 0, 100% 0, 100% 100%, 49.7% 100%);
      transform-origin: 82% 50%;
    }

    .refined-double-locket:hover .heart-wing-left,
    .refined-double-locket.open .heart-wing-left {
      transform: rotateY(-130deg);
    }

    .refined-double-locket:hover .heart-wing-right,
    .refined-double-locket.open .heart-wing-right {
      transform: rotateY(130deg);
    }

    .wing-label-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      padding-bottom: 12px;
      text-align: center;
    }

    .wing-label-overlay strong {
      font-family: 'Fredoka', sans-serif;
      font-size: 0.76rem;
      color: #1e293b;
      background: rgba(255, 255, 255, 0.92);
      padding: 2px 8px;
      border-radius: 999px;
      border: 1.5px solid #1e293b;
    }

    .wing-label-overlay span {
      font-size: 0.62rem;
      font-weight: 800;
      color: #ea580c;
      margin-top: 3px;
    }

    /* CRAYON TIMER: SAĞDAN SOLA GİDEN TURUNCU-BEYAZ RENKLİ GERİ SAYIM ÇUBUĞU */
    .crayon-progress-wrapper {
      position: relative;
      width: 100%;
      height: 22px;
      background: #f1f5f9;
      border: 2px solid #1e293b;
      border-radius: 999px;
      overflow: hidden;
      margin: 2px 0 12px 0;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.08);
    }

    .crayon-progress-fill {
      height: 100%;
      width: 100%;
      background: repeating-linear-gradient(
        -45deg,
        #f97316 0px,
        #f97316 12px,
        #ffffff 12px,
        #ffffff 22px,
        #fb923c 22px,
        #fb923c 32px
      );
      background-size: 45px 45px;
      animation: moveStripes 1.2s linear infinite;
      border-radius: 999px;
      transition: width 0.95s linear;
      position: relative;
    }

    @keyframes moveStripes {
      0% { background-position: 0 0; }
      100% { background-position: 45px 0; }
    }

    .crayon-runner-icon {
      position: absolute;
      top: 50%;
      right: -4px;
      transform: translateY(-50%);
      background: #ffffff;
      border: 1.5px solid #1e293b;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.72rem;
      box-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }

    .lobby-friend-chips {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 6px;
    }
    .friend-chip {
      background: #ffffff;
      border: 1.5px solid #1e293b;
      border-radius: 999px;
      padding: 3px 10px;
      font-size: 0.78rem;
      font-weight: 800;
    }
  `;
  document.head.appendChild(style);
}

/* 3. ÇİFT KAPAKLI KALPLİ KOLYE OLUŞTURUCU */
function renderRefinedDoubleDoorLocket() {
  const stage = document.querySelector('.locket-hanging-stage');
  if (!stage) return;

  const frontHeartSvg = `
    <svg viewBox="0 0 180 150" style="width:100%;height:100%;filter:drop-shadow(0 4px 5px rgba(30,41,59,0.12))">
      <defs>
        <linearGradient id="delicateRose" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff1f2" />
          <stop offset="50%" stop-color="#ffe4e6" />
          <stop offset="100%" stop-color="#fecdd3" />
        </linearGradient>
      </defs>
      <path d="M90 138 C90 138 16 94 16 48 C16 24 35 10 58 10 C74 10 84 19 90 29 C96 19 106 10 122 10 C145 10 164 24 164 48 C164 94 90 138 90 138 Z"
            fill="url(#delicateRose)" stroke="#1e293b" stroke-width="4"/>
      <path d="M90 128 C90 128 26 88 26 49 C26 30 41 18 59 18 C72 18 83 25 90 35 C97 25 108 18 121 18 C139 18 154 30 154 49 C154 88 90 128 90 128 Z"
            fill="none" stroke="#f97316" stroke-width="1.6" stroke-dasharray="4 3"/>
      <line x1="90" y1="29" x2="90" y2="136" stroke="#1e293b" stroke-width="1.5" stroke-dasharray="2 2" />
      <circle cx="90" cy="48" r="5" fill="#fef08a" stroke="#1e293b" stroke-width="1.5"/>
    </svg>
    <div class="wing-label-overlay">
      <strong>💖 Sınıf Kolyesi</strong>
      <span>(Açmak için dokun / gel)</span>
    </div>
  `;

  stage.innerHTML = `
    <div id="heartLocket" class="refined-double-locket" title="Kalpli Kolyeyi Açmak İçin Üzerine Gel veya Tıkla">
      <div class="fine-chain-left"></div>
      <div class="fine-chain-right"></div>
      <div class="fine-chain-ring"></div>

      <div class="heart-locket-frame">
        <div class="heart-inner-base">
          <svg viewBox="0 0 180 150" class="heart-inner-svg">
            <path d="M90 138 C90 138 16 94 16 48 C16 24 35 10 58 10 C74 10 84 19 90 29 C96 19 106 10 122 10 C145 10 164 24 164 48 C164 94 90 138 90 138 Z"
                  fill="#fff7ed" stroke="#1e293b" stroke-width="4"/>
            <path d="M90 128 C90 128 26 88 26 49 C26 30 41 18 59 18 C72 18 83 25 90 35 C97 25 108 18 121 18 C139 18 154 30 154 49 C154 88 90 128 90 128 Z"
                  fill="none" stroke="#fb7185" stroke-width="1.5"/>
          </svg>

          <div class="heart-white-link-frame">
            <span class="heart-white-link-text">mortiwan.github.io/beyza-elt-hub</span>
            <button id="copyClassLinkBtn" type="button" class="heart-inline-copy-btn">Kopyala</button>
          </div>
        </div>

        <div class="heart-wing heart-wing-left">${frontHeartSvg}</div>
        <div class="heart-wing heart-wing-right">${frontHeartSvg}</div>
      </div>
    </div>
  `;

  const locket = document.getElementById('heartLocket');
  locket.addEventListener('mouseenter', () => playLocketChimeSound(true));
  locket.addEventListener('mouseleave', () => {
    if (!locket.classList.contains('open')) playLocketChimeSound(false);
  });
  locket.addEventListener('click', () => {
    const isNowOpen = locket.classList.toggle('open');
    playLocketChimeSound(isNowOpen);
  });

  document.getElementById('copyClassLinkBtn').addEventListener('click', e => {
    e.stopPropagation();
    playSoftClickSound();
    navigator.clipboard?.writeText('https://mortiwan.github.io/beyza-elt-hub/');
    e.target.textContent = '✓ Oldu!';
    setTimeout(() => { e.target.textContent = 'Kopyala'; }, 1800);
  });
}

/* 4. CRAYON TIMER TURUNCU-BEYAZ İLERLEME ÇUBUĞU */
function injectCrayonProgressBarDOM() {
  const timerClock = document.getElementById('timerDisplay');
  if (!timerClock || document.getElementById('crayonProgressFill')) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'crayon-progress-wrapper';
  wrapper.innerHTML = `
    <div id="crayonProgressFill" class="crayon-progress-fill" style="width: 100%">
      <span class="crayon-runner-icon">🖍️</span>
    </div>
  `;
  timerClock.insertAdjacentElement('afterend', wrapper);
}

/* 5. KIZ VE ERKEK ÖZEL AVATAR KOLEKSİYONU */
const GENDER_AVATARS = {
  girl: [
    { icon: '👧🏻', label: 'Zeynep (Klasik)' },
    { icon: '👩🏻‍🎓', label: 'Mezun Kız' },
    { icon: '👩🏼‍🏫', label: 'Genç Öğretmen' },
    { icon: '👩🏻‍🎨', label: 'Ressam Kız' },
    { icon: '👩🏽‍🔬', label: 'Bilim İnsanı' },
    { icon: '👩🏻‍🚀', label: 'Astronot Kız' },
    { icon: '👸🏻', label: 'Prenses' },
    { icon: '🧚🏻‍♀️', label: 'Peri Kızı' },
    { icon: '🦸🏻‍♀️', label: 'Süper Kahraman' },
    { icon: '🕵🏻‍♀️', label: 'Dedektif Kız' },
    { icon: '🧜🏻‍♀️', label: 'Deniz Kızı' },
    { icon: '👩🏻‍💻', label: 'Kodlama Ustası' }
  ],
  boy: [
    { icon: '👦🏻', label: 'Emir (Klasik)' },
    { icon: '👨🏻‍🎓', label: 'Mezun Erkek' },
    { icon: '👨🏻‍🏫', label: 'Genç Öğretmen' },
    { icon: '👨🏻‍🚀', label: 'Astronot Erkek' },
    { icon: '👨🏻‍🔬', label: 'Bilim İnsanı' },
    { icon: '👨🏻‍🎨', label: 'Sanatçı Erkek' },
    { icon: '🤴🏻', label: 'Prens' },
    { icon: '🦸🏻‍♂️', label: 'Süper Kahraman' },
    { icon: '🕵🏻‍♂️', label: 'Dedektif Erkek' },
    { icon: '🧙🏻‍♂️', label: 'Bilge Büyücü' },
    { icon: '🥷🏻', label: 'Ninja' },
    { icon: '👨🏻‍💻', label: 'Yazılımcı Erkek' }
  ]
};

function renderAvatarPickerGrid(containerId, gender, selectedAvatar, onSelectCallback) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const list = GENDER_AVATARS[gender] || GENDER_AVATARS.girl;
  container.innerHTML = '';

  list.forEach(item => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `av-card-btn ${selectedAvatar === item.icon ? 'selected' : ''}`;
    btn.innerHTML = `<span class="av-emo">${item.icon}</span><span class="av-lbl">${item.label}</span>`;
    btn.onclick = () => {
      playSoftClickSound();
      container.querySelectorAll('.av-card-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      onSelectCallback(item.icon);
    };
    container.appendChild(btn);
  });
}

/* 6. DEFTER DELİKLERİ VE RULO MENÜ SAYFA GEÇİŞİ */
function renderBinderHoles() {
  const container = document.getElementById('binderHoles');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < 15; i++) {
    const hole = document.createElement('span');
    hole.className = 'binder-hole-circle';
    container.appendChild(hole);
  }
}

function openNotebookPage(pageId) {
  if (pageId === 'page-motivation' && !isTeacherLoggedIn()) {
    pageId = 'page-home';
  }

  playPaperFlipSound();

  document.querySelectorAll('.notebook-page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(pageId);
  if (target) target.classList.add('active');

  document.querySelectorAll('.unroll-item').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-page') === pageId);
  });
}

/* 7. MOTİVASYON SÖZLERİ (SADECE BEYZA HOCA'YA ÖZEL) */
const HARUN_QUOTES = [
  {
    text: "Önünde uçsuz bucaksız çiçek bahçeleri uzanırken sen hâlâ arkandaki mezarlara bakmaya devam ediyorsun. Ölmüşle olmuşa çare yok ama geleceğin için önünde uzun ve güzel bir ömür var. Artık yüzünü o çiçek bahçelerine ve güneşin aydınlığına çevir; kendi geleceğini bugünden şekillendirmeye başla.",
    author: "~Harun"
  },
  {
    text: "Dün çok kötü bir gün yaşamış olabilirsin ama bugün yepyeni bir sabaha uyandın. Şimdi ayağa kalk, çayını ya da kahveni hazırla ve gününü güzelleştirecek o ilk hamleyi yap. Fincanından bir yudum al ve hayata içtenlikle gülümse küçük gün ışığı. 🌞",
    author: "~Harun"
  },
  {
    text: "Her zaman güçlü olmak zorunda değilsin. Tarihin en büyük savaşçıları da yenilgiyi tattı ama bunu kabullenip pes etmediler; sadece biraz soluklandılar, derin bir nefes aldılar ve mücadeleye kaldıkları yerden devam ettiler, ta ki o savaşı kazanana dek. Biz de kendi savaşlarımızın kazananları olacağız cesur yürek. 🫂",
    author: "~Harun"
  },
  {
    text: "Hayat, geçmişe takılıp sürekli üzülecek kadar uzun değil. Her şeyin bir vakti olduğu gibi, duygularını dibine kadar yaşayıp sonra ayağa kalkacağın bir zaman da var. O karanlığın içinde kaybolup gitme; üzüntünü yaşa, sonra silkelenip toparlan ve her şeyi arkanda bırakıp bu güzel hayatına kaldığın yerden devam et canım dostum. 🥹",
    author: "~Harun"
  },
  {
    text: "Bu dünya bir sınav dünyası; yaşadığın zorluklardan dolayı asla kendini suçlama. Çünkü doğruyu öğrenmek için bazen önce yanlışı yapmak gerekir. Sen yanlışı yaparak doğruyu öğrendin ve bu sınavdan layıkıyla geçtin canım dostum. 🪽",
    author: "~Harun"
  },
  {
    text: "Bazı insanlar başkalarının başarısından hep rahatsızlık duyar. Çünkü hasettirler, kıskançtırlar, taş kalplidirler; küçümseyici sözler söyler, kindar davranır ve çevresindekilerin iyiliğini değil kötülüğünü isterler. Ama sen tüm bu kişilere rağmen başarılarınla bir yıldız gibi parla ve onlara gerçek seni göster. 💫",
    author: "~Harun"
  }
];

const STUDIO_AI_QUOTES = [
  {
    title: "🌱 Sabır ve Emek Üzerine",
    text: "Bir sınıfta ektiğin tek bir güzel kelime, yıllar sonra bir öğrencinin hayatında kocaman bir çınara dönüşür. Bugün yorulduğun her an, yarın bir çocuğun gülümsemesinde karşılığını bulacak.",
    author: "✨ Stüdyo İlham Notu"
  },
  {
    title: "☀️ Yorucu Günler İçin",
    text: "Bazen dersler uzar, sesin yorulur ve enerjin düşer... Ama unutma ki sen o sınıftan içeri girdiğinde gözleri parlayan çocuklar için sadece bir öğretmen değil, bir ilham kaynağısın.",
    author: "✨ Stüdyo İlham Notu"
  },
  {
    title: "💫 Kendi Değerini Hatırla",
    text: "Mükemmel olmak zorunda değilsin; içtenliğin, güleryüzün ve kalbindeki o güzel niyet zaten seni en özel öğretmen yapıyor. Kendine bugün birazcık şefkat göster.",
    author: "✨ Stüdyo İlham Notu"
  },
  {
    title: "🌈 Yeni Başlangıçlar",
    text: "Her ders zili yeni bir başlangıçtır. Dünün yorgunluğunu kapının dışında bırak, derin bir nefes al ve kendi ışığına güven.",
    author: "✨ Stüdyo İlham Notu"
  },
  {
    title: "🧡 Kalpten Gelen Güç",
    text: "İyi niyetle atılan hiçbir adım boşa gitmez. Senin emeğin, sabrın ve zarafetin bu sınıfın en büyük hazinesidir.",
    author: "✨ Stüdyo İlham Notu"
  },
  {
    title: "🌟 Parlamaya Devam Et",
    text: "Karanlık bulutlar güneşi sadece kısa bir süre gizleyebilir. Sen kendi içindeki neşeyi ve umudu koruduğun sürece hiçbir zorluk seni yıldırmaz.",
    author: "✨ Stüdyo İlham Notu"
  }
];

const ALL_MIXED_QUOTES = [...HARUN_QUOTES, ...STUDIO_AI_QUOTES];
let lastRandomQuoteIdx = -1;

function setupMotivationAndSincereAboutPages() {
  const thirdRollMenu = document.querySelectorAll('.scroll-dropdown')[2]?.querySelector('.unroll-paper-menu');
  if (thirdRollMenu && !thirdRollMenu.querySelector('[data-page="page-motivation"]')) {
    const motBtn = document.createElement('button');
    motBtn.id = 'teacherOnlyMotivationMenuBtn';
    motBtn.className = 'unroll-item hidden';
    motBtn.setAttribute('data-page', 'page-motivation');
    motBtn.textContent = '💌 Motivasyon & Moral Köşesi (Beyza Hoca Özel)';
    thirdRollMenu.insertBefore(motBtn, thirdRollMenu.firstChild);
  }

  const mainSheet = document.querySelector('main.notebook-sheet');
  let motPage = document.getElementById('page-motivation');
  if (!motPage && mainSheet) {
    motPage = document.createElement('section');
    motPage.id = 'page-motivation';
    motPage.className = 'notebook-page';
    mainSheet.appendChild(motPage);
  }

  if (motPage) {
    const lowerCardsHtml = STUDIO_AI_QUOTES.map(q => `
      <div class="vocab-lined-card">
        <span class="tag-orange">MORAL & İLHAM NOTU</span>
        <h3>${q.title}</h3>
        <p style="font-size:0.9rem;line-height:1.6;margin:8px 0">"${q.text}"</p>
        <p class="postit-ex" style="text-align:right;font-weight:800;color:#ea580c">${q.author}</p>
      </div>
    `).join('');

    const harunCardsHtml = HARUN_QUOTES.map((q, idx) => `
      <div class="vocab-lined-card" style="background:#fff7ed">
        <span class="tag-dark">ÖZEL MESAJ #${idx + 1}</span>
        <p style="font-size:0.92rem;line-height:1.65;margin:10px 0;font-weight:600">"${q.text}"</p>
        <p style="text-align:right;font-weight:900;color:#ea580c;font-size:1rem">${q.author}</p>
      </div>
    `).join('');

    motPage.innerHTML = `
      <div class="lined-box section-banner-box">
        <h2>💌 Beyza Hoca'ya Özel Motivasyon & Moral Köşesi</h2>
        <p>Bu özel sayfa öğrenci modunda gizlidir; sadece sen öğretmen girişi yaptığında senin için açılır. 🧡</p>
      </div>

      <div class="lined-box" style="background:linear-gradient(135deg, #fff7ed 0%, #fef08a 100%);padding:28px;text-align:center">
        <span class="tag-orange" style="font-size:0.8rem;padding:5px 14px">✨ RASTGELE MOTİVASYON TABLOSU ✨</span>
        <blockquote id="bigRandomQuoteText" style="font-size:1.22rem;font-weight:800;line-height:1.7;margin:18px auto;max-width:820px;color:#1e293b;background:#ffffff;padding:22px;border:3px solid #1e293b;border-radius:18px;box-shadow:0 5px 0 #1e293b">
          "${HARUN_QUOTES[0].text}"
        </blockquote>
        <p id="bigRandomQuoteAuthor" style="font-size:1.15rem;font-weight:900;color:#ea580c;margin-bottom:16px">${HARUN_QUOTES[0].author}</p>
        <button id="drawRandomMotivationBtn" class="big-orange-action-btn" type="button" style="font-size:1rem;padding:12px 26px">
          🎲 Rastgele Yeni Motivasyon Sözü Getir
        </button>
      </div>

      <h3 style="margin:22px 0 12px">🧡 Harun'un Kaleminden Özel Motivasyon Sözleri</h3>
      <div class="vocab-three-grid" style="margin-bottom:24px">${harunCardsHtml}</div>

      <h3 style="margin:22px 0 12px">✨ Stüdyo Moral & İlham Sözleri</h3>
      <div class="vocab-three-grid">${lowerCardsHtml}</div>
    `;

    document.getElementById('drawRandomMotivationBtn')?.addEventListener('click', () => {
      playPaperFlipSound();
      let nextIdx = Math.floor(Math.random() * ALL_MIXED_QUOTES.length);
      if (ALL_MIXED_QUOTES.length > 1 && nextIdx === lastRandomQuoteIdx) {
        nextIdx = (nextIdx + 1) % ALL_MIXED_QUOTES.length;
      }
      lastRandomQuoteIdx = nextIdx;
      const picked = ALL_MIXED_QUOTES[nextIdx];
      document.getElementById('bigRandomQuoteText').textContent = `"${picked.text}"`;
      document.getElementById('bigRandomQuoteAuthor').textContent = picked.author;
    });
  }

  const aboutPage = document.getElementById('page-about');
  if (aboutPage) {
    aboutPage.innerHTML = `
      <div class="lined-box section-banner-box">
        <h2>👩‍🏫 Hakkında & Geliştirici</h2>
        <p>Bu renkli sınıf stüdyosunun ortaya çıkış hikayesi ve arkasındaki samimi emek. 🧡</p>
      </div>

      <div class="patch-notes-two-cols">
        <div class="vocab-lined-card" style="padding:22px">
          <span class="tag-orange">SINIFIMIZIN KALBİ</span>
          <h3 style="font-size:1.35rem;margin:8px 0">👩‍🏫 Teacher Beyza's Creative Studio</h3>
          <p style="line-height:1.75;font-size:0.95rem;color:#334155">
            Burası sadece sıradan bir ders sayfası değil; İngilizceyi korkulacak bir ders olmaktan çıkarıp, boya kalemleriyle, oyunlarla ve gülümsemeyle sevdirmek için kurulan sıcak bir sınıf yuvası. 
            Her öğrencinin çekinmeden parmak kaldırdığı, hata yaparken bile eğlendiği ve öğrenmenin neşesini paylaştığı özel bir dünya. İyi ki varsın Beyza Hoca! 🧡
          </p>
        </div>

        <div class="vocab-lined-card" style="padding:22px;background:#fff7ed">
          <span class="tag-dark">GELİŞTİRİCİ & TASARIM</span>
          <h3 style="font-size:1.35rem;margin:8px 0">💻 Harun'dan Samimi Bir Hediye</h3>
          <p style="line-height:1.75;font-size:0.95rem;color:#334155">
            Bu web sitesinin her bir satırı, her bir rengi ve detayı; Beyza'nın öğretmenlik heyecanına eşlik etmesi, derslerini çok daha keyifli hale getirmesi ve yorulduğu anlarda yüzünde küçük bir tebessüm bırakması dileğiyle <strong>Harun</strong> tarafından tüm içtenlikle, özenle tasarlanıp kodlanmıştır. 
            Nice güzel derslere ve başarılara... 🧡
          </p>
        </div>
      </div>
    `;
  }
}

/* 8. ÖĞRETMEN GİRİŞ PENCERESİ */
function upgradeTeacherLoginModalDOM() {
  const modalForm = document.querySelector('#teacherLoginModal .form-stack');
  if (!modalForm) return;
  if (!document.getElementById('teacherUsernameInput')) {
    modalForm.innerHTML = `
      <label>Öğretmen Kullanıcı Adı:</label>
      <input type="text" id="teacherUsernameInput" placeholder="Kullanıcı adını girin (teacherbeyza)..." autocomplete="off" />
      <label>Öğretmen Şifresi:</label>
      <input type="password" id="teacherPasswordInput" placeholder="Şifrenizi girin..." />
      <p id="teacherLoginError" class="err-text"></p>
      <button id="submitTeacherLoginBtn" type="button" class="mini-pill-btn orange-pill">🔓 Öğretmen Moduna Giriş Yap</button>
    `;
  }
}

/* 9. ROZETLER VE HESAP SİSTEMİ */
const STUDIO_BADGES = [
  { id: 'b1', icon: '🌱', title: 'İlk Adım', reqScore: 50 },
  { id: 'b2', icon: '🔥', title: 'Kelime Avcısı', reqScore: 250 },
  { id: 'b3', icon: '⚡', title: 'Gramer Ustası', reqScore: 500 },
  { id: 'b4', icon: '👑', title: 'Sınıf Şampiyonu', reqScore: 1000 },
  { id: 'b5', icon: '💎', title: 'Efsane Öğrenci', reqScore: 2500 }
];

function getStudentAccounts() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCOUNTS)) || {}; } catch { return {}; }
}

function saveStudentAccounts(accounts) {
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  broadcastStudioUpdate('accounts');
}

function getCurrentStudent() {
  const u = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!u) return null;
  return getStudentAccounts()[u.toLowerCase()] || null;
}

function updateCurrentStudentData(mutatorFn) {
  const user = getCurrentStudent();
  if (!user) return;
  const accounts = getStudentAccounts();
  const key = user.username.toLowerCase();
  if (!accounts[key]) return;
  mutatorFn(accounts[key]);
  saveStudentAccounts(accounts);
  syncAllAuthAndModeBars();
}

function getTeacherProfile() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TEACHER_PROFILE)) || {
      username: 'Teacher Beyza',
      gender: 'girl',
      avatar: '👩‍🏫',
      frameColor: '#f97316',
      totalScore: 2500,
      gamesPlayed: 12,
      gamesWon: 12,
      gamesLost: 0
    };
  } catch {
    return { username: 'Teacher Beyza', gender: 'girl', avatar: '👩‍🏫', frameColor: '#f97316' };
  }
}

function saveTeacherProfile(prof) {
  localStorage.setItem(STORAGE_KEYS.TEACHER_PROFILE, JSON.stringify(prof));
  syncAllAuthAndModeBars();
}

/* 10. ÖĞRETMEN VE ÖĞRENCİ MODU TAM AYRIMI */
function isTeacherLoggedIn() {
  return sessionStorage.getItem(STORAGE_KEYS.TEACHER_AUTH) === 'true';
}

function setTeacherLoggedIn(state) {
  if (state) {
    sessionStorage.setItem(STORAGE_KEYS.TEACHER_AUTH, 'true');
  } else {
    sessionStorage.removeItem(STORAGE_KEYS.TEACHER_AUTH);
    localStorage.removeItem(STORAGE_KEYS.VISIBLE_CLASS);
    broadcastStudioUpdate('class_visibility');
  }
  syncAllAuthAndModeBars();
}

function syncAllAuthAndModeBars() {
  const teacherUrl = isTeacherUrlMode();
  const teacherLogged = isTeacherLoggedIn();
  const inTeacherContext = teacherUrl || teacherLogged;
  const studentUser = getCurrentStudent();

  const seoMeta = document.getElementById('seoRobotsMeta');
  if (seoMeta) {
    seoMeta.setAttribute('content', inTeacherContext ? 'noindex, nofollow' : 'index, follow');
  }

  const guestAuthBtns = document.getElementById('guestAuthButtons');
  const studentProfWrap = document.getElementById('studentProfileDropdownWrap');
  const teacherAuthBtn = document.getElementById('teacherAuthBtn');
  const teacherProfWrap = document.getElementById('teacherProfileDropdownWrap');

  if (inTeacherContext) {
    guestAuthBtns?.classList.add('hidden');
    studentProfWrap?.classList.add('hidden');

    if (teacherLogged) {
      teacherAuthBtn?.classList.add('hidden');
      teacherProfWrap?.classList.remove('hidden');
      const tProf = getTeacherProfile();
      const tAv = document.getElementById('topTeacherAvatar');
      const tNm = document.getElementById('topTeacherName');
      if (tAv) tAv.textContent = tProf.avatar || '👩‍🏫';
      if (tNm) tNm.textContent = tProf.username || 'Teacher Beyza';
    } else {
      teacherAuthBtn?.classList.remove('hidden');
      teacherProfWrap?.classList.add('hidden');
    }
  } else {
    // ÖĞRENCİ MODU: Öğretmen Girişi butonu kesinlikle gizlenir!
    teacherAuthBtn?.classList.add('hidden');
    teacherProfWrap?.classList.add('hidden');

    if (studentUser) {
      guestAuthBtns?.classList.add('hidden');
      studentProfWrap?.classList.remove('hidden');
      const avEl = document.getElementById('topStudentAvatar');
      if (avEl) {
        avEl.textContent = studentUser.avatar || '👧🏻';
        avEl.style.borderColor = studentUser.frameColor || '#f97316';
      }
      const nmEl = document.getElementById('topStudentName');
      const clEl = document.getElementById('topStudentClassBadge');
      if (nmEl) nmEl.textContent = studentUser.username;
      if (clEl) clEl.textContent = `${studentUser.className} • No:${studentUser.schoolNo}`;
    } else {
      guestAuthBtns?.classList.remove('hidden');
      studentProfWrap?.classList.add('hidden');
    }
  }

  const motMenuBtn = document.querySelector('[data-page="page-motivation"]');
  if (motMenuBtn) {
    motMenuBtn.classList.toggle('hidden', !teacherLogged);
  }
  const motPage = document.getElementById('page-motivation');
  if (!teacherLogged && motPage && motPage.classList.contains('active')) {
    openNotebookPage('page-home');
  }

  document.getElementById('teacherControlBanner')?.classList.toggle('hidden', !teacherLogged);
  document.getElementById('teacherClassManagerBox')?.classList.toggle('hidden', !teacherLogged);
  document.getElementById('teacherMessagesSection')?.classList.toggle('hidden', !teacherLogged);

  const arenaPlayer = document.getElementById('arenaPlayerName');
  if (arenaPlayer) {
    if (teacherLogged) arenaPlayer.textContent = '👩‍🏫 Teacher Beyza';
    else if (studentUser) arenaPlayer.textContent = `${studentUser.avatar} ${studentUser.username} (${studentUser.className})`;
    else arenaPlayer.textContent = 'Misafir Öğrenci';
  }

  renderLuckyPencilClasses();
  renderTeacherComplaints();
  syncGameHostPermissionsUI();
}

/* 11. "PROFİLİM" MODALI */
let profileModalTarget = 'student';
let activeWallGender = 'girl';

function openMyProfileModal(targetType) {
  profileModalTarget = targetType;
  const isTeacher = targetType === 'teacher';
  const data = isTeacher ? getTeacherProfile() : getCurrentStudent();
  if (!data) return;

  playSoftClickSound();
  activeWallGender = data.gender || 'girl';
  const bigAv = document.getElementById('wallAvatarCircle');
  bigAv.textContent = data.avatar || '👧🏻';
  bigAv.style.borderColor = data.frameColor || '#f97316';

  document.getElementById('wallUsernameTitle').textContent = data.username;
  document.getElementById('wallClassAndNoText').textContent = isTeacher
    ? 'Yönetici & İngilizce Öğretmeni'
    : `Sınıf: ${data.className} | Öğrenci No: ${data.schoolNo}`;
  document.getElementById('wallRegistrationDate').textContent = data.registeredAt || '15.11.2026';
  document.getElementById('editProfileNameInput').value = data.username;
  document.getElementById('editNameFeedbackMsg').textContent = '';

  const showStats = data.showStats !== false;
  const showBadges = data.showBadges !== false;
  document.getElementById('toggleShowStats').checked = showStats;
  document.getElementById('toggleShowBadges').checked = showBadges;

  document.getElementById('wallTotalScore').textContent = data.totalScore || 0;
  document.getElementById('wallGamesPlayed').textContent = data.gamesPlayed || 0;
  document.getElementById('wallGamesWon').textContent = data.gamesWon || 0;
  document.getElementById('wallGamesLost').textContent = data.gamesLost || 0;

  document.getElementById('wallStatsSection').classList.toggle('hidden', !showStats);
  document.getElementById('wallStatsHiddenNotice').classList.toggle('hidden', showStats);

  const badgeGrid = document.getElementById('wallBadgesGrid');
  badgeGrid.innerHTML = '';
  STUDIO_BADGES.forEach(b => {
    const unlocked = (data.totalScore || 0) >= b.reqScore;
    const div = document.createElement('div');
    div.className = `badge-tile ${unlocked ? '' : 'locked'}`;
    div.innerHTML = `<div style="font-size:1.5rem">${b.icon}</div><strong>${b.title}</strong><div>${unlocked ? '✅ Açık' : `${b.reqScore} P`}</div>`;
    badgeGrid.appendChild(div);
  });

  badgeGrid.classList.toggle('hidden', !showBadges);
  document.getElementById('wallBadgesHiddenNotice').classList.toggle('hidden', showBadges);
  document.getElementById('studentDangerFooter').classList.toggle('hidden', isTeacher);
  document.getElementById('deleteAccountConfirmBox').classList.add('hidden');

  document.getElementById('wallGenderGirlBtn').classList.toggle('active', activeWallGender === 'girl');
  document.getElementById('wallGenderBoyBtn').classList.toggle('active', activeWallGender === 'boy');
  renderAvatarPickerGrid('wallAvatarPickerGrid', activeWallGender, data.avatar, chosenAv => {
    if (profileModalTarget === 'teacher') {
      const p = getTeacherProfile();
      p.avatar = chosenAv;
      p.gender = activeWallGender;
      saveTeacherProfile(p);
    } else {
      updateCurrentStudentData(a => {
        a.avatar = chosenAv;
        a.gender = activeWallGender;
      });
    }
    openMyProfileModal(profileModalTarget);
  });

  document.getElementById('avatarWallModal').classList.remove('hidden');
}

/* 12. ŞANSLI KALEM SINIF YÖNETİMİ VE ÖĞRETMEN ÖĞRENCİ SİLME */
let pendingDeleteStudentKey = null;

function renderLuckyPencilClasses() {
  const accounts = getStudentAccounts();
  const classMap = {};

  Object.values(accounts).forEach(acc => {
    const cls = (acc.className || 'GENEL').toUpperCase().trim();
    if (!classMap[cls]) classMap[cls] = [];
    classMap[cls].push(acc);
  });

  const isTeacher = isTeacherLoggedIn();
  const visibleClass = localStorage.getItem(STORAGE_KEYS.VISIBLE_CLASS) || '';
  const classBtnsContainer = document.getElementById('teacherClassButtons');
  const statusBox = document.getElementById('activeClassStatusBox');
  const studentsListEl = document.getElementById('luckyClassStudentsList');

  if (!classBtnsContainer || !statusBox || !studentsListEl) return;

  classBtnsContainer.innerHTML = '';
  if (isTeacher) {
    const classes = Object.keys(classMap).sort();
    classes.forEach(cls => {
      const btn = document.createElement('button');
      btn.className = `cls-box-btn ${visibleClass === cls ? 'active' : ''}`;
      btn.textContent = `Sınıf ${cls}`;
      btn.onclick = () => {
        playSoftClickSound();
        localStorage.setItem(STORAGE_KEYS.VISIBLE_CLASS, cls);
        broadcastStudioUpdate('class_visibility');
        renderLuckyPencilClasses();
      };
      classBtnsContainer.appendChild(btn);
    });
  }

  if (visibleClass && classMap[visibleClass] && classMap[visibleClass].length > 0) {
    statusBox.innerHTML = `✅ Aktif Sınıf Listesi: <strong>${visibleClass}</strong> (${classMap[visibleClass].length} Öğrenci)`;
    studentsListEl.classList.remove('hidden');
    studentsListEl.innerHTML = '';
    classMap[visibleClass].forEach(st => {
      const row = document.createElement('div');
      row.className = 'st-row-item';
      row.innerHTML = `
        <span>${st.avatar || '👧🏻'} <strong>No: ${st.schoolNo}</strong> — ${st.username}</span>
        ${isTeacher ? `<button class="mini-pill-btn danger-pill" style="padding:2px 8px;font-size:0.7rem" data-del="${st.username.toLowerCase()}">Sil</button>` : ''}
      `;
      studentsListEl.appendChild(row);
    });

    if (isTeacher) {
      studentsListEl.querySelectorAll('[data-del]').forEach(btn => {
        btn.addEventListener('click', () => {
          pendingDeleteStudentKey = btn.getAttribute('data-del');
          document.getElementById('teacherDeletePromptText').textContent =
            'Bu öğrenciyi silmek istiyor musunuz, emin misiniz hocam?';
          document.getElementById('teacherDeleteStudentModal').classList.remove('hidden');
        });
      });
    }
  } else {
    statusBox.textContent = '🔒 Sınıf listesini sadece Beyza Hoca seçtiğinde görebilirsin.';
    studentsListEl.classList.add('hidden');
  }
}

/* 13. SÖZLÜK, GRAMER, DİNLEME LABORATUVARI VE WORKSHEET */
const RICH_DICTIONARY_DB = [
  {
    en: 'Accomplish', tr: 'Başarmak, tamamlamak', pos: 'Verb (Fiil)',
    subMeanings: [
      { type: 'Verb (Fiil)', meaning: 'Başarmak, tamamlamak, üstesinden gelmek' },
      { type: 'Noun (İsim - Accomplishment)', meaning: 'Başarı, kazanım' },
      { type: 'Adjective (Sıfat - Accomplished)', meaning: 'Yetenekli, başarılı' }
    ],
    synonyms: 'achieve, fulfill, complete', antonyms: 'fail, give up',
    example: 'You can accomplish anything if you work steadily.'
  },
  {
    en: 'Accurate', tr: 'Doğru, kesin, hatasız', pos: 'Adjective (Sıfat)',
    subMeanings: [
      { type: 'Adjective (Sıfat)', meaning: 'Doğru, kesin, hatasız' },
      { type: 'Noun (İsim - Accuracy)', meaning: 'Doğruluk, kesinlik' }
    ],
    synonyms: 'precise, exact, correct', antonyms: 'inaccurate, wrong',
    example: 'Please give an accurate answer to the question.'
  },
  {
    en: 'Acquire', tr: 'Edinmek, kazanmak (bilgi/dil)', pos: 'Verb (Fiil)',
    subMeanings: [
      { type: 'Verb (Fiil)', meaning: 'Edinmek, kazanmak' },
      { type: 'Noun (İsim - Acquisition)', meaning: 'Edinim, kazanım' }
    ],
    synonyms: 'obtain, gain, learn', antonyms: 'lose, forfeit',
    example: 'Children acquire new vocabulary quickly through games.'
  },
  {
    en: 'Beneficial', tr: 'Faydalı, yararlı', pos: 'Adjective (Sıfat)',
    subMeanings: [
      { type: 'Adjective (Sıfat)', meaning: 'Faydalı, yararlı' },
      { type: 'Noun/Verb (Benefit)', meaning: 'Fayda / Yarar sağlamak' }
    ],
    synonyms: 'helpful, useful, advantageous', antonyms: 'harmful, useless',
    example: 'Reading short stories daily is very beneficial.'
  },
  {
    en: 'Collaborate', tr: 'İş birliği yapmak, birlikte çalışmak', pos: 'Verb (Fiil)',
    subMeanings: [
      { type: 'Verb (Fiil)', meaning: 'İş birliği yapmak, birlikte çalışmak' },
      { type: 'Noun (İsim - Collaboration)', meaning: 'İş birliği, ortak çalışma' }
    ],
    synonyms: 'cooperate, team up', antonyms: 'compete, oppose',
    example: 'Students collaborate in groups during classroom quizzes.'
  },
  {
    en: 'Comprehensive', tr: 'Kapsamlı, detaylı', pos: 'Adjective (Sıfat)',
    subMeanings: [
      { type: 'Adjective (Sıfat)', meaning: 'Kapsamlı, detaylı, geniş' },
      { type: 'Verb (Fiil - Comprehend)', meaning: 'Anlamak, kavramak' }
    ],
    synonyms: 'thorough, complete, extensive', antonyms: 'partial, narrow',
    example: 'This notebook provides a comprehensive grammar review.'
  },
  {
    en: 'Confidence', tr: 'Özgüven, güven', pos: 'Noun (İsim)',
    subMeanings: [
      { type: 'Noun (İsim)', meaning: 'Özgüven, güven' },
      { type: 'Adjective (Sıfat - Confident)', meaning: 'Kendinden emin' }
    ],
    synonyms: 'self-assurance, trust', antonyms: 'doubt, fear',
    example: 'Speaking in class builds your English confidence.'
  },
  {
    en: 'Curious', tr: 'Meraklı, öğrenmeye istekli', pos: 'Adjective (Sıfat)',
    subMeanings: [
      { type: 'Adjective (Sıfat)', meaning: 'Meraklı, ilgili' },
      { type: 'Noun (İsim - Curiosity)', meaning: 'Merak' }
    ],
    synonyms: 'inquisitive, eager', antonyms: 'indifferent',
    example: 'Curious minds always ask the best questions.'
  },
  {
    en: 'Determine', tr: 'Belirlemek, kararlaştırmak', pos: 'Verb (Fiil)',
    subMeanings: [
      { type: 'Verb (Fiil)', meaning: 'Belirlemek, kararlaştırmak' },
      { type: 'Adjective (Sıfat - Determined)', meaning: 'Kararlı, azimli' }
    ],
    synonyms: 'decide, establish', antonyms: 'hesitate',
    example: 'Context helps you determine the meaning of a word.'
  }
];

function speakText(text, lang = 'en-US', rate = 1) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = rate;
  window.speechSynthesis.speak(u);
}

function renderFeaturedDictionaryCards() {
  const grid = document.getElementById('dictFeaturedGrid');
  if (!grid) return;
  grid.innerHTML = '';
  RICH_DICTIONARY_DB.forEach(item => {
    const card = document.createElement('div');
    card.className = 'vocab-lined-card';
    card.innerHTML = `
      <div class="vocab-top-bar">
        <span class="tag-orange">${item.pos}</span>
        <button class="dinle-btn" data-speak="${item.en}">🔊 Dinle</button>
      </div>
      <h3>${item.en}</h3>
      <p class="postit-tr">TR ${item.tr}</p>
      <p class="postit-ex">"${item.example}"</p>
    `;
    grid.appendChild(card);
  });
  grid.querySelectorAll('[data-speak]').forEach(btn => {
    btn.addEventListener('click', () => speakText(btn.getAttribute('data-speak')));
  });
}

function renderPronunciationDrills() {
  const grid = document.getElementById('pronunciationDrillGrid');
  if (!grid) return;
  grid.innerHTML = '';
  RICH_DICTIONARY_DB.slice(0, 6).forEach(item => {
    const card = document.createElement('div');
    card.className = 'vocab-lined-card';
    card.innerHTML = `
      <span class="tag-orange">PRONUNCIATION DRILL</span>
      <h3>${item.en}</h3>
      <p class="postit-tr">${item.tr}</p>
      <p class="postit-ex" style="margin-bottom:10px">"${item.example}"</p>
      <div style="display:flex;gap:6px">
        <button class="dinle-btn" data-uk="${item.example}">🇬🇧 UK Cümle</button>
        <button class="dinle-btn" data-us="${item.example}">🇺🇸 US Cümle</button>
      </div>
    `;
    grid.appendChild(card);
  });
  grid.querySelectorAll('[data-uk]').forEach(b => b.addEventListener('click', () => speakText(b.getAttribute('data-uk'), 'en-GB', 0.95)));
  grid.querySelectorAll('[data-us]').forEach(b => b.addEventListener('click', () => speakText(b.getAttribute('data-us'), 'en-US', 0.95)));
}

function renderWorksheetPreview() {
  const box = document.getElementById('worksheetPreviewBox');
  if (!box) return;
  const title = document.getElementById('worksheetCustomTitle')?.value || 'Worksheet';
  const level = document.getElementById('worksheetLevelSelect')?.value || 'Lise';

  const rows = RICH_DICTIONARY_DB.slice(0, 6).map((w, i) => `
    <tr>
      <td style="padding:8px;border:1.5px solid #1e293b"><strong>${i + 1}. ${w.en}</strong> (${w.pos})</td>
      <td style="padding:8px;border:1.5px solid #1e293b">${w.tr}</td>
      <td style="padding:8px;border:1.5px solid #1e293b">${w.example}</td>
    </tr>
  `).join('');

  box.innerHTML = `
    <div style="border-bottom:2px solid #1e293b;padding-bottom:10px;margin-bottom:12px;display:flex;justify-content:space-between;flex-wrap:wrap">
      <div>
        <h3>👩‍🏫 ${title}</h3>
        <p style="font-size:0.85rem;font-weight:700;color:#ea580c">Seviye: ${level}</p>
      </div>
      <div style="font-size:0.85rem;font-weight:700">
        Öğrenci Adı: ___________________ | Sınıf / No: _________
      </div>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:0.88rem">
      <thead>
        <tr style="background:#ffedd5">
          <th style="padding:8px;border:1.5px solid #1e293b;text-align:left">Kelime (EN)</th>
          <th style="padding:8px;border:1.5px solid #1e293b;text-align:left">Anlamı (TR)</th>
          <th style="padding:8px;border:1.5px solid #1e293b;text-align:left">Örnek Cümle</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

async function searchLiveDictionary(queryRaw) {
  const q = queryRaw.trim();
  const box = document.getElementById('dictLiveResultBox');
  if (!q || !box) return;

  playSoftClickSound();
  box.classList.remove('hidden');
  box.innerHTML = `<p>🔎 <strong>"${q}"</strong> için Türkçe ↔ İngilizce çeviri ve alt anlamlar getiriliyor...</p>`;

  const local = RICH_DICTIONARY_DB.find(
    d => d.en.toLowerCase() === q.toLowerCase() || d.tr.toLowerCase().includes(q.toLowerCase())
  );
  if (local) {
    renderLiveWordBox(local);
    return;
  }

  try {
    const isTr = /[çğıöşü]/i.test(q) || ['kitap', 'kalem', 'başarmak', 'okul', 'ışık', 'merak', 'güven'].includes(q.toLowerCase());
    const pair = isTr ? 'tr|en' : 'en|tr';
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=${pair}`);
    const data = await res.json();
    const translated = data?.responseData?.translatedText || q;
    const enWord = isTr ? translated.toLowerCase().split(',')[0].trim() : q.toLowerCase();
    const trWord = isTr ? q : translated;

    let subMeanings = [];
    let syns = '-';
    let ants = '-';
    let ex = `Learning "${enWord}" helps you express yourself clearly.`;

    try {
      const dRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(enWord)}`);
      if (dRes.ok) {
        const dJson = await dRes.json();
        const entry = dJson[0];
        const mapPos = { noun: 'Noun (İsim)', verb: 'Verb (Fiil)', adjective: 'Adjective (Sıfat)', adverb: 'Adverb (Zarf)' };
        (entry.meanings || []).forEach(m => {
          const t = mapPos[m.partOfSpeech] || m.partOfSpeech;
          const def = m.definitions?.[0]?.definition || '';
          if (def) subMeanings.push({ type: t, meaning: def });
          if (m.definitions?.[0]?.example) ex = m.definitions[0].example;
          if (m.synonyms?.length && syns === '-') syns = m.synonyms.slice(0, 4).join(', ');
          if (m.antonyms?.length && ants === '-') ants = m.antonyms.slice(0, 4).join(', ');
        });
      }
    } catch (_) {}

    if (subMeanings.length === 0) {
      subMeanings.push({ type: 'Kelime Karşılığı', meaning: `${enWord} ↔ ${trWord}` });
    }

    renderLiveWordBox({ en: enWord, tr: trWord, subMeanings, synonyms: syns, antonyms: ants, example: ex });
  } catch {
    box.innerHTML = `<p class="err-text">Çeviri bağlantısında sorun oluştu.</p>`;
  }
}

function renderLiveWordBox(item) {
  const box = document.getElementById('dictLiveResultBox');
  if (!box) return;
  const subs = (item.subMeanings || []).map(s => `
    <div style="border:2px solid #1e293b;border-radius:12px;padding:10px;background:#fff">
      <span class="tag-orange">${s.type}</span>
      <p style="font-size:0.86rem;font-weight:700">${s.meaning}</p>
    </div>
  `).join('');

  box.innerHTML = `
    <div class="flex-between-wrap" style="margin-bottom:10px">
      <h3>🌐 ${item.en.toUpperCase()} ↔ TR: ${item.tr}</h3>
      <button class="dinle-btn" id="liveSpeakBtn">🔊 Telaffuzu Dinle</button>
    </div>
    <div class="vocab-three-grid" style="margin-bottom:10px">${subs}</div>
    <p style="font-size:0.85rem"><strong>Eş Anlamlılar:</strong> ${item.synonyms || '-'} | <strong>Zıt Anlamlılar:</strong> ${item.antonyms || '-'}</p>
    <p class="postit-ex" style="margin-top:4px"><strong>Örnek:</strong> "${item.example}"</p>
  `;
  document.getElementById('liveSpeakBtn')?.addEventListener('click', () => speakText(item.en));
}

const GRAMMAR_LIBRARY_DB = {
  tenses: [
    { title: 'Present Simple (Geniş Zaman)', pos: 'I/You/We/They + V1 | He/She/It + V1(s)', neg: "don't / doesn't + V1", q: 'Do / Does + S + V1?', ex: 'She speaks English every day.' },
    { title: 'Present Continuous (Şimdiki Zaman)', pos: 'am / is / are + V-ing', neg: 'am/is/are not + V-ing', q: 'Am/Is/Are + S + V-ing?', ex: 'We are playing a classroom game now.' },
    { title: 'Past Simple (Geçmiş Zaman)', pos: 'Subject + V2 (-ed / 2. hal)', neg: "didn't + V1", q: 'Did + S + V1?', ex: 'They completed the quiz yesterday.' },
    { title: 'Past Continuous', pos: 'was / were + V-ing', neg: "wasn't / weren't + V-ing", q: 'Was/Were + S + V-ing?', ex: 'While I was studying, the bell rang.' },
    { title: 'Present Perfect Tense', pos: 'have / has + V3', neg: "haven't / hasn't + V3", q: 'Have/Has + S + V3?', ex: 'I have just learned ten new words.' },
    { title: 'Future (Will & Be Going To)', pos: 'will + V1 / am-is-are going to + V1', neg: "won't + V1", q: 'Will + S + V1?', ex: 'We will start a new round soon.' }
  ],
  modals: [
    { title: 'Can / Could / Be able to', pos: 'Yetenek, olasılık ve rica', neg: "can't / couldn't + V1", q: 'Can / Could + S + V1?', ex: 'Can I join the live game?' },
    { title: 'Must / Have to / Should', pos: 'Zorunluluk (Must) ve Tavsiye (Should)', neg: "mustn't (Yasak) / don't have to", q: 'Should + S + V1?', ex: 'You should review your vocabulary notes.' },
    { title: 'May / Might / Must be', pos: 'Olasılık ve güçlü çıkarım', neg: 'may not / might not + V1', q: 'Might + S + V1?', ex: 'She must be the winner of this round!' }
  ],
  conditionals: [
    { title: 'Zero & First Conditional (Type 0 & 1)', pos: 'If + Present Simple, Will + V1', neg: "If + don't V1, won't V1", q: 'What will you do if...?', ex: 'If you work steadily, you will accomplish your goals.' },
    { title: 'Second Conditional (Type 2)', pos: 'If + Past Simple (V2/were), Would + V1', neg: "If + didn't V1, wouldn't V1", q: 'What would you do if...?', ex: 'If I were you, I would join the quiz.' },
    { title: 'Third Conditional (Type 3) & Wish', pos: 'If + had V3, would have V3', neg: "If + hadn't V3, wouldn't have V3", q: 'I wish + Past Simple / Past Perfect', ex: 'If I had known the word, I would have won.' }
  ],
  passive: [
    { title: 'Passive Voice (Edilgen Çatı)', pos: 'Object + be (am/is/are/was/were) + V3', neg: 'is not / was not + V3', q: 'Is / Was + Object + V3?', ex: 'This studio was created for Teacher Beyza.' },
    { title: 'Reported Speech (Dolaylı Anlatım)', pos: 'He said (that) + bir derece geçmiş zaman', neg: 'told me not to + V1', q: 'asked if / whether...', ex: 'Teacher Beyza said that the game was open.' }
  ],
  clauses: [
    { title: 'Relative Clauses (Who / Which / That)', pos: 'İnsan: Who/That | Cansız: Which/That', neg: 'Yer: Where | İyelik: Whose', q: 'Do you know the student who...?', ex: 'Students who collaborate learn faster.' }
  ],
  conjunctions: [
    { title: 'Bağlaçlar (Although / Despite / Because)', pos: 'Although + Cümle | Despite + İsim', neg: 'Because + Cümle | Because of + İsim', q: 'However, Therefore, Moreover', ex: 'Although the test was hard, she succeeded.' },
    { title: 'Prepositions (IN / ON / AT)', pos: 'IN: Aylar/Yıllar | ON: Günler | AT: Saatler', neg: 'keen on, good at, interested in', q: 'depend on, afraid of', ex: 'Our lesson starts on Monday at 09:00.' }
  ]
};

function renderGrammarCategory(catKey) {
  const container = document.getElementById('grammarCardsContainer');
  if (!container) return;
  const list = GRAMMAR_LIBRARY_DB[catKey] || GRAMMAR_LIBRARY_DB.tenses;
  container.innerHTML = '';
  list.forEach(g => {
    const card = document.createElement('div');
    card.className = 'vocab-lined-card';
    card.innerHTML = `
      <span class="tag-orange">GRAMMAR NOTE</span>
      <h3>${g.title}</h3>
      <p style="font-size:0.84rem;margin:6px 0"><strong>➕ (+):</strong> ${g.pos}</p>
      <p style="font-size:0.84rem;margin:4px 0"><strong>➖ (-):</strong> ${g.neg}</p>
      <p style="font-size:0.84rem;margin:4px 0"><strong>❓ (?):</strong> ${g.q}</p>
      <p class="postit-ex" style="margin-top:6px">"${g.ex}"</p>
    `;
    container.appendChild(card);
  });
}

/* 14. NOT DEFTERİ ↔ PAINT ÇİZİM ŞALTERİ */
function initNotebookAndPaintCanvas() {
  const toggle = document.getElementById('notebookPaintToggle');
  const writtenPanel = document.getElementById('writtenNotesPanel');
  const paintPanel = document.getElementById('paintCanvasPanel');
  const textarea = document.getElementById('studentNotesTextarea');
  if (!toggle || !textarea) return;

  textarea.value = localStorage.getItem(STORAGE_KEYS.NOTES_TEXT) || '';
  textarea.addEventListener('input', () => {
    localStorage.setItem(STORAGE_KEYS.NOTES_TEXT, textarea.value);
  });

  document.getElementById('clearNotesBtn')?.addEventListener('click', () => {
    playSoftClickSound();
    textarea.value = '';
    localStorage.removeItem(STORAGE_KEYS.NOTES_TEXT);
  });

  toggle.addEventListener('change', () => {
    playPaperFlipSound();
    const isPaint = toggle.checked;
    writtenPanel.classList.toggle('hidden', isPaint);
    paintPanel.classList.toggle('hidden', !isPaint);
  });

  const canvas = document.getElementById('studioPaintCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let drawing = false;
  let currentColor = '#1e293b';
  let brushSize = 4;
  let isEraser = false;

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const savedImg = localStorage.getItem(STORAGE_KEYS.PAINT_DATA);
  if (savedImg) {
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0);
    img.src = savedImg;
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (cx - rect.left) * scaleX, y: (cy - rect.top) * scaleY };
  }

  function start(e) { drawing = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); }
  function move(e) {
    if (!drawing) return;
    e.preventDefault();
    const p = getPos(e);
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = isEraser ? '#ffffff' : currentColor;
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }
  function end() {
    if (!drawing) return;
    drawing = false;
    localStorage.setItem(STORAGE_KEYS.PAINT_DATA, canvas.toDataURL());
  }

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  window.addEventListener('mouseup', end);
  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove', move, { passive: false });
  window.addEventListener('touchend', end);

  document.querySelectorAll('#paintColorSwatches .color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      playSoftClickSound();
      isEraser = false;
      currentColor = dot.getAttribute('data-color');
      document.querySelectorAll('#paintColorSwatches .color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
    });
  });

  document.getElementById('paintBrushSize')?.addEventListener('input', e => { brushSize = Number(e.target.value); });
  document.getElementById('paintEraserBtn')?.addEventListener('click', () => { playSoftClickSound(); isEraser = true; });
  document.getElementById('paintClearBtn')?.addEventListener('click', () => {
    playPaperFlipSound();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    localStorage.removeItem(STORAGE_KEYS.PAINT_DATA);
  });
}

/* 15. ŞİKAYET & ÖNERİ KUTUSU */
function getComplaints() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLAINTS)) || []; } catch { return []; }
}
function saveComplaints(list) {
  localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(list));
  broadcastStudioUpdate('complaints');
}
function renderTeacherComplaints() {
  const list = getComplaints();
  const badge = document.getElementById('complaintCountBadge');
  const box = document.getElementById('teacherMessagesList');
  if (badge) badge.textContent = list.length;
  if (!box) return;

  if (list.length === 0) {
    box.innerHTML = '<p>Henüz öğrencilerden gelen bir mesaj yok.</p>';
    return;
  }
  box.innerHTML = '';
  list.slice().reverse().forEach(item => {
    const d = document.createElement('div');
    d.className = 'vocab-lined-card';
    d.innerHTML = `
      <strong>${item.avatar} ${item.username} | Sınıf: ${item.className} | Okul No: ${item.schoolNo}</strong>
      <p style="font-size:0.78rem;color:#ea580c;margin:4px 0">${item.type} • ${item.date}</p>
      <p>${item.message}</p>
    `;
    box.appendChild(d);
  });
}

/* 16. GERÇEK LOBİ, ARKADAŞ DAVET SİSTEMİ VE ŞALTER KONTROLÜ */
const GAME_QUESTIONS = [
  { q: "Which word means 'working very hard and carefully'?", opts: ['Reluctant', 'Diligent', 'Fragile', 'Temporary'], ans: 'Diligent', word: 'DILIGENT', hint: 'Çalışkan, özenli', tfQ: "'Diligent' kelimesi 'Çalışkan ve özenli' demektir.", tfAns: true, sent: ['Diligent', 'students', 'work', 'very', 'carefully'] },
  { q: "Which word means 'Başarmak, tamamlamak'?", opts: ['Accomplish', 'Abandon', 'Hesitate', 'Ignore'], ans: 'Accomplish', word: 'ACCOMPLISH', hint: 'Başarmak', tfQ: "'Accomplish' kelimesi 'Vazgeçmek' demektir.", tfAns: false, sent: ['You', 'can', 'accomplish', 'anything', 'today'] },
  { q: "Which word means 'Doğru, kesin, hatasız'?", opts: ['Accurate', 'Wrong', 'Vague', 'Slow'], ans: 'Accurate', word: 'ACCURATE', hint: 'Doğru, hatasız', tfQ: "'Accurate' kelimesi 'Doğru, hatasız' demektir.", tfAns: true, sent: ['Please', 'give', 'an', 'accurate', 'answer'] },
  { q: "Which word means 'Faydalı, yararlı'?", opts: ['Beneficial', 'Harmful', 'Useless', 'Weak'], ans: 'Beneficial', word: 'BENEFICIAL', hint: 'Faydalı', tfQ: "'Beneficial' kelimesi 'Zararlı' anlamına gelir.", tfAns: false, sent: ['Reading', 'daily', 'is', 'very', 'beneficial'] },
  { q: "Which word means 'Özgüven, güven'?", opts: ['Confidence', 'Doubt', 'Fear', 'Anger'], ans: 'Confidence', word: 'CONFIDENCE', hint: 'Özgüven', tfQ: "'Confidence' kelimesi 'Özgüven' demektir.", tfAns: true, sent: ['Speaking', 'builds', 'your', 'English', 'confidence'] }
];

let currentMatchState = {
  gameType: 'quiz',
  difficulty: 'Lise (9-12. Sınıf)',
  endRule: 'round-10',
  currentRound: 1,
  matchScore: 0,
  builtSentence: []
};

function canCurrentUserHostGame() {
  if (isTeacherLoggedIn()) return true;
  return localStorage.getItem(STORAGE_KEYS.HOST_PERM) === 'true';
}

function getLiveRoomData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.LIVE_ROOM)) || null; } catch { return null; }
}

function getMyDisplayName() {
  if (isTeacherLoggedIn()) return '👩‍🏫 Teacher Beyza';
  const u = getCurrentStudent();
  return u ? `${u.avatar || '👧🏻'} ${u.username} (${u.className})` : 'Misafir Öğrenci';
}

function syncGameHostPermissionsUI() {
  const studentCanHost = localStorage.getItem(STORAGE_KEYS.HOST_PERM) === 'true';
  const toggle = document.getElementById('studentHostToggle');
  const badge = document.getElementById('studentHostStatusBadge');
  const hostLabel = document.getElementById('arenaHostPermissionLabel');
  const setupBtn = document.getElementById('openGameSetupModalBtn');
  const joinBtn = document.getElementById('joinLiveSessionBtn');
  const lockedOverlay = document.getElementById('gameLockedOverlay');
  const activeStage = document.getElementById('activeGameStageCard');
  const liveBanner = document.getElementById('liveRoomBanner');
  const liveRoom = getLiveRoomData();

  if (toggle) toggle.checked = studentCanHost;
  if (badge) badge.textContent = studentCanHost ? 'Öğrenciler de Lobi Kurabilir (Açık)' : 'Sadece Beyza Hoca (Kapalı)';
  if (hostLabel) {
    hostLabel.textContent = studentCanHost
      ? '👑 Yönetici Modu: Öğrenciler de Host Olup Lobi Kurabilir'
      : '👑 Yönetici Modu: Sadece Teacher Beyza Oyun Kurabilir';
  }

  const canHost = canCurrentUserHostGame();
  if (setupBtn) {
    setupBtn.classList.toggle('hidden', !canHost);
    setupBtn.textContent = isTeacherLoggedIn()
      ? '🚀 Yeni Sınıf Lobisi Kur (Host)'
      : '🚀 Lobi Kur (Host Ol) & Arkadaşlarını Davet Et';
  }

  document.querySelectorAll('#gameTypeSelectorRow .game-select-pill').forEach(b => {
    b.style.opacity = canHost ? '1' : '0.55';
    b.style.cursor = canHost ? 'pointer' : 'not-allowed';
  });

  if (liveBanner) {
    if (liveRoom && liveRoom.active) {
      const myName = getMyDisplayName();
      const isJoined = liveRoom.participants.includes(myName);
      const isHost = liveRoom.hostName === myName;

      const allStudents = Object.values(getStudentAccounts());
      const inviteOptions = allStudents
        .map(s => `<option value="${s.avatar || '👧🏻'} ${s.username} (${s.className})">${s.username} (${s.className})</option>`)
        .join('');

      liveBanner.innerHTML = `
        <div style="width:100%">
          <div class="flex-between-wrap">
            <div>
              🟢 <strong>Aktif Lobi (#${liveRoom.roomCode || '104'}):</strong> ${liveRoom.gameType.toUpperCase()} • ${liveRoom.difficulty}
              <span style="margin-left:8px;color:#ea580c">| Host: <strong>${liveRoom.hostName}</strong></span>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              ${!isJoined ? `<button id="dynamicJoinLobbyBtn" class="mini-pill-btn register-pill">🤝 Bu Lobiye Katıl</button>` : `<span class="cls-tag" style="background:#16a34a">✅ Lobidesin</span>`}
              ${(canHost || isHost) ? `
                <select id="inviteFriendSelect" style="padding:4px 8px;border:2px solid #1e293b;border-radius:8px;font-size:0.78rem">
                  <option value="">+ Sınıf Arkadaşını Lobiye Davet Et...</option>
                  ${inviteOptions}
                </select>
                <button id="inviteFriendBtn" class="mini-pill-btn login-pill">📨 Davet Gönder</button>
                <button id="closeActiveLobbyBtn" class="mini-pill-btn danger-pill">⏹️ Lobiyi Kapat</button>
              ` : ''}
            </div>
          </div>
          <div class="lobby-friend-chips">
            <span style="font-size:0.78rem;align-self:center">👥 Lobideki Oyuncular (${liveRoom.participants.length}):</span>
            ${liveRoom.participants.map(p => `<span class="friend-chip">${p}</span>`).join('')}
          </div>
        </div>
      `;
      joinBtn?.classList.toggle('hidden', isJoined);

      document.getElementById('dynamicJoinLobbyBtn')?.addEventListener('click', joinActiveLobbyRoom);
      document.getElementById('inviteFriendBtn')?.addEventListener('click', () => {
        const sel = document.getElementById('inviteFriendSelect');
        if (!sel || !sel.value) return;
        playSoftClickSound();
        const r = getLiveRoomData();
        if (r && !r.participants.includes(sel.value)) {
          r.participants.push(sel.value);
          localStorage.setItem(STORAGE_KEYS.LIVE_ROOM, JSON.stringify(r));
          broadcastStudioUpdate('live_room');
          syncGameHostPermissionsUI();
        }
      });
      document.getElementById('closeActiveLobbyBtn')?.addEventListener('click', () => {
        playSoftClickSound();
        localStorage.removeItem(STORAGE_KEYS.LIVE_ROOM);
        broadcastStudioUpdate('live_room');
        syncGameHostPermissionsUI();
      });
    } else {
      liveBanner.innerHTML = `
        <span>📡 Şu an açık bir canlı oyun lobisi yok. ${canHost ? '<strong>"Lobi Kur"</strong> butonuna basarak yeni lobi açıp arkadaşlarını davet edebilirsin!' : 'Beyza Hoca lobi kurduğunda burada belirecek.'}</span>
        <span>Katılımcılar: -</span>
      `;
      joinBtn?.classList.add('hidden');
    }
  }

  const myName = getMyDisplayName();
  const isPlayerInRoom = liveRoom && liveRoom.active && liveRoom.participants.includes(myName);

  if (lockedOverlay && activeStage) {
    if (!canHost && (!liveRoom || !liveRoom.active)) {
      lockedOverlay.classList.remove('hidden');
      lockedOverlay.innerHTML = `
        <h3>🔒 Oyun Kurma Şu An Sadece Teacher Beyza'ya Özel!</h3>
        <p>Ana sayfadaki <strong>"Öğrenciler Oyun Kurabilsin"</strong> şalteri şu an kapalı olduğu için öğrenciler tek başına oyun kuramaz. <strong>Teacher Beyza</strong> ortak bir lobi kurduğunda buradan lobiye katılıp oynayabilirsin!</p>
      `;
      activeStage.classList.add('hidden');
    } else if (!canHost && liveRoom && liveRoom.active && !isPlayerInRoom) {
      lockedOverlay.classList.remove('hidden');
      lockedOverlay.innerHTML = `
        <h3>🟢 ${liveRoom.hostName} Canlı Oyun Lobisi Kurdu!</h3>
        <p style="margin:8px 0 14px">Oyun: <strong>${liveRoom.gameType.toUpperCase()}</strong> | Zorluk: <strong>${liveRoom.difficulty}</strong> | Lobideki Oyuncular: <strong>${liveRoom.participants.join(', ')}</strong></p>
        <button id="overlayJoinLobbyBtn" class="big-orange-action-btn">🤝 Daveti Kabul Et ve Lobiye Katıl!</button>
      `;
      activeStage.classList.add('hidden');
      document.getElementById('overlayJoinLobbyBtn')?.addEventListener('click', joinActiveLobbyRoom);
    } else {
      lockedOverlay.classList.add('hidden');
      activeStage.classList.remove('hidden');
    }
  }
}

function joinActiveLobbyRoom() {
  const room = getLiveRoomData();
  if (!room) return;
  playSoftClickSound();
  const myName = getMyDisplayName();
  if (!room.participants.includes(myName)) {
    room.participants.push(myName);
    localStorage.setItem(STORAGE_KEYS.LIVE_ROOM, JSON.stringify(room));
    broadcastStudioUpdate('live_room');
  }
  syncGameHostPermissionsUI();
  startOrJoinLiveMatch(room);
}

function startOrJoinLiveMatch(cfg) {
  currentMatchState = {
    gameType: cfg.gameType || 'quiz',
    difficulty: cfg.difficulty || 'Lise (9-12. Sınıf)',
    endRule: cfg.endRule || 'round-10',
    currentRound: 1,
    matchScore: 0,
    builtSentence: []
  };
  document.getElementById('matchEndPodiumCard')?.classList.add('hidden');
  const scEl = document.getElementById('arenaCurrentMatchScore');
  const gbEl = document.getElementById('stageGameBadge');
  const lbEl = document.getElementById('stageLevelBadge');
  if (scEl) scEl.textContent = '0';
  if (gbEl) gbEl.textContent = `⚡ ${currentMatchState.gameType.toUpperCase()}`;
  if (lbEl) lbEl.textContent = currentMatchState.difficulty;
  renderNextGameQuestion();
}

function renderNextGameQuestion() {
  const item = GAME_QUESTIONS[(currentMatchState.currentRound - 1) % GAME_QUESTIONS.length];
  const qTitle = document.getElementById('gameQuestionTitle');
  const area = document.getElementById('gameInteractiveArea');
  const fb = document.getElementById('gameInstantFeedback');
  const roundBadge = document.getElementById('arenaRoundProgressBadge');
  if (!qTitle || !area || !fb || !roundBadge) return;

  fb.textContent = '';
  area.innerHTML = '';

  if (currentMatchState.endRule.startsWith('round-')) {
    roundBadge.textContent = `Soru ${currentMatchState.currentRound} / ${currentMatchState.endRule.split('-')[1]}`;
  } else if (currentMatchState.endRule.startsWith('score-')) {
    roundBadge.textContent = `Hedef: ${currentMatchState.matchScore} / ${currentMatchState.endRule.split('-')[1]} P`;
  } else {
    roundBadge.textContent = `Soru ${currentMatchState.currentRound}`;
  }

  if (currentMatchState.gameType === 'quiz') {
    qTitle.textContent = item.q;
    item.opts.forEach(opt => {
      const b = document.createElement('button');
      b.className = 'arena-opt-btn';
      b.textContent = opt;
      b.onclick = () => handleGameAnswer(opt === item.ans);
      area.appendChild(b);
    });
  } else if (currentMatchState.gameType === 'word') {
    const masked = item.word.split('').map((c, i) => (i % 2 === 1 ? '_' : c)).join(' ');
    qTitle.textContent = `İpucu: "${item.hint}" -> ${masked}`;
    area.innerHTML = `
      <input type="text" id="wfInput" placeholder="Kelimeyi yaz..." style="padding:10px;border:2px solid #1e293b;border-radius:10px" />
      <button id="wfBtn" class="mini-pill-btn orange-pill">Kontrol Et</button>
    `;
    document.getElementById('wfBtn').onclick = () => {
      const val = document.getElementById('wfInput').value.trim().toUpperCase();
      handleGameAnswer(val === item.word);
    };
  } else if (currentMatchState.gameType === 'tf') {
    qTitle.textContent = item.tfQ;
    area.innerHTML = `
      <button id="tfT" class="arena-opt-btn">✅ TRUE (Doğru)</button>
      <button id="tfF" class="arena-opt-btn">❌ FALSE (Yanlış)</button>
    `;
    document.getElementById('tfT').onclick = () => handleGameAnswer(item.tfAns === true);
    document.getElementById('tfF').onclick = () => handleGameAnswer(item.tfAns === false);
  } else if (currentMatchState.gameType === 'sentence') {
    qTitle.textContent = 'Kelimelere sırayla tıklayarak cümleyi kur:';
    currentMatchState.builtSentence = [];
    const target = item.sent;
    const scrambled = [...target].sort(() => Math.random() - 0.5);
    scrambled.forEach(w => {
      const b = document.createElement('button');
      b.className = 'arena-opt-btn';
      b.textContent = w;
      b.onclick = () => {
        playSoftClickSound();
        currentMatchState.builtSentence.push(w);
        b.disabled = true;
        b.style.opacity = '0.4';
        qTitle.textContent = currentMatchState.builtSentence.join(' ');
        if (currentMatchState.builtSentence.length === target.length) {
          handleGameAnswer(currentMatchState.builtSentence.join(' ') === target.join(' '));
        }
      };
      area.appendChild(b);
    });
  }
}

function handleGameAnswer(ok) {
  const fb = document.getElementById('gameInstantFeedback');
  if (ok) {
    playSoftClickSound();
    currentMatchState.matchScore += 100;
    fb.style.color = '#16a34a';
    fb.textContent = '🎉 Doğru Cevap! (+100 Puan)';
  } else {
    playSoftClickSound();
    fb.style.color = '#dc2626';
    fb.textContent = '💡 Yanlış cevap!';
  }
  document.getElementById('arenaCurrentMatchScore').textContent = currentMatchState.matchScore;

  let done = false;
  let won = false;
  if (currentMatchState.endRule.startsWith('round-')) {
    const maxR = Number(currentMatchState.endRule.split('-')[1]);
    if (currentMatchState.currentRound >= maxR) {
      done = true;
      won = currentMatchState.matchScore >= (maxR * 50);
    }
  } else if (currentMatchState.endRule.startsWith('score-')) {
    const targetS = Number(currentMatchState.endRule.split('-')[1]);
    if (currentMatchState.matchScore >= targetS) {
      done = true;
      won = true;
    }
  }

  if (done) {
    playSchoolBellSound();
    updateCurrentStudentData(acc => {
      acc.totalScore = (acc.totalScore || 0) + currentMatchState.matchScore;
      acc.gamesPlayed = (acc.gamesPlayed || 0) + 1;
      if (won) acc.gamesWon = (acc.gamesWon || 0) + 1;
      else acc.gamesLost = (acc.gamesLost || 0) + 1;
    });
    const liveRoom = getLiveRoomData();
    const others = (liveRoom?.participants || []).filter(p => p !== getMyDisplayName());
    const secondPlayer = others[0] || 'Lobi Arkadaşı #1';
    const thirdPlayer = others[1] || 'Lobi Arkadaşı #2';

    document.getElementById('matchEndPodiumCard').classList.remove('hidden');
    document.getElementById('podiumWinnersList').innerHTML = `
      <div class="vocab-lined-card" style="text-align:center"><h3>🥇 1. ${getMyDisplayName()}</h3><p>${currentMatchState.matchScore} Puan</p></div>
      <div class="vocab-lined-card" style="text-align:center"><h3>🥈 2. ${secondPlayer}</h3><p>${Math.max(0, currentMatchState.matchScore - 100)} Puan</p></div>
      <div class="vocab-lined-card" style="text-align:center"><h3>🥉 3. ${thirdPlayer}</h3><p>${Math.max(0, currentMatchState.matchScore - 200)} Puan</p></div>
    `;
  } else {
    currentMatchState.currentRound++;
    setTimeout(renderNextGameQuestion, 700);
  }
}

/* 17. BAŞLATMA */
document.addEventListener('DOMContentLoaded', () => {
  injectRefinedLocketAndTimerStyles();
  injectSoundToggleButton();
  injectCrayonProgressBarDOM();
  renderBinderHoles();
  renderRefinedDoubleDoorLocket();
  setupMotivationAndSincereAboutPages();
  upgradeTeacherLoginModalDOM();
  renderFeaturedDictionaryCards();
  renderPronunciationDrills();
  renderWorksheetPreview();
  renderGrammarCategory('tenses');
  initNotebookAndPaintCanvas();

  document.querySelectorAll('.scroll-dropdown').forEach(drop => {
    drop.addEventListener('mouseenter', () => playPaperFlipSound());
  });

  let regGender = 'girl';
  let regAvatar = '👧🏻';
  renderAvatarPickerGrid('regAvatarPicker', regGender, regAvatar, icon => { regAvatar = icon; });

  document.getElementById('regGenderGirlBtn')?.addEventListener('click', () => {
    playSoftClickSound();
    regGender = 'girl';
    regAvatar = GENDER_AVATARS.girl[0].icon;
    document.getElementById('regGenderGirlBtn').classList.add('active');
    document.getElementById('regGenderBoyBtn').classList.remove('active');
    renderAvatarPickerGrid('regAvatarPicker', 'girl', regAvatar, icon => { regAvatar = icon; });
  });

  document.getElementById('regGenderBoyBtn')?.addEventListener('click', () => {
    playSoftClickSound();
    regGender = 'boy';
    regAvatar = GENDER_AVATARS.boy[0].icon;
    document.getElementById('regGenderBoyBtn').classList.add('active');
    document.getElementById('regGenderGirlBtn').classList.remove('active');
    renderAvatarPickerGrid('regAvatarPicker', 'boy', regAvatar, icon => { regAvatar = icon; });
  });

  if (isTeacherUrlMode() && !isTeacherLoggedIn()) {
    document.getElementById('teacherLoginModal')?.classList.remove('hidden');
  }

  syncAllAuthAndModeBars();

  document.querySelectorAll('.unroll-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetPage = btn.getAttribute('data-page');
      openNotebookPage(targetPage);
      const gType = btn.getAttribute('data-gametype');
      if (gType && canCurrentUserHostGame()) {
        document.querySelectorAll('#gameTypeSelectorRow .game-select-pill').forEach(p => {
          p.classList.toggle('active', p.getAttribute('data-game') === gType);
        });
        startOrJoinLiveMatch({
          gameType: gType,
          difficulty: currentMatchState.difficulty,
          endRule: currentMatchState.endRule
        });
      }
    });
  });

  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      playSoftClickSound();
      document.getElementById(btn.getAttribute('data-close'))?.classList.add('hidden');
    });
  });

  // Günün Kelimesi Yenile
  let dIdx = 0;
  document.getElementById('refreshDailyWordBtn')?.addEventListener('click', () => {
    playPaperFlipSound();
    dIdx = (dIdx + 1) % RICH_DICTIONARY_DB.length;
    const w = RICH_DICTIONARY_DB[dIdx];
    document.getElementById('dailyWordTitle').textContent = w.en;
    document.getElementById('dailyWordTr').textContent = `TR ${w.tr}`;
    document.getElementById('dailyWordEx').textContent = `"${w.example}"`;
  });

  // Crayon Timer (Kendine Özel Kronometre, Saat Tik-Tak ve Çekiçli Okul Zili Sesli)
  let tTotalSec = 180;
  let tSec = 180;
  let tInt = null;
  const tDisp = document.getElementById('timerDisplay');

  function updTimer() {
    if (!tDisp) return;
    tDisp.textContent = `${String(Math.floor(tSec / 60)).padStart(2, '0')}:${String(tSec % 60).padStart(2, '0')}`;
    const fillBar = document.getElementById('crayonProgressFill');
    if (fillBar && tTotalSec > 0) {
      const pct = Math.max(0, Math.min(100, (tSec / tTotalSec) * 100));
      fillBar.style.width = `${pct}%`;
    }
  }

  document.querySelectorAll('.time-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playTimerActionSound('start');
      clearInterval(tInt); tInt = null;
      document.querySelectorAll('.time-opt-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      tTotalSec = Number(btn.getAttribute('data-sec'));
      tSec = tTotalSec;
      updTimer();
    });
  });

  document.getElementById('timerStartBtn')?.addEventListener('click', () => {
    playTimerActionSound('start');
    if (tInt) return;
    tInt = setInterval(() => {
      if (tSec > 0) {
        tSec--;
        updTimer();
        if (tSec > 0 && tSec <= 3) playTimerActionSound('countdown');
        else if (tSec > 3) playTimerActionSound('tick');
      } else {
        clearInterval(tInt);
        tInt = null;
        if (tDisp) tDisp.textContent = '🔔 ZİL!';
        playSchoolBellSound();
      }
    }, 1000);
  });

  document.getElementById('timerResetBtn')?.addEventListener('click', () => {
    playTimerActionSound('start');
    clearInterval(tInt);
    tInt = null;
    tSec = tTotalSec;
    updTimer();
  });

  // Şanslı Kalem (Kendine Özel Çark Çevirme "Tık-Tık-Tık... Ding!" Sesli)
  document.getElementById('spinLuckyPencilBtn')?.addEventListener('click', () => {
    playWheelSpinSound();
    const vis = localStorage.getItem(STORAGE_KEYS.VISIBLE_CLASS);
    const all = Object.values(getStudentAccounts());
    const pool = vis ? all.filter(a => a.className.toUpperCase() === vis.toUpperCase()) : all;
    const iconEl = document.getElementById('spinningPencilIcon');
    if (iconEl) iconEl.style.transform = `rotate(${Math.floor(Math.random() * 720 + 360)}deg)`;
    if (pool.length === 0) {
      document.getElementById('luckyWinnerName').textContent = '🎯 Henüz bu sınıfta kayıtlı öğrenci yok!';
      return;
    }
    const picked = pool[Math.floor(Math.random() * pool.length)];
    document.getElementById('luckyWinnerName').textContent = `🎯 No: ${picked.schoolNo} — ${picked.username} (${picked.className})`;
  });

  document.getElementById('hideClassFromStudentsBtn')?.addEventListener('click', () => {
    playSoftClickSound();
    localStorage.removeItem(STORAGE_KEYS.VISIBLE_CLASS);
    broadcastStudioUpdate('class_visibility');
    renderLuckyPencilClasses();
  });

  // Sözlük & Gramer
  document.getElementById('dictSearchBtn')?.addEventListener('click', () => {
    searchLiveDictionary(document.getElementById('dictSearchInput').value);
  });
  document.getElementById('dictSearchInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') searchLiveDictionary(e.target.value);
  });
  document.querySelectorAll('#grammarCategoryTabs .gram-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playPaperFlipSound();
      document.querySelectorAll('#grammarCategoryTabs .gram-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGrammarCategory(btn.getAttribute('data-gcat'));
    });
  });

  // Öğrenci Giriş / Kayıt
  function openAuth(mode) {
    playSoftClickSound();
    const isL = mode === 'login';
    document.getElementById('studentAuthModalTitle').textContent = isL ? '🔑 Öğrenci Oturum Aç' : '📝 Öğrenci Kayıt Ol';
    document.getElementById('switchToLoginTab').classList.toggle('active', isL);
    document.getElementById('switchToRegisterTab').classList.toggle('active', !isL);
    document.getElementById('studentLoginForm').classList.toggle('hidden', !isL);
    document.getElementById('studentRegisterForm').classList.toggle('hidden', isL);
    document.getElementById('studentAuthModal').classList.remove('hidden');
  }

  document.getElementById('openLoginBtn')?.addEventListener('click', () => openAuth('login'));
  document.getElementById('openRegisterBtn')?.addEventListener('click', () => openAuth('register'));
  document.getElementById('changeUserInArenaBtn')?.addEventListener('click', () => {
    if (isTeacherUrlMode() || isTeacherLoggedIn()) {
      document.getElementById('teacherLoginModal')?.classList.remove('hidden');
    } else {
      openAuth('login');
    }
  });
  document.getElementById('switchToLoginTab')?.addEventListener('click', () => openAuth('login'));
  document.getElementById('switchToRegisterTab')?.addEventListener('click', () => openAuth('register'));

  document.getElementById('submitStudentRegisterBtn')?.addEventListener('click', () => {
    const username = document.getElementById('regUsernameInput').value.trim();
    const password = document.getElementById('regPasswordInput').value.trim();
    const className = document.getElementById('regClassInput').value.trim().toUpperCase();
    const schoolNo = document.getElementById('regSchoolNoInput').value.trim();
    const err = document.getElementById('registerErrorMsg');
    if (!username || !password || !className || !schoolNo) {
      err.textContent = 'Lütfen tüm alanları doldurun!';
      return;
    }
    const accs = getStudentAccounts();
    const key = username.toLowerCase();
    if (accs[key]) {
      err.textContent = 'Bu kullanıcı adı zaten kayıtlı!';
      return;
    }
    accs[key] = {
      username, password, className, schoolNo,
      gender: regGender, avatar: regAvatar, frameColor: '#f97316',
      registeredAt: new Date().toLocaleDateString('tr-TR'),
      totalScore: 0, gamesPlayed: 0, gamesWon: 0, gamesLost: 0,
      showStats: true, showBadges: true
    };
    saveStudentAccounts(accs);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, key);
    playSoftClickSound();
    document.getElementById('studentAuthModal').classList.add('hidden');
    syncAllAuthAndModeBars();
  });

  document.getElementById('submitStudentLoginBtn')?.addEventListener('click', () => {
    const u = document.getElementById('loginUsernameInput').value.trim().toLowerCase();
    const p = document.getElementById('loginPasswordInput').value.trim();
    const accs = getStudentAccounts();
    if (!accs[u] || accs[u].password !== p) {
      document.getElementById('loginErrorMsg').textContent = 'Kullanıcı adı veya şifre hatalı!';
      return;
    }
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, u);
    playSoftClickSound();
    document.getElementById('studentAuthModal').classList.add('hidden');
    syncAllAuthAndModeBars();
  });

  document.getElementById('studentLogoutBtn')?.addEventListener('click', () => {
    playSoftClickSound();
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    syncAllAuthAndModeBars();
  });

  // Profilim Butonları
  document.getElementById('openMyProfileBtn')?.addEventListener('click', () => openMyProfileModal('student'));
  document.getElementById('openTeacherProfileBtn')?.addEventListener('click', () => openMyProfileModal('teacher'));

  document.getElementById('profTabWallBtn')?.addEventListener('click', () => {
    playPaperFlipSound();
    document.getElementById('profTabWallBtn').classList.add('active');
    document.getElementById('profTabCustomizeBtn').classList.remove('active');
    document.getElementById('profileWallPane').classList.remove('hidden');
    document.getElementById('profileCustomizePane').classList.add('hidden');
  });

  document.getElementById('profTabCustomizeBtn')?.addEventListener('click', () => {
    playPaperFlipSound();
    document.getElementById('profTabCustomizeBtn').classList.add('active');
    document.getElementById('profTabWallBtn').classList.remove('active');
    document.getElementById('profileCustomizePane').classList.remove('hidden');
    document.getElementById('profileWallPane').classList.add('hidden');
  });

  document.getElementById('saveProfileNameBtn')?.addEventListener('click', () => {
    const newName = document.getElementById('editProfileNameInput').value.trim();
    if (!newName) return;
    playSoftClickSound();
    if (profileModalTarget === 'teacher') {
      const p = getTeacherProfile();
      p.username = newName;
      saveTeacherProfile(p);
      document.getElementById('editNameFeedbackMsg').textContent = '✅ İsim güncellendi!';
      openMyProfileModal('teacher');
    } else {
      const curr = getCurrentStudent();
      if (!curr) return;
      const accs = getStudentAccounts();
      const oldKey = curr.username.toLowerCase();
      const newKey = newName.toLowerCase();
      if (newKey !== oldKey && accs[newKey]) {
        document.getElementById('editNameFeedbackMsg').textContent = '⚠️ Bu kullanıcı adı zaten kullanımda!';
        return;
      }
      const copy = { ...accs[oldKey], username: newName };
      delete accs[oldKey];
      accs[newKey] = copy;
      saveStudentAccounts(accs);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, newKey);
      syncAllAuthAndModeBars();
      document.getElementById('editNameFeedbackMsg').textContent = '✅ Kullanıcı adın güncellendi!';
      openMyProfileModal('student');
    }
  });

  document.getElementById('wallGenderGirlBtn')?.addEventListener('click', () => {
    playSoftClickSound();
    activeWallGender = 'girl';
    document.getElementById('wallGenderGirlBtn').classList.add('active');
    document.getElementById('wallGenderBoyBtn').classList.remove('active');
    const data = profileModalTarget === 'teacher' ? getTeacherProfile() : getCurrentStudent();
    renderAvatarPickerGrid('wallAvatarPickerGrid', 'girl', data?.avatar, chosenAv => {
      if (profileModalTarget === 'teacher') {
        const p = getTeacherProfile(); p.avatar = chosenAv; p.gender = 'girl'; saveTeacherProfile(p);
      } else {
        updateCurrentStudentData(a => { a.avatar = chosenAv; a.gender = 'girl'; });
      }
      openMyProfileModal(profileModalTarget);
    });
  });

  document.getElementById('wallGenderBoyBtn')?.addEventListener('click', () => {
    playSoftClickSound();
    activeWallGender = 'boy';
    document.getElementById('wallGenderBoyBtn').classList.add('active');
    document.getElementById('wallGenderGirlBtn').classList.remove('active');
    const data = profileModalTarget === 'teacher' ? getTeacherProfile() : getCurrentStudent();
    renderAvatarPickerGrid('wallAvatarPickerGrid', 'boy', data?.avatar, chosenAv => {
      if (profileModalTarget === 'teacher') {
        const p = getTeacherProfile(); p.avatar = chosenAv; p.gender = 'boy'; saveTeacherProfile(p);
      } else {
        updateCurrentStudentData(a => { a.avatar = chosenAv; a.gender = 'boy'; });
      }
      openMyProfileModal(profileModalTarget);
    });
  });

  document.querySelectorAll('#wallFramePickerRow .frame-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSoftClickSound();
      const color = btn.getAttribute('data-frame');
      if (profileModalTarget === 'teacher') {
        const p = getTeacherProfile(); p.frameColor = color; saveTeacherProfile(p);
      } else {
        updateCurrentStudentData(a => { a.frameColor = color; });
      }
      openMyProfileModal(profileModalTarget);
    });
  });

  document.getElementById('toggleShowStats')?.addEventListener('change', e => {
    playSoftClickSound();
    updateCurrentStudentData(a => { a.showStats = e.target.checked; });
    openMyProfileModal(profileModalTarget);
  });
  document.getElementById('toggleShowBadges')?.addEventListener('change', e => {
    playSoftClickSound();
    updateCurrentStudentData(a => { a.showBadges = e.target.checked; });
    openMyProfileModal(profileModalTarget);
  });

  document.getElementById('openDeleteAccountConfirmBtn')?.addEventListener('click', () => {
    playSoftClickSound();
    document.getElementById('deleteAccountConfirmBox').classList.remove('hidden');
  });
  document.getElementById('cancelDeleteStudentAccountBtn')?.addEventListener('click', () => {
    playSoftClickSound();
    document.getElementById('deleteAccountConfirmBox').classList.add('hidden');
  });
  document.getElementById('confirmDeleteStudentAccountBtn')?.addEventListener('click', () => {
    const u = getCurrentStudent();
    if (!u) return;
    const p = document.getElementById('deleteAccountPasswordInput').value.trim();
    if (p !== u.password) {
      document.getElementById('deleteAccountErrorMsg').textContent = 'Şifre yanlış!';
      return;
    }
    const accs = getStudentAccounts();
    delete accs[u.username.toLowerCase()];
    saveStudentAccounts(accs);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    document.getElementById('avatarWallModal').classList.add('hidden');
    syncAllAuthAndModeBars();
  });

  // BEYZA HOCA GİRİŞ DOĞRULAMASI (teacherbeyza / 75395102!b)
  function attemptTeacherLogin() {
    const uInput = document.getElementById('teacherUsernameInput');
    const pInput = document.getElementById('teacherPasswordInput');
    const errEl = document.getElementById('teacherLoginError');

    const enteredUser = (uInput ? uInput.value.trim().toLowerCase() : 'teacherbeyza');
    const enteredPass = (pInput ? pInput.value.trim() : '');

    if (enteredUser === TEACHER_CREDENTIALS.username && enteredPass === TEACHER_CREDENTIALS.password) {
      if (errEl) errEl.textContent = '';
      if (pInput) pInput.value = '';
      playSoftClickSound();
      document.getElementById('teacherLoginModal')?.classList.add('hidden');
      setTeacherLoggedIn(true);
    } else {
      if (errEl) errEl.textContent = '❌ Kullanıcı adı veya şifre hatalı!';
    }
  }

  document.getElementById('teacherAuthBtn')?.addEventListener('click', () => {
    playSoftClickSound();
    document.getElementById('teacherLoginModal')?.classList.remove('hidden');
  });
  document.getElementById('submitTeacherLoginBtn')?.addEventListener('click', attemptTeacherLogin);
  document.getElementById('teacherPasswordInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') attemptTeacherLogin();
  });
  document.getElementById('teacherLogoutBtn')?.addEventListener('click', () => {
    playSoftClickSound();
    setTeacherLoggedIn(false);
  });

  document.getElementById('studentHostToggle')?.addEventListener('change', e => {
    playSoftClickSound();
    localStorage.setItem(STORAGE_KEYS.HOST_PERM, e.target.checked ? 'true' : 'false');
    broadcastStudioUpdate('host_perm');
    syncGameHostPermissionsUI();
  });

  document.getElementById('openTeacherMessagesQuickBtn')?.addEventListener('click', () => {
    openNotebookPage('page-complaints');
  });

  document.getElementById('teacherConfirmDeleteYesBtn')?.addEventListener('click', () => {
    if (pendingDeleteStudentKey) {
      const accs = getStudentAccounts();
      delete accs[pendingDeleteStudentKey];
      saveStudentAccounts(accs);
      pendingDeleteStudentKey = null;
      renderLuckyPencilClasses();
    }
    document.getElementById('teacherDeleteStudentModal')?.classList.add('hidden');
  });
  document.getElementById('teacherConfirmDeleteNoBtn')?.addEventListener('click', () => {
    pendingDeleteStudentKey = null;
    document.getElementById('teacherDeleteStudentModal')?.classList.add('hidden');
  });

  // Şikayet Gönder
  document.getElementById('sendComplaintBtn')?.addEventListener('click', () => {
    const msg = document.getElementById('complaintMessageInput').value.trim();
    if (!msg) return;
    playSoftClickSound();
    const u = getCurrentStudent();
    const list = getComplaints();
    list.push({
      avatar: u ? u.avatar : '👤',
      username: u ? u.username : 'Misafir',
      className: u ? u.className : '-',
      schoolNo: u ? u.schoolNo : '-',
      type: document.getElementById('complaintTypeSelect').value,
      message: msg,
      date: new Date().toLocaleString('tr-TR')
    });
    saveComplaints(list);
    document.getElementById('complaintMessageInput').value = '';
    document.getElementById('complaintFeedbackMsg').textContent = '✅ Mesajın Beyza Hoca’ya iletildi!';
    renderTeacherComplaints();
  });
  document.getElementById('clearAllComplaintsBtn')?.addEventListener('click', () => {
    saveComplaints([]);
    renderTeacherComplaints();
  });

  // Oyunlar & Lobi Kurulumu
  document.querySelectorAll('#gameTypeSelectorRow .game-select-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!canCurrentUserHostGame()) return;
      playPaperFlipSound();
      document.querySelectorAll('#gameTypeSelectorRow .game-select-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const gType = btn.getAttribute('data-game');
      const liveRoom = getLiveRoomData();
      if (liveRoom && liveRoom.active) {
        liveRoom.gameType = gType;
        localStorage.setItem(STORAGE_KEYS.LIVE_ROOM, JSON.stringify(liveRoom));
        broadcastStudioUpdate('live_room');
      }
      startOrJoinLiveMatch({
        gameType: gType,
        difficulty: currentMatchState.difficulty,
        endRule: currentMatchState.endRule
      });
      syncGameHostPermissionsUI();
    });
  });

  document.getElementById('openGameSetupModalBtn')?.addEventListener('click', () => {
    if (!canCurrentUserHostGame()) return;
    playSoftClickSound();
    document.getElementById('gameSetupModal')?.classList.remove('hidden');
  });

  document.getElementById('launchConfiguredGameBtn')?.addEventListener('click', () => {
    playSoftClickSound();
    const gameType = document.getElementById('setupGameTypeSelect').value;
    const difficulty = document.getElementById('setupDifficultySelect').value;
    const endRule = document.getElementById('setupEndRuleSelect').value;
    const hostName = getMyDisplayName();

    const room = {
      active: true,
      roomCode: Math.floor(100 + Math.random() * 900),
      hostName,
      gameType,
      difficulty,
      endRule,
      participants: [hostName]
    };
    localStorage.setItem(STORAGE_KEYS.LIVE_ROOM, JSON.stringify(room));
    broadcastStudioUpdate('live_room');
    document.getElementById('gameSetupModal')?.classList.add('hidden');
    syncGameHostPermissionsUI();
    startOrJoinLiveMatch(room);
  });

  document.getElementById('joinLiveSessionBtn')?.addEventListener('click', joinActiveLobbyRoom);

  document.getElementById('closePodiumBtn')?.addEventListener('click', () => {
    playSoftClickSound();
    document.getElementById('matchEndPodiumCard')?.classList.add('hidden');
    startOrJoinLiveMatch(currentMatchState);
  });

  // Dinleme Laboratuvarı & Worksheet
  document.getElementById('speakUkBtn')?.addEventListener('click', () => speakText(document.getElementById('listeningLabInput').value, 'en-GB', 1));
  document.getElementById('speakUsBtn')?.addEventListener('click', () => speakText(document.getElementById('listeningLabInput').value, 'en-US', 1));
  document.getElementById('speakSlowBtn')?.addEventListener('click', () => speakText(document.getElementById('listeningLabInput').value, 'en-US', 0.65));

  document.getElementById('previewWorksheetBtn')?.addEventListener('click', () => {
    playPaperFlipSound();
    renderWorksheetPreview();
  });
  document.getElementById('generateWorksheetBtn')?.addEventListener('click', () => {
    renderWorksheetPreview();
    window.print();
  });

  startOrJoinLiveMatch(currentMatchState);

  if (studioChannel) {
    studioChannel.onmessage = () => {
      syncAllAuthAndModeBars();
    };
  }
});
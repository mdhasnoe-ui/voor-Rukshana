/* ===================================================================
   Voor Rukshana — script.js
   =================================================================== */

const LILY_IMAGES = Array.from({ length: 11 }, (_, i) => `assets/lilies/lily${i + 1}.png`);
const HER_PHOTOS   = Array.from({ length: 7 },  (_, i) => `assets/photos/her${i + 1}.jpg`);

const REASONS = [
  { label: "Je schoonheid", text: "omdat je voor mij de mooiste persoon bent." },
  { label: "Je ogen",       text: "omdat ze zoveel liefde en warmte uitstralen." },
  { label: "Je glimlach",   text: "omdat die mij altijd geruststelt en gelukkig maakt." },
  { label: "Je lippen",     text: "omdat ik er gewoon geen genoeg van kan krijgen. ❤️" },
  { label: "Je haren",      text: "omdat ik er zo graag naar kijk en er graag doorheen ga." },
  { label: "Je karakter",   text: "omdat je een mooi, liefdevol en oprecht persoon bent." },
  { label: "Je hart",       text: "omdat je zoveel liefde geeft en altijd om mij geeft." },
  { label: "Je steun",      text: "omdat je altijd achter mij staat en in mij gelooft." },
  { label: "Je lach",       text: "omdat jouw lach mijn dag meteen beter kan maken." },
  { label: "Gewoon jij",    text: "omdat ik van jou hou om alles wat je bent, en niet alleen om één ding. ❤️" },
];

const app = {
  el: {
    app: document.getElementById('app'),
    petalLayer: document.getElementById('petal-layer'),
    song: document.getElementById('bg-song'),
  },
  currentStage: 'intro',
};

/* ---------------------------------------------------------------
   Stage navigation
   --------------------------------------------------------------- */
function goTo(stageName) {
  const stages = document.querySelectorAll('.stage');
  stages.forEach(s => {
    if (s.dataset.stage === stageName) {
      s.hidden = false;
      s.style.animation = 'none';
      // force reflow to restart animation
      void s.offsetWidth;
      s.style.animation = '';
    } else {
      s.hidden = true;
    }
  });
  app.currentStage = stageName;
  onStageEnter(stageName);
}

function onStageEnter(stageName) {
  switch (stageName) {
    case 'intro':
      spawnLilyBurst('lily-burst', 55, true);
      break;
    case 'code':
      document.getElementById('code-input').value = '';
      setTimeout(() => document.getElementById('code-input').focus(), 300);
      break;
    case 'age':
      startPetals();
      break;
    case 'main':
      // video + song are already started the moment the code was accepted
      stopPetals();
      break;
    case 'lilies2':
      spawnLilyBurst('lily-burst-2', 70, true);
      setTimeout(() => goTo('letter'), 2800);
      break;
    case 'letter':
      startPetals();
      break;
    case 'bouquet':
      stopPetals();
      buildBouquet();
      break;
    case 'question':
      resetQuestion();
      break;
    case 'end':
      break;
  }
}

/* ---------------------------------------------------------------
   Petals (falling lily background, used on a few stages)
   --------------------------------------------------------------- */
let petalInterval = null;

function startPetals() {
  app.el.petalLayer.classList.add('active');
  app.el.petalLayer.innerHTML = '';
  spawnPetal();
  petalInterval = setInterval(spawnPetal, 900);
}
function stopPetals() {
  app.el.petalLayer.classList.remove('active');
  clearInterval(petalInterval);
  app.el.petalLayer.innerHTML = '';
}
function spawnPetal() {
  const petal = document.createElement('div');
  const img = LILY_IMAGES[Math.floor(Math.random() * LILY_IMAGES.length)];
  petal.className = 'petal';
  petal.style.backgroundImage = `url(${img})`;
  const size = 18 + Math.random() * 22;
  petal.style.width = size + 'px';
  petal.style.height = size + 'px';
  petal.style.left = Math.random() * 100 + 'vw';
  petal.style.setProperty('--drift', (Math.random() * 120 - 60) + 'px');
  petal.style.setProperty('--spin', (Math.random() * 500) + 'deg');
  const duration = 7 + Math.random() * 6;
  petal.style.animationDuration = duration + 's';
  app.el.petalLayer.appendChild(petal);
  setTimeout(() => petal.remove(), duration * 1000 + 200);
}

/* ---------------------------------------------------------------
   1. Lily burst (intro + transition)
   --------------------------------------------------------------- */
function spawnLilyBurst(containerId, count, full) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const img = document.createElement('img');
    img.src = LILY_IMAGES[Math.floor(Math.random() * LILY_IMAGES.length)];
    img.style.left = (Math.random() * 110 - 5) + 'vw';
    img.style.top = (Math.random() * 110 - 5) + 'vh';
    img.style.width = full
      ? (90 + Math.random() * 130) + 'px'
      : (60 + Math.random() * 90) + 'px';
    img.style.setProperty('--rot', (Math.random() * 60 - 30) + 'deg');
    img.style.animationDelay = (Math.random() * 1.4) + 's';
    container.appendChild(img);
  }
}

document.getElementById('btn-start').addEventListener('click', () => goTo('code'));

/* ---------------------------------------------------------------
   2. Code entry — "2026"
   --------------------------------------------------------------- */
const codeInput = document.getElementById('code-input');
const codeHint = document.getElementById('code-hint');

codeInput.addEventListener('input', () => {
  codeInput.value = codeInput.value.replace(/\D/g, '').slice(0, 4);
  if (codeInput.value.length === 4) {
    checkCode();
  }
});
codeInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') checkCode();
});

function checkCode() {
  if (codeInput.value === '2026') {
    codeHint.textContent = '';
    startMedia(); // start video + song right here, inside the user action
    goTo('age');
    setTimeout(() => goTo('main'), 2600);
  } else {
    codeHint.textContent = 'probeer het nog eens';
    codeHint.classList.remove('shake');
    void codeHint.offsetWidth;
    codeHint.classList.add('shake');
    codeInput.value = '';
  }
}

/* ---------------------------------------------------------------
   4. Main happy-birthday stage — video + song start together,
      triggered synchronously from the code input so phones allow
      audio playback (no separate click needed later).
   --------------------------------------------------------------- */
let mediaStarted = false;

function startMedia() {
  if (mediaStarted) return;
  mediaStarted = true;
  const video = document.getElementById('bg-video');
  video.currentTime = 0;
  app.el.song.currentTime = 0;
  app.el.song.volume = 0.9;
  video.play().catch(() => {});
  app.el.song.play().catch(() => {
    // if a browser still blocks it, resume on the very next tap anywhere
    const resume = () => { app.el.song.play(); video.play(); document.removeEventListener('click', resume); };
    document.addEventListener('click', resume, { once: true });
  });
}

document.getElementById('btn-click-rukshana').addEventListener('click', () => {
  goTo('lilies2');
});

document.getElementById('btn-after-letter').addEventListener('click', () => {
  stopPetals();
  goTo('bouquet');
});

/* ---------------------------------------------------------------
   8. Bouquet of reasons
   --------------------------------------------------------------- */
// gentle alternating tilt, last one (the "finale" lily) stays upright
const BOUQUET_ROTATIONS = [-6, 5, -4, 6, -7, 4, -5, 6, -4, 0];
const BOUQUET_SIZES =      [116, 100, 100, 94, 94, 108, 108, 96, 96, 132];

let bouquetBuilt = false;
let reasonsSeen = new Set();

function buildBouquet() {
  if (bouquetBuilt) return;
  bouquetBuilt = true;
  const bouquet = document.getElementById('bouquet');

  REASONS.forEach((reason, i) => {
    const img = document.createElement('img');
    img.src = LILY_IMAGES[i % LILY_IMAGES.length];
    img.className = 'bouquet-lily';
    img.style.width = (BOUQUET_SIZES[i] || 100) + 'px';
    img.style.setProperty('--rot', (BOUQUET_ROTATIONS[i] || 0) + 'deg');
    img.dataset.label = reason.label;
    img.dataset.reason = reason.text;
    img.dataset.index = i;
    img.addEventListener('click', () => showReason(img));
    bouquet.appendChild(img);
  });
}

function showReason(img) {
  const hint = document.getElementById('reason-panel-hint');
  const label = document.getElementById('reason-label');
  const text = document.getElementById('reason-text');
  const count = document.getElementById('reason-count');

  hint.hidden = true;
  label.hidden = false;
  text.hidden = false;
  label.textContent = img.dataset.label;
  text.textContent = img.dataset.reason;

  img.classList.add('seen');
  reasonsSeen.add(img.dataset.index);
  count.textContent = `${reasonsSeen.size} / ${REASONS.length} gelezen`;

  if (reasonsSeen.size >= REASONS.length) {
    document.getElementById('btn-after-bouquet').hidden = false;
  }
}
document.getElementById('btn-after-bouquet').addEventListener('click', () => {
  goTo('question');
});

/* ---------------------------------------------------------------
   9. The question — growing Ja, fleeing Nee
   --------------------------------------------------------------- */
let yesScale = 1;

function resetQuestion() {
  yesScale = 1;
  const yesBtn = document.getElementById('btn-yes');
  const noBtn = document.getElementById('btn-no');
  yesBtn.style.transform = 'scale(1)';
  noBtn.style.position = 'relative';
  noBtn.style.left = '0';
  noBtn.style.top = '0';
}

document.getElementById('btn-no').addEventListener('pointerenter', fleeNo);
document.getElementById('btn-no').addEventListener('click', fleeNo);

function fleeNo(e) {
  e.preventDefault();
  const noBtn = document.getElementById('btn-no');
  const yesBtn = document.getElementById('btn-yes');

  const dx = (Math.random() * 220 - 110);
  const dy = (Math.random() * 90 - 45);
  noBtn.style.position = 'relative';
  noBtn.style.left = dx + 'px';
  noBtn.style.top = dy + 'px';

  yesScale = Math.min(yesScale + 0.18, 2.4);
  yesBtn.style.transform = `scale(${yesScale})`;
}

document.getElementById('btn-yes').addEventListener('click', () => {
  goTo('end');
});

/* ---------------------------------------------------------------
   10. Ending — replay
   --------------------------------------------------------------- */
document.getElementById('btn-replay').addEventListener('click', () => {
  document.getElementById('bg-video').pause();
  app.el.song.pause();
  mediaStarted = false;
  reasonsSeen = new Set();
  document.querySelectorAll('.bouquet-lily').forEach(l => l.classList.remove('seen'));
  document.getElementById('btn-after-bouquet').hidden = true;
  document.getElementById('reason-panel-hint').hidden = false;
  document.getElementById('reason-label').hidden = true;
  document.getElementById('reason-text').hidden = true;
  document.getElementById('reason-count').textContent = '0 / 10 gelezen';
  goTo('intro');
});

/* ---------------------------------------------------------------
   init
   --------------------------------------------------------------- */
goTo('intro');

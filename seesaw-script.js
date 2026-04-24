// sabitleri css ile ayni tutmak lazim
const PLANK_WIDTH = 400;
const MAX_ANGLE = 30;
const TORQUE_DIV = 10;
const STORAGE_KEY = 'seesaw_objects_v1';
// sol icin yesil tonlari, sag icin gri tonlari
const COLORS_LEFT = ['#4caf50', '#2e7d32', '#1b5e20'];
const COLORS_RIGHT = ['#b0bec5', '#546e7a'];
// state
let objects = [];
let currentAngle = 0;
let paused = false;
let nextWeight = 1;
// DOM refs
const leftWeightEl = document.getElementById('leftWeight');
const rightWeightEl = document.getElementById('rightWeight');
const angleEl = document.getElementById('angleValue');
const leftBar = document.getElementById('leftBar');
const rightBar = document.getElementById('rightBar');
const leftTorqueEl = document.getElementById('leftTorqueValue');
const rightTorqueEl = document.getElementById('rightTorqueValue');
const nextWeightEl = document.getElementById('nextWeight');
const markersEl = document.getElementById('markers');
const plankWrap = document.getElementById('plankWrap');
const plank = document.getElementById('plank');
const hint = document.getElementById('hint');
const logList = document.getElementById('logList');
const resetBtn = document.getElementById('resetBtn');
const pauseBtn = document.getElementById('pauseBtn');
function init() {
buildMarkers();
loadState();
pickNextWeight();
// gecmis objeler varsa animasyonsuz ciz
for (let i = 0; i < objects.length; i++) {
renderObject(objects[i], true);
}
bindEvents();
updatePhysics();
if (objects.length > 0) {
hint.classList.add('is-hidden');
}
}
function pickNextWeight() {
nextWeight = Math.floor(Math.random() * 10) + 1;
nextWeightEl.textContent = nextWeight + ' kg';
}
// 50px'de bir cizgi, 100'luklerde label. daha fazlasi gorsel karmasa
function buildMarkers() {
const half = PLANK_WIDTH / 2;
for (let x = -half; x <= half; x += 50) {
const m = document.createElement('div');
m.className = 'marker';
if (x === 0) m.classList.add('marker--mid');
m.style.left = ((x + half) / PLANK_WIDTH * 100) + '%';
if (x % 100 === 0) {
const lbl = document.createElement('span');
lbl.className = 'marker__label';
lbl.textContent = x + 'px';
m.appendChild(lbl);
}
markersEl.appendChild(m);
}
}
function loadState() {
try {
const raw = localStorage.getItem(STORAGE_KEY);
if (!raw) return;
const parsed = JSON.parse(raw);
if (Array.isArray(parsed)) objects = parsed;
} catch (e) {
// bozuk json varsa temiz baslayalim
console.warn('load failed', e);
objects = [];
}
}


function bindEvents() {
// click sadece plank uzerinde olsun
plankWrap.addEventListener('click', onPlankClick);
// klavye ile de merkeze dusursun
plank.addEventListener('keydown', function (e) {
if (e.key !== 'Enter' && e.key !== ' ') return;
e.preventDefault();
if (paused) return;
dropAtPct(0.5);
});
resetBtn.addEventListener('click', resetAll);
pauseBtn.addEventListener('click', togglePause);
}
function togglePause() {
paused = !paused;
pauseBtn.textContent = paused ? 'resume' : 'stop';
pauseBtn.classList.toggle('btn--active', paused);
pauseBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
plankWrap.classList.toggle('is-paused', paused);
}
function onPlankClick(e) {
if (paused) return;
// plank egilmis olabilir. o yuzden tiklamayi plank-local koordinata
// geri cevirmek gerek, yoksa kenarlara yakin tiklayinca yanlis yere dusuyor
const r = plankWrap.getBoundingClientRect();
const cx = r.left + r.width / 2;
const cy = r.top + r.height / 2;
const dx = e.clientX - cx;
const dy = e.clientY - cy;
const rad = -currentAngle * Math.PI / 180;
const localX = dx * Math.cos(rad) - dy * Math.sin(rad);
// plank disina cikmasin
const half = PLANK_WIDTH / 2;
let x = localX;
if (x < -half) x = -half;
if (x > half) x = half;
const pct = (x + half) / PLANK_WIDTH;
dropAtPct(pct);
}
function dropAtPct(pct) {
const w = nextWeight;
const side = pct < 0.5 ? 'left' : 'right';
const palette = side === 'left' ? COLORS_LEFT : COLORS_RIGHT;
const color = palette[Math.floor(Math.random() * palette.length)];
const obj = {
id: Date.now(),
pct: pct,
weight: w,
color: color,
side: side
};
objects.push(obj);
hint.classList.add('is-hidden');
saveState();
renderObject(obj, false);
playDrop(w);
updatePhysics();
pickNextWeight();
}
function renderObject(obj, instant) {
// plank uzerindeki top
const el = document.createElement('div');
el.className = instant ? 'obj' : 'obj obj--animate';
el.style.left = (obj.pct * 100) + '%';
el.dataset.id = obj.id;
const circle = document.createElement('div');
circle.className = 'obj__circle';
circle.style.background = obj.color;
circle.textContent = obj.weight;
el.appendChild(circle);
plank.appendChild(el);
// log kismina tag
const tag = document.createElement('span');
tag.className = 'log__tag log__tag--' + obj.side;
tag.textContent = obj.weight + 'kg · ' + obj.side;
logList.appendChild(tag);
}
// --- ses ---
// chrome autoplay policy yuzunden context'i ilk click'te olusturuyoruz
let audioCtx = null;
function playDrop(w) {
if (!audioCtx) {
try {
audioCtx = new (window.AudioContext || window.webkitAudioContext)();
} catch (err) {
return;
}
}
// agir objeler daha kalin ses cikarir
const freq = 440 - w * 20;
const osc = audioCtx.createOscillator();
const gain = audioCtx.createGain();
osc.type = 'triangle';
osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
osc.frequency.exponentialRampToValueAtTime(freq * 0.55, audioCtx.currentTime + 0.12);
gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
gain.gain.exponentialRampToValueAtTime(0.18, audioCtx.currentTime + 0.01);
gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);
osc.connect(gain);
gain.connect(audioCtx.destination);
osc.start();
osc.stop(audioCtx.currentTime + 0.22);
}

function updatePhysics() {
let leftTorque = 0;
let rightTorque = 0;
let leftW = 0;
let rightW = 0;
const half = PLANK_WIDTH / 2;
for (const o of objects) {
const pos = (o.pct * PLANK_WIDTH) - half;
const dist = pos < 0 ? -pos : pos;
const t = o.weight * dist;
if (pos < 0) {
leftTorque += t;
leftW += o.weight;
} else if (pos > 0) {
rightTorque += t;
rightW += o.weight;
} else {
// tam pivotta - torque sifir, agirligi bolelim
leftW += o.weight / 2;
rightW += o.weight / 2;
}
}
// torque farkindan aci, clamp
let a = (rightTorque - leftTorque) / TORQUE_DIV;
if (a > MAX_ANGLE) a = MAX_ANGLE;
if (a < -MAX_ANGLE) a = -MAX_ANGLE;
currentAngle = a;
plankWrap.style.transform = `translateX(-50%) rotate(${a}deg)`;
updateUI(leftW, rightW, leftTorque, rightTorque, a);
}
function updateUI(lw, rw, lt, rt, a) {
leftWeightEl.textContent = lw + ' kg';
rightWeightEl.textContent = rw + ' kg';
angleEl.textContent = a.toFixed(1) + '°';
leftTorqueEl.textContent = Math.round(lt);
rightTorqueEl.textContent = Math.round(rt);
// 50kg bar icin "full" sayalim, fazlasi zaten gorsel olarak taniniyor
const MAX_BAR = 50;
leftBar.style.width = Math.min(100, lw / MAX_BAR * 100) + '%';
rightBar.style.width = Math.min(100, rw / MAX_BAR * 100) + '%';
// iki tarafta da agirlik varsa ve neredeyse duzse denge parla
const balanced = lw > 0 && rw > 0 && Math.abs(a) < 0.5;
plankWrap.classList.toggle('is-balanced', balanced);
}
function resetAll() {
objects = [];
currentAngle = 0;
try {
localStorage.removeItem(STORAGE_KEY);
} catch (e) {
console.warn('clear failed', e);
}
const olds = plank.querySelectorAll('.obj');
olds.forEach(el => el.remove());
logList.innerHTML = '';
hint.classList.remove('is-hidden');
plankWrap.classList.remove('is-balanced');
plankWrap.style.transform = 'translateX(-50%) rotate(0deg)';
pickNextWeight();
updatePhysics();
}
function saveState() {
try {
localStorage.setItem(STORAGE_KEY, JSON.stringify(objects));
} catch (e) {
console.warn('save failed', e);
}
}
init();
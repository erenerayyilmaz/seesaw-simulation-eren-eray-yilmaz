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
const MENU_URL = "home.html";
const PREVIEW_MS = 3000;        
const PEEK_MS = 1500;           
const MATCH_POINTS = 100;       
const STREAK_BONUS = 20;       
const TIME_BONUS = 5;          

const LEVELS = {
  easy:   { name: "Easy",   pairs: 8,  cols: 4, limit: 90,  penalty: 5 },
  medium: { name: "Medium", pairs: 18, cols: 6, limit: 180, penalty: 10 },
  hard:   { name: "Hard",   pairs: 18, cols: 6, limit: 120, penalty: 15 },
  expert: { name: "Expert", pairs: 32, cols: 8, limit: 240, penalty: 20 }
};

const EMOJIS = ["🦊","🦉","🦋","🍄","🌿","🍀","🌸","🌙","⭐","🔥","💎","🐞","🐸","🐢","🦄","🐝",
                "🌻","🍁","🍎","🍓","🍇","🍒","🐙","🦀","🐬","🐧","🐰","🐼","🦁","🐨","🌵","🍉"];


let currentLevel = null;
let firstCard = null, secondCard = null;
let lockBoard = true;
let moves = 0, score = 0, streak = 0;
let pairsFound = 0, pairsTotal = 0;
let time = 0, timeLimit = 0;
let paused = false;
let previewing = false;     
let timerInterval = null;
let gameActive = false;
let pendingTimeouts = [];
let peekLeft = 1;
let muted = false;
let audioCtx = null;
let midShuffled = false;


const board = document.getElementById("board");
const movesEl = document.getElementById("moves");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const banner = document.getElementById("banner");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const againBtn = document.getElementById("againBtn");
const levelModal = document.getElementById("levelModal");


function startGame(levelKey) {
  if (levelKey) currentLevel = levelKey;
  if (!currentLevel) return;

  pendingTimeouts.forEach(clearTimeout);
  pendingTimeouts = [];
  stopTimer();

  const level = LEVELS[currentLevel];
  pairsTotal = level.pairs;
  timeLimit = level.limit;
  firstCard = secondCard = null;
  moves = 0; score = 0; streak = 0; pairsFound = 0;
  time = 0;
  midShuffled = false;
  setPaused(false);
  peekLeft = 1;
  gameActive = false;
  lockBoard = true;                
  modal.hidden = true;
  levelModal.hidden = true;

  renderBoard(shuffleCards(createCards(pairsTotal)), level.cols);
  updateStats();
  updatePeekButton();

  previewing = true;
  beginPreview();
}


function beginPreview() {
  showBanner("Memorize!", PREVIEW_MS);
  setAllFlipped(true);
  later(endPreview, PREVIEW_MS);
}

function endPreview() {
  previewing = false;
  setAllFlipped(false);
  showBanner("GO!", 700);
  gameActive = true;
  lockBoard = false;
  startTimer();
}

function setAllFlipped(on) {
  Array.from(board.children).forEach(function (c) { c.classList.toggle("flipped", on); });
}

function later(fn, ms) { pendingTimeouts.push(setTimeout(fn, ms)); }

function showBanner(text, ms) {
  banner.textContent = text;
  banner.classList.add("show");
  later(function () { banner.classList.remove("show"); }, ms);
}


function shuffleCards(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createCards(count) {
  const chosen = shuffleCards(EMOJIS).slice(0, count);
  return chosen.concat(chosen);
}

function renderBoard(cards, cols) {
  board.innerHTML = "";
  board.style.setProperty("--cols", cols);
  board.dataset.cols = cols;
  cards.forEach(function (emoji) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card";
    card.dataset.emoji = emoji;
    card.setAttribute("aria-label", "Hidden card");
    card.innerHTML =
      '<span class="card-inner">' +
        '<span class="face front">?</span>' +
        '<span class="face back">' + emoji + '</span>' +
      '</span>';
    board.appendChild(card);
  });
}


function flipCard(card) {
  if (!gameActive || lockBoard || paused) return;
  if (card.classList.contains("matched") || card === firstCard) return;

  card.classList.add("flipped");
  card.setAttribute("aria-label", "Card " + card.dataset.emoji);
  playSound("flip");

  if (firstCard === null) { firstCard = card; return; }

  secondCard = card;
  moves++;
  updateStats();
  lockBoard = true;
  if (firstCard.dataset.emoji === secondCard.dataset.emoji) handleMatch();
  else handleMismatch();
}

function handleMatch() {
  firstCard.classList.add("matched");
  secondCard.classList.add("matched");
  pairsFound++;
  streak++;
  score += MATCH_POINTS + (streak - 1) * STREAK_BONUS;   
  playSound("match");
  updateStats();
  resetTurn();
  if (pairsFound === pairsTotal) handleWin();
}

function handleMismatch() {
  streak = 0;
  score = Math.max(score - LEVELS[currentLevel].penalty, 0);   
  updateStats();
  playSound("mismatch");
  const a = firstCard, b = secondCard;
  later(function () {
    a.classList.remove("flipped");
    b.classList.remove("flipped");
    a.setAttribute("aria-label", "Hidden card");
    b.setAttribute("aria-label", "Hidden card");
    resetTurn();
  }, 800);
}

function resetTurn() {
  firstCard = secondCard = null;
  lockBoard = false;
}


function shuffleBoard() {
  if (!gameActive || lockBoard || paused) return false;
  if (firstCard) {                      
    firstCard.classList.remove("flipped");
    firstCard.setAttribute("aria-label", "Hidden card");
    firstCard = null;
  }
  const cards = Array.from(board.children);
  const loose = shuffleCards(cards.filter(function (c) { return !c.classList.contains("matched"); }));
  let i = 0;
  board.append.apply(board, cards.map(function (c) {
    return c.classList.contains("matched") ? c : loose[i++];
  }));
  board.classList.add("shuffled");
  later(function () { board.classList.remove("shuffled"); }, 350);
  showBanner("Shuffled!", 700);
  return true;
}


function startTimer() {
  stopTimer();
  updateTime();
  timerInterval = setInterval(function () {
    if (paused) return;
    time++;
    updateTime();
    if (time >= timeLimit) { handleGameOver(); return; }
    if (!midShuffled && time >= Math.floor(timeLimit / 2) && shuffleBoard()) midShuffled = true;
  }, 1000);
}

function stopTimer() { clearInterval(timerInterval); timerInterval = null; }

function updateTime() {
  const left = Math.max(timeLimit - time, 0);
  timeEl.textContent = left + "s";
  timeEl.classList.toggle("danger", left <= 10);
}

function updateStats() {
  movesEl.textContent = moves;
  scoreEl.textContent = score;
  updateTime();
}


function usePeek() {
  if (!gameActive || lockBoard || paused || peekLeft < 1) return;
  const hidden = Array.from(board.children).filter(function (c) {
    return !c.classList.contains("matched") && !c.classList.contains("flipped");
  });
  lockBoard = true;
  hidden.forEach(function (c) { c.classList.add("flipped"); });
  later(function () {
    hidden.forEach(function (c) { c.classList.remove("flipped"); });
    lockBoard = false;
  }, PEEK_MS);
  peekLeft--;
  updatePeekButton();
}

function updatePeekButton() {
  document.getElementById("peekBtn").disabled = peekLeft < 1;
}


const pauseBtn = document.getElementById("pauseBtn");
const ICON_PAUSE = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>';
const ICON_PLAY = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><polygon points="7,4 20,12 7,20"/></svg>';

function togglePause() {
  if (!gameActive && !previewing) return;
  const willPause = !paused;
  setPaused(willPause);
  if (!previewing) return;
  
  if (willPause) {
    pendingTimeouts.forEach(clearTimeout);
    pendingTimeouts = [];
    banner.classList.remove("show");
    setAllFlipped(false);
  } else {
    beginPreview();
  }
}

function setPaused(state) {
  paused = state;
  board.classList.toggle("paused", state);   
  pauseBtn.innerHTML = state ? ICON_PLAY : ICON_PAUSE;
  pauseBtn.setAttribute("aria-label", state ? "Resume game" : "Pause game");
}


function handleWin() {
  if (!gameActive) return;
  gameActive = false;
  stopTimer();
  lockBoard = true;

  score += Math.max(timeLimit - time, 0) * TIME_BONUS;  
  updateStats();

  const stars = calculateStars();
  const levelName = LEVELS[currentLevel].name;
  const previousBest = getBestScore(levelName);
  const isRecord = previousBest === null || score > previousBest;

  saveResult(true, stars);

  playSound("win");
  if (typeof confetti === "function") {
    confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 }, zIndex: 300 });
  }
  later(function () {
    showModal(
      "🎉 You Won!",
      "<p>🏅 Score: <b>" + score + "</b></p>" +
      "<p>⏱️ Time: <b>" + time + "s</b></p>" +
      "<p>👆 Moves: <b>" + moves + "</b></p>" +
      '<p class="stars">' + "⭐".repeat(stars) + "</p>" +
      (isRecord ? "<p>🏆 New best for " + levelName + "!</p>" : ""),
      "Play Again"
    );
  }, 700);
}

function calculateStars() {
  const ratio = moves / pairsTotal;
  if (ratio <= 1.6) return 3;
  if (ratio <= 2.4) return 2;
  return 1;
}

function handleGameOver() {
  if (!gameActive) return;
  gameActive = false;
  stopTimer();
  lockBoard = true;
  saveResult(false, 0);
  playSound("lose");
  later(function () {
    showModal(
      "⏰ Time's Up!",
      "<p>🏅 Score: <b>" + score + "</b></p>" +
      "<p>🧩 Pairs found: <b>" + pairsFound + " / " + pairsTotal + "</b></p>" +
      "<p>🎚️ Level: <b>" + LEVELS[currentLevel].name + "</b></p>",
      "Try Again"
    );
  }, 500);
}

function showModal(title, bodyHtml, againText) {
  modalTitle.textContent = title;
  modalBody.innerHTML = bodyHtml;
  againBtn.textContent = againText;
  modal.hidden = false;
  againBtn.focus();
}


function saveResult(won, stars) {
  const user = getCurrentUser();
  saveScore({
    email: user ? user.email : "",
    name: user ? user.name : "Player",
    difficulty: LEVELS[currentLevel].name,
    won: won,
    score: score,
    moves: moves,
    time: time,
    stars: stars,
    date: new Date().toISOString()
  });
}


function getBestScore(levelName) {
  let best = null;
  getMyScores().forEach(function (r) {
    if (r.difficulty === levelName && r.won && typeof r.score === "number") {
      if (best === null || r.score > best) best = r.score;
    }
  });
  return best;
}


function openLevelPicker() {
  setPaused(false);
  previewing = false;
  pendingTimeouts.forEach(clearTimeout);
  pendingTimeouts = [];
  stopTimer();
  gameActive = false;
  lockBoard = true;
  modal.hidden = true;
  levelModal.hidden = false;
}

board.addEventListener("click", function (e) {
  const card = e.target.closest(".card");
  if (card) flipCard(card);
});

document.querySelectorAll(".level-btn").forEach(function (b) {
  b.addEventListener("click", function () { startGame(b.dataset.level); });
});
document.getElementById("peekBtn").addEventListener("click", usePeek);

document.getElementById("restartBtn").addEventListener("click", function () { startGame(); });
document.getElementById("levelBtn").addEventListener("click", openLevelPicker);
againBtn.addEventListener("click", function () { startGame(); });
document.getElementById("menuBtn").addEventListener("click", function () {
  window.location.href = MENU_URL;
});

const muteBtn = document.getElementById("muteBtn");
muteBtn.addEventListener("click", function () {
  muted = !muted;
  muteBtn.textContent = muted ? "🔇" : "🔊";
  muteBtn.setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
});


document.addEventListener("keydown", function (e) {
  if (e.key === "p" || e.key === "P") togglePause();
});
pauseBtn.addEventListener("click", togglePause);


function tone(freq, start, duration, type, volume) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const t0 = audioCtx.currentTime + start;
  osc.type = type || "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume || 0.12, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(t0);
  osc.stop(t0 + duration);
}

function playSound(type) {
  if (muted) return;
  if (audioCtx === null) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  if (type === "flip") tone(520, 0, 0.08, "triangle");
  else if (type === "match") { tone(660, 0, 0.12); tone(880, 0.1, 0.2); }
  else if (type === "mismatch") tone(200, 0, 0.22, "sawtooth", 0.05);
  else if (type === "win") [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * 0.15, 0.3); });
  else if (type === "lose") [392, 330, 262].forEach(function (f, i) { tone(f, i * 0.22, 0.35, "triangle"); });
}


function createFireflies() {
  const box = document.getElementById("fireflies");
  for (let i = 0; i < 30; i++) {
    const f = document.createElement("span");
    f.className = "firefly" + (Math.random() < 0.4 ? " yellow" : "");
    f.style.left = Math.random() * 100 + "%";
    f.style.top = Math.random() * 100 + "%";
    f.style.setProperty("--dx", (Math.random() * 80 - 40) + "px");
    f.style.setProperty("--dy", (-20 - Math.random() * 120) + "px");
    f.style.animationDuration = (8 + Math.random() * 10) + "s";
    f.style.animationDelay = (-Math.random() * 10) + "s";
    box.appendChild(f);
  }
}


createFireflies();
updatePeekButton();
levelModal.hidden = false;  
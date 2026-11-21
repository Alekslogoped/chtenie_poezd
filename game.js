"use strict";

const animals = [
  { id: "wolf", syllables: "волк", group: "forest" },
  { id: "fox", syllables: "ли-са", group: "forest" },
  { id: "hare", syllables: "за-яц", group: "forest" },
  { id: "cat", syllables: "кот", group: "home" },
  { id: "dog", syllables: "со-ба-ка", group: "home" },
  { id: "cow", syllables: "ко-ро-ва", group: "home" },
  { id: "giraffe", syllables: "жи-раф", group: "hot" },
  { id: "elephant", syllables: "слон", group: "hot" },
  { id: "zebra", syllables: "зе-бра", group: "hot" }
];
const food = [
  { id: "milk", syllables: "мо-ло-ко", group: "dairy" },
  { id: "cheese", syllables: "сыр", group: "dairy" },
  { id: "yogurt", syllables: "йо-гурт", group: "dairy" },
  { id: "bread", syllables: "хлеб", group: "bakery" },
  { id: "bun", syllables: "бу-лоч-ка", group: "bakery" },
  { id: "bagel", syllables: "буб-лик", group: "bakery" },
  { id: "salami", syllables: "кол-ба-са", group: "meat" },
  { id: "sausages", syllables: "со-сис-ки", group: "meat" },
  { id: "cutlet", syllables: "кот-ле-та", group: "meat" }
];
const wildlife = [
  { id: "owl", syllables: "со-ва", group: "birds" },
  { id: "duck", syllables: "ут-ка", group: "birds" },
  { id: "crow", syllables: "во-ро-на", group: "birds" },
  { id: "catfish", syllables: "сом", group: "fish" },
  { id: "pike", syllables: "щу-ка", group: "fish" },
  { id: "perch", syllables: "о-кунь", group: "fish" },
  { id: "beetle", syllables: "жук", group: "insects" },
  { id: "wasp", syllables: "о-са", group: "insects" },
  { id: "fly", syllables: "му-ха", group: "insects" }
];
const wardrobe = [
  { id: "skirt", syllables: "юб-ка", group: "clothes" },
  { id: "dress", syllables: "пла-тье", group: "clothes" },
  { id: "trousers", syllables: "брю-ки", group: "clothes" },
  { id: "boots", syllables: "са-по-ги", group: "shoes" },
  { id: "shoes", syllables: "туф-ли", group: "shoes" },
  { id: "slippers", syllables: "тап-ки", group: "shoes" },
  { id: "hat", syllables: "шап-ка", group: "headwear" },
  { id: "cap", syllables: "кеп-ка", group: "headwear" },
  { id: "beret", syllables: "бе-рет", group: "headwear" }
];
const jobs = [
  { id: "bandage", syllables: "бинт", group: "doctor" },
  { id: "syringe", syllables: "шприц", group: "doctor" },
  { id: "thermometer", syllables: "гра-дус-ник", group: "doctor" },
  { id: "ladle", syllables: "по-лов-ник", group: "cook" },
  { id: "grater", syllables: "тёр-ка", group: "cook" },
  { id: "pan", syllables: "ско-во-ро-да", group: "cook" },
  { id: "helmet", syllables: "кас-ка", group: "builder" },
  { id: "brick", syllables: "кир-пич", group: "builder" },
  { id: "trowel", syllables: "мас-те-рок", group: "builder" }
];
const games = {
  animals: {
    title: "Поезд животных",
    groups: [
      ["forest", "Дикие животные"],
      ["home", "Домашние животные"],
      ["hot", "Животные жарких стран"]
    ],
    items: animals,
    finish: "Все пассажиры на своих местах."
  },
  food: {
    title: "Поезд продуктов",
    groups: [
      ["dairy", "Молочные продукты"],
      ["bakery", "Хлебобулочные изделия"],
      ["meat", "Мясные продукты"]
    ],
    items: food,
    finish: "Все продукты разложены по вагонам."
  },
  wildlife: {
    title: "Птицы, рыбы и насекомые",
    groups: [["birds", "Птицы"], ["fish", "Рыбы"], ["insects", "Насекомые"]],
    items: wildlife,
    finish: "Все пассажиры на своих местах."
  },
  wardrobe: {
    title: "Гардероб",
    groups: [["clothes", "Одежда"], ["shoes", "Обувь"], ["headwear", "Головные уборы"]],
    items: wardrobe,
    finish: "Все вещи разложены по вагонам."
  },
  jobs: {
    title: "Кому это нужно?",
    groups: [["doctor", "Врачу"], ["cook", "Повару"], ["builder", "Строителю"]],
    items: jobs,
    finish: "Врач, повар и строитель получат всё, что им нужно."
  }
};

const card = document.querySelector("#card");
const feedback = document.querySelector("#feedback");
const progressText = document.querySelector("#progress-text");
const train = document.querySelector("#train");
const wagons = [...document.querySelectorAll(".wagon")];
const gameButtons = [...document.querySelectorAll(".game-picker button")];
const readingButtons = [...document.querySelectorAll(".reading-picker button")];
const finish = document.querySelector("#finish");
const finishTitle = document.querySelector("#finish-title");
const finishMessage = document.querySelector("#finish-message");
const restart = document.querySelector("#restart");
const rules = document.querySelector("#rules");
const fullscreenButton = document.querySelector("#fullscreen-button");
const fullscreenLabel = document.querySelector("#fullscreen-label");
const page = document.documentElement;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const pictures = new Map();
const options = new URLSearchParams(location.search);
const requestedGame = options.get("game");

let activeGame = Object.hasOwn(games, requestedGame) ? requestedGame : "animals";
let readingMode = options.get("reading") === "syllables" ? "syllables" : "whole";
let round = 0;
let queue = [];
let position = 0;
let boarding = false;
let drag = null;

function shuffle(list) {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function showPassenger() {
  const { syllables } = queue[position];
  const word = readingMode === "syllables" ? syllables : syllables.replaceAll("-", "");
  card.textContent = word.toUpperCase();
  card.style.setProperty("--word-length", word.length);
}

function say(message, tone = "") {
  feedback.textContent = message;
  feedback.dataset.tone = tone;
}

function waitForTrain() {
  const animations = train.getAnimations?.() ?? [];
  return Promise.allSettled(animations.map(animation => animation.finished));
}

async function startGame() {
  const currentRound = ++round;
  const game = games[activeGame];
  queue = shuffle(game.items);
  position = 0;
  boarding = true;
  train.classList.remove("arriving", "leaving");
  clearDrag();
  document.querySelector(".flying")?.remove();
  document.title = game.title;
  finish.hidden = true;
  finishMessage.textContent = game.finish;
  card.classList.add("waiting-for-train");
  progressText.textContent = `0 / ${queue.length}`;
  say("");
  for (const button of gameButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.game === activeGame));
  }
  for (const item of game.items) {
    if (pictures.has(item.id)) continue;
    const image = new Image();
    image.src = `assets/${activeGame}/${item.id}.webp`;
    image.alt = item.syllables.replaceAll("-", "");
    pictures.set(item.id, image);
  }
  for (const [index, wagon] of wagons.entries()) {
    const [group, label] = game.groups[index];
    const capacity = queue.filter(item => item.group === group).length;
    wagon.dataset.group = group;
    wagon.querySelector("strong").textContent = label;
    wagon.disabled = true;
    wagon.classList.remove("correct", "incorrect");
    wagon.style.setProperty("--seats", capacity);
    const seats = Array.from({ length: capacity }, () => document.createElement("i"));
    wagon.querySelector(".windows").replaceChildren(...seats);
  }
  void train.offsetWidth;
  train.classList.add("arriving");
  await waitForTrain();
  if (currentRound !== round) return false;
  train.classList.remove("arriving");
  showPassenger();
  card.classList.remove("waiting-for-train");
  for (const wagon of wagons) wagon.disabled = false;
  boarding = false;
  return true;
}

function addPassenger(passenger, seat) {
  seat.append(pictures.get(passenger.id));
  seat.classList.add("filled");
}

async function animateBoarding(passenger, seat, from) {
  if (reducedMotion.matches) return;
  const destination = seat.getBoundingClientRect();
  const size = Math.min(from.width, from.height);
  const sprite = pictures.get(passenger.id).cloneNode();
  sprite.className = "flying";
  sprite.setAttribute("aria-hidden", "true");
  Object.assign(sprite.style, {
    left: `${from.left + (from.width - size) / 2}px`,
    top: `${from.top + (from.height - size) / 2}px`,
    width: `${size}px`,
    height: `${size}px`
  });
  document.body.append(sprite);
  const x = destination.left + destination.width / 2 - (from.left + from.width / 2);
  const y = destination.top + destination.height / 2 - (from.top + from.height / 2);
  const scale = destination.width / size;
  const motion = sprite.animate([
    { transform: "none" },
    { transform: `translate(${x}px, ${y}px) scale(${scale})` }
  ], { duration: 330, easing: "cubic-bezier(.4,.03,.55,1)", fill: "forwards" });
  await motion.finished.catch(() => {});
  sprite.remove();
}

async function endGame() {
  const currentRound = round;
  card.classList.add("waiting-for-train");
  card.textContent = "";
  say("");
  for (const wagon of wagons) wagon.disabled = true;
  train.classList.add("leaving");
  await waitForTrain();
  if (currentRound !== round) return;
  finish.hidden = false;
  finishTitle.focus();
}

async function chooseWagon(wagon, from = card.getBoundingClientRect()) {
  if (boarding || wagon.disabled || position === queue.length || rules.open) return;
  const passenger = queue[position];
  const currentRound = round;
  if (passenger.group !== wagon.dataset.group) {
    wagon.classList.remove("incorrect");
    void wagon.offsetWidth;
    wagon.classList.add("incorrect");
    say("Попробуй другой вагон.", "try");
    return;
  }

  boarding = true;
  wagon.classList.remove("incorrect");
  const seat = wagon.querySelector(".windows i:not(.filled)");
  card.classList.add("waiting-for-train");
  say("Отлично!", "good");
  await animateBoarding(passenger, seat, from);
  if (currentRound !== round) return;
  addPassenger(passenger, seat);
  wagon.classList.add("correct");
  position++;
  progressText.textContent = `${position} / ${queue.length}`;

  if (position === queue.length) {
    endGame();
    return;
  }
  showPassenger();
  card.classList.remove("waiting-for-train");
  boarding = false;
}

function closestWagon(x, y) {
  return document.elementFromPoint(x, y)?.closest(".wagon") ?? null;
}

function moveDrag(event) {
  if (drag?.pointerId !== event.pointerId) return;
  if (!drag.ghost && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 7) return;
  if (!drag.ghost) {
    drag.ghost = document.createElement("div");
    drag.ghost.className = "drag-ghost word";
    drag.ghost.textContent = card.textContent;
    drag.ghost.setAttribute("aria-hidden", "true");
    document.body.append(drag.ghost);
    card.classList.add("is-dragging");
    say("");
  }
  drag.ghost.style.left = `${event.clientX}px`;
  drag.ghost.style.top = `${event.clientY}px`;
  const target = closestWagon(event.clientX, event.clientY);
  for (const wagon of wagons) wagon.classList.toggle("is-over", wagon === target);
}

function clearDrag() {
  drag?.ghost?.remove();
  drag = null;
  card.classList.remove("is-dragging");
  for (const wagon of wagons) wagon.classList.remove("is-over");
}

function stopDrag(event, acceptDrop) {
  if (drag?.pointerId !== event.pointerId) return;
  const from = drag.ghost?.getBoundingClientRect();
  const target = from && acceptDrop ? closestWagon(event.clientX, event.clientY) : null;
  clearDrag();
  if (target) chooseWagon(target, from);
}

card.addEventListener("pointerdown", event => {
  if (boarding || drag || event.button !== 0) return;
  drag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, ghost: null };
  card.setPointerCapture(event.pointerId);
});
card.addEventListener("pointermove", moveDrag);
card.addEventListener("pointerup", event => stopDrag(event, true));
card.addEventListener("pointercancel", event => stopDrag(event, false));
card.addEventListener("lostpointercapture", event => stopDrag(event, false));

for (const wagon of wagons) {
  wagon.addEventListener("click", () => chooseWagon(wagon));
  wagon.addEventListener("animationend", () => wagon.classList.remove("correct", "incorrect"));
}
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !rules.open && page.classList.contains("game-expanded")) {
    page.classList.remove("game-expanded");
    updateFullscreenLabel();
    return;
  }
  if (rules.open || !finish.hidden || drag || event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
  const wagon = { "1": wagons[0], "2": wagons[1], "3": wagons[2] }[event.key];
  if (!wagon) return;
  event.preventDefault();
  chooseWagon(wagon);
});
restart.addEventListener("click", async () => {
  if (await startGame()) wagons[0].focus();
});
function updateSelectionUrl() {
  const url = new URL(location.href);
  if (activeGame === "animals") url.searchParams.delete("game");
  else url.searchParams.set("game", activeGame);
  if (readingMode === "whole") url.searchParams.delete("reading");
  else url.searchParams.set("reading", readingMode);
  try {
    history.replaceState(null, "", url);
  } catch (error) {
    if (error.name !== "SecurityError") throw error;
  }
}

for (const button of gameButtons) {
  button.addEventListener("click", () => {
    if (activeGame === button.dataset.game) return;
    activeGame = button.dataset.game;
    updateSelectionUrl();
    startGame();
  });
}
for (const button of readingButtons) {
  button.setAttribute("aria-pressed", String(button.dataset.reading === readingMode));
  button.addEventListener("click", () => {
    if (readingMode === button.dataset.reading) return;
    readingMode = button.dataset.reading;
    for (const option of readingButtons) {
      option.setAttribute("aria-pressed", String(option === button));
    }
    updateSelectionUrl();
    clearDrag();
    if (!boarding) showPassenger();
  });
}
document.querySelector("#rules-button").addEventListener("click", () => rules.showModal());

function updateFullscreenLabel() {
  const expanded = document.fullscreenElement || page.classList.contains("game-expanded");
  fullscreenLabel.textContent = expanded ? "Выйти из полного экрана" : "Во весь экран";
}

fullscreenButton.addEventListener("click", async () => {
  if (document.fullscreenElement) {
    try {
      await document.exitFullscreen();
    } catch {
      say("Не удалось выйти из полноэкранного режима.");
    }
    return;
  }
  const expanded = page.classList.contains("game-expanded");
  if (!expanded && document.fullscreenEnabled) {
    try {
      await page.requestFullscreen();
      return;
    } catch {
      // An embedded game can still fill the available viewport.
    }
  }
  page.classList.toggle("game-expanded", !expanded);
  updateFullscreenLabel();
});
document.addEventListener("fullscreenchange", updateFullscreenLabel);

startGame();

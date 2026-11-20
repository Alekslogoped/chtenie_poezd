"use strict";

const animals = [
  { id: "wolf", word: "волк", group: "forest" },
  { id: "fox", word: "лиса", group: "forest" },
  { id: "hare", word: "заяц", group: "forest" },
  { id: "cat", word: "кот", group: "home" },
  { id: "dog", word: "собака", group: "home" },
  { id: "cow", word: "корова", group: "home" },
  { id: "giraffe", word: "жираф", group: "hot" },
  { id: "elephant", word: "слон", group: "hot" },
  { id: "zebra", word: "зебра", group: "hot" }
];

const card = document.querySelector("#card");
const feedback = document.querySelector("#feedback");
const progressText = document.querySelector("#progress-text");
const train = document.querySelector("#train");
const wagons = [...document.querySelectorAll(".wagon")];
const finish = document.querySelector("#finish");
const finishTitle = document.querySelector("#finish-title");
const restart = document.querySelector("#restart");
const rules = document.querySelector("#rules");
const fullscreenButton = document.querySelector("#fullscreen-button");
const fullscreenLabel = document.querySelector("#fullscreen-label");
const page = document.documentElement;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const pictures = Object.fromEntries(animals.map(animal => {
  const image = new Image();
  image.src = `assets/animals/${animal.id}.webp`;
  image.alt = animal.word;
  return [animal.id, image];
}));

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
  card.textContent = queue[position].word.toUpperCase();
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
  queue = shuffle(animals);
  position = 0;
  boarding = true;
  train.classList.remove("arriving", "leaving");
  clearDrag();
  finish.hidden = true;
  card.classList.add("waiting-for-train");
  progressText.textContent = `0 / ${queue.length}`;
  say("");
  for (const wagon of wagons) {
    const capacity = queue.filter(animal => animal.group === wagon.dataset.group).length;
    wagon.disabled = true;
    wagon.classList.remove("correct", "incorrect");
    wagon.style.setProperty("--seats", capacity);
    const seats = Array.from({ length: capacity }, () => document.createElement("i"));
    wagon.querySelector(".windows").replaceChildren(...seats);
  }
  showPassenger();

  void train.offsetWidth;
  train.classList.add("arriving");
  await waitForTrain();
  train.classList.remove("arriving");
  card.classList.remove("waiting-for-train");
  for (const wagon of wagons) wagon.disabled = false;
  boarding = false;
}

function addPassenger(passenger, seat) {
  seat.append(pictures[passenger.id]);
  seat.classList.add("filled");
}

async function animateBoarding(passenger, seat, from) {
  if (reducedMotion.matches) return;
  const destination = seat.getBoundingClientRect();
  const size = Math.min(from.width, from.height);
  const sprite = pictures[passenger.id].cloneNode();
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
  card.classList.add("waiting-for-train");
  card.textContent = "";
  say("");
  for (const wagon of wagons) wagon.disabled = true;
  train.classList.add("leaving");
  await waitForTrain();
  finish.hidden = false;
  finishTitle.focus();
}

async function chooseWagon(wagon, from = card.getBoundingClientRect()) {
  if (boarding || wagon.disabled || position === queue.length || rules.open) return;
  const passenger = queue[position];
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
  await startGame();
  wagons[0].focus();
});
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

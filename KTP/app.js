const DATA_FILES = {
  site: "data/site.json",
  tracks: "data/tracks.json",
  cards: "data/memory-cards.json",
  sentences: "data/daily-sentences.json"
};

const state = {
  site: null,
  tracks: [],
  cards: [],
  sentences: [],
  cardIndex: 0,
  variantIndex: 0,
  soundEnabled: true,
  savedCards: new Set(JSON.parse(localStorage.getItem("savedCards") || "[]"))
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

async function loadJson(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  return response.json();
}

async function loadData() {
  try {
    const [site, tracks, cards, sentences] = await Promise.all(Object.values(DATA_FILES).map(loadJson));
    Object.assign(state, { site, tracks, cards, sentences });
    renderSite();
    renderTracks();
    renderMemoryCard();
    renderSentences();
    bindDynamicEvents();
  } catch (error) {
    console.error(error);
    $("#trackGrid").innerHTML = `<div class="error-card">The lesson data could not be loaded. Open this project through GitHub Pages or a local web server rather than directly as a <code>file://</code> page.</div>`;
    $("#sentenceList").innerHTML = `<div class="error-card">Check the JSON files inside <code>data/</code>.</div>`;
  }
}

function renderSite() {
  $("#todayMinutes").textContent = state.site.todayMinutes;
  $("#streakDays").textContent = state.site.streakDays;
  $("#continueTitle").textContent = state.site.continueLesson.title;
  $("#continueWords").textContent = state.site.continueLesson.words;
  $("#continueProgress").style.width = `${state.site.continueLesson.progress}%`;
  $("#dailySetTitle").textContent = state.site.dailySetTitle;
  updateSavedCount();
}

function renderTracks() {
  $("#trackGrid").innerHTML = state.tracks.map(track => `
    <article class="track-card" data-track-id="${track.id}" data-tone="${track.tone}" tabindex="0" role="button" aria-label="Open ${track.title}">
      <div>
        <span class="track-number">${track.number} · ${track.eyebrow}</span>
        <h3>${track.title}</h3>
        <p>${track.description}</p>
        <div class="track-meta"><span>${track.lessonCount} mini lessons</span><span>${track.minutes} min</span></div>
      </div>
      <div class="track-symbol">${track.symbol}</div>
      <button class="track-arrow" tabindex="-1" aria-hidden="true">→</button>
    </article>
  `).join("");
}

function renderMemoryCard() {
  if (!state.cards.length) return;
  const card = state.cards[state.cardIndex];
  const variant = card.variants[state.variantIndex];
  $("#cardEmoji").textContent = card.emoji;
  $("#cardTopic").textContent = card.topic;
  $("#cardPosition").textContent = `${String(state.cardIndex + 1).padStart(2, "0")} / ${String(state.cards.length).padStart(2, "0")}`;
  $("#sceneText").textContent = variant.scene;
  $("#koreanText").textContent = variant.korean;
  $("#romanText").textContent = variant.romanization;
  $("#translationText").textContent = variant.translation;
  $("#hiddenThought").textContent = variant.hiddenThought;
  $("#attitudeNote").textContent = variant.attitudeNote;
  $("#tipText").textContent = card.tip;
  $("#choiceRow").innerHTML = card.variants.map((item, index) => `
    <button class="variant-tab ${index === state.variantIndex ? "active" : ""}" data-variant-index="${index}" role="tab" aria-selected="${index === state.variantIndex}">${item.label}</button>
  `).join("");
  const isSaved = state.savedCards.has(card.id);
  $("#favoriteBtn").textContent = isSaved ? "♥" : "♡";
  $("#favoriteBtn").classList.toggle("saved", isSaved);
  bindVariantButtons();
}

function renderSentences() {
  $("#sentenceList").innerHTML = state.sentences.slice(0, 4).map((item, index) => `
    <button class="sentence-item" data-sentence-id="${item.id}">
      <span class="sentence-number">${String(index + 1).padStart(2, "0")}</span>
      <span class="sentence-copy"><strong>${item.korean}</strong><small>${item.translation}</small></span>
      <span class="sentence-play">▶</span>
    </button>
  `).join("");
}

function bindDynamicEvents() {
  $$(".track-card").forEach(card => {
    const open = () => openTrack(card.dataset.trackId);
    card.addEventListener("click", open);
    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); }
    });
  });
  $$(".sentence-item").forEach(button => button.addEventListener("click", () => {
    const sentence = state.sentences.find(item => item.id === button.dataset.sentenceId);
    speak(sentence.korean);
    showToast(sentence.note);
  }));
}

function bindVariantButtons() {
  $$(".variant-tab").forEach(button => button.addEventListener("click", () => {
    state.variantIndex = Number(button.dataset.variantIndex);
    renderMemoryCard();
  }));
}

function openTrack(id) {
  const track = state.tracks.find(item => item.id === id);
  if (!track) return;
  $("#dialogEyebrow").textContent = track.eyebrow;
  $("#dialogTitle").textContent = track.title;
  $("#dialogDescription").textContent = track.description;
  $("#dialogList").innerHTML = track.lessons.map((lesson, index) => `<div><strong>${String(index + 1).padStart(2, "0")}</strong><span>${lesson}</span></div>`).join("");
  $("#trackDialog").showModal();
}

function currentCard() { return state.cards[state.cardIndex]; }
function currentVariant() { return currentCard()?.variants[state.variantIndex]; }

function speak(text) {
  if (!state.soundEnabled) return showToast("Sound is muted");
  if (!("speechSynthesis" in window)) return showToast("Speech synthesis is not supported in this browser");
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ko-KR";
  utterance.rate = 0.82;
  window.speechSynthesis.speak(utterance);
}

function nextCard(random = false) {
  if (!state.cards.length) return;
  if (random && state.cards.length > 1) {
    let next = state.cardIndex;
    while (next === state.cardIndex) next = Math.floor(Math.random() * state.cards.length);
    state.cardIndex = next;
  } else {
    state.cardIndex = (state.cardIndex + 1) % state.cards.length;
  }
  state.variantIndex = 0;
  renderMemoryCard();
}

function toggleSave() {
  const id = currentCard().id;
  state.savedCards.has(id) ? state.savedCards.delete(id) : state.savedCards.add(id);
  localStorage.setItem("savedCards", JSON.stringify([...state.savedCards]));
  renderMemoryCard();
  updateSavedCount();
  showToast(state.savedCards.has(id) ? "Card saved" : "Card removed");
}

function updateSavedCount() { $("#savedCount").textContent = state.savedCards.size; }
function scrollToId(id) { document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
}
function toggleSheet(open) {
  $("#sideSheet").classList.toggle("open", open);
  $("#sheetBackdrop").classList.toggle("open", open);
  $("#sideSheet").setAttribute("aria-hidden", String(!open));
}

$("#playSentence").addEventListener("click", () => speak(currentVariant()?.korean));
$("#favoriteBtn").addEventListener("click", toggleSave);
$("#nextCardBtn").addEventListener("click", () => nextCard(false));
$("#shuffleBtn").addEventListener("click", () => nextCard(true));
$("#startTodayBtn").addEventListener("click", () => scrollToId("practiceSection"));
$("#resumeBtn").addEventListener("click", () => scrollToId("practiceSection"));
$("#savedBtn").addEventListener("click", () => showToast(`${state.savedCards.size} saved memory card${state.savedCards.size === 1 ? "" : "s"}`));
$("#filterBtn").addEventListener("click", () => scrollToId("trackGrid"));
$("#seeAllBtn").addEventListener("click", () => showToast(`${state.sentences.length} daily sentences loaded from JSON`));
$("#soundToggle").addEventListener("click", event => {
  state.soundEnabled = !state.soundEnabled;
  event.currentTarget.innerHTML = state.soundEnabled ? "<span>♬</span>" : "<span>×</span>";
  showToast(state.soundEnabled ? "Sound on" : "Sound off");
});
$("#menuBtn").addEventListener("click", () => toggleSheet(true));
$("#sheetClose").addEventListener("click", () => toggleSheet(false));
$("#sheetBackdrop").addEventListener("click", () => toggleSheet(false));
$$('[data-sheet-target]').forEach(button => button.addEventListener("click", () => { toggleSheet(false); scrollToId(button.dataset.sheetTarget); }));
$("#dialogClose").addEventListener("click", () => $("#trackDialog").close());
$("#startLessonBtn").addEventListener("click", () => { $("#trackDialog").close(); scrollToId("practiceSection"); });
$$(".nav-item").forEach(button => button.addEventListener("click", () => {
  $$(".nav-item").forEach(item => item.classList.remove("active"));
  button.classList.add("active");
  scrollToId(button.dataset.target);
}));

loadData();

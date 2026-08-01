
const state = {
  folders: [],
  items: [],
  activeFolder: null,
  activeItem: null,
  saved: new Set(JSON.parse(localStorage.getItem("ktpSaved") || "[]"))
};

const $ = (s) => document.querySelector(s);

async function loadData() {
  const [foldersRes, itemsRes] = await Promise.all([
    fetch("data/folders.json"),
    fetch("data/content.json")
  ]);
  state.folders = await foldersRes.json();
  state.items = await itemsRes.json();
  renderFolders();
  renderItems(state.items.slice(0, 8), "Recently added");
}

function renderFolders() {
  $("#folderGrid").innerHTML = state.folders.map(folder => `
    <button class="folder-card" data-folder="${folder.id}">
      <span class="folder-icon">${folder.icon}</span>
      <span>
        <h3>${folder.title}</h3>
        <p>${folder.description}</p>
      </span>
      <small>${folder.sections.length} sections</small>
    </button>
  `).join("");

  document.querySelectorAll(".folder-card").forEach(btn => {
    btn.addEventListener("click", () => openFolder(btn.dataset.folder));
  });
}

function openFolder(folderId) {
  state.activeFolder = folderId;
  const folder = state.folders.find(x => x.id === folderId);
  const filtered = state.items.filter(item => item.folder === folderId);
  renderItems(filtered, folder.title);
  $("#resultsSection").scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderItems(items, title) {
  $("#resultsTitle").textContent = title;
  const list = $("#contentList");

  if (!items.length) {
    list.innerHTML = `<div class="empty-state">No matching content yet.</div>`;
    return;
  }

  list.innerHTML = items.map(item => `
    <button class="content-item" data-id="${item.id}">
      <span class="content-badge">${item.badge}</span>
      <span>
        <strong>${item.title}</strong>
        <small>${item.subtitle}</small>
      </span>
      <span class="content-arrow">→</span>
    </button>
  `).join("");

  document.querySelectorAll(".content-item").forEach(btn => {
    btn.addEventListener("click", () => openItem(btn.dataset.id));
  });
}

function openItem(id) {
  const item = state.items.find(x => x.id === id);
  state.activeItem = item;
  $("#dialogType").textContent = item.type.toUpperCase();
  $("#dialogTitle").textContent = item.title;
  $("#dialogSubtitle").textContent = item.subtitle;
  $("#dialogBody").innerHTML = item.blocks.map(block => `
    <section class="dialog-block">
      <h3>${block.label}</h3>
      <p class="${block.korean ? "korean-large" : ""}">${block.text}</p>
    </section>
  `).join("");
  $("#saveItem").textContent = state.saved.has(id) ? "★ Saved" : "☆ Save";
  $("#contentDialog").showModal();
}

function searchLibrary(query) {
  const q = query.trim().toLowerCase();
  if (!q) {
    $("#searchMeta").textContent = "Browse folders or search across all content.";
    renderItems(state.items.slice(0, 8), "Recently added");
    return;
  }
  const result = state.items.filter(item => {
    const searchable = [
      item.title, item.subtitle, item.type, item.folder,
      ...(item.tags || []),
      ...item.blocks.map(b => b.text)
    ].join(" ").toLowerCase();
    return searchable.includes(q);
  });
  $("#searchMeta").textContent = `${result.length} result${result.length === 1 ? "" : "s"} for “${query}”`;
  renderItems(result, "Search results");
}

$("#globalSearch").addEventListener("input", e => searchLibrary(e.target.value));
$("#clearSearch").addEventListener("click", () => {
  $("#globalSearch").value = "";
  searchLibrary("");
  $("#globalSearch").focus();
});
$("#dialogClose").addEventListener("click", () => $("#contentDialog").close());

$("#playAudio").addEventListener("click", () => {
  if (!state.activeItem) return;

  const spokenText = state.activeItem.blocks
    .map(block => block.speakable || "")
    .filter(text => text.trim() !== "")
    .join(" ");

  if (!spokenText) {
    console.info("No speakable text is defined for this item.");
    return;
  }

  if (!("speechSynthesis" in window)) {
    console.warn("Speech synthesis is not supported in this browser.");
    return;
  }

  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(spokenText);
  utterance.lang = "ko-KR";
  utterance.rate = 0.85;

  speechSynthesis.speak(utterance);
});

$("#saveItem").addEventListener("click", () => {
  if (!state.activeItem) return;
  const id = state.activeItem.id;
  if (state.saved.has(id)) state.saved.delete(id);
  else state.saved.add(id);
  localStorage.setItem("ktpSaved", JSON.stringify([...state.saved]));
  $("#saveItem").textContent = state.saved.has(id) ? "★ Saved" : "☆ Save";
});

$("#themeButton").addEventListener("click", () => {
  alert("V2 keeps the V1 beige/brown visual language while changing the architecture.");
});

loadData().catch(err => {
  console.error(err);
  $("#contentList").innerHTML = `<div class="empty-state">Could not load JSON data. Open this project through GitHub Pages or a local server.</div>`;
});

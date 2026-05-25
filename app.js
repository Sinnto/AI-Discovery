const specimenSets = [
  ["coffee cup", "silver badge", "keyboard key"],
  ["cake candle", "team photo", "flower petal"],
  ["whiteboard note", "launch sticker", "paper cup"],
  ["train ticket", "tiny suitcase", "sunlit window"],
  ["meeting note", "blue pen", "late snack"],
  ["desk light", "woven tote", "thank-you card"],
];

const gradients = [
  "linear-gradient(135deg, #3b3d3d, #151719 52%, #75684f)",
  "linear-gradient(135deg, #24272b, #101113 46%, #b59b68)",
  "linear-gradient(135deg, #49443c, #18191b 52%, #5f675f)",
  "linear-gradient(135deg, #26292f, #111214 48%, #826f7c)",
  "linear-gradient(135deg, #343333, #111315 52%, #998764)",
  "linear-gradient(135deg, #1f2222, #0d0f11 48%, #6e6b60)",
];

const SUPABASE_URL = "https://dbtangzhendong04-1.supabase.database.sankuai.com";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGF" +
  "iYXNlIiwiaWF0IjoxNzQ2OTc5MjAwLCJleHAiOjE5MDQ3NDU2MDB9.snofD399CWaUaU-MZi8c" +
  "WJXgamG48-FVwpVxabLmpa4";
const SUPABASE_BUCKET = "lulu-memories";
const LOCAL_STORAGE_KEY = "lulu-memory-film.saved-memories.v2";

const seedMemories = [
  {
    title: "The Friday Light",
    author: "Mia",
    tag: "Daily moment",
    message: "You always made the end of a long week feel lighter. Even when the room was tired, your laugh arrived first.",
    mediaLabel: "coffee, notes, the last warm light",
    specimens: specimenSets[0],
    gradient: gradients[0],
  },
  {
    title: "Before Launch",
    author: "Alex",
    tag: "Project",
    message: "The whiteboard looked impossible until you started drawing the simple path through it. That calm stayed with all of us.",
    mediaLabel: "whiteboard arrows and midnight snacks",
    specimens: specimenSets[2],
    gradient: gradients[1],
  },
  {
    title: "Lunch Table Weather",
    author: "Nina",
    tag: "Lunch",
    message: "You remembered everyone's tiny preferences. Less ice, more chili, corner seat, quiet day. That is a rare kind of care.",
    mediaLabel: "shared lunch, soft window, small jokes",
    specimens: specimenSets[4],
    gradient: gradients[2],
  },
  {
    title: "The Small Celebration",
    author: "Chen",
    tag: "Celebration",
    message: "A cake, six paper cups, and the way you pretended not to notice us hiding behind the meeting-room door.",
    mediaLabel: "cake candle and blurred applause",
    specimens: specimenSets[1],
    gradient: gradients[3],
  },
  {
    title: "Carry This With You",
    author: "Team",
    tag: "Daily moment",
    message: "Not every goodbye is an ending. Some people become a standard we quietly keep using.",
    mediaLabel: "desk light, card, silver pen",
    specimens: specimenSets[5],
    gradient: gradients[4],
  },
];

let savedMemories = loadLocalMemories();
let memories = [...savedMemories, ...seedMemories];

const memoryTrack = document.querySelector("#memoryTrack");
const uploadDialog = document.querySelector("#uploadDialog");
const memoryForm = document.querySelector("#memoryForm");
const processing = document.querySelector("#processing");
const processingTitle = document.querySelector("#processingTitle");
const progressBar = document.querySelector("#progressBar");
const processingSteps = Array.from(document.querySelectorAll("#processingSteps li"));
const saveToast = document.querySelector("#saveToast");

function renderMemories() {
  memoryTrack.innerHTML = memories.map((memory, index) => memoryTemplate(memory, index)).join("");
}

function memoryTemplate(memory, index) {
  const media = memory.mediaUrl
    ? mediaTemplate(memory)
    : `<div class="media-placeholder"><span>${escapeHtml(memory.mediaLabel)}</span></div>`;

  return `
    <article class="memory-frame" style="--media-bg: ${memory.gradient}">
      <div class="media-panel">
        ${media}
      </div>
      <div class="memory-copy">
        <div class="memory-meta">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <span>${escapeHtml(memory.tag)}</span>
        </div>
        <h3>${escapeHtml(memory.title)}</h3>
        <blockquote>${escapeHtml(memory.message)}</blockquote>
        <div class="author-line">From ${escapeHtml(memory.author)}</div>
        <div class="specimen-row">
          ${memory.specimens.map((item) => `<span class="memory-chip">${escapeHtml(item)}</span>`).join("")}
        </div>
      </div>
    </article>
  `;
}

function mediaTemplate(memory) {
  if (memory.mediaType.startsWith("video/")) {
    return `<video src="${memory.mediaUrl}" controls muted playsinline></video>`;
  }

  return `<img src="${memory.mediaUrl}" alt="${escapeHtml(memory.title)} uploaded memory" />`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function openUpload() {
  if (typeof uploadDialog.showModal === "function") {
    uploadDialog.showModal();
  } else {
    uploadDialog.setAttribute("open", "");
  }
}

function closeUpload() {
  uploadDialog.close();
}

function randomSpecimens(title, message) {
  const text = `${title} ${message}`.toLowerCase();
  if (text.includes("cake") || text.includes("celebrat")) return specimenSets[1];
  if (text.includes("launch") || text.includes("project")) return specimenSets[2];
  if (text.includes("travel") || text.includes("trip")) return specimenSets[3];
  if (text.includes("lunch") || text.includes("food")) return specimenSets[4];
  return specimenSets[Math.floor(Math.random() * specimenSets.length)];
}

function loadLocalMemories() {
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isValidMemory) : [];
  } catch {
    return [];
  }
}

function isValidMemory(memory) {
  return (
    memory &&
    typeof memory.title === "string" &&
    typeof memory.author === "string" &&
    typeof memory.message === "string" &&
    typeof memory.tag === "string"
  );
}

function persistLocalMemories() {
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedMemories));
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
}

function showSaveToast(message) {
  saveToast.textContent = message;
  saveToast.hidden = false;
  window.clearTimeout(showSaveToast.timeoutId);
  showSaveToast.timeoutId = window.setTimeout(() => {
    saveToast.hidden = true;
  }, 3200);
}

function supabaseHeaders(extra = {}) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    ...extra,
  };
}

function mapRemoteMemory(row) {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    tag: row.tag,
    message: row.message,
    mediaUrl: row.media_url || "",
    mediaType: row.media_type || "",
    mediaPath: row.media_path || "",
    mediaLabel: row.media_label || "cloud memory frame",
    specimens: Array.isArray(row.specimens) && row.specimens.length ? row.specimens : randomSpecimens(row.title, row.message),
    gradient: row.gradient || gradients[0],
    createdAt: row.created_at,
    source: "cloud",
  };
}

function toRemotePayload(memory) {
  return {
    title: memory.title,
    author: memory.author,
    tag: memory.tag,
    message: memory.message,
    media_url: memory.mediaUrl || null,
    media_type: memory.mediaType || null,
    media_path: memory.mediaPath || null,
    media_label: memory.mediaLabel,
    specimens: memory.specimens,
    gradient: memory.gradient,
  };
}

async function fetchRemoteMemories() {
  const url = `${SUPABASE_URL}/rest/v1/memories?select=*&order=created_at.desc&limit=100`;
  const response = await fetch(url, {
    headers: supabaseHeaders({ Accept: "application/json" }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return (await response.json()).map(mapRemoteMemory);
}

async function insertRemoteMemory(memory) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/memories?select=*`, {
    method: "POST",
    headers: supabaseHeaders({
      "Content-Type": "application/json",
      Prefer: "return=representation",
    }),
    body: JSON.stringify(toRemotePayload(memory)),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const rows = await response.json();
  return mapRemoteMemory(rows[0]);
}

async function uploadMedia(file) {
  if (!file || file.size === 0) return { mediaUrl: "", mediaPath: "", mediaType: "" };

  const extension = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "bin";
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const mediaPath = `memories/${safeName}`;
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${mediaPath}`, {
    method: "POST",
    headers: supabaseHeaders({
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "false",
    }),
    body: file,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return {
    mediaUrl: `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${mediaPath}`,
    mediaPath,
    mediaType: file.type || "application/octet-stream",
  };
}

async function refreshRemoteMemories() {
  try {
    const remoteMemories = await fetchRemoteMemories();
    savedMemories = remoteMemories;
    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    memories = [...savedMemories, ...seedMemories];
    renderMemories();
    showSaveToast("Cloud memories loaded.");
  } catch {
    showSaveToast("Supabase is not ready yet. Showing local memories.");
  }
}

async function showProcessing() {
  const titles = ["Reading the scene", "Cutting out memory specimens", "Placing it into the film"];
  processing.hidden = false;

  for (let index = 0; index < titles.length; index += 1) {
    processingTitle.textContent = titles[index];
    progressBar.style.width = `${(index + 1) * 33.4}%`;
    processingSteps.forEach((step, stepIndex) => {
      step.classList.toggle("active", stepIndex <= index);
    });
    await wait(720);
  }

  processing.hidden = true;
  progressBar.style.width = "0%";
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

memoryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(memoryForm);
  const file = formData.get("media");
  const title = formData.get("title").trim();
  const message = formData.get("message").trim();
  const author = formData.get("author").trim();
  const tag = formData.get("tag");

  if (!title || !message || !author) return;

  closeUpload();
  await showProcessing();

  const hasMedia = file && file.size > 0;
  const previewUrl = hasMedia ? URL.createObjectURL(file) : "";
  let saveMessage = "Saved to Supabase. Everyone will see it after refresh.";

  const newMemory = {
    title,
    author,
    tag,
    message,
    mediaUrl: previewUrl,
    mediaType: hasMedia ? file.type : "",
    mediaPath: "",
    mediaLabel: "newly added frame, waiting to become a memory",
    specimens: randomSpecimens(title, message),
    gradient: gradients[Math.floor(Math.random() * gradients.length)],
  };

  try {
    const uploaded = await uploadMedia(file);
    const remoteMemory = await insertRemoteMemory({ ...newMemory, ...uploaded });
    savedMemories = [remoteMemory, ...savedMemories];
    memories = [remoteMemory, ...memories];
    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    if (hasMedia) {
      try {
        newMemory.mediaUrl = await fileToDataUrl(file);
      } catch {
        newMemory.mediaUrl = "";
      }
    }
    savedMemories = [newMemory, ...savedMemories];
    memories = [newMemory, ...memories];
    persistLocalMemories();
    saveMessage = "Cloud save failed. Saved in this browser as a fallback.";
  }

  renderMemories();
  memoryForm.reset();
  showSaveToast(saveMessage);
  document.querySelector("#film").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelectorAll("[data-open-upload]").forEach((button) => {
  button.addEventListener("click", openUpload);
});

document.querySelector("[data-close-upload]").addEventListener("click", closeUpload);

uploadDialog.addEventListener("click", (event) => {
  const rect = uploadDialog.getBoundingClientRect();
  const outside =
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom;

  if (outside) closeUpload();
});

renderMemories();
refreshRemoteMemories();

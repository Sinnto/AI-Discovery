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

const SUPABASE_URL = "https://apukbofvnfisrdqjfjrf.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im" +
  "FwdWtib2Z2bmZpc3JkcWpmanJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2ODAyMTgsIm" +
  "V4cCI6MjA5NTI1NjIxOH0.9Kg9JquOZAJKz5zbC3zikF4E0NRWvEw2fE0GPKUSu0g";
const SUPABASE_BUCKET = "lulu-memories";
const LOCAL_STORAGE_KEY = "lulu-memory-film.saved-memories.v2";
const LOCAL_WISHES_KEY = "lulu-memory-film.saved-wishes.v1";

const wishColors = ["cream", "butter", "rose", "blue", "sage"];
const wishRotations = [-3.5, -2, -1, 1.5, 2.5, 3.2];

let savedMemories = loadLocalMemories();
let memories = [...savedMemories];
let savedWishes = loadLocalWishes();
let wishes = [...savedWishes];

const memoryTrack = document.querySelector("#memoryTrack");
const wishWall = document.querySelector("#wishWall");
const uploadDialog = document.querySelector("#uploadDialog");
const wishDialog = document.querySelector("#wishDialog");
const memoryForm = document.querySelector("#memoryForm");
const wishForm = document.querySelector("#wishForm");
const processing = document.querySelector("#processing");
const processingTitle = document.querySelector("#processingTitle");
const progressBar = document.querySelector("#progressBar");
const processingSteps = Array.from(document.querySelectorAll("#processingSteps li"));
const saveToast = document.querySelector("#saveToast");

function renderMemories() {
  memoryTrack.innerHTML = memories.length
    ? memories.map((memory, index) => memoryTemplate(memory, index)).join("")
    : emptyStateTemplate();
}

function renderWishes() {
  wishWall.innerHTML = wishes.length ? wishes.map(wishTemplate).join("") : emptyWishTemplate();
}

function emptyStateTemplate() {
  return `
    <section class="empty-state" aria-label="No memories yet">
      <p>No real memories yet</p>
      <h3>The corridor is waiting for its first real frame.</h3>
      <button class="secondary-button" data-open-upload type="button">Add the first memory</button>
    </section>
  `;
}

function emptyWishTemplate() {
  return `
    <section class="empty-state wish-empty" aria-label="No wishes yet">
      <p>No wishes yet</p>
      <h3>Pin the first note for lulu's next chapter.</h3>
      <button class="secondary-button" data-open-wish type="button">Write the first wish</button>
    </section>
  `;
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
        ${cutoutTemplate(memory)}
        <div class="specimen-row">
          ${memory.specimens.map((item) => `<span class="memory-chip">${escapeHtml(item)}</span>`).join("")}
        </div>
      </div>
    </article>
  `;
}

function cutoutTemplate(memory) {
  if (!memory.cutoutUrl) return "";

  return `
    <figure class="cutout-specimen">
      <img src="${memory.cutoutUrl}" alt="${escapeHtml(memory.cutoutLabel || "Photo cutout specimen")}" />
      <figcaption>${escapeHtml(memory.cutoutLabel || "photo cutout")}</figcaption>
    </figure>
  `;
}

function wishTemplate(wish) {
  const author = wish.author ? `From ${escapeHtml(wish.author)}` : "From someone who will miss you";
  return `
    <article class="wish-note ${escapeHtml(wish.color || "cream")}" style="--tilt: ${Number(wish.rotation || 0)}deg">
      <p>${escapeHtml(wish.message)}</p>
      <footer>
        <span>${escapeHtml(author)}</span>
        <small>${escapeHtml(wish.mood || "Future wish")}</small>
      </footer>
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

function openWish() {
  if (typeof wishDialog.showModal === "function") {
    wishDialog.showModal();
  } else {
    wishDialog.setAttribute("open", "");
  }
}

function closeWish() {
  wishDialog.close();
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

function loadLocalWishes() {
  try {
    const raw = window.localStorage.getItem(LOCAL_WISHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isValidWish) : [];
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

function isValidWish(wish) {
  return wish && typeof wish.message === "string" && wish.message.trim().length > 0;
}

function persistLocalMemories() {
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedMemories));
}

function persistLocalWishes() {
  window.localStorage.setItem(LOCAL_WISHES_KEY, JSON.stringify(savedWishes));
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
    cutoutUrl: row.cutout_url || "",
    cutoutPath: row.cutout_path || "",
    cutoutLabel: row.cutout_label || "",
    mediaLabel: row.media_label || "cloud memory frame",
    specimens: Array.isArray(row.specimens) && row.specimens.length ? row.specimens : randomSpecimens(row.title, row.message),
    gradient: row.gradient || gradients[0],
    createdAt: row.created_at,
    source: "cloud",
  };
}

function mapRemoteWish(row) {
  return {
    id: row.id,
    author: row.author || "",
    message: row.message,
    mood: row.mood || "",
    color: row.color || "cream",
    rotation: row.rotation || 0,
    createdAt: row.created_at,
    source: "cloud",
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

async function fetchRemoteWishes() {
  const url = `${SUPABASE_URL}/rest/v1/wishes?select=*&order=created_at.desc&limit=120`;
  const response = await fetch(url, {
    headers: supabaseHeaders({ Accept: "application/json" }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return (await response.json()).map(mapRemoteWish);
}

async function saveRemoteMemory(memory, file, cutoutDataUrl) {
  const [uploaded, cutout] = await Promise.all([uploadMedia(file), uploadCutout(cutoutDataUrl)]);
  const response = await fetch(`${SUPABASE_URL}/rest/v1/memories?select=*`, {
    method: "POST",
    headers: supabaseHeaders({
      "Content-Type": "application/json",
      Prefer: "return=representation",
    }),
    body: JSON.stringify(toRemotePayload({ ...memory, ...uploaded, ...cutout })),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const rows = await response.json();
  return mapRemoteMemory(rows[0]);
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
    cutout_url: memory.cutoutUrl || null,
    cutout_path: memory.cutoutPath || null,
    cutout_label: memory.cutoutLabel || null,
    media_label: memory.mediaLabel,
    specimens: memory.specimens,
    gradient: memory.gradient,
  };
}

function toWishPayload(wish) {
  return {
    author: wish.author || null,
    message: wish.message,
    mood: wish.mood || null,
    color: wish.color || "cream",
    rotation: wish.rotation || 0,
  };
}

async function saveRemoteWish(wish) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/wishes?select=*`, {
    method: "POST",
    headers: supabaseHeaders({
      "Content-Type": "application/json",
      Prefer: "return=representation",
    }),
    body: JSON.stringify(toWishPayload(wish)),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const rows = await response.json();
  return mapRemoteWish(rows[0]);
}

async function uploadObject({ body, contentType, extension, folder }) {
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const objectPath = `${folder}/${safeName}`;
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${objectPath}`, {
    method: "POST",
    headers: supabaseHeaders({
      "Content-Type": contentType || "application/octet-stream",
      "x-upsert": "false",
    }),
    body,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return {
    url: `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${objectPath}`,
    path: objectPath,
  };
}

async function uploadMedia(file) {
  if (!file || file.size === 0) return { mediaUrl: "", mediaPath: "", mediaType: "" };

  const extension = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "bin";
  const uploaded = await uploadObject({
    body: file,
    contentType: file.type || "application/octet-stream",
    extension,
    folder: "memories",
  });

  return {
    mediaUrl: uploaded.url,
    mediaPath: uploaded.path,
    mediaType: file.type || "application/octet-stream",
  };
}

async function uploadCutout(cutoutDataUrl) {
  if (!cutoutDataUrl) return { cutoutUrl: "", cutoutPath: "", cutoutLabel: "" };

  const blob = await (await fetch(cutoutDataUrl)).blob();
  const uploaded = await uploadObject({
    body: blob,
    contentType: "image/png",
    extension: "png",
    folder: "cutouts",
  });

  return {
    cutoutUrl: uploaded.url,
    cutoutPath: uploaded.path,
    cutoutLabel: "photo cutout",
  };
}

async function createCutoutDataUrl(file) {
  if (!file || !file.type.startsWith("image/")) return "";

  const sourceUrl = URL.createObjectURL(file);
  const image = await loadImage(sourceUrl);
  URL.revokeObjectURL(sourceUrl);

  const size = 420;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  const scale = Math.max(size / image.naturalWidth, size / image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  const x = (size - width) / 2;
  const y = (size - height) / 2;

  context.clearRect(0, 0, size, size);
  context.save();
  context.beginPath();
  context.moveTo(218, 18);
  context.bezierCurveTo(328, 24, 399, 94, 400, 206);
  context.bezierCurveTo(402, 326, 320, 401, 204, 404);
  context.bezierCurveTo(88, 407, 23, 326, 20, 222);
  context.bezierCurveTo(17, 104, 92, 10, 218, 18);
  context.closePath();
  context.clip();
  context.drawImage(image, x, y, width, height);
  context.restore();

  context.globalCompositeOperation = "source-atop";
  const vignette = context.createRadialGradient(210, 170, 80, 210, 210, 250);
  vignette.addColorStop(0, "rgba(255,255,255,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.2)");
  context.fillStyle = vignette;
  context.fillRect(0, 0, size, size);

  return canvas.toDataURL("image/png");
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.src = url;
  });
}

async function refreshRemoteMemories() {
  let loadedAny = false;

  try {
    const remoteMemories = await fetchRemoteMemories();
    savedMemories = remoteMemories;
    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    memories = [...savedMemories];
    renderMemories();
    loadedAny = true;
  } catch {
    // Keep local fallback memories visible if cloud reads fail.
  }

  try {
    const remoteWishes = await fetchRemoteWishes();
    savedWishes = remoteWishes;
    window.localStorage.removeItem(LOCAL_WISHES_KEY);
    wishes = [...savedWishes];
    renderWishes();
    loadedAny = true;
  } catch {
    // The wishes table may not exist until the updated schema is applied.
  }

  if (loadedAny) {
    showSaveToast("Cloud content loaded.");
  } else {
    showSaveToast("Supabase is not ready yet. Showing local notes.");
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

  if (!author) return;
  if (!title && !message && (!file || file.size === 0)) {
    showSaveToast("Add a photo, title, or message before saving.");
    return;
  }

  closeUpload();
  await showProcessing();

  const hasMedia = file && file.size > 0;
  const previewUrl = hasMedia ? URL.createObjectURL(file) : "";
  const cutoutDataUrl = hasMedia && file.type.startsWith("image/") ? await createCutoutDataUrl(file) : "";
  let saveMessage = "Saved to Supabase. Everyone will see it after refresh.";

  const newMemory = {
    title: title || "A quiet memory",
    author,
    tag,
    message: message || "A photo memory from this shared chapter.",
    mediaUrl: previewUrl,
    mediaType: hasMedia ? file.type : "",
    mediaPath: "",
    cutoutUrl: cutoutDataUrl,
    cutoutPath: "",
    cutoutLabel: cutoutDataUrl ? "photo cutout" : "",
    mediaLabel: "newly added frame, waiting to become a memory",
    specimens: randomSpecimens(title, message),
    gradient: gradients[Math.floor(Math.random() * gradients.length)],
  };

  try {
    const remoteMemory = await saveRemoteMemory(newMemory, file, cutoutDataUrl);
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

wishForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(wishForm);
  const author = formData.get("author").trim();
  const message = formData.get("message").trim();
  const mood = formData.get("mood");

  if (!message) return;

  closeWish();
  const newWish = {
    author,
    message,
    mood,
    color: wishColors[wishes.length % wishColors.length],
    rotation: wishRotations[wishes.length % wishRotations.length],
  };

  let saveMessage = "Wish pinned to the wall.";

  try {
    const remoteWish = await saveRemoteWish(newWish);
    savedWishes = [remoteWish, ...savedWishes];
    wishes = [remoteWish, ...wishes];
    window.localStorage.removeItem(LOCAL_WISHES_KEY);
  } catch {
    savedWishes = [newWish, ...savedWishes];
    wishes = [newWish, ...wishes];
    persistLocalWishes();
    saveMessage = "Cloud save failed. Wish saved in this browser as a fallback.";
  }

  renderWishes();
  wishForm.reset();
  showSaveToast(saveMessage);
  document.querySelector("#wishes").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelectorAll("[data-open-upload]").forEach((button) => {
  button.addEventListener("click", openUpload);
});

document.querySelectorAll("[data-open-wish]").forEach((button) => {
  button.addEventListener("click", openWish);
});

memoryTrack.addEventListener("click", (event) => {
  if (event.target.closest("[data-open-upload]")) {
    openUpload();
  }
});

wishWall.addEventListener("click", (event) => {
  if (event.target.closest("[data-open-wish]")) {
    openWish();
  }
});

document.querySelector("[data-close-upload]").addEventListener("click", closeUpload);
document.querySelector("[data-close-wish]").addEventListener("click", closeWish);

uploadDialog.addEventListener("click", (event) => {
  const rect = uploadDialog.getBoundingClientRect();
  const outside =
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom;

  if (outside) closeUpload();
});

wishDialog.addEventListener("click", (event) => {
  const rect = wishDialog.getBoundingClientRect();
  const outside =
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom;

  if (outside) closeWish();
});

renderMemories();
renderWishes();
refreshRemoteMemories();

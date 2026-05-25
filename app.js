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

let memories = [
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

const memoryTrack = document.querySelector("#memoryTrack");
const uploadDialog = document.querySelector("#uploadDialog");
const memoryForm = document.querySelector("#memoryForm");
const processing = document.querySelector("#processing");
const processingTitle = document.querySelector("#processingTitle");
const progressBar = document.querySelector("#progressBar");
const processingSteps = Array.from(document.querySelectorAll("#processingSteps li"));

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

  const mediaUrl = file && file.size > 0 ? URL.createObjectURL(file) : "";
  const mediaType = file && file.size > 0 ? file.type : "";

  memories = [
    {
      title,
      author,
      tag,
      message,
      mediaUrl,
      mediaType,
      mediaLabel: "newly added frame, waiting to become a memory",
      specimens: randomSpecimens(title, message),
      gradient: gradients[Math.floor(Math.random() * gradients.length)],
    },
    ...memories,
  ];

  renderMemories();
  memoryForm.reset();
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

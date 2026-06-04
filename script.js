
const SUPABASE_URL = "TON_URL";
const SUPABASE_KEY = "TON_KEY";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let userId = localStorage.getItem("userId");
if (!userId) {
  userId = crypto.randomUUID();
  localStorage.setItem("userId", userId);
}

let collection = {};
let images = {};
let gameReady = false;

let lastOpen = 0;
const COOLDOWN = 40000;

// ================= CARDS =================

let cardsDB = [
  { id: 1, name: "Flamior", rarity: 1 },
  { id: 2, name: "Leafy", rarity: 1 },
  { id: 3, name: "Rocky", rarity: 1 },
  { id: 4, name: "Aquos", rarity: 2 },
  { id: 5, name: "Pyron", rarity: 2 },
  { id: 6, name: "Voltair", rarity: 3 },
  { id: 7, name: "Froston", rarity: 3 },
  { id: 8, name: "Umbrix", rarity: 5 },
  { id: 9, name: "Dracora EX", rarity: 6 }
];

// ================= INIT =================

async function initGame() {
  await loadCollection();
  loadImages();
  gameReady = true;

  renderCollection();
  startCooldown();
}

// ================= SAFE LOAD =================

async function loadCollection() {

  let { data } = await client
    .from("collections")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  collection = data?.data || {};
}

// ================= SAVE =================

async function saveCollection() {
  await client
    .from("collections")
    .upsert({
      id: userId,
      data: collection
    });
}

// ================= BOOSTER =================

function openBooster() {

  if (!gameReady) return;

  if (Date.now() - lastOpen < COOLDOWN) return;

  lastOpen = Date.now();

  let pack = [];

  for (let i = 0; i < 6; i++) {

    let card = getCard();
    pack.push(card);

    if (!collection[card.id]) {
      collection[card.id] = { copies: 0 };
    }

    collection[card.id].copies++;
  }

  saveCollection();

  renderBooster(pack);
  renderCollection();
}

// ================= CARD =================

function getCard() {
  let rarity = Math.random() < 0.01 ? 6 :
               Math.random() < 0.05 ? 5 :
               Math.random() < 0.15 ? 4 :
               Math.random() < 0.35 ? 3 :
               Math.random() < 0.65 ? 2 : 1;

  let pool = cardsDB.filter(c => c.rarity === rarity);

  return pool[Math.floor(Math.random() * pool.length)];
}

// ================= RENDER BOOSTER =================

function renderBooster(pack) {

  let div = document.getElementById("boosterResult");
  div.innerHTML = "";

  pack.forEach((c, i) => {

    setTimeout(() => {

      let data = collection[c.id];

      let el = document.createElement("div");
      el.className = "card";

      if (c.rarity === 6) el.classList.add("holo");

      el.innerHTML = `
        <p><b>${c.name}</b></p>
        <p>⭐ ${c.rarity}</p>
        <p>x${data?.copies ?? 0}</p>
      `;

      div.appendChild(el);

    }, i * 200);
  });
}

// ================= COLLECTION =================

function renderCollection() {

  let div = document.getElementById("collectionList");
  div.innerHTML = "";

  let count = Object.keys(collection).length;

  let header = document.createElement("div");
  header.innerText = `${count}/${cardsDB.length}`;
  header.style.textAlign = "center";

  div.appendChild(header);

  cardsDB.forEach(c => {

    let el = document.createElement("div");
    el.className = "card";

    let data = collection[c.id];

    if (!data) {
      el.innerHTML = "❓";
    } else {
      el.innerHTML = `
        <p><b>${c.name}</b></p>
        <p>⭐ ${c.rarity}</p>
        <p>x${data.copies}</p>
      `;
    }

    div.appendChild(el);
  });
}

// ================= COOLDOWN =================

function startCooldown() {

  setInterval(() => {

    let el = document.getElementById("cooldown");
    if (!el) return;

    let diff = COOLDOWN - (Date.now() - lastOpen);

    el.innerText = diff > 0
      ? "Cooldown " + Math.ceil(diff / 1000) + "s"
      : "";

  }, 1000);
}

// ================= IMAGES =================

async function uploadImage() {

  let id = document.getElementById("cardIdInput").value;
  let file = document.getElementById("imgInput").files[0];

  let path = `${userId}/${id}.png`;

  await client.storage
    .from("cards")
    .upload(path, file, { upsert: true });

  let { data } = client.storage
    .from("cards")
    .getPublicUrl(path);

  images[id] = data.publicUrl;

  renderCollection();
}

function loadImages() {

  cardsDB.forEach(c => {

    let path = `${userId}/${c.id}.png`;

    let { data } = client.storage
      .from("cards")
      .getPublicUrl(path);

    images[c.id] = data.publicUrl;
  });
}

// ================= START =================

initGame();
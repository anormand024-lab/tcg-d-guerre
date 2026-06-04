
// =====================================================
// SUPABASE INIT
// =====================================================

const SUPABASE_URL = "TON_URL";
const SUPABASE_KEY = "TON_KEY";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =====================================================
// GAME STATE
// =====================================================

let gameReady = false;

let userId = localStorage.getItem("userId");

if (!userId) {
  userId = crypto.randomUUID();
  localStorage.setItem("userId", userId);
}

let collection = {};
let images = {};

let lastOpen = 0;
const COOLDOWN = 40000;

// =====================================================
// CARD DATABASE
// =====================================================

let cardsDB = [
  { id: 1, name: "Flamior", rarity: 1 },
  { id: 2, name: "Leafy", rarity: 1 },
  { id: 3, name: "Rocky", rarity: 1 },
  { id: 4, name: "Aquos", rarity: 2 },
  { id: 5, name: "Pyron", rarity: 2 },
  { id: 6, name: "Florania", rarity: 2 },
  { id: 7, name: "Voltair", rarity: 3 },
  { id: 8, name: "Froston", rarity: 3 },
  { id: 9, name: "Shadowrex", rarity: 4 },
  { id: 10, name: "Umbrix", rarity: 5 },
  { id: 11, name: "Dracora EX", rarity: 6 }
];

// =====================================================
// SAFE INIT LOAD
// =====================================================

async function initGame() {

  await loadCollection();
  loadImages();

  gameReady = true;

  renderCollection();
  startCooldownLoop();
}

// =====================================================
// SUPABASE LOAD SAFE
// =====================================================

async function loadCollection() {

  let { data, error } = await client
    .from("collections")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (data && data.data) {
    collection = data.data;
  } else {
    collection = {};
  }
}

// =====================================================
// SAVE COLLECTION
// =====================================================

async function saveCollection() {

  await client
    .from("collections")
    .upsert({
      id: userId,
      data: collection
    });
}

// =====================================================
// TAB SYSTEM
// =====================================================

function showTab(id) {

  let tabs = document.querySelectorAll(".tab");

  for (let i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove("active");
  }

  document.getElementById(id).classList.add("active");
}

// =====================================================
// RARITY SYSTEM
// =====================================================

function getRarity() {

  let r = Math.random() * 100;

  if (r < 1) return 6;
  if (r < 5) return 5;
  if (r < 15) return 4;
  if (r < 30) return 3;
  if (r < 60) return 2;
  return 1;
}

// =====================================================
// RANDOM CARD
// =====================================================

function getCard() {

  let rarity = getRarity();

  let pool = [];

  for (let i = 0; i < cardsDB.length; i++) {
    if (cardsDB[i].rarity === rarity) {
      pool.push(cardsDB[i]);
    }
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

// =====================================================
// BOOSTER OPEN
// =====================================================

function openBooster() {

  if (!gameReady) return;

  let now = Date.now();

  if (now - lastOpen < COOLDOWN) return;

  lastOpen = now;

  let pack = [];

  document.getElementById("boosterResult").innerHTML = "";

  for (let i = 0; i < 6; i++) {

    let card = getCard();

    pack.push(card);

    if (!collection[card.id]) {
      collection[card.id] = {
        copies: 0,
        discovered: true
      };
    }

    collection[card.id].copies++;
  }

  saveCollection();

  renderBooster(pack);
  renderCollection();
}

// =====================================================
// BOOSTER RENDER
// =====================================================

function renderBooster(pack) {

  let div = document.getElementById("boosterResult");

  div.innerHTML = "";

  for (let i = 0; i < pack.length; i++) {

    setTimeout(() => {

      let c = pack[i];

      let data = collection[c.id];

      if (!data) return;

      let el = document.createElement("div");

      el.className = "card";

      if (c.rarity === 6) {
        el.classList.add("holo");
      }

      let img = images[c.id];

      el.innerHTML = `
        <p><b>${c.name}</b></p>
        <p>⭐ ${c.rarity}</p>
        <p>x${data?.copies ?? 0}</p>
        ${img ? `<img src="${img}">` : ""}
      `;

      div.appendChild(el);

    }, i * 250);
  }
}

// =====================================================
// COLLECTION RENDER
// =====================================================

function renderCollection() {

  let div = document.getElementById("collectionList");

  div.innerHTML = "";

  let count = 0;

  for (let i = 0; i < cardsDB.length; i++) {
    if (collection[cardsDB[i].id]) count++;
  }

  let header = document.createElement("div");

  header.innerText = `📚 ${count}/${cardsDB.length}`;

  header.style.textAlign = "center";
  header.style.fontSize = "18px";

  div.appendChild(header);

  for (let i = 0; i < cardsDB.length; i++) {

    let c = cardsDB[i];

    let el = document.createElement("div");
    el.className = "card";

    let data = collection[c.id];

    if (!data) {
      el.innerHTML = "❓ UNKNOWN";
    } else {
      el.innerHTML = `
        <p><b>${c.name}</b></p>
        <p>⭐ ${c.rarity}</p>
        <p>x${data.copies}</p>
      `;
    }

    div.appendChild(el);
  }
}

// =====================================================
// COOLDOWN LOOP
// =====================================================

function startCooldownLoop() {

  setInterval(() => {

    let el = document.getElementById("cooldown");
    if (!el) return;

    let diff = COOLDOWN - (Date.now() - lastOpen);

    if (diff <= 0) {
      el.innerText = "";
      return;
    }

    el.innerText = `Cooldown : ${Math.ceil(diff / 1000)}s`;

  }, 1000);
}

// =====================================================
// IMAGE UPLOAD (SUPABASE)
// =====================================================

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

// =====================================================
// LOAD IMAGES
// =====================================================

function loadImages() {

  for (let i = 0; i < cardsDB.length; i++) {

    let id = cardsDB[i].id;

    let path = `${userId}/${id}.png`;

    let { data } = client.storage
      .from("cards")
      .getPublicUrl(path);

    images[id] = data.publicUrl;
  }
}

// =====================================================
// START GAME
// =====================================================

initGame();
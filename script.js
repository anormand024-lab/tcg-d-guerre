
// =====================================================
// SUPABASE INIT
// =====================================================

const SUPABASE_URL = "TON_URL";
const SUPABASE_KEY = "TON_KEY";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =====================================================
// USER SYSTEM
// =====================================================

let userId = localStorage.getItem("userId");

if (!userId) {
  userId = crypto.randomUUID();
  localStorage.setItem("userId", userId);
}

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
  { id: 10, name: "Lumina", rarity: 4 },

  { id: 11, name: "Umbrix", rarity: 5 },
  { id: 12, name: "Dracora EX", rarity: 6 }
];

// =====================================================
// DROP SYSTEM
// =====================================================

let dropTable = [
  { rarity: 1, chance: 50 },
  { rarity: 2, chance: 25 },
  { rarity: 3, chance: 15 },
  { rarity: 4, chance: 7 },
  { rarity: 5, chance: 2.5 },
  { rarity: 6, chance: 0.5 }
];

// =====================================================
// COLLECTION DATA
// =====================================================

let collection = {};

// =====================================================
// IMAGES CACHE
// =====================================================

let images = {};

// =====================================================
// COOLDOWN SYSTEM
// =====================================================

let lastOpen = 0;
const COOLDOWN_TIME = 40000;

// =====================================================
// LOAD COLLECTION FROM SUPABASE
// =====================================================

async function loadCollectionFromServer() {

  let { data, error } = await client
    .from("collections")
    .select("*")
    .eq("id", userId)
    .single();

  if (data && data.data) {
    collection = data.data;
  }

  renderCollection();
}

// =====================================================
// SAVE COLLECTION TO SUPABASE
// =====================================================

async function saveCollectionToServer() {

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

function showTab(tabId) {

  let tabs = document.querySelectorAll(".tab");

  for (let i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove("active");
  }

  document.getElementById(tabId).classList.add("active");
}

// =====================================================
// DROP LOGIC (RARITY PICK)
// =====================================================

function getRandomRarity() {

  let rand = Math.random() * 100;
  let sum = 0;

  for (let i = 0; i < dropTable.length; i++) {

    sum += dropTable[i].chance;

    if (rand <= sum) {
      return dropTable[i].rarity;
    }
  }

  return 1;
}

// =====================================================
// GET RANDOM CARD
// =====================================================

function getRandomCard() {

  let rarity = getRandomRarity();

  let pool = [];

  for (let i = 0; i < cardsDB.length; i++) {
    if (cardsDB[i].rarity === rarity) {
      pool.push(cardsDB[i]);
    }
  }

  let index = Math.floor(Math.random() * pool.length);

  return pool[index];
}

// =====================================================
// BOOSTER SYSTEM
// =====================================================

function openBooster() {

  let now = Date.now();

  if (now - lastOpen < COOLDOWN_TIME) {

    let remaining =
      Math.ceil((COOLDOWN_TIME - (now - lastOpen)) / 1000);

    document.getElementById("cooldown").innerText =
      "Cooldown : " + remaining + "s";

    return;
  }

  lastOpen = now;
  localStorage.setItem("lastOpen", lastOpen);

  animateBoosterButton();

  let pack = generatePack(6);

  applyPackToCollection(pack);

  saveCollectionToServer();

  renderBooster(pack);
  renderCollection();

  startCooldownDisplay();
}

// =====================================================
// GENERATE PACK
// =====================================================

function generatePack(size) {

  let pack = [];

  for (let i = 0; i < size; i++) {

    let card = getRandomCard();

    pack.push(card);
  }

  return pack;
}

// =====================================================
// APPLY PACK TO COLLECTION
// =====================================================

function applyPackToCollection(pack) {

  for (let i = 0; i < pack.length; i++) {

    let c = pack[i];

    if (!collection[c.id]) {

      collection[c.id] = {
        copies: 1,
        discovered: true
      };

    } else {

      collection[c.id].copies += 1;
    }
  }
}

// =====================================================
// BOOSTER BUTTON ANIMATION
// =====================================================

function animateBoosterButton() {

  let btn = document.getElementById("openBoosterBtn");

  btn.classList.add("booster-open");

  setTimeout(function () {
    btn.classList.remove("booster-open");
  }, 500);
}

// =====================================================
// BOOSTER RENDER (ANIMATION HEAVY)
// =====================================================

function renderBooster(pack) {

  let container =
    document.getElementById("boosterResult");

  container.innerHTML = "";

  for (let i = 0; i < pack.length; i++) {

    let delay = i * 250;

    setTimeout(function () {

      let card = pack[i];

      let el = document.createElement("div");

      el.className = "card";

      if (card.rarity === 6) {
        el.classList.add("holo");
      }

      let data = collection[card.id];

      let isNew = data.copies === 1;

      let img = images[card.id];

      if (isNew) {

        let tag = document.createElement("div");
        tag.innerText = "NEW";
        tag.style.color = "lime";
        tag.style.fontWeight = "bold";

        el.appendChild(tag);
      }

      if (img) {

        let image = document.createElement("img");
        image.src = img;

        el.appendChild(image);
      }

      let name = document.createElement("p");
      name.innerHTML = "<b>" + card.name + "</b>";

      let rarity = document.createElement("p");
      rarity.innerText = "⭐ " + card.rarity;

      let id = document.createElement("p");
      id.innerText = "ID " + card.id;

      let copies = document.createElement("p");
      copies.innerText = "x" + data.copies;

      el.appendChild(name);
      el.appendChild(rarity);
      el.appendChild(id);
      el.appendChild(copies);

      container.appendChild(el);

    }, delay);
  }
}

// =====================================================
// COLLECTION RENDER
// =====================================================

function renderCollection() {

  let container =
    document.getElementById("collectionList");

  container.innerHTML = "";

  let count = 0;

  for (let i = 0; i < cardsDB.length; i++) {
    if (collection[cardsDB[i].id]) {
      count++;
    }
  }

  let header = document.createElement("div");

  header.innerText =
    "📚 Collection : " +
    count +
    "/" +
    cardsDB.length;

  header.style.textAlign = "center";
  header.style.fontSize = "18px";

  container.appendChild(header);

  for (let i = 0; i < cardsDB.length; i++) {

    let card = cardsDB[i];

    let el = document.createElement("div");
    el.className = "card";

    let data = collection[card.id];

    if (card.rarity === 6 && data) {
      el.classList.add("holo");
    }

    if (!data) {

      el.innerHTML = "❓ UNKNOWN";

    } else {

      let name = document.createElement("p");
      name.innerHTML = "<b>" + card.name + "</b>";

      let rarity = document.createElement("p");
      rarity.innerText = "⭐ " + card.rarity;

      let copies = document.createElement("p");
      copies.innerText = "x" + data.copies;

      el.appendChild(name);
      el.appendChild(rarity);
      el.appendChild(copies);
    }

    container.appendChild(el);
  }
}

// =====================================================
// COOL DOWN DISPLAY LOOP
// =====================================================

function startCooldownDisplay() {

  let interval = setInterval(function () {

    let now = Date.now();

    let diff = COOLDOWN_TIME - (now - lastOpen);

    let el = document.getElementById("cooldown");

    if (!el) {
      clearInterval(interval);
      return;
    }

    if (diff <= 0) {
      el.innerText = "";
      clearInterval(interval);
      return;
    }

    el.innerText =
      "Cooldown : " +
      Math.ceil(diff / 1000) +
      "s";

  }, 1000);
}

// =====================================================
// IMAGE UPLOAD (SUPABASE STORAGE)
// =====================================================

async function uploadImage() {

  let id = document.getElementById("cardIdInput").value;
  let file = document.getElementById("imgInput").files[0];

  let path = userId + "/" + id + ".png";

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

async function loadImages() {

  for (let i = 0; i < cardsDB.length; i++) {

    let id = cardsDB[i].id;

    let path = userId + "/" + id + ".png";

    let { data } = client.storage
      .from("cards")
      .getPublicUrl(path);

    images[id] = data.publicUrl;
  }
}

// =====================================================
// INIT
// =====================================================

loadCollectionFromServer();
loadImages();
renderCollection();
startCooldownDisplay();
// =====================================================
// DATABASE CARDS
// Met l'URL de l'image directement ici si tu veux
// Exemple : url: "https://monsite.com/flamior.png"
// =====================================================

let cardsDB = [
  { id: 1,  name: "Petit PD",     rarity: 1, url: "https://i.postimg.cc/yYbqWpJy/Sans-titre-448-20260602204421.png" },
  { id: 2,  name: "Petit PD",       rarity: 1, url: "https://i.postimg.cc/nzZgN6WR/Sans-titre-449-20260602204431.png" },
  { id: 3,  name: "P de D",       rarity: 1, url: "" },

  { id: 4,  name: "Le Romantique",       rarity: 1, url: "" },
  { id: 5,  name: "Pyron",       rarity: 2, url: "" },
  { id: 6,  name: "Florania",    rarity: 2, url: "" },

  { id: 7,  name: "Voltair",     rarity: 3, url: "" },
  { id: 8,  name: "Froston",     rarity: 3, url: "" },

  { id: 9,  name: "Shadowrex",   rarity: 4, url: "" },
  { id: 10, name: "Lumina",      rarity: 4, url: "" },

  { id: 11, name: "Umbrix",      rarity: 5, url: "" },
  { id: 12, name: "Dracora EX",  rarity: 6, url: "" }
];

// =====================================================
// DROP SYSTEM
// =====================================================

let dropRates = [
  { rarity: 1, chance: 45 },
  { rarity: 2, chance: 25 },
  { rarity: 3, chance: 15 },
  { rarity: 4, chance: 10 },
  { rarity: 5, chance: 4  },
  { rarity: 6, chance: 1  }
];

// =====================================================
// STORAGE SYSTEM
// =====================================================

let collection = JSON.parse(localStorage.getItem("collection")) || {};
let lastBoosterOpen = Number(localStorage.getItem("lastBoosterOpen")) || 0;

// =====================================================
// GET CARD IMAGE
// Priorité 1 : url dans cardsDB
// Priorité 2 : image sauvegardée via l'admin
// =====================================================

function getCardImage(card) {
  if (card.url && card.url.trim() !== "") {
    return card.url.trim();
  }
  let stored = localStorage.getItem("img_" + card.id);
  return stored || null;
}

// =====================================================
// TAB SYSTEM
// =====================================================

function showTab(tabId) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
}

// =====================================================
// RANDOM RARITY SELECTION
// =====================================================

function getRandomRarity() {
  let rand = Math.random() * 100;
  let cumulative = 0;
  for (let r of dropRates) {
    cumulative += r.chance;
    if (rand <= cumulative) return r.rarity;
  }
  return 1;
}

// =====================================================
// GET RANDOM CARD
// =====================================================

function getRandomCard() {
  let rarity = getRandomRarity();
  let pool = cardsDB.filter(c => c.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}

// =====================================================
// BOOSTER SYSTEM
// =====================================================

function openBooster() {
  let now = Date.now();
  let cooldown = 40000;

  if (now - lastBoosterOpen < cooldown) {
    let remaining = Math.ceil((cooldown - (now - lastBoosterOpen)) / 1000);
    document.getElementById("cooldown").innerText = "Cooldown : " + remaining + "s";
    return;
  }

  lastBoosterOpen = now;
  localStorage.setItem("lastBoosterOpen", lastBoosterOpen);
  animateBoosterButton();

  let pack = generatePack(6);
  saveCollection(pack);
  renderBooster(pack);
  renderCollection();
  startCooldown();
}

// =====================================================
// GENERATE PACK
// =====================================================

function generatePack(size) {
  let pack = [];
  for (let i = 0; i < size; i++) pack.push(getRandomCard());
  return pack;
}

// =====================================================
// SAVE COLLECTION
// =====================================================

function saveCollection(pack) {
  pack.forEach(card => {
    if (!collection[card.id]) {
      collection[card.id] = { discovered: true, copies: 1 };
    } else {
      collection[card.id].copies += 1;
    }
  });
  localStorage.setItem("collection", JSON.stringify(collection));
}

// =====================================================
// BOOSTER BUTTON ANIMATION
// =====================================================

function animateBoosterButton() {
  let btn = document.getElementById("openBoosterBtn");
  btn.classList.add("booster-open");
  setTimeout(() => btn.classList.remove("booster-open"), 500);
}

// =====================================================
// BOOSTER RENDER
// =====================================================

function renderBooster(pack) {
  let container = document.getElementById("boosterResult");
  container.innerHTML = "";

  pack.forEach((card, index) => {
    setTimeout(() => {
      let el = document.createElement("div");
      el.className = "card";
      if (card.rarity === 6) el.classList.add("holo");

      let data = collection[card.id];
      let isNew = data.copies === 1;
      let imgSrc = getCardImage(card);

      if (isNew) {
        let newTag = document.createElement("div");
        newTag.innerText = "NEW";
        newTag.style.color = "lime";
        newTag.style.fontWeight = "bold";
        el.appendChild(newTag);
      }

      if (imgSrc) {
        let image = document.createElement("img");
        image.src = imgSrc;
        el.appendChild(image);
      }

      let name = document.createElement("p");
      name.innerHTML = "<b>" + card.name + "</b>";
      let rarity = document.createElement("p");
      rarity.innerText = "⭐ " + card.rarity;
      let id = document.createElement("p");
      id.innerText = "ID " + card.id;
      let copy = document.createElement("p");
      copy.innerText = "x" + data.copies;

      el.appendChild(name);
      el.appendChild(rarity);
      el.appendChild(id);
      el.appendChild(copy);
      container.appendChild(el);

    }, index * 250);
  });
}

// =====================================================
// COLLECTION RENDER
// =====================================================

function renderCollection() {
  let container = document.getElementById("collectionList");
  container.innerHTML = "";

  let count = 0;
  for (let c of cardsDB) { if (collection[c.id]) count++; }

  let header = document.createElement("div");
  header.innerText = "📚 Collection : " + count + "/" + cardsDB.length;
  header.style.textAlign = "center";
  header.style.fontSize = "18px";
  container.appendChild(header);

  cardsDB.forEach(card => {
    let data = collection[card.id];
    let el = document.createElement("div");
    el.className = "card";
    if (card.rarity === 6 && data) el.classList.add("holo");

    if (!data) {
      el.innerHTML = "❓ UNKNOWN";
    } else {
      let imgSrc = getCardImage(card);

      if (imgSrc) {
        let image = document.createElement("img");
        image.src = imgSrc;
        el.appendChild(image);
      }

      let text = document.createElement("p");
      text.innerHTML = "<b>" + card.name + "</b>";
      let rarity = document.createElement("p");
      rarity.innerText = "⭐ " + card.rarity;
      let copies = document.createElement("p");
      copies.innerText = "x" + data.copies;

      el.appendChild(text);
      el.appendChild(rarity);
      el.appendChild(copies);
    }

    container.appendChild(el);
  });
}

// =====================================================
// COOLDOWN SYSTEM
// =====================================================

function startCooldown() {
  let interval = setInterval(() => {
    let now = Date.now();
    let diff = 40000 - (now - lastBoosterOpen);
    let el = document.getElementById("cooldown");
    if (!el) { clearInterval(interval); return; }
    if (diff <= 0) {
      el.innerText = "";
      clearInterval(interval);
      return;
    }
    el.innerText = "Cooldown : " + Math.ceil(diff / 1000) + "s";
  }, 1000);
}

// =====================================================
// IMAGE UPLOAD (URL ou fichier)
// =====================================================

function uploadImage() {
  let id = document.getElementById("cardIdInput").value.trim();

  if (!id) {
    alert("Entre un ID de carte.");
    return;
  }

  let url = document.getElementById("imgUrlInput").value.trim();

  if (url !== "") {
    localStorage.setItem("img_" + id, url);
    renderCollection();
    alert("✅ Image enregistrée pour la carte ID " + id);
    return;
  }

  let file = document.getElementById("imgInput").files[0];
  if (!file) {
    alert("Entre une URL ou choisis un fichier.");
    return;
  }

  let reader = new FileReader();
  reader.onload = function(e) {
    localStorage.setItem("img_" + id, e.target.result);
    renderCollection();
    alert("✅ Image enregistrée pour la carte ID " + id);
  };
  reader.readAsDataURL(file);
}

// =====================================================
// INIT
// =====================================================

renderCollection();
startCooldown();
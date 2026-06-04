
// =====================
// CARDS DATABASE
// =====================

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

// =====================
// DROP RATES
// =====================

const rarityRates = [
  { rarity: 1, chance: 45 },
  { rarity: 2, chance: 25 },
  { rarity: 3, chance: 15 },
  { rarity: 4, chance: 10 },
  { rarity: 5, chance: 4 },
  { rarity: 6, chance: 1 }
];

// =====================
// STORAGE
// =====================

let collectionData =
  JSON.parse(localStorage.getItem("collectionData")) || {};

let lastOpen =
  Number(localStorage.getItem("lastOpen")) || 0;

// =====================
// TABS
// =====================

function showTab(tab) {
  document.querySelectorAll(".tab")
    .forEach(t => t.classList.remove("active"));

  document.getElementById(tab)
    .classList.add("active");
}

// =====================
// RANDOM CARD
// =====================

function getRandomCard() {

  let rand = Math.random() * 100;
  let sum = 0;

  for (let r of rarityRates) {
    sum += r.chance;
    if (rand <= sum) {
      let pool = cardsDB.filter(c => c.rarity === r.rarity);
      return pool[Math.floor(Math.random() * pool.length)];
    }
  }
}

// =====================
// OPEN BOOSTER
// =====================

function openBooster() {

  let now = Date.now();

  if (now - lastOpen < 40000) {
    document.getElementById("cooldown").innerText =
      "Cooldown : " + Math.ceil((40000 - (now - lastOpen))/1000) + "s";
    return;
  }

  lastOpen = now;
  localStorage.setItem("lastOpen", lastOpen);

  let btn = document.getElementById("openBoosterBtn");
  btn.classList.add("booster-open");
  setTimeout(() => btn.classList.remove("booster-open"), 500);

  let pack = [];
  document.getElementById("boosterResult").innerHTML = "";

  for (let i = 0; i < 6; i++) {

    let card = getRandomCard();
    pack.push(card);

    if (!collectionData[card.id]) {
      collectionData[card.id] = { discovered: true, copies: 1 };
    } else {
      collectionData[card.id].copies++;
    }
  }

  localStorage.setItem("collectionData", JSON.stringify(collectionData));

  renderBooster(pack);
  renderCollection();
}

// =====================
// BOOSTER DISPLAY
// =====================

function renderBooster(pack) {

  let div = document.getElementById("boosterResult");

  pack.forEach((c, i) => {

    setTimeout(() => {

      let card = document.createElement("div");
      card.className = "card";

      if (c.rarity === 6) card.classList.add("holo");

      let data = collectionData[c.id];
      let isNew = data.copies === 1;

      let img = localStorage.getItem("img_" + c.id);

      card.innerHTML = `
        ${isNew ? "<b style='color:lime'>NEW</b>" : ""}
        ${img ? `<img src="${img}">` : ""}
        <p><b>${c.name}</b></p>
        <p>⭐ ${c.rarity}</p>
        <p>x${data.copies}</p>
      `;

      div.appendChild(card);

    }, i * 250);
  });
}

// =====================
// COLLECTION
// =====================

function renderCollection() {

  let div = document.getElementById("collectionList");
  div.innerHTML = "";

  let count = 0;

  cardsDB.forEach(c => {
    if (collectionData[c.id]) count++;
  });

  let header = document.createElement("div");
  header.innerHTML = `📚 ${count}/${cardsDB.length}`;
  header.style.textAlign = "center";
  header.style.fontSize = "18px";
  header.style.marginBottom = "10px";

  div.appendChild(header);

  cardsDB.forEach(c => {

    let data = collectionData[c.id];

    let card = document.createElement("div");
    card.className = "card";

    if (c.rarity === 6 && data) card.classList.add("holo");

    if (!data) {
      card.innerHTML = "❓ Unknown";
    } else {
      card.innerHTML = `
        <p><b>${c.name}</b></p>
        <p>⭐ ${c.rarity}</p>
        <p>x${data.copies}</p>
      `;
    }

    div.appendChild(card);
  });
}

// =====================
// ADMIN IMAGE
// =====================

function uploadImage() {

  let id = document.getElementById("cardIdInput").value;
  let file = document.getElementById("imgInput").files[0];

  let reader = new FileReader();

  reader.onload = e => {
    localStorage.setItem("img_" + id, e.target.result);
    renderCollection();
  };

  reader.readAsDataURL(file);
}

// =====================
// INIT
// =====================

renderCollection();
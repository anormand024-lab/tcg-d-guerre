// =====================
// CARDS DB
// =====================

let cardsDB = [
  { id: 1, name: "Flamior", rarity: 1 },
  { id: 2, name: "Leafy", rarity: 1 },
  { id: 3, name: "Rocky", rarity: 1 },

  { id: 4, name: "Aquos", rarity: 2 },
  { id: 5, name: "Pyron", rarity: 2 },

  { id: 6, name: "Voltair", rarity: 3 },
  { id: 7, name: "Froston", rarity: 3 },

  { id: 8, name: "Shadowrex", rarity: 4 },

  { id: 9, name: "Umbrix", rarity: 5 },

  { id: 10, name: "Dracora EX", rarity: 6 }
];

// =====================
// DROP RATE
// =====================

const rates = [
  { r: 1, c: 45 },
  { r: 2, c: 25 },
  { r: 3, c: 15 },
  { r: 4, c: 10 },
  { r: 5, c: 4 },
  { r: 6, c: 1 }
];

// =====================
// STORAGE
// =====================

let data =
  JSON.parse(localStorage.getItem("collection")) || {};

let lastOpen =
  Number(localStorage.getItem("lastOpen")) || 0;

// =====================
// TABS
// =====================

function showTab(t) {
  document.querySelectorAll(".tab")
    .forEach(x => x.classList.remove("active"));

  document.getElementById(t).classList.add("active");
}

// =====================
// RANDOM CARD
// =====================

function getCard() {
  let x = Math.random() * 100;
  let sum = 0;

  for (let i of rates) {
    sum += i.c;
    if (x <= sum) {
      let pool = cardsDB.filter(c => c.rarity === i.r);
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
      "Cooldown " + Math.ceil((40000 - (now - lastOpen))/1000) + "s";
    return;
  }

  lastOpen = now;
  localStorage.setItem("lastOpen", lastOpen);

  let btn = document.getElementById("openBoosterBtn");
  btn.classList.add("booster-open");
  setTimeout(() => btn.classList.remove("booster-open"), 500);

  let container = document.getElementById("boosterResult");
  container.innerHTML = "";

  let pack = [];

  for (let i = 0; i < 6; i++) {

    let card = getCard();
    pack.push(card);

    if (!data[card.id]) {
      data[card.id] = { copies: 1 };
    } else {
      data[card.id].copies++;
    }
  }

  localStorage.setItem("collection", JSON.stringify(data));

  renderBooster(pack);
  renderCollection();
}

// =====================
// BOOSTER ANIMATION (IMPORTANT)
// =====================

function renderBooster(pack) {

  let div = document.getElementById("boosterResult");

  pack.forEach((c, i) => {

    setTimeout(() => {

      let el = document.createElement("div");
      el.className = "card";

      // HOLO
      if (c.rarity === 6) el.classList.add("holo");

      let isNew = data[c.id].copies === 1;

      el.innerHTML = `
        ${isNew ? "<b style='color:lime'>NEW</b>" : ""}
        <p><b>${c.name}</b></p>
        <p>⭐ ${c.rarity}</p>
        <p>x${data[c.id].copies}</p>
      `;

      div.appendChild(el);

    }, i * 250); // IMPORTANT animation timing

  });
}

// =====================
// COLLECTION
// =====================

function renderCollection() {

  let div = document.getElementById("collectionList");
  div.innerHTML = "";

  let count = Object.keys(data).length;

  let header = document.createElement("div");
  header.innerHTML = `📚 ${count}/${cardsDB.length}`;
  header.style.textAlign = "center";
  header.style.marginBottom = "10px";

  div.appendChild(header);

  cardsDB.forEach(c => {

    let d = data[c.id];

    let el = document.createElement("div");
    el.className = "card";

    if (c.rarity === 6 && d) el.classList.add("holo");

    if (!d) {
      el.innerHTML = "❓ Unknown";
    } else {
      el.innerHTML = `
        <p><b>${c.name}</b></p>
        <p>⭐ ${c.rarity}</p>
        <p>x${d.copies}</p>
      `;
    }

    div.appendChild(el);
  });
}

// =====================
// INIT
// =====================

renderCollection();
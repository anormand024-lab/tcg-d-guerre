
// =====================
// DATABASE CARTES
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

  document.getElementById(tab).classList.add("active");
}

// =====================
// RANDOM CARD (DROP SYSTEM)
// =====================

function getRandomCard() {

  let rand = Math.random() * 100;

  let cumulative = 0;
  let selectedRarity = 1;

  for (let rate of rarityRates) {
    cumulative += rate.chance;

    if (rand <= cumulative) {
      selectedRarity = rate.rarity;
      break;
    }
  }

  let filtered =
    cardsDB.filter(c => c.rarity === selectedRarity);

  return filtered[
    Math.floor(Math.random() * filtered.length)
  ];
}

// =====================
// OPEN BOOSTER
// =====================

function openBooster() {

  let now = Date.now();

  // cooldown
  if (now - lastOpen < 40000) {
    let remaining =
      Math.ceil((40000 - (now - lastOpen)) / 1000);

    document.getElementById("cooldown").innerText =
      "Cooldown : " + remaining + "s";

    return;
  }

  lastOpen = now;
  localStorage.setItem("lastOpen", lastOpen);

  let btn =
    document.getElementById("openBoosterBtn");

  btn.classList.add("booster-open");

  setTimeout(() => {
    btn.classList.remove("booster-open");
  }, 600);

  document.getElementById("boosterResult").innerHTML = "";

  let pack = [];

  for (let i = 0; i < 6; i++) {

    let card = getRandomCard();
    pack.push(card);

    // =====================
    // COLLECTION LOGIC
    // =====================

    if (!collectionData[card.id]) {
      collectionData[card.id] = {
        discovered: true,
        copies: 1
      };
    } else {
      collectionData[card.id].copies++;
    }
  }

  localStorage.setItem(
    "collectionData",
    JSON.stringify(collectionData)
  );

  renderBoosterAnimated(pack);
  renderCollection();
  startCooldown();
}

// =====================
// BOOSTER ANIMATION
// =====================

function renderBoosterAnimated(pack) {

  let container =
    document.getElementById("boosterResult");

  container.innerHTML = "";

  pack.forEach((c, index) => {

    setTimeout(() => {

      let card =
        document.createElement("div");

      card.className = "card";

      // 🌈 HOLO EFFECT (RARITY 6)
      if (c.rarity === 6) {
        card.classList.add("holo");
        card.style.boxShadow = "0 0 30px gold";
        card.style.border = "2px solid gold";
      }

      // NEW CARD
      let isNew =
        collectionData[c.id].copies === 1;

      let img =
        localStorage.getItem("img_" + c.id);

      card.innerHTML = `

        ${isNew ? `
          <div style="
            background:#00ff66;
            color:black;
            font-weight:bold;
            padding:4px 8px;
            border-radius:8px;
            margin-bottom:6px;
            display:inline-block;
          ">
            NEW
          </div>
        ` : ""}

        ${img ?
          `<img src="${img}" style="width:100%; border-radius:12px;">`
          : ""
        }

        ${getRarityBadge(c.rarity)}

        <p><b>${c.name}</b></p>

        <p>ID : ${c.id}</p>

      `;

      container.appendChild(card);

    }, index * 300);
  });
}

// =====================
// COLLECTION DISPLAY
// =====================

function renderCollection() {

  let div =
    document.getElementById("collectionList");

  div.innerHTML = "";

  let discoveredCount = 0;

  cardsDB.forEach(cardData => {

    let saved =
      collectionData[cardData.id];

    let discovered =
      saved?.discovered || false;

    if (discovered) discoveredCount++;
  });

  let header =
    document.createElement("div");

  header.style.textAlign = "center";
  header.style.fontSize = "20px";
  header.style.fontWeight = "bold";
  header.style.marginBottom = "15px";

  header.innerHTML =
    `📚 Collection : ${discoveredCount}/${cardsDB.length}`;

  div.appendChild(header);

  cardsDB.forEach(cardData => {

    let saved =
      collectionData[cardData.id];

    let discovered =
      saved?.discovered || false;

    let img =
      localStorage.getItem("img_" + cardData.id);

    let card =
      document.createElement("div");

    card.className = "card";

    // 🌈 HOLO COLLECTION
    if (cardData.rarity === 6 && discovered) {
      card.classList.add("holo");
      card.style.boxShadow = "0 0 25px gold";
    }

    if (!discovered) {

      card.innerHTML = `
        <div style="
          height:140px;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:60px;
          opacity:0.4;
        ">
          ?
        </div>
        <p><b>Carte inconnue</b></p>
        <p>???</p>
      `;

    } else {

      card.innerHTML = `

        ${img ?
          `<img src="${img}" style="width:100%; border-radius:12px;">`
          : ""
        }

        ${getRarityBadge(cardData.rarity)}

        <p><b>${cardData.name}</b></p>

        <p>ID : ${cardData.id}</p>

        <p>🔁 x${saved.copies}</p>

      `;
    }

    div.appendChild(card);
  });
}

// =====================
// COOLDOWN
// =====================

function startCooldown() {

  let interval = setInterval(() => {

    let now = Date.now();

    let diff =
      40000 - (now - lastOpen);

    let text =
      document.getElementById("cooldown");

    if (!text) return clearInterval(interval);

    if (diff <= 0) {
      text.innerText = "";
      return clearInterval(interval);
    }

    text.innerText =
      "Cooldown : " +
      Math.ceil(diff / 1000) +
      "s";

  }, 1000);
}

// =====================
// IMAGE UPLOAD
// =====================

function uploadImage() {

  let id =
    document.getElementById("cardIdInput").value;

  let file =
    document.getElementById("imgInput").files[0];

  if (!id || !file) {
    alert("ID ou image manquant");
    return;
  }

  let reader =
    new FileReader();

  reader.onload = function (e) {

    localStorage.setItem(
      "img_" + id,
      e.target.result
    );

    alert("Image uploadée !");
    renderCollection();
  };

  reader.readAsDataURL(file);
}

// =====================
// RARITY BADGE
// =====================

function getRarityBadge(r) {

  let colors = [
    "#9e9e9e",
    "#4fc3f7",
    "#66bb6a",
    "#ffd54f",
    "#ba68c8",
    "#ff7043"
  ];

  return `
    <div style="
      font-size:12px;
      background:${colors[r - 1]};
      display:inline-block;
      padding:5px 9px;
      border-radius:10px;
      margin-bottom:8px;
      font-weight:bold;
    ">
      ★ ${r}
    </div>
  `;
}

// =====================
// INIT
// =====================

renderCollection();
startCooldown();
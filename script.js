
// =====================
// DATABASE CARTES
// =====================

let cardsDB = [

  // ⭐ 1
  { id: 1, name: "Flamior", rarity: 1 },
  { id: 2, name: "Leafy", rarity: 1 },
  { id: 3, name: "Rocky", rarity: 1 },

  // ⭐ 2
  { id: 4, name: "Aquos", rarity: 2 },
  { id: 5, name: "Pyron", rarity: 2 },
  { id: 6, name: "Florania", rarity: 2 },

  // ⭐ 3
  { id: 7, name: "Voltair", rarity: 3 },
  { id: 8, name: "Froston", rarity: 3 },

  // ⭐ 4
  { id: 9, name: "Shadowrex", rarity: 4 },
  { id: 10, name: "Lumina", rarity: 4 },

  // ⭐ 5
  { id: 11, name: "Umbrix", rarity: 5 },

  // ⭐ 6
  { id: 12, name: "Dracora EX", rarity: 6 }

];

// =====================
// TAUX DE DROP
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

let collection =
  JSON.parse(localStorage.getItem("collection")) || [];

let lastOpen =
  Number(localStorage.getItem("lastOpen")) || 0;

// =====================
// TABS
// =====================

function showTab(tab) {

  document
    .querySelectorAll(".tab")
    .forEach(t => t.classList.remove("active"));

  document
    .getElementById(tab)
    .classList.add("active");
}

// =====================
// RANDOM CARD WITH DROP RATE
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

  // save timer
  lastOpen = now;
  localStorage.setItem("lastOpen", lastOpen);

  // bouton animation
  let btn =
    document.getElementById("openBoosterBtn");

  btn.classList.add("booster-open");

  setTimeout(() => {
    btn.classList.remove("booster-open");
  }, 600);

  // clear ancien booster
  document.getElementById("boosterResult").innerHTML = "";

  // génération cartes
  let pack = [];

  for (let i = 0; i < 6; i++) {

    let card = getRandomCard();

    pack.push(card);
    collection.push(card);
  }

  // save collection
  localStorage.setItem(
    "collection",
    JSON.stringify(collection)
  );

  // animations
  renderBoosterAnimated(pack);

  // refresh collection
  renderCollection();

  // cooldown
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

      // glow rare
      if (c.rarity >= 5) {

        card.style.boxShadow =
          "0 0 25px gold";

        card.style.border =
          "2px solid gold";
      }

      // image
      let img =
        localStorage.getItem("img_" + c.id);

      card.innerHTML = `

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
// COLLECTION
// =====================

function renderCollection() {

  let div =
    document.getElementById("collectionList");

  if (!div) return;

  div.innerHTML = "";

  collection.forEach((c, index) => {

    let img =
      localStorage.getItem("img_" + c.id);

    let card =
      document.createElement("div");

    card.className = "card";

    // glow rare
    if (c.rarity >= 5) {

      card.style.boxShadow =
        "0 0 20px gold";

      card.style.border =
        "2px solid gold";
    }

    card.innerHTML = `

      ${img ?
        `<img src="${img}" style="width:100%; border-radius:12px;">`
        : ""
      }

      ${getRarityBadge(c.rarity)}

      <p><b>${c.name}</b></p>

      <p>ID : ${c.id}</p>

    `;

    div.appendChild(card);
  });
}

// =====================
// COOLDOWN DISPLAY
// =====================

function startCooldown() {

  let interval = setInterval(() => {

    let now = Date.now();

    let diff =
      40000 - (now - lastOpen);

    let text =
      document.getElementById("cooldown");

    if (!text) {
      clearInterval(interval);
      return;
    }

    if (diff <= 0) {

      text.innerText = "";

      clearInterval(interval);

      return;
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

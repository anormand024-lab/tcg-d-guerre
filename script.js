
let cardsDB = [
  { id: 1, name: "Flamior", rarity: 2 },
  { id: 2, name: "Aquos", rarity: 3 },
  { id: 3, name: "Terranox", rarity: 1 },
  { id: 4, name: "Voltair", rarity: 4 },
  { id: 5, name: "Umbrix", rarity: 5 },
  { id: 6, name: "Dracora", rarity: 6 }
];

// =====================
// STORAGE
// =====================
let collection = JSON.parse(localStorage.getItem("collection")) || [];
let lastOpen = Number(localStorage.getItem("lastOpen")) || 0;

// =====================
// TABS
// =====================
function showTab(tab) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(tab).classList.add("active");
}

// =====================
// BOOSTER MAIN FUNCTION
// =====================
function openBooster() {
  let now = Date.now();

  // cooldown
  if (now - lastOpen < 40000) {
    let remaining = Math.ceil((40000 - (now - lastOpen)) / 1000);
    document.getElementById("cooldown").innerText =
      "Cooldown: " + remaining + "s";
    return;
  }

  lastOpen = now;
  localStorage.setItem("lastOpen", lastOpen);

  // bouton animation
  let btn = document.getElementById("openBoosterBtn");
  btn.classList.add("booster-open");
  setTimeout(() => btn.classList.remove("booster-open"), 600);

  // génération pack
  let pack = [];
  for (let i = 0; i < 6; i++) {
    let card = cardsDB[Math.floor(Math.random() * cardsDB.length)];
    pack.push(card);
    collection.push(card);
  }

  localStorage.setItem("collection", JSON.stringify(collection));

  // IMPORTANT : reset UI avant animation
  document.getElementById("boosterResult").innerHTML = "";

  renderBoosterAnimated(pack);
  renderCollection();
  startCooldown();
}

// =====================
// BOOSTER ANIMATION (IMPORTANT FIX)
// =====================
function renderBoosterAnimated(pack) {
  let container = document.getElementById("boosterResult");

  if (!container) return;

  container.innerHTML = "";

  pack.forEach((c, index) => {
    setTimeout(() => {
      let card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        ${getRarityBadge(c.rarity)}
        <p><b>${c.name}</b></p>
        <p>ID: ${c.id}</p>
      `;

      container.appendChild(card);

    }, index * 250);
  });
}

// =====================
// COLLECTION
// =====================
function renderCollection() {
  let div = document.getElementById("collectionList");
  if (!div) return;

  div.innerHTML = "";

  collection.forEach((c, index) => {
    let img = localStorage.getItem("img_" + c.id);

    let card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      ${img ? `<img src="${img}" style="width:100%; border-radius:10px;">` : ""}
      ${getRarityBadge(c.rarity)}
      <p><b>${c.name}</b></p>
      <p>ID: ${c.id}</p>
    `;

    div.appendChild(card);
  });
}

// =====================
// COOLDOWN VISUAL
// =====================
function startCooldown() {
  let interval = setInterval(() => {
    let now = Date.now();
    let diff = 40000 - (now - lastOpen);

    let cooldownText = document.getElementById("cooldown");

    if (!cooldownText) {
      clearInterval(interval);
      return;
    }

    if (diff <= 0) {
      cooldownText.innerText = "";
      clearInterval(interval);
      return;
    }

    cooldownText.innerText =
      "Cooldown: " + Math.ceil(diff / 1000) + "s";

  }, 1000);
}

// =====================
// ADMIN IMAGE UPLOAD
// =====================
function uploadImage() {
  let id = document.getElementById("cardIdInput").value;
  let file = document.getElementById("imgInput").files[0];

  if (!id || !file) {
    alert("ID ou image manquant");
    return;
  }

  let reader = new FileReader();

  reader.onload = function (e) {
    localStorage.setItem("img_" + id, e.target.result);
    alert("Image uploadée !");
    renderCollection();
  };

  reader.readAsDataURL(file);
}

// =====================
// RARITY BADGE
// =====================
function getRarityBadge(r) {
  let colors = ["#aaa", "#4fc3f7", "#81c784", "#ffd54f", "#ba68c8", "#ff7043"];

  return `
    <div style="
      font-size:12px;
      background:${colors[r - 1]};
      display:inline-block;
      padding:4px 8px;
      border-radius:8px;
      margin-bottom:6px;
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
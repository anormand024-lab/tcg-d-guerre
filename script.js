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
let lastOpen = parseInt(localStorage.getItem("lastOpen")) || 0;

// =====================
// TABS
// =====================
function showTab(tab) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(tab).classList.add("active");
}

// =====================
// BOOSTER OPEN
// =====================
function openBooster() {
  let now = Date.now();

  // cooldown 40s
  if (now - lastOpen < 40000) {
    let remaining = Math.ceil((40000 - (now - lastOpen)) / 1000);
    document.getElementById("cooldown").innerText =
      "Cooldown: " + remaining + "s";
    return;
  }

  lastOpen = now;
  localStorage.setItem("lastOpen", lastOpen);

  let btn = document.getElementById("openBoosterBtn");

  // animation bouton
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

  renderBooster
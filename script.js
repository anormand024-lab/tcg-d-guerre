let cardsDB = [
  { id: 1, name: "Flamior", rarity: 2 },
  { id: 2, name: "Aquos", rarity: 3 },
  { id: 3, name: "Terranox", rarity: 1 },
  { id: 4, name: "Voltair", rarity: 4 },
  { id: 5, name: "Umbrix", rarity: 5 },
  { id: 6, name: "Dracora", rarity: 6 }
];

let collection = JSON.parse(localStorage.getItem("collection")) || [];
let lastOpen = localStorage.getItem("lastOpen") || 0;

// TAB SYSTEM
function showTab(tab) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(tab).classList.add("active");
}

// BOOSTER SYSTEM
function openBooster() {
  let now = Date.now();
  if (now - lastOpen < 40000) {
    let remaining = Math.ceil((40000 - (now - lastOpen)) / 1000);
    document.getElementById("cooldown").innerText = "Cooldown: " + remaining + "s";
    return;
  }

  lastOpen = now;
  localStorage.setItem("lastOpen", lastOpen);

  let pack = [];

  for (let i = 0; i < 6; i++) {
    let card = cardsDB[Math.floor(Math.random() * cardsDB.length)];
    pack.push(card);
    collection.push(card);
  }

  localStorage.setItem("collection", JSON.stringify(collection));

  renderBooster(pack);
  renderCollection();
  startCooldown();
}

function renderBooster(pack) {
  let div = document.getElementById("boosterResult");
  div.innerHTML = "";

  pack.forEach(c => {
    div.innerHTML += `
      <div class="card">
        <p>${c.name}</p>
        <p>Rareté: ${c.rarity}</p>
        <p>ID: ${c.id}</p>
      </div>
    `;
  });
}

// COLLECTION
function renderCollection() {
  let div = document.getElementById("collectionList");
  div.innerHTML = "";

  collection.forEach(c => {
    let img = localStorage.getItem("img_" + c.id);

    div.innerHTML += `
      <div class="card">
        ${img ? `<img src="${img}" width="100">` : ""}
        <p>${c.name}</p>
        <p>ID: ${c.id}</p>
      </div>
    `;
  });
}

// COOLDOWN
function startCooldown() {
  let btn = document.getElementById("openBoosterBtn");

  let interval = setInterval(() => {
    let now = Date.now();
    let diff = 40000 - (now - lastOpen);

    if (diff <= 0) {
      clearInterval(interval);
      document.getElementById("cooldown").innerText = "";
      return;
    }

    document.getElementById("cooldown").innerText =
      "Cooldown: " + Math.ceil(diff / 1000) + "s";
  }, 1000);
}

// ADMIN UPLOAD IMAGE
function uploadImage() {
  let id = document.getElementById("cardIdInput").value;
  let file = document.getElementById("imgInput").files[0];

  let reader = new FileReader();
  reader.onload = function (e) {
    localStorage.setItem("img_" + id, e.target.result);
    alert("Image uploadée !");
    renderCollection();
  };

  reader.readAsDataURL(file);
}

// INIT
renderCollection();
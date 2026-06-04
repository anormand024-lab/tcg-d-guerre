
// =====================================================
// DATABASE CARDS
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

let dropRates = [
  { rarity: 1, chance: 45 },
  { rarity: 2, chance: 25 },
  { rarity: 3, chance: 15 },
  { rarity: 4, chance: 10 },
  { rarity: 5, chance: 4 },
  { rarity: 6, chance: 1 }
];

// =====================================================
// STORAGE SYSTEM
// =====================================================

let collection =
  JSON.parse(localStorage.getItem("collection")) || {};

let lastBoosterOpen =
  Number(localStorage.getItem("lastBoosterOpen")) || 0;

// =====================================================
// TAB SYSTEM
// =====================================================

function showTab(tabId) {

  let tabs = document.querySelectorAll(".tab");

  tabs.forEach(t => {
    t.classList.remove("active");
  });

  document.getElementById(tabId)
    .classList.add("active");
}

// =====================================================
// RANDOM RARITY SELECTION
// =====================================================

function getRandomRarity() {

  let rand = Math.random() * 100;
  let cumulative = 0;

  for (let r of dropRates) {

    cumulative += r.chance;

    if (rand <= cumulative) {
      return r.rarity;
    }
  }

  return 1;
}

// =====================================================
// GET RANDOM CARD
// =====================================================

function getRandomCard() {

  let rarity = getRandomRarity();

  let pool = cardsDB.filter(c => c.rarity === rarity);

  let index = Math.floor(Math.random() * pool.length);

  return pool[index];
}

// =====================================================
// BOOSTER SYSTEM
// =====================================================

function openBooster() {

  let now = Date.now();

  let cooldown = 40000;

  if (now - lastBoosterOpen < cooldown) {

    let remaining =
      Math.ceil((cooldown - (now - lastBoosterOpen)) / 1000);

    document.getElementById("cooldown").innerText =
      "Cooldown : " + remaining + "s";

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

  for (let i = 0; i < size; i++) {

    let card = getRandomCard();

    pack.push(card);
  }

  return pack;
}

// =====================================================
// SAVE COLLECTION LOGIC
// =====================================================

function saveCollection(pack) {

  pack.forEach(card => {

    if (!collection[card.id]) {

      collection[card.id] = {
        discovered: true,
        copies: 1
      };

    } else {

      collection[card.id].copies += 1;
    }
  });

  localStorage.setItem(
    "collection",
    JSON.stringify(collection)
  );
}

// =====================================================
// BOOSTER BUTTON ANIMATION
// =====================================================

function animateBoosterButton() {

  let btn =
    document.getElementById("openBoosterBtn");

  btn.classList.add("booster-open");

  setTimeout(() => {

    btn.classList.remove("booster-open");

  }, 500);
}

// =====================================================
// BOOSTER RENDER (ANIMATION IMPORTANT)
// =====================================================

function renderBooster(pack) {

  let container =
    document.getElementById("boosterResult");

  container.innerHTML = "";

  pack.forEach((card, index) => {

    setTimeout(() => {

      let el = document.createElement("div");

      el.className = "card";

      // HOLO EFFECT
      if (card.rarity === 6) {
        el.classList.add("holo");
      }

      let data = collection[card.id];

      let isNew = data.copies === 1;

      let img = localStorage.getItem("img_" + card.id);

      el.innerHTML = "";

      // NEW TAG
      if (isNew) {

        let newTag =
          document.createElement("div");

        newTag.innerText = "NEW";

        newTag.style.color = "lime";
        newTag.style.fontWeight = "bold";

        el.appendChild(newTag);
      }

      // IMAGE
      if (img) {

        let image =
          document.createElement("img");

        image.src = img;

        el.appendChild(image);
      }

      // TEXT
      let name =
        document.createElement("p");

      name.innerHTML =
        "<b>" + card.name + "</b>";

      let rarity =
        document.createElement("p");

      rarity.innerText =
        "⭐ " + card.rarity;

      let id =
        document.createElement("p");

      id.innerText =
        "ID " + card.id;

      let copy =
        document.createElement("p");

      copy.innerText =
        "x" + data.copies;

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

  let container =
    document.getElementById("collectionList");

  container.innerHTML = "";

  let count = 0;

  for (let c of cardsDB) {
    if (collection[c.id]) count++;
  }

  let header =
    document.createElement("div");

  header.innerText =
    "📚 Collection : " +
    count +
    "/" +
    cardsDB.length;

  header.style.textAlign = "center";
  header.style.fontSize = "18px";

  container.appendChild(header);

  cardsDB.forEach(card => {

    let data = collection[card.id];

    let el =
      document.createElement("div");

    el.className = "card";

    if (card.rarity === 6 && data) {
      el.classList.add("holo");
    }

    if (!data) {

      el.innerHTML = "❓ UNKNOWN";

    } else {

      let text =
        document.createElement("p");

      text.innerHTML =
        "<b>" + card.name + "</b>";

      let rarity =
        document.createElement("p");

      rarity.innerText =
        "⭐ " + card.rarity;

      let copies =
        document.createElement("p");

      copies.innerText =
        "x" + data.copies;

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

  let interval =
    setInterval(() => {

      let now = Date.now();

      let diff =
        40000 - (now - lastBoosterOpen);

      let el =
        document.getElementById("cooldown");

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
// IMAGE UPLOAD SYSTEM
// =====================================================

function uploadImage() {

  let id =
    document.getElementById("cardIdInput").value;

  let file =
    document.getElementById("imgInput").files[0];

  let reader =
    new FileReader();

  reader.onload = function (e) {

    localStorage.setItem(
      "img_" + id,
      e.target.result
    );

    renderCollection();
  };

  reader.readAsDataURL(file);
}

// =====================================================
// INIT
// =====================================================

renderCollection();
startCooldown();
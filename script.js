"use strict";

/* ==========================================================================
   Dhulikhel Municipality — Contributors Dashboard
   --------------------------------------------------------------------------
   Data source: contributors_categories_50_records.xlsx
   (Name, Contributor, Category Name, Address, Points Gained, Latitude, Longitude)

   To connect this to real municipal data, replace the CONTRIBUTORS array
   below with rows pulled from your database / API / spreadsheet export —
   the rest of the dashboard (stats, map, table, legend) works off this
   array automatically, no other code changes needed.
   ========================================================================== */

const CONTRIBUTORS = [
  { name: "Dhulikhel Agro Cooperative", contributor: 'Aarav', category: 'Agriculture', address: 'Ward 1, Dhulikhel', points: 20, lat: 27.649206, lng: 85.561256, ward: 1 },
  { name: "Dhulikhel Trade Center", contributor: 'Sita', category: 'Commercial', address: 'Ward 2, Dhulikhel', points: 27, lat: 27.656765, lng: 85.557078, ward: 2 },
  { name: "Dhulikhel Telecom Hub", contributor: 'Ramesh', category: 'Communication', address: 'Ward 3, Dhulikhel', points: 34, lat: 27.629208, lng: 85.556261, ward: 3 },
  { name: "Dhulikhel Secondary School", contributor: 'Maya', category: 'Education', address: 'Ward 4, Dhulikhel', points: 41, lat: 27.616036, lng: 85.539309, ward: 4 },
  { name: "Dhulikhel Cinema Hall", contributor: 'Nima', category: 'Entertainment', address: 'Ward 5, Dhulikhel', points: 48, lat: 27.617795, lng: 85.531085, ward: 5 },
  { name: "Newa Kitchen Restaurant", contributor: 'Priya', category: 'Food and Drinks', address: 'Ward 6, Dhulikhel', points: 55, lat: 27.611627, lng: 85.543046, ward: 6 },
  { name: "Dhulikhel Savings & Credit Cooperative", contributor: 'Binod', category: 'Finance', address: 'Ward 7, Dhulikhel', points: 62, lat: 27.612195, lng: 85.568001, ward: 7 },
  { name: "Dhulikhel Fuel Station", contributor: 'Kiran', category: 'Fuel', address: 'Ward 8, Dhulikhel', points: 69, lat: 27.629599, lng: 85.578587, ward: 8 },
  { name: "Dhulikhel Game Zone", contributor: 'Anita', category: 'Games', address: 'Ward 9, Dhulikhel', points: 76, lat: 27.603048, lng: 85.563801, ward: 9 },
  { name: "Ward Office", contributor: 'Suman', category: 'Government', address: 'Ward 10, Dhulikhel', points: 83, lat: 27.589663, lng: 85.557672, ward: 10 },
  { name: "Dhulikhel Community Hospital", contributor: 'Aarav', category: 'Health', address: 'Ward 11, Dhulikhel', points: 90, lat: 27.590988, lng: 85.572606, ward: 11 },
  { name: "Dhulikhel Textile Industries", contributor: 'Sita', category: 'Industry', address: 'Ward 12, Dhulikhel', points: 97, lat: 27.575312, lng: 85.564705, ward: 12 },
  { name: "Dhulikhel Construction Co.", contributor: 'Priya', category: 'Infrastructure', address: 'Ward 1, Dhulikhel', points: 104, lat: 27.640769, lng: 85.550568, ward: 1 },
  { name: "Glamour Beauty Salon", contributor: 'Ramesh', category: 'Lifestyle', address: 'Ward 2, Dhulikhel', points: 111, lat: 27.673335, lng: 85.561274, ward: 2 },
  { name: "Panchakanya Forest Reserve", contributor: 'Maya', category: 'Natural', address: 'Ward 3, Dhulikhel', points: 118, lat: 27.631306, lng: 85.544792, ward: 3 },
  { name: "Dhulikhel Welfare Society", contributor: 'Aarav', category: 'Organization', address: 'Ward 4, Dhulikhel', points: 125, lat: 27.622755, lng: 85.550062, ward: 4 },
  { name: "Dhulikhel Heritage Square", contributor: 'Sita', category: 'Place', address: 'Ward 5, Dhulikhel', points: 132, lat: 27.612535, lng: 85.53195, ward: 5 },
  { name: "Valley Security Services", contributor: 'Ramesh', category: 'Security', address: 'Ward 6, Dhulikhel', points: 139, lat: 27.617296, lng: 85.549569, ward: 6 },
  { name: "Dhulikhel Shopping Complex", contributor: 'Maya', category: 'Shopping', address: 'Ward 7, Dhulikhel', points: 146, lat: 27.609246, lng: 85.554014, ward: 7 },
  { name: "Dhulikhel Auto Workshop", contributor: 'Nima', category: 'Vehicle Service', address: 'Ward 8, Dhulikhel', points: 153, lat: 27.612341, lng: 85.595733, ward: 8 },
  { name: "Dhulikhel Service Center", contributor: 'Priya', category: 'Services', address: 'Ward 9, Dhulikhel', points: 160, lat: 27.598904, lng: 85.57786, ward: 9 },
  { name: "Dhulikhel Heritage Guest House", contributor: 'Binod', category: 'Stay and Travel', address: 'Ward 10, Dhulikhel', points: 167, lat: 27.594137, lng: 85.558041, ward: 10 },
  { name: "Dhulikhel Tour Agency", contributor: 'Kiran', category: 'Tourism', address: 'Ward 11, Dhulikhel', points: 174, lat: 27.610047, lng: 85.603452, ward: 11 },
  { name: "Green Hill Farm", contributor: 'Anita', category: 'Agriculture', address: 'Ward 12, Dhulikhel', points: 181, lat: 27.585851, lng: 85.571838, ward: 12 },
  { name: "New Valley Enterprises", contributor: 'Suman', category: 'Commercial', address: 'Ward 1, Dhulikhel', points: 188, lat: 27.647817, lng: 85.583961, ward: 1 },
  { name: "NetLink Communications", contributor: 'Aarav', category: 'Communication', address: 'Ward 2, Dhulikhel', points: 195, lat: 27.657177, lng: 85.546166, ward: 2 },
  { name: "Bright Future Academy", contributor: 'Sita', category: 'Education', address: 'Ward 3, Dhulikhel', points: 21, lat: 27.627146, lng: 85.540499, ward: 3 },
  { name: "Valley View Entertainment Zone", contributor: 'Priya', category: 'Entertainment', address: 'Ward 4, Dhulikhel', points: 28, lat: 27.624644, lng: 85.549206, ward: 4 },
  { name: "Hilltop Cafe", contributor: 'Ramesh', category: 'Food and Drinks', address: 'Ward 5, Dhulikhel', points: 35, lat: 27.615795, lng: 85.531735, ward: 5 },
  { name: "Valley Microfinance", contributor: 'Maya', category: 'Finance', address: 'Ward 6, Dhulikhel', points: 42, lat: 27.615154, lng: 85.542249, ward: 6 },
  { name: "Highway Petrol Pump", contributor: 'Aarav', category: 'Fuel', address: 'Ward 7, Dhulikhel', points: 49, lat: 27.60947, lng: 85.560397, ward: 7 },
  { name: "Pixel Play Arcade", contributor: 'Sita', category: 'Games', address: 'Ward 8, Dhulikhel', points: 56, lat: 27.61933, lng: 85.559345, ward: 8 },
  { name: "Municipal Service Center", contributor: 'Ramesh', category: 'Government', address: 'Ward 9, Dhulikhel', points: 63, lat: 27.614688, lng: 85.611063, ward: 9 },
  { name: "Valley Health Clinic", contributor: 'Maya', category: 'Health', address: 'Ward 10, Dhulikhel', points: 70, lat: 27.596335, lng: 85.543819, ward: 10 },
  { name: "Himalayan Manufacturing Works", contributor: 'Nima', category: 'Industry', address: 'Ward 11, Dhulikhel', points: 77, lat: 27.58842, lng: 85.581897, ward: 11 },
  { name: "Skyline Builders", contributor: 'Priya', category: 'Infrastructure', address: 'Ward 12, Dhulikhel', points: 84, lat: 27.585071, lng: 85.558201, ward: 12 },
  { name: "Serenity Wellness Spa", contributor: 'Binod', category: 'Lifestyle', address: 'Ward 1, Dhulikhel', points: 91, lat: 27.636203, lng: 85.583231, ward: 1 },
  { name: "Green Valley Nature Park", contributor: 'Kiran', category: 'Natural', address: 'Ward 2, Dhulikhel', points: 98, lat: 27.657034, lng: 85.550107, ward: 2 },
  { name: "Community Development Foundation", contributor: 'Anita', category: 'Organization', address: 'Ward 3, Dhulikhel', points: 105, lat: 27.637619, lng: 85.549958, ward: 3 },
  { name: "Namobuddha Viewpoint", contributor: 'Suman', category: 'Place', address: 'Ward 4, Dhulikhel', points: 112, lat: 27.62198, lng: 85.540121, ward: 4 },
  { name: "Ward Guard Force", contributor: 'Aarav', category: 'Security', address: 'Ward 5, Dhulikhel', points: 119, lat: 27.60829, lng: 85.540845, ward: 5 },
  { name: "Central Bazaar", contributor: 'Sita', category: 'Shopping', address: 'Ward 6, Dhulikhel', points: 126, lat: 27.615649, lng: 85.548345, ward: 6 },
  { name: "Highway Motors Garage", contributor: 'Priya', category: 'Vehicle Service', address: 'Ward 7, Dhulikhel', points: 133, lat: 27.608867, lng: 85.55691, ward: 7 },
  { name: "Quick Solutions Hub", contributor: 'Ramesh', category: 'Services', address: 'Ward 8, Dhulikhel', points: 140, lat: 27.620375, lng: 85.576073, ward: 8 },
  { name: "Namobuddha Homestay", contributor: 'Maya', category: 'Stay and Travel', address: 'Ward 9, Dhulikhel', points: 147, lat: 27.602424, lng: 85.579871, ward: 9 },
  { name: "Himalayan Travel Desk", contributor: 'Aarav', category: 'Tourism', address: 'Ward 10, Dhulikhel', points: 154, lat: 27.595519, lng: 85.555324, ward: 10 },
  { name: "Himalayan Organic Farm", contributor: 'Sita', category: 'Agriculture', address: 'Ward 11, Dhulikhel', points: 161, lat: 27.607873, lng: 85.603421, ward: 11 },
  { name: "Ward Bazaar Trading House", contributor: 'Ramesh', category: 'Commercial', address: 'Ward 12, Dhulikhel', points: 168, lat: 27.55857, lng: 85.560604, ward: 12 },
  { name: "Sunrise Infotel Center", contributor: 'Maya', category: 'Communication', address: 'Ward 1, Dhulikhel', points: 175, lat: 27.654581, lng: 85.576488, ward: 1 },
  { name: "Himalayan Learning Center", contributor: 'Nima', category: 'Education', address: 'Ward 2, Dhulikhel', points: 182, lat: 27.678947, lng: 85.550064, ward: 2 },
];

// Full category list requested for the municipality, each with its own
// map-pin icon and color. Order here also controls the order of the
// checklist in the Category panel.
const CATEGORY_META = {
  "Agriculture":      { icon: "🌾", color: "#3E8B4A" },
  "Commercial":       { icon: "🏢", color: "#2B6CB0" },
  "Communication":    { icon: "📡", color: "#2B8C8C" },
  "Education":        { icon: "🎓", color: "#4A5FC1" },
  "Entertainment":    { icon: "🎬", color: "#B23A8C" },
  "Food and Drinks":  { icon: "🍔", color: "#D9822B" },
  "Finance":          { icon: "💰", color: "#C08A28" },
  "Fuel":             { icon: "⛽", color: "#C1440E" },
  "Games":            { icon: "🎮", color: "#6A4C93" },
  "Government":       { icon: "🏛️", color: "#1E4E82" },
  "Health":           { icon: "⚕️", color: "#C0392B" },
  "Industry":         { icon: "🏭", color: "#5B6B7C" },
  "Infrastructure":   { icon: "🛠️", color: "#8B5E3C" },
  "Lifestyle":        { icon: "💃", color: "#C2477A" },
  "Natural":          { icon: "🌳", color: "#2C8C5B" },
  "Organization":     { icon: "👥", color: "#46647A" },
  "Place":            { icon: "📍", color: "#708095" },
  "Security":         { icon: "🔒", color: "#7A1F1F" },
  "Shopping":         { icon: "🛍️", color: "#C15C7A" },
  "Vehicle Service":  { icon: "🚗", color: "#1F6F6F" },
  "Services":         { icon: "🛎️", color: "#2870A0" },
  "Stay and Travel":  { icon: "🧳", color: "#B8863B" },
  "Tourism":          { icon: "✈️", color: "#2E86C1" },
};
const CATEGORY_ORDER = Object.keys(CATEGORY_META);
const FALLBACK_META = { icon: "📍", color: "#5B6B7C" };
function metaFor(cat){ return CATEGORY_META[cat] || FALLBACK_META; }

// ---------------------------------------------------------------------------
// Derived category summary (counts/points pulled from the data; the
// category itself always follows CATEGORY_ORDER above so the checklist
// stays in the same fixed order the municipality asked for)
// ---------------------------------------------------------------------------
const CATEGORIES = CATEGORY_ORDER.map(name => {
  const rows = CONTRIBUTORS.filter(d => d.category === name);
  return { name, count: rows.length, points: rows.reduce((s, r) => s + r.points, 0) };
});

// Several sample rows share the exact same coordinate pair (the sample
// sheet cycles through 10 locations). Spread those out slightly on the map
// so every marker stays visible and clickable — this only nudges the pin,
// the address text shown in the table/popup is untouched.
(function jitterDuplicateCoords(){
  const seen = new Map();
  CONTRIBUTORS.forEach(d => {
    const key = d.lat + "," + d.lng;
    const n = seen.get(key) || 0;
    seen.set(key, n + 1);
    if (n > 0){
      const angle = (n * 47) * (Math.PI / 180);
      const radius = 0.0018 * Math.ceil(n / 1);
      d.lat += Math.cos(angle) * radius;
      d.lng += Math.sin(angle) * radius;
    }
  });
})();

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let activeCategories = new Set();
let searchTerm = "";
let activeId = null; // index into CONTRIBUTORS currently highlighted

// ---------------------------------------------------------------------------
// DOM refs
// ---------------------------------------------------------------------------
const categoryBtn = document.getElementById("categoryBtn");
const categoryPanel = document.getElementById("categoryPanel");
const categoryList = document.getElementById("categoryList");
const selectAllBtn = document.getElementById("selectAllBtn");
const clearBtn = document.getElementById("clearBtn");
const activeChips = document.getElementById("activeChips");
const toolbarHint = document.getElementById("toolbarHint");
const statsStrip = document.getElementById("statsStrip");

const legend = document.getElementById("legend");
const legendList = document.getElementById("legendList");

const leaderboardBtn = document.getElementById("leaderboardBtn");
const leaderboardPanel = document.getElementById("leaderboardPanel");
const leaderboardList = document.getElementById("leaderboardList");

const wardBtn = document.getElementById("wardBtn");
const wardPanel = document.getElementById("wardPanel");
const wardList = document.getElementById("wardList");
const wardClearBtn = document.getElementById("wardClearBtn");
const refreshBtn = document.getElementById("refreshBtn");

const tableEmpty = document.getElementById("tableEmpty");
const tableScroll = document.getElementById("tableScroll");
const tableBody = document.getElementById("tableBody");
const tableFooter = document.getElementById("tableFooter");
const tableSearch = document.getElementById("tableSearch");
const scrollHint = document.getElementById("scrollHint");

// ---------------------------------------------------------------------------
// Map setup
// ---------------------------------------------------------------------------
const map = L.map("map", { zoomControl: true }).setView([27.618, 85.579], 13);
L.tileLayer("https://map-init.gallimap.com/styles/light/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; GalliMaps",
}).addTo(map);

const markersLayer = L.layerGroup().addTo(map);
const markerById = new Map();

// ---------------------------------------------------------------------------
// Ward boundaries
// ---------------------------------------------------------------------------
let wardLayer = null;          // L.geoJSON layer, once loaded
const wardLayerById = new Map(); // ward_no -> leaflet layer
let selectedWard = null;         // currently highlighted ward_no (or null)

const WARD_STYLE_DEFAULT = { color: "#2B6CB0", weight: 1.5, fillColor: "#2B6CB0", fillOpacity: 0.05 };
const WARD_STYLE_SELECTED = { color: "#1E4E82", weight: 3, fillColor: "#2B6CB0", fillOpacity: 0.22 };

let defaultMapBounds = null; // set once wards.geojson loads; used by the Refresh button

// Ward boundaries load from the WARDS_GEOJSON constant (see wards-data.js),
// which is loaded as a plain script tag before this file. This avoids
// fetch()/CORS issues when the dashboard is opened directly from disk
// (file://) instead of through a local web server.
try {
  const data = WARDS_GEOJSON;
  wardLayer = L.geoJSON(data, {
    style: WARD_STYLE_DEFAULT,
    onEachFeature: (feature, layer) => {
      const wardNo = feature.properties.ward_no;
      wardLayerById.set(wardNo, layer);
      layer.on("click", () => selectWard(wardNo));
      layer.bindTooltip(`Ward ${wardNo}`, { sticky: true, direction: "top" });
    },
  }).addTo(map);
  renderWardList();
  map.fitBounds(wardLayer.getBounds(), { padding: [20, 20] });
  defaultMapBounds = wardLayer.getBounds();
} catch (err) {
  console.error("Could not load ward boundaries — is wards-data.js included before script.js?", err);
}

function selectWard(wardNo){
  selectedWard = selectedWard === wardNo ? null : wardNo;
  wardLayerById.forEach((layer, no) => {
    layer.setStyle(no === selectedWard ? WARD_STYLE_SELECTED : WARD_STYLE_DEFAULT);
    if (no === selectedWard) layer.bringToFront();
  });
  if (selectedWard !== null && wardLayerById.has(selectedWard)){
    map.fitBounds(wardLayerById.get(selectedWard).getBounds(), { padding: [24, 24] });
  }
  wardBtn.classList.toggle("active-filter", selectedWard !== null);
  renderWardList();
}

function renderWardList(){
  if (!wardLayerById.size) return;
  const wardNos = [...wardLayerById.keys()].sort((a, b) => a - b);
  wardList.innerHTML = wardNos.map(no => `
    <div class="ward-chip ${no === selectedWard ? "selected" : ""}" data-ward="${no}">Ward ${no}</div>
  `).join("");
}

wardList.addEventListener("click", (e) => {
  const chip = e.target.closest(".ward-chip");
  if (!chip) return;
  selectWard(Number(chip.dataset.ward));
});

function makeIcon(cat){
  const m = metaFor(cat);
  return L.divIcon({
    className: "",
    html: `<div style="
        width:32px;height:32px;border-radius:50% 50% 50% 0;
        background:${m.color};transform:rotate(-45deg);
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 3px 8px rgba(0,0,0,.35); border:2px solid #fff;">
        <span style="transform:rotate(45deg);font-size:15px;">${m.icon}</span>
      </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 30],
    popupAnchor: [0, -28],
  });
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------
function filteredRows(){
  return CONTRIBUTORS
    .map((d, i) => ({ ...d, id: i }))
    .filter(d => activeCategories.has(d.category))
    .filter(d => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return d.name.toLowerCase().includes(q) || d.contributor.toLowerCase().includes(q) || d.address.toLowerCase().includes(q);
    });
}

function renderCategoryList(){
  categoryList.innerHTML = "";
  CATEGORIES.forEach(cat => {
    const meta = metaFor(cat.name);
    const row = document.createElement("label");
    row.className = "category-row";
    row.innerHTML = `
      <input type="checkbox" ${activeCategories.has(cat.name) ? "checked" : ""} data-cat="${cat.name}" />
      <div class="cat-swatch" style="background:${meta.color}22;color:${meta.color};">${meta.icon}</div>
      <div class="cat-meta">
        <div class="cat-name">${cat.name}</div>
        <div class="cat-count">${cat.count} contributor${cat.count === 1 ? "" : "s"} · ${cat.points} pts</div>
      </div>
    `;
    row.querySelector("input").addEventListener("change", (e) => {
      toggleCategory(cat.name, e.target.checked);
    });
    categoryList.appendChild(row);
  });
}

function renderChips(){
  activeChips.innerHTML = "";
  activeCategories.forEach(name => {
    const meta = metaFor(name);
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.innerHTML = `<span class="dot" style="background:${meta.color}"></span>${name}<button aria-label="Remove ${name}">✕</button>`;
    chip.querySelector("button").addEventListener("click", () => toggleCategory(name, false));
    activeChips.appendChild(chip);
  });
  toolbarHint.style.display = activeCategories.size ? "none" : "block";
}

function renderStats(){
  const rows = filteredRows();
  const totalContributors = activeCategories.size
    ? new Set(rows.map(r => r.contributor)).size
    : new Set(CONTRIBUTORS.map(r => r.contributor)).size;
  const totalPoints = activeCategories.size
    ? rows.reduce((s, r) => s + r.points, 0)
    : CONTRIBUTORS.reduce((s, r) => s + r.points, 0);
  statsStrip.innerHTML = `
    <div class="stat-card"><div class="stat-value">${activeCategories.size}/${CATEGORIES.length}</div><div class="stat-label">Categories active</div></div>
    <div class="stat-card"><div class="stat-value">${totalContributors}</div><div class="stat-label">${activeCategories.size ? "Contributors shown" : "Total contributors"}</div></div>
    <div class="stat-card"><div class="stat-value">${totalPoints}</div><div class="stat-label">${activeCategories.size ? "Points shown" : "Total points"}</div></div>
  `;
}

function renderLegend(){
  if (!activeCategories.size){ legend.classList.add("hidden"); return; }
  legend.classList.remove("hidden");
  legendList.innerHTML = "";
  activeCategories.forEach(name => {
    const meta = metaFor(name);
    const row = document.createElement("div");
    row.className = "legend-row";
    row.innerHTML = `<span class="dot" style="background:${meta.color}"></span>${meta.icon} ${name}`;
    legendList.appendChild(row);
  });
}

function renderMarkers(){
  markersLayer.clearLayers();
  markerById.clear();
  const rows = filteredRows();
  rows.forEach(d => {
    const marker = L.marker([d.lat, d.lng], { icon: makeIcon(d.category) });
    const meta = metaFor(d.category);
    marker.bindPopup(`
      <div class="popup-cat" style="color:${meta.color}">${meta.icon} ${d.category}</div>
      <p class="popup-name">${d.name}</p>
      <p class="popup-contributor">${d.contributor}</p>
      <p class="popup-addr">${d.address}</p>
      <div class="popup-points">${d.points} pts</div>
    `);
    marker.on("click", () => setActiveRow(d.id, true));
    marker.addTo(markersLayer);
    markerById.set(d.id, marker);
  });
}

function renderTable(){
  const rows = filteredRows();
  if (!activeCategories.size){
    tableEmpty.classList.remove("hidden");
    tableScroll.classList.add("hidden");
    scrollHint.classList.add("hidden");
    tableFooter.textContent = "";
    return;
  }
  tableEmpty.classList.add("hidden");
  tableScroll.classList.remove("hidden");
  scrollHint.classList.toggle("hidden", tableScrollUnlocked);

  tableBody.innerHTML = "";
  rows
    .sort((a, b) => b.points - a.points)
    .forEach(d => {
      const meta = metaFor(d.category);
      const tr = document.createElement("tr");
      tr.dataset.id = d.id;
      if (d.id === activeId) tr.classList.add("active-row");
      tr.innerHTML = `
        <td class="row-name">${d.name}</td>
        <td class="row-contributor">${d.contributor}</td>
        <td><span class="cat-badge" style="background:${meta.color}1A; color:${meta.color}; border-color:${meta.color}4D;">${d.category}</span></td>
        <td class="row-address">${d.address}</td>
        <td class="row-points">${d.points}</td>
      `;
      tr.addEventListener("click", () => setActiveRow(d.id, true));
      tableBody.appendChild(tr);
    });

  tableFooter.textContent = `Showing ${rows.length} of ${CONTRIBUTORS.length} contributors`;
}

function setActiveRow(id, panToMarker){
  activeId = id;
  document.querySelectorAll("tbody tr").forEach(tr => {
    tr.classList.toggle("active-row", Number(tr.dataset.id) === id);
  });
  const marker = markerById.get(id);
  if (marker){
    if (panToMarker) map.panTo(marker.getLatLng(), { animate: true });
    marker.openPopup();
  }
}

// ---------------------------------------------------------------------------
// Top 10 leaderboard — combines a contributor's points across every
// category they appear in, so it reflects their total standing rather
// than any single category.
// ---------------------------------------------------------------------------
function buildLeaderboard(){
  const byContributor = new Map();
  CONTRIBUTORS.forEach(d => {
    if (!byContributor.has(d.contributor)){
      byContributor.set(d.contributor, { name: d.contributor, points: 0, entries: 0, categories: new Set() });
    }
    const rec = byContributor.get(d.contributor);
    rec.points += d.points;
    rec.entries += 1;
    rec.categories.add(d.category);
  });
  return Array.from(byContributor.values())
    .sort((a, b) => b.points - a.points)
    .slice(0, 10);
}
const LEADERBOARD = buildLeaderboard();

function renderLeaderboard(){
  leaderboardList.innerHTML = "";
  LEADERBOARD.forEach((rec, i) => {
    const rank = i + 1;
    const row = document.createElement("div");
    row.className = "leaderboard-row" + (rank <= 3 ? ` top-${rank}` : "");
    const catIcons = Array.from(rec.categories).map(c => metaFor(c).icon).join(" ");
    row.innerHTML = `
      <div class="lb-rank">${rank}</div>
      <div class="lb-meta">
        <div class="lb-name">${rec.name}</div>
        <div class="lb-cats">${catIcons} ${Array.from(rec.categories).join(", ")}</div>
      </div>
      <div class="lb-points">
        <div class="lb-points-value">${rec.points}</div>
        <div class="lb-entries">${rec.entries} entr${rec.entries === 1 ? "y" : "ies"}</div>
      </div>
    `;
    row.addEventListener("click", () => selectContributor(rec.name));
    leaderboardList.appendChild(row);
  });
}

// Selecting a contributor from the Top 10 panel shows that person's
// records — across every category they contribute to — on both the
// map and the table, by activating their categories and filtering the
// table to their name.
function selectContributor(name){
  const rows = CONTRIBUTORS.filter(d => d.contributor === name);
  activeCategories = new Set(rows.map(r => r.category));
  searchTerm = name;
  tableSearch.value = name;
  unlockTableScroll();
  renderAll();
  closeLeaderboard();

  const firstId = CONTRIBUTORS.findIndex(d => d.contributor === name);
  if (firstId !== -1) setActiveRow(firstId, true);
}

function closeLeaderboard(){
  leaderboardPanel.classList.add("hidden");
  leaderboardBtn.classList.remove("open");
  leaderboardBtn.setAttribute("aria-expanded", "false");
}

function renderAll(){
  renderCategoryList();
  renderChips();
  renderStats();
  renderLegend();
  renderMarkers();
  renderTable();
}

// ---------------------------------------------------------------------------
// Interactions
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// The contributor list only starts scrolling once the person clicks into
// the table (or picks a category) — this avoids the list capturing the
// mouse wheel by accident while they're just moving around the page.
// ---------------------------------------------------------------------------
let tableScrollUnlocked = false;
function unlockTableScroll(){
  if (tableScrollUnlocked) return;
  tableScrollUnlocked = true;
  tableScroll.classList.add("scroll-unlocked");
  scrollHint.classList.add("hidden");
}
tableScroll.addEventListener("click", unlockTableScroll);

function toggleCategory(name, on){
  if (on) activeCategories.add(name); else activeCategories.delete(name);
  if (on) unlockTableScroll();
  renderAll();
}

categoryBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const willOpen = categoryPanel.classList.contains("hidden");
  closeLeaderboard();
  categoryPanel.classList.toggle("hidden");
  categoryBtn.classList.toggle("open", willOpen);
  categoryBtn.setAttribute("aria-expanded", String(willOpen));
});
document.addEventListener("click", (e) => {
  if (!categoryPanel.contains(e.target) && e.target !== categoryBtn){
    categoryPanel.classList.add("hidden");
    categoryBtn.classList.remove("open");
    categoryBtn.setAttribute("aria-expanded", "false");
  }
});
categoryPanel.addEventListener("click", (e) => e.stopPropagation());

leaderboardBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const willOpen = leaderboardPanel.classList.contains("hidden");
  categoryPanel.classList.add("hidden");
  categoryBtn.classList.remove("open");
  leaderboardPanel.classList.toggle("hidden");
  leaderboardBtn.classList.toggle("open", willOpen);
  leaderboardBtn.setAttribute("aria-expanded", String(willOpen));
});
document.addEventListener("click", (e) => {
  if (!leaderboardPanel.contains(e.target) && e.target !== leaderboardBtn){
    closeLeaderboard();
  }
});
leaderboardPanel.addEventListener("click", (e) => e.stopPropagation());

function closeWardPanel(){
  wardPanel.classList.add("hidden");
  wardBtn.classList.remove("open");
  wardBtn.setAttribute("aria-expanded", "false");
}

wardBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const willOpen = wardPanel.classList.contains("hidden");
  categoryPanel.classList.add("hidden");
  categoryBtn.classList.remove("open");
  closeLeaderboard();
  wardPanel.classList.toggle("hidden");
  wardBtn.classList.toggle("open", willOpen);
  wardBtn.setAttribute("aria-expanded", String(willOpen));
});
document.addEventListener("click", (e) => {
  if (!wardPanel.contains(e.target) && e.target !== wardBtn){
    closeWardPanel();
  }
});
wardPanel.addEventListener("click", (e) => e.stopPropagation());

wardClearBtn.addEventListener("click", () => {
  if (selectedWard === null) return;
  wardLayerById.forEach((layer) => layer.setStyle(WARD_STYLE_DEFAULT));
  selectedWard = null;
  wardBtn.classList.remove("active-filter");
  renderWardList();
});

// ---------------------------------------------------------------------------
// Refresh — clears every selection (categories, search, table highlight,
// ward highlight) and returns the dashboard to its initial empty state.
// ---------------------------------------------------------------------------
refreshBtn.addEventListener("click", () => {
  activeCategories = new Set();
  searchTerm = "";
  tableSearch.value = "";
  tableScrollUnlocked = false;
  tableScroll.classList.remove("scroll-unlocked");
  scrollHint.classList.remove("hidden");
  activeId = null;

  if (selectedWard !== null){
    const prev = selectedWard;
    selectedWard = null;
    wardLayerById.forEach((layer) => layer.setStyle(WARD_STYLE_DEFAULT));
    wardBtn.classList.remove("active-filter");
    renderWardList();
  }

  closeWardPanel();
  closeLeaderboard();
  categoryPanel.classList.add("hidden");
  categoryBtn.classList.remove("open");

  if (defaultMapBounds) map.fitBounds(defaultMapBounds, { padding: [20, 20] });
  else map.setView([27.618, 85.579], 13);
  renderAll();

  refreshBtn.classList.remove("spinning");
  void refreshBtn.offsetWidth; // restart animation
  refreshBtn.classList.add("spinning");
});

selectAllBtn.addEventListener("click", () => {
  activeCategories = new Set(CATEGORIES.map(c => c.name));
  renderAll();
});
clearBtn.addEventListener("click", () => {
  activeCategories = new Set();
  renderAll();
});

tableSearch.addEventListener("input", (e) => {
  searchTerm = e.target.value.trim();
  renderTable();
});

// ---------------------------------------------------------------------------
// Draggable resizer between map and table panels
// ---------------------------------------------------------------------------
(function initResizer(){
  const grid = document.querySelector(".grid");
  const resizer = document.getElementById("resizer");
  const mapPanel = document.querySelector(".map-panel");
  const tablePanel = document.querySelector(".table-panel");
  if (!grid || !resizer || !mapPanel || !tablePanel) return;

  // The map is a full-bleed layer filling the whole grid; the table panel
  // floats on top of it as an overlay card anchored to the right edge.
  // Dragging the resizer changes the overlay's width — the map itself
  // never needs to resize, it just gets covered by more or less of it.
  const EDGE_GAP = 14;       // matches the top/right/bottom offsets on .table-panel in CSS
  const MIN_TABLE_WIDTH = 300;
  const MIN_MAP_VISIBLE = 320; // keep at least this much of the map visible on the left
  let dragging = false;

  function applyWidth(tableWidth, gridWidth){
    const maxTableWidth = gridWidth - MIN_MAP_VISIBLE - EDGE_GAP;
    const clamped = Math.max(MIN_TABLE_WIDTH, Math.min(tableWidth, maxTableWidth));
    tablePanel.style.width = `${clamped}px`;
    resizer.style.right = `${clamped + EDGE_GAP}px`;
  }

  function onPointerDown(e){
    if (window.matchMedia("(max-width:980px)").matches) return;
    dragging = true;
    grid.classList.add("is-resizing");
    document.body.style.cursor = "col-resize";
    e.preventDefault();
  }

  function onPointerMove(e){
    if (!dragging) return;
    const gridRect = grid.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const tableWidth = gridRect.right - clientX - EDGE_GAP;
    applyWidth(tableWidth, gridRect.width);
    if (typeof map !== "undefined" && map.invalidateSize) map.invalidateSize();
  }

  function onPointerUp(){
    if (!dragging) return;
    dragging = false;
    grid.classList.remove("is-resizing");
    document.body.style.cursor = "";
    if (typeof map !== "undefined" && map.invalidateSize) map.invalidateSize();
  }

  resizer.addEventListener("mousedown", onPointerDown);
  resizer.addEventListener("touchstart", onPointerDown, { passive: false });
  window.addEventListener("mousemove", onPointerMove);
  window.addEventListener("touchmove", onPointerMove, { passive: false });
  window.addEventListener("mouseup", onPointerUp);
  window.addEventListener("touchend", onPointerUp);

  // Keyboard support for accessibility
  resizer.addEventListener("keydown", (e) => {
    const step = 24;
    const gridRect = grid.getBoundingClientRect();
    let tableWidth = tablePanel.getBoundingClientRect().width;
    if (e.key === "ArrowLeft") tableWidth += step;       // widen the overlay
    else if (e.key === "ArrowRight") tableWidth -= step; // narrow the overlay
    else return;
    e.preventDefault();
    applyWidth(tableWidth, gridRect.width);
    if (typeof map !== "undefined" && map.invalidateSize) map.invalidateSize();
  });

  window.addEventListener("resize", () => {
    if (typeof map !== "undefined" && map.invalidateSize) map.invalidateSize();
  });

  // Set the initial overlay width/resizer position to match the CSS defaults.
  applyWidth(380, grid.getBoundingClientRect().width);
})();

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
renderLeaderboard();
renderAll();

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

// This used to be a big hardcoded list of 50 sample places. Now it starts
// empty and gets filled in automatically from your Neon database via the
// backend API — see initDashboard() near the bottom of this file.
let CONTRIBUTORS = [];

// Tag every sample record with its full administrative path (Bagmati
// Province -> Kavrepalanchok -> Dhulikhel) so the Province/District/
// Municipality/Ward filters in the toolbar can also filter these markers
// and table rows, not just the category checklist. Ward numbers are mapped
// to the real ward ids used by admin-data.js / WARD_STATS.
const DHULIKHEL_WARD_IDS = { 1: 6430, 2: 6406, 3: 6258, 4: 6268, 5: 6280, 6: 3644, 7: 3638, 8: 6407, 9: 6414, 10: 6428, 11: 6429, 12: 6431 };
function tagContributorsWithAdminPath(){
  CONTRIBUTORS.forEach(d => {
    // Use the province/district/municipality already on the row (from your
    // Neon "places" table) when present, so rows tagged to other
    // municipalities (e.g. Banepa, Panauti) show up correctly. Only fall
    // back to the original Dhulikhel default for rows that don't set these
    // columns, so older/existing data keeps working unchanged.
    d.province = d.province || "Bagmati Province";
    d.district = d.district || "Kavrepalanchok";
    d.municipality = d.municipality || "Dhulikhel";

    const key = muniKeyForTagging(d.district, d.municipality);
    const wardEntry = (typeof MUNICIPALITY_WARD_MAP !== "undefined" && MUNICIPALITY_WARD_MAP[key] || [])
      .find(w => w.ward_no === Number(d.ward));
    d.wardId = wardEntry ? wardEntry.id : (DHULIKHEL_WARD_IDS[d.ward] && d.municipality === "Dhulikhel" ? DHULIKHEL_WARD_IDS[d.ward] : null);
  });
}
// Same "district||municipality" key format used by MUNICIPALITY_WARD_MAP in
// admin-data.js. Defined here (rather than reusing muniKey) since this file
// tags contributors before the cascading-dropdown code further down runs.
function muniKeyForTagging(district, municipality){ return `${district}||${municipality}`; }

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
let CATEGORIES = [];
function computeCategories(){
  CATEGORIES = CATEGORY_ORDER.map(name => {
    const rows = CONTRIBUTORS.filter(d => d.category === name);
    return { name, count: rows.length, points: rows.reduce((s, r) => s + r.points, 0) };
  });
}

// Several sample rows share the exact same coordinate pair (the sample
// sheet cycles through 10 locations). Spread those out slightly on the map
// so every marker stays visible and clickable — this only nudges the pin,
// the address text shown in the table/popup is untouched.
function jitterDuplicateCoords(){
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
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let activeCategories = new Set();
let searchTerm = "";
let activeId = null; // index into CONTRIBUTORS currently highlighted
let selectedProvince = null; // province name, or null
let selectedDistrict = null; // district name, or null (only selectable once a province is chosen)
let selectedMunicipality = null; // municipality name, or null (only selectable once a district is chosen)

// ---------------------------------------------------------------------------
// DOM refs
// ---------------------------------------------------------------------------
const categoryBtn = document.getElementById("categoryBtn");
const categoryPanel = document.getElementById("categoryPanel");
const categoryList = document.getElementById("categoryList");
const selectAllBtn = document.getElementById("selectAllBtn");
const clearBtn = document.getElementById("clearBtn");
const activeChips = document.getElementById("activeChips");
const miniStats = document.getElementById("miniStats");

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
const provinceBtn = document.getElementById("provinceBtn");
const provincePanel = document.getElementById("provincePanel");
const provinceList = document.getElementById("provinceList");
const provinceClearBtn = document.getElementById("provinceClearBtn");
const districtBtn = document.getElementById("districtBtn");
const districtPanel = document.getElementById("districtPanel");
const districtList = document.getElementById("districtList");
const districtClearBtn = document.getElementById("districtClearBtn");
const municipalityBtn = document.getElementById("municipalityBtn");
const municipalityPanel = document.getElementById("municipalityPanel");
const municipalityList = document.getElementById("municipalityList");
const municipalityClearBtn = document.getElementById("municipalityClearBtn");

const tableScroll = document.getElementById("tableScroll");
const tableBody = document.getElementById("tableBody");
const tableFooter = document.getElementById("tableFooter");
const tableSearch = document.getElementById("tableSearch");
const scrollHint = document.getElementById("scrollHint");
const tablePanelEl = document.querySelector(".table-panel");
const resizerEl = document.getElementById("resizer");
const tableCollapseBtn = document.getElementById("tableCollapseBtn");
const tableCloseBtn = document.getElementById("tableCloseBtn");

// ---------------------------------------------------------------------------
// Map setup
// ---------------------------------------------------------------------------
const map = L.map("map", { zoomControl: true }).setView([28.3, 84.1], 7);
map.attributionControl.setPrefix(false); // drop the default "Leaflet" branding, keep only the basemap credit
L.tileLayer("https://map-init.gallimap.com/styles/light/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; GalliMaps",
}).addTo(map);

const markersLayer = L.layerGroup().addTo(map);
const markerById = new Map();

// ---------------------------------------------------------------------------
// Reverse geocoding — click anywhere on empty map space to look up the
// address at that point via GalliMaps' reverse geocoding API. Clicks on a
// contributor marker are handled by the marker's own click event (see
// renderMarkers below) and never bubble up to this handler, so this only
// fires for clicks on open map area.
// ---------------------------------------------------------------------------
const GALLI_REVERSE_GEOCODE_TOKEN = "YOUR_GALLIMAPS_ACCESS_TOKEN"; // TODO: replace with your real GalliMaps access token

async function reverseGeocode(lat, lng) {
  const url = `https://route-init.gallimap.com/api/v1/reverse/generalReverse?accessToken=${GALLI_REVERSE_GEOCODE_TOKEN}&lat=${lat}&lng=${lng}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Reverse geocode request failed (${res.status})`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Reverse geocode failed");
  return json.data;
}

function formatGalliAddress(data){
  if (!data) return null;
  if (data.generalName) return data.generalName;
  // Fall back to stitching together whatever pieces GalliMaps did return.
  return [data.place, data.roadName, data.municipality, data.district]
    .filter(Boolean)
    .join(", ") || null;
}

// Cache reverse-geocode lookups per contributor id so re-opening the same
// popup (or re-rendering after a filter change) doesn't re-hit the API.
const galliAddressCache = new Map();

async function loadGalliAddress(d, popupEl, popup){
  const addrEl = popupEl.querySelector(`[data-geo-addr][data-id="${d.id}"]`);
  if (!addrEl) return;

  if (galliAddressCache.has(d.id)){
    const cached = galliAddressCache.get(d.id);
    if (cached) { addrEl.textContent = cached; popup.update(); }
    return; // cached miss -> silently keep the original d.address already shown
  }

  const originalText = addrEl.textContent;
  addrEl.textContent = "Locating on GalliMaps…";
  addrEl.classList.add("popup-addr-loading");
  popup.update();

  try {
    const data = await reverseGeocode(d.lat, d.lng);
    const formatted = formatGalliAddress(data);
    galliAddressCache.set(d.id, formatted);
    addrEl.textContent = formatted || originalText;
  } catch (err) {
    galliAddressCache.set(d.id, null);
    addrEl.textContent = originalText; // keep the stored address on failure
  } finally {
    addrEl.classList.remove("popup-addr-loading");
    popup.update();
  }
}

function geoPopupHtml({ loading = false, error = null, data = null, lat, lng } = {}) {
  if (loading) {
    return `
      <div class="geo-popup geo-popup-loading">
        <span class="geo-spinner"></span> Looking up address…
      </div>
    `;
  }
  if (error) {
    return `
      <div class="geo-popup geo-popup-error">
        Couldn't look up this location.
        <div class="geo-popup-coords">${lat.toFixed(5)}, ${lng.toFixed(5)}</div>
      </div>
    `;
  }
  const rows = [
    ["Road", data.roadName],
    ["Place", data.place],
    ["Municipality", data.municipality],
    ["Ward", data.ward],
    ["District", data.district],
    ["Province", data.province],
  ].filter(([, v]) => v);

  return `
    <div class="geo-popup">
      <p class="popup-name">${data.generalName || "Unknown location"}</p>
      <div class="geo-popup-rows">
        ${rows.map(([label, val]) => `<div class="geo-popup-row"><span>${label}</span><span>${val}</span></div>`).join("")}
      </div>
      <div class="geo-popup-coords">${lat.toFixed(5)}, ${lng.toFixed(5)}</div>
    </div>
  `;
}

// Reverse-geocode-on-click (shows an address popup when clicking empty map
// space) has been disabled — it requires a real GalliMaps access token
// (see GALLI_REVERSE_GEOCODE_TOKEN above) and otherwise just shows a
// "Couldn't look up this location" error on every click. Re-enable by
// restoring a map.on("click", ...) handler once a real token is set.

// ---------------------------------------------------------------------------
// Province / District / Municipality / Ward boundaries — all loaded from
// admin-data.js (reprojected from Province.geojson / District.geojson /
// Gana_name.geojson / Ward.geojson, covering all 7 provinces, 77 districts,
// ~753 local levels and their wards nationwide). Everything is bundled as
// plain script-tag constants (not fetched) so the dashboard keeps working
// when opened directly from disk (file://) instead of through a web server.
//
// Only the layer(s) relevant to the current selection are ever drawn:
//  - all provinces are shown lightly, always, for context
//  - the selected district / municipality get their own highlighted layer
//  - ward boundaries are only built for the currently selected municipality
//    (drawing all ~6,700 wards nationwide at once would be far too heavy)
// ---------------------------------------------------------------------------
let selectedWard = null; // currently highlighted ward id (or null)

// One consistent rule across every admin level: black outline while it's
// just context, a light-blue highlight only for whichever level is the
// deepest one currently selected (see refreshBoundaryHighlights()).
const BOUNDARY_STYLE_DEFAULT = { color: "#1B2733", weight: 1.25, fillOpacity: 0, dashArray: null };
const BOUNDARY_STYLE_HIGHLIGHT = { color: "#2B9CF2", weight: 3, fillOpacity: 0, dashArray: null };
const PROVINCE_STYLE = BOUNDARY_STYLE_DEFAULT;
const PROVINCE_STYLE_ACTIVE = BOUNDARY_STYLE_DEFAULT;
const DISTRICT_STYLE = BOUNDARY_STYLE_DEFAULT;
const MUNICIPALITY_STYLE = BOUNDARY_STYLE_DEFAULT;
const WARD_STYLE_DEFAULT = BOUNDARY_STYLE_DEFAULT;
const WARD_STYLE_SELECTED = BOUNDARY_STYLE_HIGHLIGHT;

// Re-styles every currently-drawn boundary layer so only the deepest
// selected level (ward > municipality > district > province) gets the
// light-blue highlight; everything shallower than it falls back to the
// plain black outline, since it's now just context for the real selection.
function refreshBoundaryHighlights(){
  const deepest = selectedWard !== null ? "ward"
    : selectedMunicipality ? "municipality"
    : selectedDistrict ? "district"
    : selectedProvince ? "province"
    : null;

  if (selectedProvinceLayer) selectedProvinceLayer.setStyle(deepest === "province" ? BOUNDARY_STYLE_HIGHLIGHT : BOUNDARY_STYLE_DEFAULT);
  if (districtLayer) districtLayer.setStyle(deepest === "district" ? BOUNDARY_STYLE_HIGHLIGHT : BOUNDARY_STYLE_DEFAULT);
  if (municipalityLayer) municipalityLayer.setStyle(deepest === "municipality" ? BOUNDARY_STYLE_HIGHLIGHT : BOUNDARY_STYLE_DEFAULT);
  wardLayerById.forEach((layer, id) => {
    layer.setStyle(id === selectedWard && deepest === "ward" ? BOUNDARY_STYLE_HIGHLIGHT : BOUNDARY_STYLE_DEFAULT);
    if (id === selectedWard && deepest === "ward") layer.bringToFront();
  });
  if (deepest === "province" && selectedProvinceLayer) selectedProvinceLayer.bringToFront();
  if (deepest === "district" && districtLayer) districtLayer.bringToFront();
  if (deepest === "municipality" && municipalityLayer) municipalityLayer.bringToFront();
}

let provinceLayer = null;         // all 7 provinces, always on the map
let selectedProvinceLayer = null; // just the one selected province, highlighted
let districtLayer = null;         // just the one selected district
let municipalityLayer = null;     // just the one selected municipality
let wardLayer = null;              // wards belonging to the selected municipality
const wardLayerById = new Map();   // ward id -> leaflet layer (selected municipality only)

let defaultMapBounds = null; // Nepal-wide bounds; used by the Refresh button

try {
  provinceLayer = L.geoJSON(PROVINCE_GEOJSON, {
    style: PROVINCE_STYLE,
    onEachFeature: (feature, layer) => {
      layer.bindTooltip(feature.properties.name || "Province", { sticky: true, direction: "top" });
    },
  }).addTo(map);
  defaultMapBounds = provinceLayer.getBounds();
  map.fitBounds(defaultMapBounds, { padding: [20, 20] });
} catch (err) {
  console.error("Could not load province boundaries — is admin-data.js included before script.js?", err);
}

renderProvinceList();
renderDistrictList();
renderMunicipalityList();
renderWardList();
updateCascadeUI(); // district/municipality/ward dropdowns start disabled until their parent is picked
updateAdminButtonLabels();

// ---------------------------------------------------------------------------
// Cascading Province -> District -> Municipality -> Ward selection. Each level's
// dropdown is only enabled once the level above it has been picked, and each
// level's options are filtered to what actually belongs to the parent that's
// currently selected (via PROVINCE_DISTRICT_MAP / DISTRICT_MUNICIPALITY_MAP /
// MUNICIPALITY_WARD_MAP in admin-data.js). Picking a new value at any level
// clears whatever was selected below it, since that selection may no longer
// be valid. Municipality names repeat across different districts (e.g. more
// than one district has a "Madi"), so municipality/ward lookups are always
// keyed on the district+municipality pair together, never the name alone.
// ---------------------------------------------------------------------------
function muniKey(district, municipality){ return `${district}||${municipality}`; }

function updateCascadeUI(){
  districtBtn.disabled = !selectedProvince;
  districtBtn.title = selectedProvince ? "Filter by district" : "Select a province first";
  municipalityBtn.disabled = !selectedDistrict;
  municipalityBtn.title = selectedDistrict ? "Filter by municipality" : "Select a district first";
  wardBtn.disabled = !selectedMunicipality;
  wardBtn.title = selectedMunicipality ? "Filter by ward" : "Select a municipality first";
}

// Show the picked name right on the button itself (e.g. "Koshi Province"
// becomes just "Koshi") instead of the generic "Province"/"District" label,
// so the toolbar reflects the current selection at a glance.
function updateAdminButtonLabels(){
  const provinceLabel = provinceBtn.querySelector("span");
  const districtLabel = districtBtn.querySelector("span");
  const municipalityLabel = municipalityBtn.querySelector("span");
  const wardLabel = wardBtn.querySelector("span");

  provinceLabel.textContent = selectedProvince ? selectedProvince.replace(/\s+Province$/i, "") : "Province";
  districtLabel.textContent = selectedDistrict || "District";
  municipalityLabel.textContent = selectedMunicipality || "Municipality";

  if (selectedWard !== null){
    const key = muniKey(selectedDistrict, selectedMunicipality);
    const wardEntry = (MUNICIPALITY_WARD_MAP[key] || []).find(w => w.id === selectedWard);
    wardLabel.textContent = wardEntry ? `Ward ${wardEntry.ward_no}` : "Ward";
  } else {
    wardLabel.textContent = "Ward";
  }
}

// Runs everything that needs to stay in sync whenever the Province/District/
// Municipality/Ward selection changes: which boundary is highlighted, what
// the filter buttons say, the dynamic contribution/contributor totals, and
// (since sample markers/table rows are tagged with their admin path too)
// which markers and table rows are currently shown.
function onAdminSelectionChanged(){
  refreshBoundaryHighlights();
  updateAdminButtonLabels();
  renderStats();
  renderMarkers();
  renderTable();
}

function nudge(btn){
  btn.classList.remove("nudge");
  void btn.offsetWidth; // restart animation
  btn.classList.add("nudge");
  setTimeout(() => btn.classList.remove("nudge"), 500);
}

function renderProvinceList(){
  if (!provinceLayer) return;
  const names = PROVINCE_GEOJSON.features.map(f => f.properties.name).filter(Boolean);
  provinceList.innerHTML = names.length ? names.map(name => `
    <div class="dd-chip ${name === selectedProvince ? "selected" : ""}" data-province="${name}">${name}</div>
  `).join("") : `<div class="dd-empty">No provinces found</div>`;
}

function renderDistrictList(){
  if (!selectedProvince){
    districtList.innerHTML = `<div class="dd-empty">Select a province first</div>`;
    return;
  }
  const names = PROVINCE_DISTRICT_MAP[selectedProvince] || [];
  districtList.innerHTML = names.length ? names.map(name => `
    <div class="dd-chip ${name === selectedDistrict ? "selected" : ""}" data-district="${name}">${name}</div>
  `).join("") : `<div class="dd-empty">No districts in this province</div>`;
}

function renderMunicipalityList(){
  if (!selectedDistrict){
    municipalityList.innerHTML = `<div class="dd-empty">Select a district first</div>`;
    return;
  }
  const items = DISTRICT_MUNICIPALITY_MAP[selectedDistrict] || [];
  municipalityList.innerHTML = items.length ? items.map(item => `
    <div class="dd-chip ${item.name === selectedMunicipality ? "selected" : ""}" data-municipality="${item.name}" title="${item.typeLabel}">${item.name}</div>
  `).join("") : `<div class="dd-empty">No municipalities in this district</div>`;
}

function renderWardList(){
  if (!selectedMunicipality){
    wardList.innerHTML = `<div class="dd-empty">Select a municipality first</div>`;
    return;
  }
  const key = muniKey(selectedDistrict, selectedMunicipality);
  const wards = MUNICIPALITY_WARD_MAP[key] || [];
  wardList.innerHTML = wards.length ? wards.map(w => `
    <div class="dd-chip ${w.id === selectedWard ? "selected" : ""}" data-ward="${w.id}">Ward ${w.ward_no}</div>
  `).join("") : `<div class="dd-empty">No wards found for this municipality</div>`;
}

function clearWardSelection(){
  selectedWard = null;
  if (wardLayer){ map.removeLayer(wardLayer); wardLayer = null; }
  wardLayerById.clear();
  wardBtn.classList.remove("active-filter");
  onAdminSelectionChanged();
}

function clearMunicipalitySelection(){
  clearWardSelection();
  if (selectedMunicipality === null) return;
  selectedMunicipality = null;
  municipalityBtn.classList.remove("active-filter");
  if (municipalityLayer){ map.removeLayer(municipalityLayer); municipalityLayer = null; }
  onAdminSelectionChanged();
}

function clearDistrictSelection(){
  clearMunicipalitySelection();
  if (selectedDistrict === null) return;
  selectedDistrict = null;
  districtBtn.classList.remove("active-filter");
  if (districtLayer){ map.removeLayer(districtLayer); districtLayer = null; }
  onAdminSelectionChanged();
}

function clearProvinceSelection(){
  clearDistrictSelection();
  if (selectedProvince === null) return;
  selectedProvince = null;
  provinceBtn.classList.remove("active-filter");
  if (selectedProvinceLayer){ map.removeLayer(selectedProvinceLayer); selectedProvinceLayer = null; }
  onAdminSelectionChanged();
}

function selectProvince(name){
  if (selectedProvince === name){
    clearProvinceSelection();
  } else {
    clearDistrictSelection();
    selectedProvince = name;
    provinceBtn.classList.add("active-filter");
    if (selectedProvinceLayer) map.removeLayer(selectedProvinceLayer);
    const feature = PROVINCE_GEOJSON.features.find(f => f.properties.name === name);
    if (feature){
      selectedProvinceLayer = L.geoJSON(feature, { style: BOUNDARY_STYLE_DEFAULT }).addTo(map);
      map.fitBounds(selectedProvinceLayer.getBounds(), { padding: [20, 20] });
    }
  }
  renderProvinceList();
  renderDistrictList();
  renderMunicipalityList();
  renderWardList();
  updateCascadeUI();
  onAdminSelectionChanged();
}

function selectDistrict(name){
  if (districtBtn.disabled) return;
  if (selectedDistrict === name){
    clearDistrictSelection();
  } else {
    clearMunicipalitySelection();
    selectedDistrict = name;
    districtBtn.classList.add("active-filter");
    if (districtLayer) map.removeLayer(districtLayer);
    const feature = DISTRICT_GEOJSON.features.find(f => f.properties.name === name && f.properties.province === selectedProvince);
    if (feature){
      districtLayer = L.geoJSON(feature, {
        style: BOUNDARY_STYLE_DEFAULT,
        onEachFeature: (f, layer) => layer.bindTooltip(name, { sticky: true, direction: "top" }),
      }).addTo(map);
      map.fitBounds(districtLayer.getBounds(), { padding: [20, 20] });
    }
  }
  renderDistrictList();
  renderMunicipalityList();
  renderWardList();
  updateCascadeUI();
  onAdminSelectionChanged();
}

function selectMunicipality(name){
  if (municipalityBtn.disabled) return;
  if (selectedMunicipality === name){
    clearMunicipalitySelection();
  } else {
    clearWardSelection();
    selectedMunicipality = name;
    municipalityBtn.classList.add("active-filter");
    if (municipalityLayer) map.removeLayer(municipalityLayer);
    const feature = MUNICIPALITY_GEOJSON.features.find(f => f.properties.name === name && f.properties.district === selectedDistrict);
    if (feature){
      municipalityLayer = L.geoJSON(feature, {
        style: BOUNDARY_STYLE_DEFAULT,
        onEachFeature: (f, layer) => layer.bindTooltip(name, { sticky: true, direction: "top" }),
      }).addTo(map);
      map.fitBounds(municipalityLayer.getBounds(), { padding: [20, 20] });
    }

    // Build the ward layer for this municipality on demand (wards are only
    // ever drawn for whichever single municipality is currently selected).
    const wardFeatures = WARD_GEOJSON.features.filter(f => f.properties.district === selectedDistrict && f.properties.name === name);
    if (wardFeatures.length){
      // The ward polygons already tile the full municipality, so their outer
      // edges exactly retrace the municipality boundary drawn above. Leaving
      // both layers on the map at once renders that shared edge twice
      // (visible as a "double line"), so drop the municipality outline once
      // we have ward-level boundaries to show instead.
      if (municipalityLayer){ map.removeLayer(municipalityLayer); municipalityLayer = null; }
      wardLayer = L.geoJSON({ type: "FeatureCollection", features: wardFeatures }, {
        style: BOUNDARY_STYLE_DEFAULT,
        onEachFeature: (feature, layer) => {
          const wardId = feature.properties.id;
          wardLayerById.set(wardId, layer);
          layer.on("click", () => selectWard(wardId));
          layer.bindTooltip(`Ward ${feature.properties.ward_no}`, { sticky: true, direction: "top" });
        },
      }).addTo(map);
    }
  }
  renderMunicipalityList();
  renderWardList();
  updateCascadeUI();
  onAdminSelectionChanged();
}

function selectWard(wardId){
  if (wardBtn.disabled){
    nudge(municipalityBtn);
    return;
  }
  selectedWard = selectedWard === wardId ? null : wardId;
  if (selectedWard !== null && wardLayerById.has(selectedWard)){
    map.fitBounds(wardLayerById.get(selectedWard).getBounds(), { padding: [24, 24] });
  }
  wardBtn.classList.toggle("active-filter", selectedWard !== null);
  renderWardList();
  onAdminSelectionChanged();
}

provinceList.addEventListener("click", (e) => {
  const chip = e.target.closest(".dd-chip");
  if (!chip || !chip.dataset.province) return;
  selectProvince(chip.dataset.province);
});
districtList.addEventListener("click", (e) => {
  const chip = e.target.closest(".dd-chip");
  if (!chip || !chip.dataset.district) return;
  selectDistrict(chip.dataset.district);
});
municipalityList.addEventListener("click", (e) => {
  const chip = e.target.closest(".dd-chip");
  if (!chip || !chip.dataset.municipality) return;
  selectMunicipality(chip.dataset.municipality);
});
wardList.addEventListener("click", (e) => {
  const chip = e.target.closest(".dd-chip");
  if (!chip || !chip.dataset.ward) return;
  selectWard(Number(chip.dataset.ward));
});

provinceClearBtn.addEventListener("click", () => {
  clearProvinceSelection();
  renderProvinceList();
  renderDistrictList();
  renderMunicipalityList();
  renderWardList();
  updateCascadeUI();
});
districtClearBtn.addEventListener("click", () => {
  clearDistrictSelection();
  renderDistrictList();
  renderMunicipalityList();
  renderWardList();
  updateCascadeUI();
});
municipalityClearBtn.addEventListener("click", () => {
  clearMunicipalitySelection();
  renderMunicipalityList();
  renderWardList();
  updateCascadeUI();
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
    .filter(d => !selectedProvince || d.province === selectedProvince)
    .filter(d => !selectedDistrict || d.district === selectedDistrict)
    .filter(d => !selectedMunicipality || d.municipality === selectedMunicipality)
    .filter(d => selectedWard === null || d.wardId === selectedWard)
    .filter(d => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return d.contributor.toLowerCase().includes(q);
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
}

// ---------------------------------------------------------------------------
// Contribution stats — calculated live from CONTRIBUTORS (your real Neon
// data), scoped to whichever Province/District/Municipality/Ward is
// currently selected. "Points" is the sum of the points column across the
// matching rows; "Contributors" is the number of distinct contributor
// names among those rows (not the number of rows), so someone who added
// several places is only counted once.
// ---------------------------------------------------------------------------
function selectionStats(){
  // Match filteredRows() exactly, including the category filter — otherwise
  // these totals silently include rows from categories the user hasn't
  // selected, which will no longer match what's shown on the map/table.
  const rows = CONTRIBUTORS.filter(d =>
    activeCategories.has(d.category) &&
    (!selectedProvince || d.province === selectedProvince) &&
    (!selectedDistrict || d.district === selectedDistrict) &&
    (!selectedMunicipality || d.municipality === selectedMunicipality) &&
    (selectedWard === null || d.wardId === selectedWard)
  );
  const entryCount = rows.length; // number of contribution records
  const points = rows.reduce((s, r) => s + r.points, 0); // sum of points across those records
  const contributors = new Set(rows.map(r => r.contributor)).size;
  return { contributors, points, entryCount };
}
function selectionScopeLabel(){
  if (selectedWard !== null) return "Selected ward";
  if (selectedMunicipality) return selectedMunicipality;
  if (selectedDistrict) return selectedDistrict;
  if (selectedProvince) return selectedProvince.replace(/\s+Province$/i, "");
  return "All Nepal";
}

function renderStats(){
  const { contributors, points, entryCount } = selectionStats();
  miniStats.innerHTML = `
    <div class="mini-stat"><span class="mini-stat-value">${entryCount.toLocaleString()}</span><span class="mini-stat-label">Total Contributions</span></div>
    <div class="mini-stat"><span class="mini-stat-value">${contributors.toLocaleString()}</span><span class="mini-stat-label">Total Contributors</span></div>
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
      <div class="popup-wrap">
        <div class="popup-main">
          <div class="popup-cat" style="color:${meta.color}">${meta.icon} ${d.category}</div>
          <p class="popup-name">${d.name}</p>
          <button type="button" class="popup-photo-btn" data-id="${d.id}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            Photo
          </button>
          <p class="popup-addr" data-geo-addr data-id="${d.id}">${d.address}</p>
          <div class="popup-points">${d.points} pts</div>
        </div>
        <div class="popup-photo-panel" data-photo-panel>
          <img src="${d.photo || `https://picsum.photos/seed/${d.id}/240/200`}" alt="${d.name}" />
        </div>
      </div>
    `, { minWidth: 190, maxWidth: 340, autoPanPadding: [40, 40] });
    marker.on("click", () => setActiveRow(d.id, true));
    marker.on("popupopen", (e) => {
      const el = e.popup.getElement();
      if (!el) return;
      const btn = el.querySelector(".popup-photo-btn");
      const panel = el.querySelector("[data-photo-panel]");
      if (btn && panel){
        btn.addEventListener("click", () => {
          panel.classList.toggle("open");
          // Popup width is measured from its content; once the photo panel's
          // width changes we need to tell Leaflet to recompute the popup's
          // size/position so it doesn't clip or sit off-center.
          e.popup.update();
        });
      }
      loadGalliAddress(d, el, e.popup);
    });
    marker.addTo(markersLayer);
    markerById.set(d.id, marker);
  });
}

let tablePanelCollapsed = false;
let tablePanelManuallyClosed = false; // set by the close (✕) button; cleared once a category is (re)selected

// The Contributor Records panel only exists on screen once at least one
// category is active — no empty box, no tab, nothing. The collapse
// toggle (independent of that) lets the person shrink it to a slim bar
// once it's showing, without losing their category selection. The close
// (✕) button hides it outright; picking a category again brings it back.
function updateTablePanelVisibility(){
  const hasSelection = activeCategories.size > 0;
  const shouldShow = hasSelection && !tablePanelManuallyClosed;
  tablePanelEl.classList.toggle("hidden", !shouldShow);
  resizerEl.classList.toggle("hidden", !shouldShow || tablePanelCollapsed);
}
function reopenTablePanel(){
  tablePanelManuallyClosed = false;
}

function renderTable(){
  const rows = filteredRows();
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
let LEADERBOARD = [];

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
  reopenTablePanel();
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
  updateTablePanelVisibility();
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

tableCollapseBtn.addEventListener("click", () => {
  tablePanelCollapsed = !tablePanelCollapsed;
  tablePanelEl.classList.toggle("collapsed", tablePanelCollapsed);
  tableCollapseBtn.setAttribute("aria-expanded", String(!tablePanelCollapsed));
  tableCollapseBtn.title = tablePanelCollapsed ? "Expand panel" : "Collapse panel";
  updateTablePanelVisibility();
  if (typeof map !== "undefined" && map.invalidateSize) map.invalidateSize();
});

function toggleCategory(name, on){
  if (on) activeCategories.add(name); else activeCategories.delete(name);
  if (on){ unlockTableScroll(); reopenTablePanel(); }
  renderAll();
}

categoryBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const willOpen = categoryPanel.classList.contains("hidden");
  closeLeaderboard();
  closeProvincePanel();
  closeDistrictPanel();
  closeWardPanel();
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
  closeProvincePanel();
  closeDistrictPanel();
  closeWardPanel();
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

function closeProvincePanel(){
  provincePanel.classList.add("hidden");
  provinceBtn.classList.remove("open");
  provinceBtn.setAttribute("aria-expanded", "false");
}
function closeDistrictPanel(){
  districtPanel.classList.add("hidden");
  districtBtn.classList.remove("open");
  districtBtn.setAttribute("aria-expanded", "false");
}
function closeMunicipalityPanel(){
  municipalityPanel.classList.add("hidden");
  municipalityBtn.classList.remove("open");
  municipalityBtn.setAttribute("aria-expanded", "false");
}
function closeWardPanel(){
  wardPanel.classList.add("hidden");
  wardBtn.classList.remove("open");
  wardBtn.setAttribute("aria-expanded", "false");
}
function closeAllDropdownPanels(){
  categoryPanel.classList.add("hidden");
  categoryBtn.classList.remove("open");
  closeLeaderboard();
  closeProvincePanel();
  closeDistrictPanel();
  closeMunicipalityPanel();
  closeWardPanel();
}

provinceBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const willOpen = provincePanel.classList.contains("hidden");
  closeAllDropdownPanels();
  if (willOpen){
    provincePanel.classList.remove("hidden");
    provinceBtn.classList.add("open");
    provinceBtn.setAttribute("aria-expanded", "true");
  }
});
document.addEventListener("click", (e) => {
  if (!provincePanel.contains(e.target) && e.target !== provinceBtn){
    closeProvincePanel();
  }
});
provincePanel.addEventListener("click", (e) => e.stopPropagation());

districtBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (districtBtn.disabled){
    nudge(provinceBtn);
    return;
  }
  const willOpen = districtPanel.classList.contains("hidden");
  closeAllDropdownPanels();
  if (willOpen){
    districtPanel.classList.remove("hidden");
    districtBtn.classList.add("open");
    districtBtn.setAttribute("aria-expanded", "true");
  }
});
document.addEventListener("click", (e) => {
  if (!districtPanel.contains(e.target) && e.target !== districtBtn){
    closeDistrictPanel();
  }
});
districtPanel.addEventListener("click", (e) => e.stopPropagation());

municipalityBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (municipalityBtn.disabled){
    nudge(districtBtn);
    return;
  }
  const willOpen = municipalityPanel.classList.contains("hidden");
  closeAllDropdownPanels();
  if (willOpen){
    municipalityPanel.classList.remove("hidden");
    municipalityBtn.classList.add("open");
    municipalityBtn.setAttribute("aria-expanded", "true");
  }
});
document.addEventListener("click", (e) => {
  if (!municipalityPanel.contains(e.target) && e.target !== municipalityBtn){
    closeMunicipalityPanel();
  }
});
municipalityPanel.addEventListener("click", (e) => e.stopPropagation());

wardBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (wardBtn.disabled){
    nudge(municipalityBtn);
    return;
  }
  const willOpen = wardPanel.classList.contains("hidden");
  closeAllDropdownPanels();
  if (willOpen){
    wardPanel.classList.remove("hidden");
    wardBtn.classList.add("open");
    wardBtn.setAttribute("aria-expanded", "true");
  }
});
document.addEventListener("click", (e) => {
  if (!wardPanel.contains(e.target) && e.target !== wardBtn){
    closeWardPanel();
  }
});
wardPanel.addEventListener("click", (e) => e.stopPropagation());

wardClearBtn.addEventListener("click", () => {
  clearWardSelection();
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
  tablePanelCollapsed = false;
  tablePanelManuallyClosed = false;
  tablePanelEl.classList.remove("collapsed");
  tableCollapseBtn.setAttribute("aria-expanded", "true");
  tableCollapseBtn.title = "Collapse panel";

  clearProvinceSelection(); // cascades through district, municipality, and ward too
  renderProvinceList();
  renderDistrictList();
  renderMunicipalityList();
  renderWardList();
  updateCascadeUI();

  closeAllDropdownPanels();

  if (defaultMapBounds) map.fitBounds(defaultMapBounds, { padding: [20, 20] });
  else map.setView([28.3, 84.1], 7);
  renderAll();

  refreshBtn.classList.remove("spinning");
  void refreshBtn.offsetWidth; // restart animation
  refreshBtn.classList.add("spinning");
});

selectAllBtn.addEventListener("click", () => {
  activeCategories = new Set(CATEGORIES.map(c => c.name));
  reopenTablePanel();
  renderAll();
});
clearBtn.addEventListener("click", () => {
  activeCategories = new Set();
  renderAll();
});

tableCloseBtn.addEventListener("click", () => {
  tablePanelManuallyClosed = true;
  updateTablePanelVisibility();
  if (typeof map !== "undefined" && map.invalidateSize) map.invalidateSize();
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
// The toolbar now floats over the map (see .stage in style.css) instead of
// pushing it down, so its height can vary — it wraps to more rows on narrow
// screens, and gains a second row once category chips appear. Keep the
// Contributor Records panel (and its resizer handle) pinned just below the
// toolbar's *actual* rendered height rather than a guessed fixed offset.
// ---------------------------------------------------------------------------
(function syncPanelOffsetToToolbar(){
  const stageToolbar = document.querySelector(".stage > .toolbar");
  if (!stageToolbar || !tablePanelEl) return;
  function apply(){
    if (window.matchMedia("(max-width:980px)").matches){
      tablePanelEl.style.top = "";
      if (resizerEl) resizerEl.style.top = "";
      return;
    }
    const top = Math.ceil(stageToolbar.getBoundingClientRect().height) + 20; // toolbar's own top offset (10px) + a small gap
    tablePanelEl.style.top = `${top}px`;
    if (resizerEl) resizerEl.style.top = `${top}px`;
  }
  apply();
  if (window.ResizeObserver){
    new ResizeObserver(apply).observe(stageToolbar);
  } else {
    window.addEventListener("resize", apply);
  }
})();

// ---------------------------------------------------------------------------
// Init — fetch contributor data from your backend API (which talks to
// Neon), then build the leaderboard, categories, and the rest of the
// dashboard from that data.
// ---------------------------------------------------------------------------
const API_URL = "http://localhost:3000/api/places";

async function initDashboard(){
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`API request failed (${res.status})`);
    CONTRIBUTORS = await res.json();
  } catch (err) {
    console.error("Could not load data from the backend API:", err);
    CONTRIBUTORS = [];
  }

  tagContributorsWithAdminPath();
  computeCategories();
  jitterDuplicateCoords();
  LEADERBOARD = buildLeaderboard();

  renderLeaderboard();
  renderAll();
}

initDashboard();

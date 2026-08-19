const map = L.map("map", { zoomControl: true, attributionControl: true }).setView([31.70, 131.08], 13);
const areasLayer = L.featureGroup().addTo(map);
const apartmentsLayer = L.layerGroup().addTo(map);
const restrictedHomesLayer = L.layerGroup().addTo(map);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const text = (node, selector) => node.querySelector(selector)?.textContent?.trim() || "";
const coordinates = (value) => value.trim().split(/\s+/).map(item => {
  const [lng, lat] = item.split(",").map(Number);
  return [lat, lng];
}).filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));

function kmlColor(value, fallback) {
  if (!value || value.length < 8) return fallback;
  const a = parseInt(value.slice(0, 2), 16) / 255;
  const b = value.slice(2, 4), g = value.slice(4, 6), r = value.slice(6, 8);
  return { color: `#${r}${g}${b}`, opacity: a };
}

async function loadAreas() {
  const response = await fetch("./data/areas.kml");
  if (!response.ok) throw new Error("区域KMLを読み込めませんでした");
  const xml = new DOMParser().parseFromString(await response.text(), "application/xml");
  const styles = new Map();
  xml.querySelectorAll("Style").forEach(style => {
    const line = kmlColor(text(style, "LineStyle > color"), { color: "#315f90", opacity: 1 });
    const fill = kmlColor(text(style, "PolyStyle > color"), { color: "#7aa4ca", opacity: .4 });
    styles.set(style.id, { color: line.color, opacity: line.opacity, weight: 2, fillColor: fill.color, fillOpacity: fill.opacity });
  });
  xml.querySelectorAll("StyleMap").forEach(mapStyle => {
    const normal = [...mapStyle.querySelectorAll("Pair")].find(pair => text(pair, "key") === "normal");
    const styleId = text(normal || mapStyle, "styleUrl").replace("#", "");
    if (styles.has(styleId)) styles.set(mapStyle.id, styles.get(styleId));
  });

  xml.querySelectorAll("Placemark").forEach(place => {
    const name = text(place, ":scope > name");
    const areaId = name.match(/^M\d{3}/)?.[0];
    const management = window.AREA_STATUSES?.[areaId];
    const styleId = text(place, ":scope > styleUrl").replace("#", "");
    const rings = [...place.querySelectorAll("Polygon outerBoundaryIs LinearRing coordinates")].map(node => coordinates(node.textContent));
    if (!rings.length) return;
    const originalStyle = styles.get(styleId) || { color: "#315f90", weight: 2, fillColor: "#7aa4ca", fillOpacity: .4 };
    const polygonStyle = management ? { color: management.color, weight: 4, opacity: 1, fillColor: management.color, fillOpacity: .62 } : originalStyle;
    const polygon = L.polygon(rings, polygonStyle).addTo(areasLayer);
    polygon.bindTooltip(management ? `${name}｜${management.displayColor}` : name, { sticky: true, direction: "top" });
    if (management) {
      const sheetUrl = `${window.AREA_MANAGEMENT_SHEET_URL}&range=A${management.sheetRow}:L${management.sheetRow}`;
      polygon.bindPopup(`<article class="area-status-card"><div class="status-swatch" style="--status-color:${management.color}">${management.displayColor}</div><div class="card-id">スプレッドシート連携テスト</div><h2 class="card-title">${name}</h2><dl class="card-grid"><dt>保管区分</dt><dd>${management.storageType}</dd><dt>貸出状態</dt><dd>${management.loanStatus}</dd><dt>進捗</dt><dd>${management.progress}</dd><dt>経過判定</dt><dd>${management.elapsed}</dd></dl><a class="sheet-button area-sheet-button" href="${sheetUrl}" target="_blank" rel="noopener noreferrer">区域管理表を開く ↗</a></article>`, { maxWidth: 310 });
    }
    L.marker(polygon.getBounds().getCenter(), { interactive: false, icon: L.divIcon({ className: "area-label", html: name, iconSize: [90, 18], iconAnchor: [45, 9] }) }).addTo(areasLayer);
  });
  if (areasLayer.getLayers().length) map.fitBounds(areasLayer.getBounds(), { paddingTopLeft: [20, 95], paddingBottomRight: [20, 130] });
}

function addApartments() {
  window.APARTMENTS.forEach(apartment => {
    const icon = L.divIcon({ className: "", html: '<div class="apartment-pin"><span>🏢</span></div>', iconSize: [44, 44], iconAnchor: [15, 42], popupAnchor: [7, -40] });
    const popup = `<article><div class="card-id">${apartment.id}</div><h2 class="card-title">${apartment.name}</h2><dl class="card-grid"><dt>区域</dt><dd>${apartment.areaId}</dd><dt>部屋数</dt><dd>${apartment.roomCount}戸</dd><dt>ステータス</dt><dd>${apartment.status}</dd></dl><p class="card-note">101〜303号室の訪問状況を確認</p><a class="sheet-button" href="${apartment.sheetUrl}" target="_blank" rel="noopener noreferrer">部屋管理を開く ↗</a></article>`;
    L.marker(apartment.position, { icon, title: `${apartment.id}｜${apartment.name}`, zIndexOffset: 1000 }).addTo(apartmentsLayer).bindPopup(popup, { maxWidth: 300 });
  });
}

function addRestrictedHomes() {
  window.RESTRICTED_HOMES.forEach(home => {
    const icon = L.divIcon({ className: "", html: '<div class="restricted-pin"><span>×</span></div>', iconSize: [44, 44], iconAnchor: [15, 42], popupAnchor: [7, -40] });
    const popup = `<article class="restricted-card"><div class="sample-image"><img src="${home.imageUrl}" alt="訪問しない家の確認用サンプル画像"><strong>サンプル画像</strong></div><div class="card-id">${home.id}</div><h2 class="card-title">${home.label}</h2><dl class="card-grid"><dt>区域</dt><dd>${home.areaId}</dd><dt>状態</dt><dd class="danger-text">${home.status}</dd></dl><p class="card-note restricted-note">目印：${home.note}</p><div class="do-not-visit">この家は訪問しない</div></article>`;
    L.marker(home.position, { icon, title: `${home.id}｜${home.label}`, zIndexOffset: 1100 }).addTo(restrictedHomesLayer).bindPopup(popup, { maxWidth: 320 });
  });
}

function setPinFilter(filter) {
  map.closePopup();
  map.removeLayer(apartmentsLayer);
  map.removeLayer(restrictedHomesLayer);
  if (filter === "all" || filter === "apartments") apartmentsLayer.addTo(map);
  if (filter === "all" || filter === "restricted") restrictedHomesLayer.addTo(map);
  document.querySelectorAll(".filter-button").forEach(button => {
    const selected = button.dataset.filter === filter;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

document.querySelectorAll(".filter-button").forEach(button => button.addEventListener("click", () => setPinFilter(button.dataset.filter)));
document.getElementById("areas-toggle").addEventListener("click", event => {
  const visible = map.hasLayer(areasLayer);
  if (visible) map.removeLayer(areasLayer); else areasLayer.addTo(map);
  event.currentTarget.classList.toggle("active", !visible);
  event.currentTarget.setAttribute("aria-pressed", String(!visible));
  event.currentTarget.textContent = `区域境界 ${visible ? "OFF" : "ON"}`;
});

loadAreas().catch(error => {
  console.error(error);
  document.getElementById("loading").textContent = "区域データの読み込みに失敗しました";
}).finally(() => document.getElementById("loading").classList.add("hidden"));
addApartments();
addRestrictedHomes();

const map = L.map("map", { zoomControl: true, attributionControl: true }).setView([31.70, 131.08], 13);

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

  const group = L.featureGroup().addTo(map);
  xml.querySelectorAll("Placemark").forEach(place => {
    const name = text(place, ":scope > name");
    const styleId = text(place, ":scope > styleUrl").replace("#", "");
    const rings = [...place.querySelectorAll("Polygon outerBoundaryIs LinearRing coordinates")].map(node => coordinates(node.textContent));
    if (!rings.length) return;
    const polygon = L.polygon(rings, styles.get(styleId) || { color: "#315f90", weight: 2, fillColor: "#7aa4ca", fillOpacity: .4 }).addTo(group);
    polygon.bindTooltip(name, { sticky: true, direction: "top" });
    L.marker(polygon.getBounds().getCenter(), { interactive: false, icon: L.divIcon({ className: "area-label", html: name, iconSize: [90, 18], iconAnchor: [45, 9] }) }).addTo(group);
  });
  if (group.getLayers().length) map.fitBounds(group.getBounds(), { paddingTopLeft: [20, 95], paddingBottomRight: [20, 20] });
}

function addApartments() {
  window.APARTMENTS.forEach(apartment => {
    const icon = L.divIcon({ className: "", html: '<div class="apartment-pin"><span>🏢</span></div>', iconSize: [44, 44], iconAnchor: [15, 42], popupAnchor: [7, -40] });
    const popup = `<article><div class="card-id">${apartment.id}</div><h2 class="card-title">${apartment.name}</h2><dl class="card-grid"><dt>区域</dt><dd>${apartment.areaId}</dd><dt>部屋数</dt><dd>${apartment.roomCount}戸</dd><dt>ステータス</dt><dd>${apartment.status}</dd></dl><p class="card-note">101〜303号室の訪問状況を確認</p><a class="sheet-button" href="${apartment.sheetUrl}" target="_blank" rel="noopener noreferrer">部屋管理を開く ↗</a></article>`;
    L.marker(apartment.position, { icon, title: `${apartment.id}｜${apartment.name}`, zIndexOffset: 1000 }).addTo(map).bindPopup(popup, { maxWidth: 300 });
  });
}

loadAreas().catch(error => {
  console.error(error);
  document.getElementById("loading").textContent = "区域データの読み込みに失敗しました";
}).finally(() => document.getElementById("loading").classList.add("hidden"));
addApartments();

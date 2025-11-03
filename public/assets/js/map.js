const API_URL = "https://www.jma.go.jp/bosai/quake/data/list.json";
const listElement = document.getElementById("quake-list");
const reloadButton = document.getElementById("reload");

const defaultCenter = [36.0, 138.0];
const defaultZoom = 5;
const mapTop = L.map("map-top").setView(defaultCenter, defaultZoom);
let map = L.map('map').setView(defaultCenter, defaultZoom);

// const mapStyle = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'";
const mapStyle = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
// const mapStyle = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

L.tileLayer(mapStyle, {
	attribution:'&copy; OpenStreetMap, &copy; CARTO',
}).addTo(mapTop);

L.tileLayer(mapStyle, {
	attribution:'&copy; OpenStreetMap, &copy; CARTO',
}).addTo(map);

function getIntensityColor(maxi) {
	switch (maxi) {
		case "7": return "#b50068";
		case "6+": return "#a50022";
		case "6-": return "#ff2801";
		case "5+": return "#fe9900";
		case "5-": return "#fde600";
		case "4": return "#fae697";
		case "3": return "#0041ff";
		case "2": return "#00aaff";
		case "1": return "#f2f2fe";
		default: return "#fff";
	}
}

function getTextColor(maxi) {
	return ["2", "3", "6-", "6+", "7"].includes(maxi) ? "#fff" : "#000";
}

function formatDate(dateStr, format) {
	const date = new Date(dateStr);
	const pad = (num) => num.toString().padStart(2, '0');

	if (format === "iso") {
		return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
	} else if (format === "jp") {
		return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
	} else if (format === "kr") {
		return `${date.getFullYear()}년 ${pad(date.getMonth() + 1)}월 ${pad(date.getDate())}일 ${pad(date.getHours())}시 ${pad(date.getMinutes())}분`;
	} else if (format === "us") {
		return date.toLocaleString("en-US", { hour12: false });
	} else {
		return date.toString();
	}
}

// cod 예시: "+29.4+129.3-10000/"
function parseLatLon(cod) {
	if (!cod) return [null, null, null];
	const match = cod.match(/([+\-]\d{2}\.\d{1,10})([+\-]\d{3}\.\d{1,10})([+\-]?\d{1,10})?\//);
	if (!match) return [null, null, null];

	const safeFloat = (value) => {
		const num = parseFloat(value);
		return isNaN(num) ? null : num;
	};

	const lat = safeFloat(match[1]);
	const lon = safeFloat(match[2]);
	const depthRaw = match[3] !== undefined ? safeFloat(match[3]) : null;
	const depth = depthRaw !== null ? (Math.abs(depthRaw) / 1000) + "km" : null;

	return [lat, lon, depth];
}

function getMarkerIcon(maxi, color=getIntensityColor(maxi), size=25) {
    const height = size * 1.64;
    const cx = size / 2;
    const cy = size * 0.82;
    const r = size / 2 - 2.5;
	
	let svg;
	if (color === "#f2f2fe" || color === "#fff") {
		svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${height}">
		    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" stroke="black" stroke-width="1"/>
		</svg>`;
	} else {
		svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${height}">
		<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>
		</svg>`;
	}
    // const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${height}">
    //     <circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" stroke="black" stroke-width="0.5"/>
    // </svg>`;

    const url = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
	
    return L.icon({
		iconUrl: url,
        iconSize: [size, height],
        iconAnchor: [cx, cy],
        popupAnchor: [0, -cy]
    });
}

function addMarker(mapInstance, lang, lat, lon, item, time, depth, color, iconSize = 15, openPopup = false) {
    const marker = L.marker([lat, lon], { icon: getMarkerIcon(item.maxi, color, iconSize) })
        .addTo(mapInstance)
        .bindPopup(createPopupContent(lang, item, time, depth));
	
	if (openPopup) {
		marker.openPopup();
	}
	
    return marker;
}

function createPopupContent(lang, item, time, depth) {
    if (lang === "ja") {
        return `<b>${item.anm}</b><br>${time}<br>M${item.mag}<br>最大震度 ${item.maxi}<br>震源の深さ ${formatDepth(depth, lang)}`;
    } else {
        return `<b>${item.en_anm}</b><br>${time}<br>M${item.mag}<br>Max Intensity ${item.maxi}<br>Depth ${formatDepth(depth, lang)}`;
    }
}

function formatDepth(depth, lang) {
    if (depth === "0km") {
        return lang === "ja" ? "ごく浅い" : "Very shallow";
    }
    return depth;
}

function createQuakeCard(item, time, lang) {
    const card = document.createElement("div");
    card.className = "quake-card";
    card.style.backgroundColor = getIntensityColor(item.maxi);
    card.style.color = getTextColor(item.maxi);

    const titleLink = document.createElement("a");
    titleLink.className = "item-title";
    titleLink.target = "_blank";
    titleLink.href = lang === "ja"
        ? `https://www.data.jma.go.jp/multi/quake/quake_detail.html?eventID=${item.ctt}&lang=jp`
        : `https://www.data.jma.go.jp/multi/quake/quake_detail.html?eventID=${item.ctt}&lang=en`;
    const strong = document.createElement("strong");
    strong.textContent = lang === "ja" ? item.ttl : item.en_ttl;
    titleLink.appendChild(strong);
    card.appendChild(titleLink);
    card.appendChild(document.createElement("br"));

    const infos = [
        lang === "ja" ? `発生時刻: ${time}` : `Time: ${time}`,
        lang === "ja" ? `震源: ${item.anm}` : `Epicenter: ${item.en_anm}`,
        lang === "ja" ? `マグニチュード: M${item.mag}` : `Magnitude: M${item.mag}`,
        lang === "ja" ? `最大震度: ${item.maxi}` : `Max Intensity: ${item.maxi}`
    ];

    infos.forEach(text => {
        const small = document.createElement("small");
        small.textContent = text;
        card.appendChild(small);
        card.appendChild(document.createElement("br"));
    });

    return card;
}


const mapTopMarkers = [];
let topMarker;
let mapMarker;

async function fetchQuakes() {
	listElement.innerHTML = "<li>Loading...</li>";
	
	try {
		const res = await fetch(API_URL);
		const data = await res.json();
		const lang = document.documentElement.lang;

		listElement.innerHTML = "";

		data.forEach((item) => {
			let time;

			if (lang === "ja") {
				time = formatDate(item.at, "jp");
			} else {
				time = formatDate(item.at, "iso");
			}

			const coords = parseLatLon(item.cod);

			if (!coords || coords[0] === null || coords[1] === null) {
				return;
			}
			
			if (coords) {
				let [lat, lon, depth] = coords;

				topMarker = addMarker(mapTop, lang, lat, lon, item, time, depth, color = '#FF4D4A', iconSize = 15, openPopup = false);
				mapTopMarkers.push(topMarker);
			}

			const card = createQuakeCard(item, time, lang);

			card.addEventListener("click", () => {
				const coords = parseLatLon(item.cod);
				if (!coords || coords[0] === null || coords[1] === null) {
					return;
				}

				if (coords) {
					let [lat, lon, depth] = coords;

					if (mapMarker) map.removeLayer(mapMarker);
					mapMarker = addMarker(map, lang, lat, lon, item, time, depth, color = getIntensityColor(item.maxi), iconSize = 15, openPopup = true);
					map.setView([lat, lon], 8);
				} else {
					if (lang === "ja") {
						alert("位置情報が取得できませんでした。");
					} else {
						alert("Location information is not available.");
					}
				}
			});

			listElement.appendChild(card);
		});

	} catch (error) {
		console.error("Fetch error:", error);
		listElement.innerHTML = `<li>Failed to fetch data.</li>`;
	}
}

if (reloadButton) {
	reloadButton.addEventListener("click", () => {
		mapTop.setView(defaultCenter, defaultZoom);

		mapTopMarkers.forEach(marker => mapTop.removeLayer(marker));
		mapTopMarkers.length = 0;

		if (mapMarker) {
			map.setView(defaultCenter, defaultZoom);
			map.removeLayer(mapMarker);
			mapMarker = null;
		}
		fetchQuakes();
	});
}

fetchQuakes();
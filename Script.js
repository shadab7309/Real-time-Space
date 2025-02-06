const apiKey = "DYMBWF-LN69PK-5Q8XYQ-5EY3";  // Replace with your API key
let satId = "25544"; // Default: ISS
let globe = Globe() 
    .globeImageUrl("//unpkg.com/three-globe/example/img/earth-dark.jpg")
    .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
    .pointColor(() => 'cyan')
    .pointAltitude(() => 0.1)
    (document.getElementById('globe-container'));

let currentSatellite = { lat: 0, lng: 0, velocity: 0 };
let orbitPath = null;

async function fetchSatelliteData(satelliteId) {
    try {
        let response = await fetch(`https://api.n2yo.com/rest/v1/satellite/positions/${satelliteId}/0/0/0/1/&apiKey=${apiKey}`);
        let data = await response.json();
        let pos = data.positions[0];

        document.getElementById("sat-name").textContent = `Satellite ID: ${satelliteId}`;
        document.getElementById("lat").textContent = pos.satlatitude.toFixed(2);
        document.getElementById("lng").textContent = pos.satlongitude.toFixed(2);
        document.getElementById("alt").textContent = pos.sataltitude.toFixed(2);
        document.getElementById("velocity").textContent = pos.satvelocity.toFixed(2);

        updateSatelliteOrbit(pos.satlatitude, pos.satlongitude);
        animateSatellite(pos.satlatitude, pos.satlongitude, pos.satvelocity);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function updateSatelliteOrbit(lat, lng) {
    if (orbitPath) {
        globe.removeObject(orbitPath);
    }

    let orbitPoints = [];
    for (let i = 0; i < 360; i++) {
        orbitPoints.push({
            lat: lat + 0.1 * Math.sin(i * Math.PI / 180),  // Adjust for orbit visualization
            lng: lng + 0.1 * Math.cos(i * Math.PI / 180),
        });
    }

    orbitPath = {
        path: orbitPoints,
        color: 'cyan',
        width: 0.5,
    };

    globe.addObject(orbitPath);
}

function animateSatellite(newLat, newLng, velocity) {
    let step = 0.02;
    let interval = setInterval(() => {
        currentSatellite.lat += step * (newLat - currentSatellite.lat);
        currentSatellite.lng += step * (newLng - currentSatellite.lng);

        globe.pointsData([{ lat: currentSatellite.lat, lng: currentSatellite.lng, size: 5 }]);

        if (Math.abs(currentSatellite.lat - newLat) < 0.01 && Math.abs(currentSatellite.lng - newLng) < 0.01) {
            clearInterval(interval);
        }
    }, 50);
}

function searchSatellite() {
    let inputId = document.getElementById("search-box").value.trim();
    if (inputId) {
        satId = inputId;
        fetchSatelliteData(satId);
    }
}

function selectSatellite() {
    satId = document.getElementById("satellite-list").value;
    fetchSatelliteData(satId);
}

fetchSatelliteData(satId);
setInterval(() => fetchSatelliteData(satId), 5000);

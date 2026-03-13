// Used specifically for coloring the map
const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name);

const clamp = (val, min, max) => Math.max(min, Math.min(val, max));

const sortLowToHigh = (val) => val.sort((a, b) => a - b);

// Population to legible string
function formatPopulation(n) {
    // '+' converts to a number, dropping excess zeros
    if (n >= 1e9) return +(n / 1e9).toFixed(2) + 'B'; // 2 digits to separate the largest countries
    if (n >= 1e6) return +(n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return +(n / 1e3).toFixed(1) + 'K';
    return String(n); // If below 1000
}

// Area (km²) to legible string
function formatArea(n) {
    if (n >= 1e6) return +(n / 1e6).toFixed(2) + 'M km²';
    if (n >= 1e3) return +(n / 1e3).toFixed(1) + 'K km²';
    return String(n) + ' km²'; // If below 1000
}

function randomizeDeck(unsortedDeck) {
    return unsortedDeck.sort(() => 0.5 - Math.random()); // TODO: Use a real shuffle
}

function filterDeck(countries, {popMin, popMax, areaMin, areaMax}) {
    const conditions = [];

    // Loose == for undefined
    if (popMin != null) conditions.push(c => c.population >= popMin);
    if (popMax != null) conditions.push(c => c.population <= popMax);
    if (areaMin != null) conditions.push(c => c.area >= areaMin);
    if (areaMax != null) conditions.push(c => c.area <= areaMax);

    const filteredDeck = countries.filter(
        c => conditions.every((condition) => condition(c))
    );

    if (filteredDeck.length) return randomizeDeck(filteredDeck);

    showToast('No countries match');

    return randomizeDeck(countries);
}

// Fix countries that cross the antimeridian (e.g. Fiji, Russia, New Zealand)
// Applied per-polygon so countries like the US don't get their mainland shifted off-screen
function fixAntimeridian(geo) {
    if (geo.type === 'MultiPolygon') {
        return {
            type: 'MultiPolygon',
            coordinates: geo.coordinates.map(fixAntimeridianRing),
        };
    }
    if (geo.type === 'Polygon') {
        return {
            type: 'Polygon',
            coordinates: fixAntimeridianRing(geo.coordinates),
        };
    }
    return geo;
}

// Fix for bounding boxes that stretch across the date line
function fixAntimeridianRing(rings) {
    const longitudes = [];
    const collectLongitudes = (c) => {
        if (typeof c[0] === 'number') { longitudes.push(c[0]); return; }
        c.forEach(collectLongitudes);
    };
    collectLongitudes(rings);

    if (!longitudes.some(l => l < -160) || !longitudes.some(l => l > 160)) return rings;

    const shift = (c) => {
        if (typeof c[0] === 'number') return [c[0] < 0 ? c[0] + 360 : c[0], c[1]];
        return c.map(shift);
    };
    return shift(rings);
}

function pointInGeometry(point, geometry) {
    const polys = geometry.type === 'MultiPolygon'
        ? geometry.coordinates
        : [geometry.coordinates]; // Wrap Polygon as single-element array
    return polys.some(rings => pointInPolygon(point, rings[0])); // Test outer ring only
}

// Ray casting (https://en.wikipedia.org/wiki/Point_in_polygon)
function pointInPolygon([px, py], ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [xi, yi] = ring[i];
        const [xj, yj] = ring[j];
        if ((yi > py) !== (yj > py) &&
            px < (xj - xi) * (py - yi) / (yj - yi) + xi) {
            inside = !inside;
        }
    }
    return inside;
}

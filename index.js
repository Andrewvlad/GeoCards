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

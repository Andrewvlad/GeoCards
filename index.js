const sortLowToHigh = (val) => val.sort((a, b) => a - b);

// Population to legible string
function formatPopulation(n) {
    // '+' converts to a number, dropping excess zeros
    if (n >= 1e9) return +(n / 1e9).toFixed(2) + 'B'; // 2 digits to separate the largest countries
    if (n >= 1e6) return +(n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return +(n / 1e3).toFixed(1) + 'K';
    return String(n); // If below 1000
}

function randomizeDeck(unsortedDeck) {
    return unsortedDeck.sort(() => 0.5 - Math.random()); // TODO: Use a real shuffle
}

function filterDeck(countries, {min, max}) {
    const conditions = [];

    if (min != null) { // Loose == for undefined
        conditions.push(({population}) => population >= min);
    }

    if (max != null) { // Loose == for undefined
        conditions.push(({population}) => population <= max);
    }

    const filteredDeck = countries.filter(
        c => conditions.every((condition) => condition(c))
    );

    if (filteredDeck.length) return randomizeDeck(filteredDeck);

    showToast('No countries match');

    return randomizeDeck(countries);
}

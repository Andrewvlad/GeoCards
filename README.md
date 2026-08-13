# GeoCards
A free flashcard app to learn countries. 

I've always wanted to be more knowledgeable about countries, so I decided to make a lightweight game out of it!
Hosted [here](https://andrewvlad.github.io/GeoCards/) on GitHub.

| ![map_example.png](.github/media/map_example.png "Map mode example")    | ![skip_example.png](.github/media/skip_example.png "Card skip example")          |
|-------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| ![info_example.png](.github/media/info_example.png "Card back example") | ![correct_example.png](.github/media/correct_example.png "Card correct example") |

## Modes
- Location - Recognize the country by geographic location
- Flag - Recognize the country by flag
- Name - Recognize the country by name
- Capital - Recognize the country by capital city/cities

## Features
- Auto-saves session, stats, and settings to localStorage
- Keybindings and gesture controls
    - `[SPACE]` (or tap) - Flip card
    - `[←]`/`[→]` (or swipe) - Mark wrong/correct/skip

## Settings
- Filter countries by population and area
- Recycle wrong cards

## TODO
- [x] Mobile support
- [x] Add skipping
- [x] Display population
- [x] Display capitals
- [x] Capitals mode
- [ ] Multiple choice mode
- [x] Population filter
- [ ] -dles (daily) mode
- [ ] Downloadable file with internal CSS

## Overview
The app runs entirely clientside using HTML/CSS/JS.
Country data is served from `countries.json`, built by `scripts/build-countries.py` from
[mledoze/countries](https://github.com/mledoze/countries) and [Wikidata](https://www.wikidata.org/) populations, with flags from [flagcdn](https://flagcdn.com/).
A nightly GitHub Action regenerates it, so the app itself depends on no third-party API at runtime.
Borders are rendered on a [Leaflet](https://leafletjs.com/) map using [Natural Earth](https://www.naturalearthdata.com/downloads/)'s vector data.
Progress and settings are saved using localstorage. 
Card swiping is supported for both mobile touch gestures and desktop dragging.

# Disclaimer
I do not manage the borders, nor sovereignty of the countries.
Those are managed by the upstream data sources themselves.
Feel free to fork to match your political beliefs.

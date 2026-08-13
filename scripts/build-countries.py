#!/usr/bin/env python3
"""Regenerate countries.json from keyless upstream sources.

Replaces the deprecated restcountries.com v3.1 API. Output schema matches what
index.html destructures, so it stays a drop-in for the old fetch response.
"""

import json
import sys
import urllib.parse
import urllib.request

COUNTRIES = 'https://raw.githubusercontent.com/mledoze/countries/master/dist/countries.json'
WIKIDATA = 'https://query.wikidata.org/sparql'
# Every ISO 3166-1 alpha-2 with a population, one row per recorded value
POPULATION_QUERY = '''
SELECT ?iso2 ?pop ?when WHERE {
    ?country wdt:P297 ?iso2 ; p:P1082 ?statement .
    ?statement ps:P1082 ?pop .
    OPTIONAL { ?statement pq:P585 ?when }
}
'''
FLAG_CDN = 'https://flagcdn.com/w320'
OUTPUT = 'countries.json'
MINIMUM_EXPECTED_COUNTRIES = 200


def fetch_json(url, headers=None):
    request = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(request, timeout=120) as response:
        return json.load(response)


def population_by_cca2():
    url = f'{WIKIDATA}?{urllib.parse.urlencode({"query": POPULATION_QUERY})}'
    payload = fetch_json(url, {
        'Accept': 'application/sparql-results+json',
        'User-Agent': 'GeoCards/1.0 (https://github.com/Andrewvlad/GeoCards)',
    })

    # Countries carry several population statements across census years, so keep
    # the most recent. Undated statements sort oldest and only win by default.
    latest = {}
    for row in payload['results']['bindings']:
        cca2 = row['iso2']['value']
        when = row.get('when', {}).get('value', '')
        if cca2 not in latest or when > latest[cca2][1]:
            latest[cca2] = (int(float(row['pop']['value'])), when)

    return {cca2: population for cca2, (population, _) in latest.items()}


def build():
    countries = fetch_json(COUNTRIES)
    populations = population_by_cca2()

    built, unpopulated = [], []
    for country in countries:
        common = country['name']['common']
        cca2 = country['cca2']
        population = populations.get(cca2)

        # Uninhabited and disputed territories have no population to quiz on
        if population is None:
            unpopulated.append(common)
            continue

        built.append({
            'name': {'common': common},
            # restcountries served per-flag descriptive alt text that no keyless
            # source carries, so screen readers get the country name instead
            'flags': {
                'png': f'{FLAG_CDN}/{cca2.lower()}.png',
                'alt': f'Flag of {common}',
            },
            'cca2': cca2,
            'ccn3': country.get('ccn3'), # String, matched against world-atlas feature ids
            'capital': country.get('capital', []),
            'population': population,
            'region': country.get('region'),
            'subregion': country.get('subregion'),
            'latlng': country.get('latlng'),
            'area': country.get('area'),
        })

    built.sort(key=lambda c: c['name']['common'])

    # A short file means an upstream shape change, so fail before committing
    # data that would break the app
    if len(built) < MINIMUM_EXPECTED_COUNTRIES:
        sys.exit(f'Only {len(built)} countries, expected {MINIMUM_EXPECTED_COUNTRIES}+. Upstream changed?')

    with open(OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(built, f, ensure_ascii=False, separators=(',', ':'))
        f.write('\n')

    print(f'Wrote {len(built)} countries to {OUTPUT}')
    print(f'Skipped {len(unpopulated)} without population: {", ".join(sorted(unpopulated))}')


if __name__ == '__main__':
    build()

loadData().then(data => {

	// For no country selected by default
	this.activeCountry = null;
	this.activeYear = ["2000", "2000"]
    let that = this;

    function updateCountry(countryID) {
        that.activeCountry = countryID;
    }

    const worldMap = new Map(data, updateCountry);

    d3.json('../data/world.json').then(mapData => {
        worldMap.drawMap(mapData);
    });

    worldMap.yearslider()
    worldMap.updateMap(this.activeYear, 'child-mortality');

});

// ******* DATA LOADING *******
async function loadFile(file) {
    let data = await d3.csv(file).then(d => {
        let mapped = d.map(g => {
            for (let key in g) {
                let numKey = +key;
                if (numKey) {
                    g[key] = +g[key];
                }
            }
            return g;
        });
        return mapped;
    });
    return data;
}

async function loadData() {
    let cmu = await loadFile('../../data/changed_csv/child-mortality.csv');
    let bcpp = await loadFile('../../data/changed_csv/beer-consumption-per-person.csv');
    let cmilc = await loadFile('../../data/changed_csv/child-mortality-by-income-level-of-country.csv');
    let eyl = await loadFile('../../data/changed_csv/expected-years-of-living-with-disability-or-disease-burden.csv');
    let le = await loadFile('../../data/changed_csv/life-expectancy.csv');
    let mm = await loadFile('../../data/changed_csv/maternal-mortality.csv');
    let ma = await loadFile('../../data/changed_csv/median-age.csv');
    let pvc = await loadFile('../../data/changed_csv/polio-vaccine-coverage-of-one-year-olds.csv');
    let spc = await loadFile('../../data/changed_csv/share-of-population-with-cancer.csv');
    let sad = await loadFile('../../data/changed_csv/share-with-alcohol-use-disorders.csv');
    let smsd = await loadFile('../../data/changed_csv/share-with-mental-and-substance-disorders.csv');
    let the = await loadFile('../../data/changed_csv/total-healthcare-expenditure-as-share-of-national-gdp-by-country.csv');

    return {
        'child-mortality': cmu,
        'beer-consumption-per-person.csv': bcpp,
        'child-mortality-by-income-level-of-country.csv': cmilc,
        'expected-years-of-living-with-disability-or-disease-burden.csv': eyl,
        'life-expectancy.csv': le,
        'maternal-mortality.csv': mm,
        'median-age.csv': ma,
        'polio-vaccine-coverage-of-one-year-olds.csv': pvc,
        'share-of-population-with-cancer.csv': spc,
        'share-with-alcohol-use-disorders.csv': sad,
        'share-with-mental-and-substance-disorders.csv': smsd,
        'total-healthcare-expenditure-as-share-of-national-gdp-by-country.csv': the
    };
}
import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Nav from './components/Nav';
import Map from './components/Map';
import Sidebar from './components/Sidebar';

type FipsCasesMap = {
    date: Date,
    state: string,
    county: string,
    population: number
    cases: number,
    casesPerThousand: number,
    deaths: number,
    deathsPerThousand: number
}

const MapContainer = () => {
    const [countyData, setCountyData] = useState();
    const [virusData, setVirusData] = useState();
    const [censusTable, setCensusTable] = useState();
    const [fipsToCases, setFipsToCases] = useState();
    const [minCasesPerT, setMinCasesPerT] = useState();
    const [maxCasesPerT, setMaxCasesPerT] = useState();
    const [minDeathsPerT, setMinDeathsPerT] = useState();
    const [maxDeathsPerT, setMaxDeathsPerT] = useState();
    const [activeCounty, setActiveCounty] = useState<string>();

    const ratePerThousand = (cases: number, population: number): number => {
        if (population === 0) {
            return 0;
        }
        return (cases * 1000) / population;
    }

    const BRONX = '36005';
    const NEW_YORK = '36061';
    const QUEENS = '36081';
    const KINGS = '36047';
    const RICHMOND = '36085';
    const NYC = [BRONX, NEW_YORK, QUEENS, KINGS, RICHMOND];

    useEffect(() => {
        let getData = async () => {
            // County GeoJSON
            let cResponse = await fetch('/data/county.json')
            if (!cResponse.ok) {
                throw new Error('HTTP Error: county GeoJSON not loaded');
            }
            let cData = await cResponse.json();

            // Virus Counts
            let vResponse = await fetch('https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv');
            if (!vResponse.ok) {
                throw new Error('HTTP Error: case counts not loaded');
            }
            let vCsvString = await vResponse.text();
            let {data, errors, meta} = Papa.parse(vCsvString, {header: true});
            setVirusData(data);

            // Census Data
            let censusResponse = await fetch('/data/census.csv');
            if (!censusResponse.ok) {
                throw new Error('HTTP Error: census data not loaded');
            }
            let censusCsvString = await censusResponse.text();
            let {data: censusData} = Papa.parse(censusCsvString, {header: true});
            let censusLookupTable = censusData.reduce((acc: any, val: any) => {
                acc[val.GEOID] = Number(val.POPESTIMATE2019);
                return acc;
            }, {});
            setCensusTable(censusLookupTable);

            // You need to relate a FIPS to the most recent count
            // You also need to annotate the GeoJSON with case numbers

            // Iterate over the cases array, for each update an object
            // where the key is the FIPS number as a string, and the value is
            // the number of cases

            // Then iterate over the GeoJSON, and annotate with case numbers by looking up the fips
            // TODO: implement types
            let minCasesPerThousand = 0;
            let maxCasesPerThousand = 0;
            let minDeathsPerThousand = 0;
            let maxDeathsPerThousand = 0;
            let fipsToCasesTable = data.reduce((acc: any, val: any) => {
                // Special case for NYC
                let fips = val.county === 'New York City' ? '99999' : val.fips;

                let d = new Date(val.date);
                let population = censusLookupTable[fips];
                let cases = Number(val.cases);
                let casesPerThousand = ratePerThousand(cases, population);
                let deaths = Number(val.deaths);
                let deathsPerThousand = ratePerThousand(deaths, population);
                
                if (casesPerThousand < minCasesPerThousand) {
                    minCasesPerThousand = casesPerThousand;
                }
                if (casesPerThousand > maxCasesPerThousand) {
                    maxCasesPerThousand = casesPerThousand;
                }
                if (casesPerThousand < minDeathsPerThousand) {
                    minDeathsPerThousand = casesPerThousand;
                }
                if (casesPerThousand > maxDeathsPerThousand) {
                    maxDeathsPerThousand = casesPerThousand;
                }


                let datum: FipsCasesMap = {
                    date: d,
                    state: val.state,
                    county: val.county,
                    population: population,
                    cases: cases,
                    casesPerThousand: casesPerThousand,
                    deaths: deaths,
                    deathsPerThousand: deathsPerThousand 
                };

                if (acc[fips]) {
                    let idx = acc[fips].findIndex((el: FipsCasesMap) => el.date > d);
                    if (idx < 0) {
                        acc[fips].push(datum);
                        return acc;
                    }
                    acc[fips].splice(idx, 0, datum);
                    return acc;
                }
                acc[fips] = [datum];
                return acc;
            }, {});
            setFipsToCases(fipsToCasesTable);
            setMinCasesPerT(minCasesPerThousand);
            setMaxCasesPerT(maxCasesPerThousand);
            setMinDeathsPerT(minDeathsPerThousand);
            setMaxDeathsPerT(maxDeathsPerThousand);

            let annotatedFeatures = cData.features.map((val: any) => {
                // Special case for NYC, rewrite GEOID to a non-valid FIPS number
                // Use this to map information to the five boroughs
                if (NYC.includes(val.properties.GEOID)) {
                    val.properties.GEOID = '99999';
                    val.properties['CASES'] = fipsToCasesTable['99999'] || null;
                    return val;
                }
                val.properties['CASES'] = fipsToCasesTable[val.properties.GEOID] || null;
                return val;
            });
            cData.features = annotatedFeatures;
            setCountyData(cData);
        }

        getData();
    }, [])
    return (
        <div id="map-container" className="container-fluid">
            <div className="row">
                <div className="col-4">
                    <div className="container">
                        <Sidebar countyData={activeCounty ? fipsToCases[activeCounty] : null} />
                    </div>
                </div>
                <div className="col-8 sidebar">
                    {countyData &&
                    <Map countyData={countyData}
                         minCasesPerT={minCasesPerT}
                         maxCasesPerT={maxCasesPerT}
                         minDeathsPerT={minDeathsPerT}
                         maxDeathsPerT={maxDeathsPerT}
                         activeCounty={activeCounty}
                         setActiveCounty={setActiveCounty}/>}
                </div>
            </div>
        </div>
    )
}

function App() {
  return (
    <div className="App">
        <div>
            <Nav/>
        </div>
        <MapContainer/>
    </div>
  );
}

export default App;

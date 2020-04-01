import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Nav from './components/Nav';
import Map from './components/Map';
import Sidebar from './components/Sidebar';

type FipsCasesMap = {
    date: Date,
    cases: number,
    casePct: number,
    deaths: number,
    deathPct: number
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
    const [activeCounty, setActiveCounty] = useState<number>();

    const ratePerThousand = (cases: number, population: number): number => {
        if (population == 0) {
            return 0;
        }
        return (cases * 1000) / population;
    }

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
                let d = new Date(val.date);
                let population = censusLookupTable[val.fips];
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

                if (acc[val.fips]) {
                    if (acc[val.fips].date < d) {
                        acc[val.fips] = {
                            date: d,
                            state: val.state,
                            county: val.county,
                            population: population,
                            cases: cases,
                            casesPerThousand: casesPerThousand,
                            deaths: deaths,
                            deathsPerThousand: deathsPerThousand 
                        }
                    } else {
                        return acc;
                    }
                }
                acc[val.fips] = {
                    date: d,
                    state: val.state,
                    county: val.county,
                    population: population,
                    cases: cases,
                    casesPerThousand: casesPerThousand,
                    deaths: deaths,
                    deathsPerThousand: deathsPerThousand 
                }
                return acc;
            }, {});
            setFipsToCases(fipsToCasesTable);
            setMinCasesPerT(minCasesPerThousand);
            setMaxCasesPerT(maxCasesPerThousand);
            setMinDeathsPerT(minDeathsPerThousand);
            setMaxDeathsPerT(maxDeathsPerThousand);

            let annotatedFeatures = cData.features.map((val: any) => {
                val.properties['CASES'] = fipsToCasesTable[val.properties.GEOID] || null;
                return val;
            });
            cData.features = annotatedFeatures;
            setCountyData(cData);
        }

        getData();
    }, [])
    return (
        <div id="map-container" className="row">
            <div className="col-4">
                <div className="container">
                    <Sidebar countyData={activeCounty ? fipsToCases[activeCounty] : null} />
                </div>
            </div>
            <div className="col-8">
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

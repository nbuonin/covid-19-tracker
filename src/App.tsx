import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Nav from './components/Nav';
import Map from './components/Map';

const MapContainer = () => {
    const [countyData, setCountyData] = useState();
    const [virusData, setVirusData] = useState();
    const [fipsToCases, setFipsToCases] = useState();

    useEffect(() => {
        let getData = async () => {
            let cResponse = await fetch('/data/county.json')
            if (!cResponse.ok) {
                throw new Error('HTTP Error');
            }
            let cData = await cResponse.json();

            let vResponse = await fetch('https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv');
            if (!vResponse.ok) {
                throw new Error('HTTP Error');
            }
            let vCsvString = await vResponse.text();
            let {data, errors, meta} = Papa.parse(vCsvString, {header: true});
            setVirusData(data);

            // You need to relate a FIPS to the most recent count
            // You also need to annotate the GeoJSON with case numbers

            // Iterate over the cases array, for each update an object
            // where the key is the FIPS number as a string, and the value is
            // the number of cases

            // Then iterate over the GeoJSON, and annotate with case numbers by looking up the fips
            // TODO: eventuall implement this as cases per thousand
            let maxCases = 0;
            let maxDeaths = 0;
            data.map((val: any) => {
                let cases = Number(val.cases);
                if (cases > maxCases) {
                    maxCases = cases;
                }
                let deaths = Number(val.deaths);
                if (deaths > maxDeaths) {
                    maxDeaths = deaths;
                }
            });
            let fipsToCasesTable = data.reduce((acc, val) => {
                let d = new Date(val.date);
                let cases = Number(val.cases);
                let deaths = Number(val.deaths);

                if (acc[val.fips]) {
                    if (acc[val.fips].date < d) {
                        acc[val.fips] = {
                            date: d,
                            cases: cases,
                            casePct: cases / maxCases,
                            deaths: deaths,
                            deathPct: deaths / maxDeaths
                        }
                    } else {
                        return acc;
                    }
                }
                acc[val.fips] = {
                    date: d,
                    cases: cases,
                    casePct: cases / maxCases,
                    deaths: deaths,
                    deathPct: deaths / maxDeaths
                }
                return acc;
            }, {});
            setFipsToCases(fipsToCasesTable);

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
            <div className="col-9">
                {countyData && <Map countyData={countyData}/>}
            </div>
            <div className="col-3">
                sidebar
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

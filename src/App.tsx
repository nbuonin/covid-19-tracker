import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Nav from './components/Nav';
import Map from './components/Map';

const MapContainer = () => {
    const [countyData, setCountyData] = useState();

    useEffect(() => {
        fetch('/data/county.json')
        .then((response) => {
            if (!response.ok) {
                throw new Error('HTTP Error');
            }
            return response.json();
        })
        .then((countyData) => {
            setCountyData(countyData)
        });
    }, []);
    return (
        <div id="map-container" className="row">
            <div className="col-9">
                <Map countyData={countyData}/>
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

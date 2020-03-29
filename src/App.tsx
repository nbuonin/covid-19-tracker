import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Nav from './components/Nav';
import Map from './components/Map';

function App() {
  return (
    <div className="App">
        <div>
            <Nav/>
        </div>
        <div id="map-container" className="row">
            <div className="col-9">
                <Map/>
            </div>
            <div className="col-3">
                sidebar
            </div>
        </div>
    </div>
  );
}

export default App;

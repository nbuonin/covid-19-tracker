import React, { useState, useEffect } from 'react';
// Mapbox and ReactMap bindings
import ReactMapGL, {
    Marker, Popup, NavigationControl, FullscreenControl
} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {GeoJSON} from 'geojson';

// Deck.gl
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';

const TOKEN = 'pk.eyJ1IjoibmIyNDEzIiwiYSI6ImNrMndkdDByczAwdnkzZ28yN2dwYjF5dWIifQ.4pPTuMIJvdboMXok3Xux-A';


const Map = () => {
    const [viewportState, setViewport] = useState({
            viewport: {
                latitude: 40,
                longitude: -100,
                zoom: 3,
                bearing: 0,
                pitch: 0
            }
    });
    const [countyData, setCountyData] = useState();
    const [countyLayer, setCountyLayer] = useState();

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
            // If you need to add data to the county GeoJSON information, this is
            // the place to do it
            setCountyLayer(new GeoJsonLayer({
                data: countyData,
                stroked: true,
                filled: false,
                getLineColor: [0, 0, 0, 255],
                getLineWidth: 250
            }));
        });
    }, []);

    console.log(countyLayer);
    return (
        <ReactMapGL
            {...viewportState.viewport}
            width="100%"
            height="100%"
            onViewportChange={viewport => setViewport({viewport})}
            mapStyle="mapbox://styles/mapbox/light-v9"
            mapboxApiAccessToken={TOKEN}
        >
            {countyLayer &&
                <DeckGL
                    layers={[countyLayer]}
                    viewState={viewportState.viewport}
                    width={"100%"}
                    height={'100%'}
                    controller={true} />
            }
        </ReactMapGL>
    )
}

export default Map;

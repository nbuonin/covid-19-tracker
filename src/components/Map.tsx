import React, { useState, useEffect } from 'react';
// Mapbox and ReactMap bindings
import { StaticMap } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {GeoJSON} from 'geojson';

// Deck.gl
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';

const TOKEN = 'pk.eyJ1IjoibmIyNDEzIiwiYSI6ImNrMndkdDByczAwdnkzZ28yN2dwYjF5dWIifQ.4pPTuMIJvdboMXok3Xux-A';


// TODO: Type GeoJSON
type MapProps = {
    countyData: any
}
const Map = ({countyData}: MapProps) => {
    const [viewportState, setViewport] = useState({
            viewport: {
                latitude: 40,
                longitude: -100,
                zoom: 3,
                bearing: 0,
                pitch: 0
            }
    });
    const [countyLayer, setCountyLayer] = useState();

    const [countyHoverData, setCountyHoverData] = useState();
    const onCountyHover = (info: any, event: any) => {
        setCountyHoverData({x: info.x, y: info.y, hoveredObject: info.object});
    }

    const onCountyClick = (info: any, event: any) => {
        console.log('clicking');
    }
    const renderTooltip = () => {
        const {x, y, hoveredObject} = countyHoverData;
        if(hoveredObject) {
            console.log(hoveredObject.properties);
        }
        return (
            hoveredObject && (
                <div className={""}
                    style={{top: y, left: x, position: 'absolute', pointerEvents: 'none'}}>
                    <div className="arrow"/>
                    <div className="tooltip-inner">
                        {hoveredObject.properties.NAME}<br/>
                        Cases: {hoveredObject.properties.CASES.cases || ''}<br/>
                        Deaths: {hoveredObject.properties.CASES.deaths || ''}
                    </div>
                </div>
            )
        )
    }

    useEffect(() => {
        setCountyLayer(new GeoJsonLayer({
            data: countyData,
            pickable: true,
            stroked: true,
            filled: true,
            getFillColor: [0, 0, 0, 10],
            getLineColor: [0, 0, 0, 255],
            getLineWidth: 250,
            onHover: onCountyHover,
            onClick: onCountyClick
        }));
    }, [countyData]);

    return (
        <>
        <DeckGL
            layers={[countyLayer]}
            initialViewState={viewportState.viewport}
            width={'100%'}
            height={'100%'}
            controller={true}>
            <StaticMap
                reuseMaps
                width={'100%'}
                height={'100%'}
                preventStyleDiffing={true}
                mapStyle='mapbox://styles/mapbox/light-v9'
                mapboxApiAccessToken={TOKEN} />
        </DeckGL>
        {countyHoverData && renderTooltip()}
        </>
    )
}

export default Map;

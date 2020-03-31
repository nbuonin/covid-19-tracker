import React, { useState, useEffect } from 'react';
// Mapbox and ReactMap bindings
import { StaticMap } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {GeoJSON} from 'geojson';

// Deck.gl
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import { RGBAColor  } from "@deck.gl/aggregation-layers/utils/color-utils";

const TOKEN = 'pk.eyJ1IjoibmIyNDEzIiwiYSI6ImNrMndkdDByczAwdnkzZ28yN2dwYjF5dWIifQ.4pPTuMIJvdboMXok3Xux-A';


// TODO: Type GeoJSON
type MapProps = {
    countyData: any,
    minCasesPerT: number,
    maxCasesPerT: number,
    minDeathsPerT: number,
    maxDeathsPerT: number
}
const Map = ({countyData, minCasesPerT, maxCasesPerT, minDeathsPerT, maxDeathsPerT}: MapProps) => {
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

    const getCountyFill = (feature: any): RGBAColor => {
        console.log(feature);
        if (feature.properties.CASES) {
            let caseRate = feature.properties.CASES.casesPerThousand;
            let casePct = caseRate / maxCasesPerT;
            let alphaChannel = casePct * 255;
            return [255, 0, 0, alphaChannel];
        }
        return [0, 0, 0, 0];
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
                        Cases: {hoveredObject.properties.CASES ? hoveredObject.properties.CASES.cases : '0'}<br/>
                        Cases Per Thousand: {hoveredObject.properties.CASES ? hoveredObject.properties.CASES.casesPerThousand.toFixed(2) : '0'}<br/>
                        Deaths: {hoveredObject.properties.CASES ? hoveredObject.properties.CASES.deaths : '0'}<br/>
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
            getFillColor: getCountyFill,
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

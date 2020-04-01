import React, { useState } from 'react';
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
    maxDeathsPerT: number,
    activeCounty: string | undefined,
    setActiveCounty: React.Dispatch<React.SetStateAction<string | undefined>>
}
const Map = ({
    countyData, minCasesPerT, maxCasesPerT, minDeathsPerT, maxDeathsPerT, activeCounty, setActiveCounty}: MapProps) => {

    const viewportState = {
            viewport: {
                latitude: 40,
                longitude: -100,
                zoom: 3,
                bearing: 0,
                pitch: 0
            }
    };

    const [countyHoverData, setCountyHoverData] = useState();
    const renderTooltip = () => {
        const {x, y, hoveredObject} = countyHoverData;
        let datum = null;
        if (hoveredObject && hoveredObject.properties.CASES) {
            let idx = hoveredObject.properties.CASES.length - 1;
            datum = hoveredObject.properties.CASES[idx];
        }
        return (
            hoveredObject && (
                <div className={""}
                    style={{top: y, left: x, position: 'absolute', pointerEvents: 'none'}}>
                    <div className="arrow"/>
                    <div className="tooltip-inner">
                        {hoveredObject.properties.NAME}<br/>
                        Cases: {datum ? datum.cases : '0'}<br/>
                        Cases Per Thousand: {datum ? datum.casesPerThousand.toFixed(2) : '0'}<br/>
                        Deaths: {datum ? datum.deaths : '0'}<br/>
                    </div>
                </div>
            )
        )
    }

    const onCountyHover = (info: any, event: any) => {
        setCountyHoverData({x: info.x, y: info.y, hoveredObject: info.object});
    }

    const onCountyClick = (info: any, event: any) => {
        setActiveCounty(info.object.properties.GEOID);
    }

    const getCountyFill = (feature: any): RGBAColor => {
        if (feature.properties.CASES) {
            let idx = feature.properties.CASES.length - 1;
            let datum = feature.properties.CASES[idx];
            let caseRate = datum.casesPerThousand;
            let casePct = caseRate / maxCasesPerT;
            let alphaChannel = casePct * 255;
            if (feature.properties.GEOID === activeCounty) {
                return [0, 0, 255, 127];
            }
            return [255, 0, 0, alphaChannel];
        }
        return [0, 0, 0, 0];
    }

    const getCountyLineColor = (feature: any): RGBAColor => {
        if (feature.properties.GEOID === activeCounty) {
            return [255, 0, 0, 255];
        }
        return [0, 0, 0, 255];
    }

    const getCountyLineWidth = (feature: any): number => {
        if (feature.properties.GEOID === activeCounty) {
            return 150;
        }
        return 50;
    }

    const countyLayer = new GeoJsonLayer({
        id: 'county-' + activeCounty,
        data: countyData,
        pickable: true,
        stroked: true,
        filled: true,
        getFillColor: getCountyFill,
        getLineColor: getCountyLineColor,
        getLineWidth: getCountyLineWidth, 
        onHover: onCountyHover,
        onClick: onCountyClick
    });

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

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
                <div className={"county-tooltip"}
                    style={{top: y, left: x, position: 'absolute', pointerEvents: 'none'}}>
                    <div className="tooltip-inner">
                        {hoveredObject.properties.NAME}
                        <table className={"county-tooltip__table"}>
                            <tr>
                                <td>Cases:</td>
                                <td>{datum ? datum.cases : '0'}</td>
                            </tr>
                            <tr>
                                <td>Cases/1k:</td>
                                <td>{datum ? datum.casesPerThousand.toFixed(2) : '0'}</td>
                            </tr>
                            <tr>
                                <td>Deaths:</td>
                                <td>{datum ? datum.deaths : '0'}</td>
                            </tr>
                            <tr>
                                <td>Deaths1/k:</td>
                                <td>{datum ? datum.deathsPerThousand.toFixed(2) : '0'}</td>
                            </tr>
                        </table>
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
            let offset = 25;
            let alphaChannel = (casePct * (255 - offset)) + offset;
            if (feature.properties.GEOID === activeCounty) {
                return [0, 0, 0, 127];
            }
            // sea 202 210 211 cad2d3
            // land 240 240 239 f0f0ef

            // Lighter, best guess
            // return [92, 86, 136, alphaChannel];
            // Triadic of above land and sea colors
            // return [163, 161, 147, alphaChannel];
            // Complement of the triadic
            return [65, 61, 87, alphaChannel];
        }
        return [0, 0, 0, 0];
    }

    const getCountyLineColor = (feature: any): RGBAColor => {
        return [0, 0, 0, 255];
    }

    const getCountyLineWidth = (feature: any): number => {
        if (feature.properties.GEOID === activeCounty) {
            return 400;
        }
        return 150;
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
        <div className="sidebar-sticky">
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
        </div>
    )
}

export default Map;

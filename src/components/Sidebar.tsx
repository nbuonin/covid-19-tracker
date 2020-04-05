import React, { useState } from 'react';
import {VictoryContainer, VictoryTheme, VictoryChart, VictoryBar, VictoryAxis} from 'victory';

// TODO: type countyData
type SidebarProps = {
    countyData: any
}

const Sidebar = ({countyData}: SidebarProps) => {
    let latestDatum = null;
    let graphData = null;
    if (countyData) {
        latestDatum = countyData[countyData.length - 1];
        graphData = countyData.reduce((acc: any, val: any) => {
            acc.push({
                date: val.date.toLocaleDateString("en-US", {month: 'numeric', day: 'numeric', timeZone: "UTC"}),
                cases: val.cases,
                casesPerThousand: val.casesPerThousand,
                deaths: val.deaths,
                deathsPerThousand: val.deathsPerThousand,
            });
            return acc;
        }, []);
    }
    return (
        <div className="row">
            <div className="col-12">
                {countyData ? (
                    <>
                    <h2>{latestDatum.county} County, {latestDatum.state}</h2>
                    <table className="table">
                        <tbody>
                            <tr>
                                <th>Last updated:</th>
                                <td>{latestDatum.date.toLocaleDateString("en-US", {timeZone: "UTC"})}</td>
                            </tr>
                            <tr>
                                <th>Cases:</th>
                                <td>{latestDatum.cases}</td>
                            </tr>
                            <tr>
                                <th>Cases per thousand:</th>
                                <td>{latestDatum.casesPerThousand.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <th>Deaths:</th>
                                <td>{latestDatum.deaths}</td>
                            </tr>
                            <tr>
                                <th>Deaths per thousand:</th>
                                <td>{latestDatum.deathsPerThousand.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <th>Population (2019):</th>
                                <td>{latestDatum.population}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div>
                        <VictoryChart
                            theme={VictoryTheme.material}>
                            <VictoryBar
                                data={graphData}
                                x="date"
                                y="cases" />
                            <VictoryAxis label="Cases" dependentAxis={true} padding={{bottom: 100}}/>
                            <VictoryAxis tickCount={4}/>
                        </VictoryChart>
                    </div>
                    <div>
                        <VictoryChart
                            theme={VictoryTheme.material}>
                            <VictoryBar
                                data={graphData}
                                x="date"
                                y="casesPerThousand" />
                            <VictoryAxis label="Cases/1k" dependentAxis={true}/>
                            <VictoryAxis tickCount={4}/>
                        </VictoryChart>
                    </div>
                    <div>
                        <VictoryChart
                            theme={VictoryTheme.material}>
                            <VictoryBar
                                data={graphData}
                                x="date"
                                y="deaths" />
                            <VictoryAxis label="Deaths" dependentAxis={true}/>
                            <VictoryAxis tickCount={4}/>
                        </VictoryChart>
                    </div>
                    <div>
                        <VictoryChart
                            theme={VictoryTheme.material}>
                            <VictoryBar
                                data={graphData}
                                x="date"
                                y="deathsPerThousand" />
                            <VictoryAxis label="Deaths/1k" dependentAxis={true}/>
                            <VictoryAxis tickCount={4}/>
                        </VictoryChart>
                    </div>
                    </>
                ) : (
                    <p>
                        Select a county from the map to view Coronavirus case numbers.
                    </p>
                )}
            </div>
        </div>
    );
}

export default Sidebar;

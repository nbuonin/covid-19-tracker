import React, { useState } from 'react';

// TODO: type countyData
type SidebarProps = {
    countyData: any
}

const Sidebar = ({countyData}: SidebarProps) => {
    return (
        <div className="row">
            <div className="col-12">
                <h1>Current US County Data</h1>
                {countyData ? (
                    <>
                    <h2>{countyData.county} County, {countyData.state}</h2>
                    <table className="table">
                        <tbody>
                            <tr>
                                <th>Cases:</th>
                                <td>{countyData.cases}</td>
                            </tr>
                            <tr>
                                <th>Cases per thousand:</th>
                                <td>{countyData.casesPerThousand.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <th>Deaths:</th>
                                <td>{countyData.deaths}</td>
                            </tr>
                            <tr>
                                <th>Deaths per thousand:</th>
                                <td>{countyData.deathsPerThousand.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <th>Population (2019):</th>
                                <td>{countyData.population}</td>
                            </tr>
                            <tr>
                                <th>Last updated:</th>
                                <td>{countyData.date.toLocaleDateString("en-US", {timeZone: "UTC"})}</td>
                            </tr>
                        </tbody>
                    </table>
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

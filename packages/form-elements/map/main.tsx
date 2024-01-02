import { useEffect, useState } from "react";
import { Paragraph, Textbox, Button, FormLabel } from "@utrecht/component-library-react";
import { MapContainer, TileLayer, Polygon, useMapEvents, Marker } from "react-leaflet";
import { OpenStreetMapProvider } from "leaflet-geosearch";

export default function Map(props) {
    const colorOption = { color: "#333" };
    const [useMarker, setMarker] = useState(undefined);
    const [searchResults, setSearchResults] = useState(null);
    const [checkInvalid, setCheckInValid] = useState(false);

    const MyMarker = () => {
        const map = useMapEvents({
            click: (e) => {
                setMarker([map.mouseEventToLatLng(e.originalEvent).lat, map.mouseEventToLatLng(e.originalEvent).lng]);
            },
        });
        return useMarker === undefined ? undefined : <Marker position={useMarker}></Marker>;
    };

    const mapOverlay = [
        [
            [56.12455123270675, -7.389895432471974],
            [44.47968250297663, -7.389895432471974],
            [44.47968250297663, 16.405966791842474],
            [56.12455123270675, 16.405966791842474],
            [56.12455123270675, -7.389895432471974],
        ],
        ...props.polygon,
    ];

    const provider = new OpenStreetMapProvider({
        params: {
            "accept-language": "nld",
            countrycodes: "nl",
            viewbox: "52.0148484, 52.1350362, 4.1849984, 4.4224897",
            bounded: 1,
        },
    });

    const searchRegion = async (e) => {
        e.preventDefault();
        const val = e.target.parentElement.getElementsByTagName("input")[0].value;
        try {
            const results = await provider.search({ query: val });
            setSearchResults(results.filter((item) => item.label.includes("Den Haag")));
        } catch (error) {
            console.error("Error in searchRegion:", error);
        }
    };

    const setResultMarker = (e, y, x) => {
        e.preventDefault();
        setSearchResults(null);
        setMarker([y, x]);
    };

    return (
        <>
            <div
                className="map-container"
                invalid={checkInvalid.toString()}
                id={`map`}
            >
                <MapContainer
                    // center={[props.lat, props.long]}
                    zoom={props.zoom}
                    scrollWheelZoom={false}
                    maxZoom={props.maxZoom}
                    minZoom={props.minZoom}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {props.polygon && <Polygon pathOptions={colorOption} positions={mapOverlay} />}

                    <MyMarker />
                </MapContainer>
            </div>
            <input
                type="text"
                name={`test`}
                required={checkInvalid}
                className="map-input-hidden"
            />

            <div className="map-search-container">
                <div className="search-field">
                    <FormLabel htmlFor="map-search-label">U kunt ook hier het adres typen.</FormLabel>

                    <Textbox type="text" id="map-search-label" placeholder="Vul het adres in..." />
                    <Button type="submit" onClick={(e) => searchRegion(e)} appearance="primary-action-button">
                        Zoeken
                    </Button>
                </div>
                {searchResults && (
                    <ul className="map-search-results">
                        {searchResults.map((item, i) => (
                            <li key={i}>
                                <Button onClick={(e) => setResultMarker(e, item.y, item.x)} appearance="subtle-button">
                                    {item.label}
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}
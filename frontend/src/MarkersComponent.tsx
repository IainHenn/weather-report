import { useEffect, useState} from 'react';
import MarkerClusterGroup from 'react-leaflet-cluster';
import {Marker, Popup} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MarkersComponent() {
    const [cities, setCities] = useState([]);
    console.log("Inside MarkersComponent");
    useEffect(() => {
        console.log("Inside MarkersComponent-useEffect");
        fetch("http://localhost:8080/cities")
        .then(resp => resp.json())
        .then(cities => {
            setCities(cities);
        })
        .catch(err => console.log(err))
    }, []);
    return (
        <>
            <MarkerClusterGroup chunkedLoading>
                {cities.map((city, index) => {
                    console.log(city);
                    return (
                        <Marker key={city.id} position={[city.lat, city.lon]}>
                            <Popup>
                                <strong>{city.name}</strong>
                            </Popup>
                        </Marker>
                    );
                })}
            </MarkerClusterGroup>
        </>
    )
}

export default MarkersComponent;
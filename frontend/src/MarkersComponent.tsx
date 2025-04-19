import { useEffect, useState} from 'react';
import MarkerClusterGroup from 'react-leaflet-cluster';
import {Marker, Popup} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
//import { LeafletMouseEvent } from 'leaflet';

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
                        <Marker key={city.id} position={[city.lat, city.lon]} eventHandlers={{
                            click: () => retrieveInfo(city.id),
                        }}>
                        </Marker>
                    );
                })}
            </MarkerClusterGroup>
        </>
    )
}

function retrieveInfo(cityId: number) {
    fetch(`http://localhost:8080/city?id=${cityId}`)
        .then(resp => resp.json())
        .then(city => {
            const overlayStatsDiv = document.getElementById('overlay-stats');
            if (overlayStatsDiv) {
                overlayStatsDiv.innerHTML = `
                    <h1 class="text-blue-200 text-4xl text-center">
                        ${city.name}
                    </h1>
                    <ul>
                        <li class="text-blue-200 text-2xl">Sunrise: ${city.sunrise}</li>
                        <li class="text-blue-200 text-2xl">Sunset: ${city.sunset}</li>
                        <li class="text-blue-200 text-2xl">Temperature: ${city.temp}</li>
                        <li class="text-blue-200 text-2xl">Minimum Temperature: ${city.temp_min}</li>
                        <li class="text-blue-200 text-2xl">Maximum Temperature: ${city.temp_max}</li>
                        <li class="text-blue-200 text-2xl">Humidity: ${city.humidity}</li>
                    </ul>
                `;
            } else {
                overlayStatsDiv.innerHTML = `<h1>Error! No data on city ID ${cityId} was found!</h1>`;
            }
        })
        .catch(err => console.log(err))
}

export default MarkersComponent;
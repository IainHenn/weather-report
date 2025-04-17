import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function MapComponent() {
    useEffect(() => {
        var map = L.map('map').setView([38.7946,-98.5348], 4.5);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        console.log("inside MapComponent");

        return () => {
            map.remove()
        };
    }, []);

    return <div id="map" style={{ height: '100vh', width: '100%' }}></div>;
}

export default MapComponent;
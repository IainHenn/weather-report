import { useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MarkersComponent from './MarkersComponent'; // Import MarkersComponent


function MapComponent() {
    //[38.7946,-98.5348], 4.5

    useEffect(() => {
        return () => {
            const container = document.querySelector('.leaflet-container');
            if (container && container._leaflet_id) {
                // @ts-ignore
                container._leaflet_id = null;  // force Leaflet to release the container
            }
        };
    }, []);

    return (
        <>
            <MapContainer center={[38.7946,-98.5348]} zoom={4.5} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MarkersComponent/>
            </MapContainer> 
        </>
    )
}

export default MapComponent;
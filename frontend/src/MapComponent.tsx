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
        <>  <div id="map-wrapper">
                <div id="map">
                    <MapContainer center={[38.7946,-98.5348]} zoom={4.5} style={{ height: '100vh', width: '100vw', margin: 0, padding: 0}} dragging={true} scrollWheelZoom={false}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <MarkersComponent/>
                    </MapContainer> 
                </div>

                <div style={{ position: 'absolute', top: '20px', right: '20px', width: '16rem', padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.6)', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', zIndex: 1000 }} id="overlay-stats">
                </div>
            </div>
        </>
    )
}

export default MapComponent;
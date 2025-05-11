import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MarkersComponent from './MarkersComponent';
import { MapContext } from './MapContext';


function MapProvider({ children }: { children: React.ReactNode }) {
    const map = useMap();
    return <MapContext.Provider value={map}>{children}</MapContext.Provider>;
}


function MapComponent() {
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
                        <MapProvider>
                            <MarkersComponent/>
                        </MapProvider>
                    </MapContainer> 
                </div>
            </div>
        </>
    )
}

export default MapComponent;
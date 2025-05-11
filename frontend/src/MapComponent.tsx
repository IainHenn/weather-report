import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MarkersComponent from './MarkersComponent';
import { MapContext, useSharedMap } from './MapContext';


function MapProvider({ children }: { children: React.ReactNode }) {
    const map = useMap();
    return <MapContext.Provider value={map}>{children}</MapContext.Provider>;
}

function SetViewOnCoordinatesChange({ coords }: { coords: { latitude: number; longitude: number; zoom: number } }) {
  const map = useMap();

  useEffect(() => {
    map.setView([coords.latitude, coords.longitude], coords.zoom);
  }, [coords]);

  return null;
}

function MapComponent() {
    const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number; zoom: number}>({ latitude: 38.7946, longitude: -98.5348, zoom: 4.5});

function MapProvider({ children }: { children: React.ReactNode }) {
    const map = useMap();
    return <MapContext.Provider value={map}>{children}</MapContext.Provider>;
}


function MapComponent() {
    useEffect(() => {
        const container = document.querySelector('.leaflet-container');

        if (!navigator.geolocation) {
            console.log("Geolocation not supported.");
            return;
        }
      
        navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const zoom = 15;
            setCoordinates({ latitude, longitude, zoom});
        },
        (error) => {
            console.error("Error getting location:", error);
        });

        return () => {
            if (container && (container as HTMLElement & { _leaflet_id?: any })._leaflet_id) {
                (container as HTMLElement & { _leaflet_id?: any })._leaflet_id = null;
            }
        };
    }, []);

    return (
        <>  
            <div id="map-wrapper">
                    <MapContainer center={[coordinates.latitude, coordinates.longitude]} zoom={coordinates.zoom} style={{ height: '100vh', width: '100vw', margin: 0, padding: 0}} dragging={true} scrollWheelZoom={false}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <MapProvider>
                            <MarkersComponent/>
                        </MapProvider>
                    </MapContainer> 
            </div>
        </>
    )
}

export default MapComponent;
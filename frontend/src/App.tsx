import { useState } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import './App.css'
import MapComponent from './MapComponent'
import 'leaflet/dist/leaflet.css'
//import MarkersComponent from './MarkersComponent';

function App() {
  return (
    <>
      <MapComponent />
    </>
  );
}

export default App
import { useEffect, useState, useRef} from 'react';
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
/*import MarkerClusterGroup from 'react-leaflet-cluster';
import {Marker, Popup} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as d3 from "d3";
import { userInfo } from 'os';
import { icon } from 'leaflet';
import { json } from 'stream/consumers';*/


function UserComponent() {
    interface City {
        name: string;
    }

    const [cities, setCities] = useState<City[]>([]);
    const [query, setQuery] = useState('');

    useEffect(() => {
        if (query !== '') {
            fetch(`http://localhost:8080/searchCities?name=${query}`)
            .then(resp => resp.json())
            .then(cities => {
                setCities(cities || []);
            });
        }
    }, [query]);

        const filteredCities = query === '' ? cities : cities.filter((city: City) => city.name.toLowerCase().includes(query.toLowerCase()));
        console.log(filteredCities);
    return (
        <div style={{ position: 'absolute', top: '20px', left: '45px', width: '40rem', height: '45rem', padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.6)', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', zIndex: 1000 }} className="overlay-stats">
            <Combobox value={query} onChange={(value) => setQuery(value ?? '')}>
                <div className="relative" style={{ width: '40rem' }}>
                    <ComboboxInput
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search for a city..."
                        className="text-white w-full text-lg"
                        style={{ marginLeft: '-15px' }}
                    />
                </div>
                <ComboboxOptions className="absolute z-10 mt-1 max-h-80 w-3/4 overflow-auto rounded-md bg-white py-2 text-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-large" style={{ marginLeft: '-15px' }}>
                {filteredCities.length > 0 ? (
                    filteredCities.map((city) => (
                        <ComboboxOption
                            key={city.name}
                            value={city}
                            className="group flex cursor-default items-center gap-3 rounded-lg px-4 py-2 select-none data-focus:bg-black/10"
                        >
                            <div className="text-lg text-black">{city.name}</div>
                        </ComboboxOption>
                    ))
                ) : (
                    <div className="text-lg text-gray-500 px-4 py-2" style={{ width: '40rem' }}>No results found</div>
                )}
                </ComboboxOptions>
            </Combobox>
        </div>
    );
}

export default UserComponent;
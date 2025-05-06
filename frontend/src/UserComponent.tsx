import { useEffect, useState, useRef} from 'react';
import Select from 'react-select';
/*import MarkerClusterGroup from 'react-leaflet-cluster';
import {Marker, Popup} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as d3 from "d3";
import { userInfo } from 'os';
import { icon } from 'leaflet';
import { json } from 'stream/consumers';*/


function UserComponent(){


    return (
        <div style={{ position: 'absolute', top: '20px', left: '45px', width: '40rem', height: '45rem', padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.6)', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', zIndex: 1000 }} className="overlay-stats">
            <SearchBar/>
        </div>
    )
}

function SearchBar() {
    interface City {
        id: number;
        name: string;
        lat: number;
        long: number;
    }

    const [cities, setCities] = useState<City[]>([]);
    const [selectedCities, setSelectedCities] = useState<{ value: string; label: string }[]>([]);
    const [query, setQuery] = useState('');
    
    useEffect(() => {
        fetch(`http://localhost:8080/searchCities?name=${query}`)
        .then(resp => resp.json())
        .then(data => {
            console.log(data);
            setCities(data);
        });
    }, [query]);

        
    const handleChange = (selectedOptions: any) => {
        if (selectedOptions) {
            // Log the selected options for debugging
            console.log("Selected options:", selectedOptions);

            const selectedCityObjects = selectedOptions.map((option: any) => option.value);
            setSelectedCities(selectedCityObjects);
        } else {
            console.log('empty');
            setSelectedCities([]);
        }
    };

    const handleChangeInput = (inputValue: any) => {
        setQuery(inputValue);
    }

        return (
            <>
                <Select
                options={cities.map((city) => (
                    {value: city.id, label: city.name}
                ))}
                value={selectedCities.map(city => ({ value: city.id, label: city.name }))}
                onInputChange={handleChangeInput}
                onChange={handleChange}
                isMulti
                placeholder="Search for a city..."
                >
                </Select>

                <div>
                    <ul>
                    {selectedCities.map((city) => (
                        <li>{city.name}</li>
                    ))}
                    </ul>
                </div>
            </>
        );
}

export default UserComponent;
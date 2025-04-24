import { useEffect, useState, useRef} from 'react';
import MarkerClusterGroup from 'react-leaflet-cluster';
import {Marker, Popup} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as d3 from "d3";
import { userInfo } from 'os';
import { icon } from 'leaflet';
import { json } from 'stream/consumers';
//import { LeafletMouseEvent } from 'leaflet';

function MarkersComponent() {
    const [cities, setCities] = useState([]);
    const [selectedCityId,setSelectedCityId] = useState(null);
    const [selectedForecast, setSelectedForecast] = useState(null);
    useEffect(() => {
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
                    return (
                        <Marker key={city.id} position={[city.lat, city.lon]} eventHandlers={{
                            click: () => {
                                setSelectedCityId(city.id);
                                setSelectedForecast({lat: city.lat, lon: city.lon});
                            }
                        }}>
                        </Marker>
                    );
                })}
            </MarkerClusterGroup>
            <>
            {selectedCityId && (
                <div style={{ position: 'absolute', top: '20px', right: '20px', width: '40rem', padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.6)', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', zIndex: 1000 }} className="overlay-stats">
                    <RetrieveInfo cityId={selectedCityId} />
                    {selectedForecast && <RetrieveForecast cityLat={selectedForecast.lat} cityLon={selectedForecast.lon} />}
                    {selectedForecast && <RetrieveForecastWidgets cityLat={selectedForecast.lat} cityLon={selectedForecast.lon} />}
                    <button onClick={() => {setSelectedCityId(null); setSelectedForecast(null);}} className="absolute top-2 right-2 text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-lg rounded-full text-sm p-2.5 text-center inline-flex items-center">
                        <span className="text-lg">&rarr;</span>
                    </button>
                </div>
            )}
            </>
        </>
    )
}

function RetrieveInfo({ cityId }) {
    console.log("RetrieveInfo cityId:", cityId);
    const [city,setCity] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:8080/city?id=${cityId}`)
        .then(resp => resp.json())
        .then(city => {
            console.log(city);
            setCity(city);
        })
        .catch(err => console.log(err))
    }, [cityId])    
    
    if(!city){
        console.log("City:", city); 
        return <div style={{ position: 'absolute', top: '20px', right: '20px', width: '40rem', padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.6)', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', zIndex: 1000 }} className="overlay-stats">
                            <h1 className="text-blue-200 text-4xl text-center">Loading...</h1>
            </div>;
    }

        return(
            <>
                <div className="weather-summary">
                    <h1 className="text-blue-200 text-4xl text-center rounded">{city.name}</h1>
                    <ul className="space-y-3">
                        <li className="w-45 inline-block p-2 text-blue-200 text-l bg-grey-100 shadow rounded-lg">Sunrise: {city.sunrise}</li>
                        <li className="w-45 inline-block p-2 text-blue-200 text-l bg-grey-100 shadow rounded-lg">Sunset: {city.sunset}</li>
                        <li className="w-45 inline-block p-2 text-blue-200 text-l bg-grey-100 shadow rounded-lg">Hum: {city.humidity}</li>
                    </ul>

                    <ul className="space-y-3">
                        <li className="w-45 inline-block p-2 text-blue-200 text-l bg-grey-100 shadow rounded-lg">Temp: {city.temp}</li>
                        <li className="w-45 inline-block p-2 text-blue-200 text-l bg-grey-100 shadow rounded-lg">Min. Temp: {city.temp_min}</li>
                        <li className="w-45 inline-block p-2 text-blue-200 text-l bg-grey-100 shadow rounded-lg">Max. Temp: {city.temp_max}</li>
                    </ul>
                </div>
            </>
        );
}
    
function RetrieveForecast({cityLat, cityLon}){
    const chartRef = useRef();

    useEffect(() => {
        fetch(`http://localhost:8080/forecast?lat=${cityLat}&lon=${cityLon}`)
        .then(resp => resp.json())
        .then(data => {
            const groupedData: { [key: string]: { time: string; temperature: number }[] } = {};
            const container = d3.select(chartRef.current);

            container.selectAll("*").remove();

            data.forecast_dates.forEach((date: string, i: number) => {
                const today = new Date();
                const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const adjustedDaysOfWeek = [...daysOfWeek.slice(today.getDay()), ...daysOfWeek.slice(0, today.getDay())];
                const day = adjustedDaysOfWeek[i % 5]; // Get today and the next four days

                if (!groupedData[day]) {
                    groupedData[day] = [];
                }

                groupedData[day].push({
                    time: new Date(date).toLocaleTimeString('en-US', {
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                    }),
                    temperature: data.forecast_temps[i],
                });
            });
            console.log(groupedData);

            const svg = container
            .append("svg")
            .attr("width", 600)
            .attr("height", 500)
            .style("background-color", "white");

            const margin = { top: 20, right: 30, bottom: 30, left: 40 };
            const width = 600 - margin.left - margin.right;
            const height = 500 - margin.top - margin.bottom;

            const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

            // Create scales
            const x = d3.scalePoint()
                .domain([...new Set(data.forecast_dates.map(date => 
                    new Date(date).toLocaleTimeString('en-US', {
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                    })
                ))])
                .range([0, width]);

            const y = d3.scaleLinear()
                .domain([d3.min(data.forecast_temps), d3.max(data.forecast_temps)])
                .range([height, 0]);

            // Add axes
            g.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x));

            g.append("g")
                .call(d3.axisLeft(y));

            // Draw a line for each day
            Object.keys(groupedData).forEach((day, index) => {
                const dayData = groupedData[day];

                // Update x domain for the current day's times
                x.domain(dayData.map(d => d.time));

                // Draw the line
                g.append("path")
                    .datum(dayData)
                    .attr("fill", "none")
                    .attr("stroke", d3.schemeCategory10[index % 10]) // Use a different color for each day
                    .attr("stroke-width", 1.5)
                    .attr("d", d3.line<{ time: string; temperature: number }>()
                        .x(d => x(d.time)!)
                        .y(d => y(d.temperature)!)
                    );

            // Add legend at the top right
            const legend = svg.append("g")
                .attr("transform", `translate(${width - 100}, 20)`);

            legend.append("rect")
                .attr("width", 100)
                .attr("height", Object.keys(groupedData).length * 20)
                .attr("fill", "white")
                .attr("stroke", "black");

            Object.keys(groupedData).forEach((day, i) => {
                legend.append("circle")
                    .attr("cx", 10)
                    .attr("cy", 10 + i * 20)
                    .attr("r", 5)
                    .attr("fill", d3.schemeCategory10[i % 10]);

                legend.append("text")
                    .attr("x", 20)
                    .attr("y", 15 + i * 20)
                    .attr("fill", "black")
                    .text(day)
                    .style("font-size", "12px")
                    .attr("alignment-baseline", "middle");
            });
            });
        })
        .catch(err => console.log(err))
    }, [cityLat,cityLon])

    return (
        <div ref={chartRef}></div>
    )
    
}

function RetrieveForecastWidgets({cityLat, cityLon}){
    const [groupedData, setGroupedData] = useState<{ [key: string]: { icon: string; time: string; temperature: number }[] }>({});

    useEffect(() => {
        fetch(`http://localhost:8080/forecast?lat=${cityLat}&lon=${cityLon}`)
        .then(resp => resp.json())
        .then(data => {
            const newGroupedData: { [key: string]: { icon: string; time: string; temperature: number }[] } = {};
            data.forecast_dates.forEach((date: string, i: number) => {
                const today = new Date();
                const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const adjustedDaysOfWeek = [...daysOfWeek.slice(today.getDay()), ...daysOfWeek.slice(0, today.getDay())];
                const day = adjustedDaysOfWeek[i % 5]; // Get today and the next four days

                if (!newGroupedData[day]) {
                    newGroupedData[day] = [];
                }

                newGroupedData[day].push({
                    time: new Date(date).toLocaleTimeString('en-US', {
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                    }),
                    temperature: data.forecast_temps[i],
                    icon: data.forecast_icons[i],
                });
            });

            setGroupedData(newGroupedData);
        })
        .catch(err => console.log(err));

        console.log(JSON.stringify(groupedData));
    }, [cityLat, cityLon])

    return( 
        <div className="flex justify-center items-center gap-4">
            <ul className="grid grid-cols-2 gap-4">
                {Object.keys(groupedData).map((day, idx) => (
                    <WeatherDay
                        key={idx}
                        day={day}
                        avgTemp={averageTemp(groupedData[day])}
                        commonIcon={mostCommonIcon(groupedData[day])}
                    />
                ))}
            </ul>
        </div>
    )
}

function WeatherDay({idx, day, avgTemp, commonIcon}) {
    return (
        <>
            <li className="flex flex-col items-center bg-gray-800 p-4 rounded-lg shadow-md">
                <h2 className="text-blue-200 text-2xl font-semibold mb-2">{day}</h2>
                <img src={`https://openweathermap.org/img/wn/${commonIcon}@2x.png`} alt="Weather Icon" className="w-16 h-16 mb-2" />
                <h3 className="text-blue-100 text-xl">Avg Temp: {avgTemp}°C</h3>
            </li>
        </>
    )
}

function averageTemp(data: { temperature: number }[]) {
    console.log(`data: ${JSON.stringify(data)}`);
    if (data.length === 0) return 0;

    let sum = 0;
    for (let i = 0; i < data.length; i++){
        sum += data[i]['temperature'];
    }
    return (sum / data.length).toFixed(2);
}

function mostCommonIcon(data: {icon: string}[]) {
    /*if (data.length === 0) return null;
    const frequencyMap = data.reduce((map, entry) => {
        map[entry.icon] = (map[entry.icon] || 0) + 1;
        return map;
    }, {} as Record<string, number>);
    return Object.keys(frequencyMap).reduce((a, b) => frequencyMap[a] > frequencyMap[b] ? a : b);*/
    interface iconRecords {
        [key: string]: number;
    }

    const iconRecords: iconRecords = {};

    for (let i = 0; i < data.length; i++){
        if (iconRecords[data[i]["icon"]] === undefined){
            iconRecords[data[i]["icon"]] = 1;
        }

        else{
            iconRecords[data[i]["icon"]] += 1;
        }
    }

    console.log(JSON.stringify(iconRecords));

    let highestFreq = 0;
    let highestIcon = '';
    for(const key of Object.keys(iconRecords)){
        if(iconRecords[key] > highestFreq){
            highestIcon = key;
            highestFreq = iconRecords[key];
        } 
    }
    return highestIcon;
}

export default MarkersComponent;
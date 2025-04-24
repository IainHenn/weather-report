package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

func getCities(c *gin.Context) {
	dbUser := os.Getenv("DB_USER")
	dbPW := os.Getenv("DB_PW")
	dbHost := os.Getenv("DB_HOST")
	dbName := os.Getenv("DB_NAME")

	connectionStr := fmt.Sprintf("postgres://%s:%s@%s/%s?sslmode=disable", dbUser, dbPW, dbHost, dbName)
	db, err := sql.Open("postgres", connectionStr)

	if err != nil {
		fmt.Println("Error opening database:", err)
		return
	}

	err = db.Ping()
	if err != nil {
		fmt.Println("Error connecting to database:", err)
		return
	}

	rows, err := db.Query("SELECT id, name, lat, lon FROM locations LIMIT 500")

	if err != nil {
		fmt.Println("Error querying from table!")
		return
	}

	defer rows.Close()

	type city struct {
		ID   int     `json:"id"`
		Name string  `json:"name"`
		Lat  float64 `json:"lat"`
		Lon  float64 `json:"lon"`
	}

	var cities []city

	for rows.Next() {
		var c city
		err := rows.Scan(&c.ID, &c.Name, &c.Lat, &c.Lon)
		if err != nil {
			fmt.Println("Error scanning row")
			return
		}
		cities = append(cities, c)
	}

	c.IndentedJSON(http.StatusOK, cities)
}

func getCity(c *gin.Context) {
	connectionStr := "postgres://postgres:Iainh2005@10.0.0.223:5433/airflow?sslmode=disable"
	db, err := sql.Open("postgres", connectionStr)
	city_id := c.Query("id")

	if err != nil {
		fmt.Println("Error opening database!")
		return
	}
	defer db.Close()

	err = db.Ping()
	if err != nil {
		fmt.Println("Error connecting to database!")
		return
	}

	row := db.QueryRow(`SELECT 
							l.id,
							l.name,
							l.lat,
							l.lon,
							ws.sunrise,
							ws.sunset,
							mw.temp,
							mw.temp_min,
							mw.temp_max,
							mw.humidity
						FROM locations l
						JOIN weather_snapshots ws 
						ON ws.location_id = l.id
						JOIN main_weather mw 
						ON mw.snapshot_id = ws.id
						WHERE l.id = $1
						ORDER BY ws.sunset DESC
						LIMIT 1`,
		city_id)

	type city struct {
		ID       int     `json:"id"`
		Name     string  `json:"name"`
		Lat      float64 `json:"lat"`
		Lon      float64 `json:"lon"`
		Sunrise  string  `json:"sunrise"`
		Sunset   string  `json:"sunset"`
		Temp     float64 `json:"temp"`
		TempMin  float64 `json:"temp_min"`
		TempMax  float64 `json:"temp_max"`
		Humidity int     `json:"humidity"`
	}

	var cityData city
	err = row.Scan(&cityData.ID,
		&cityData.Name,
		&cityData.Lat,
		&cityData.Lon,
		&cityData.Sunrise,
		&cityData.Sunset,
		&cityData.Temp,
		&cityData.TempMin,
		&cityData.TempMax,
		&cityData.Humidity)

	fmt.Println("City Data: ", cityData)

	if err != nil {
		print("Error scanning row")
		return
	}

	c.IndentedJSON(http.StatusOK, cityData)

}

func getWeatherForecast(c *gin.Context) {
	fmt.Println("Entered getWeatherForecast!")
	apiKey := os.Getenv("OPEN_WEATHER_MAP_API_KEY2")
	client := &http.Client{}

	lat := c.Query("lat")
	lon := c.Query("lon")

	input := fmt.Sprintf("https://api.openweathermap.org/data/2.5/forecast?lat=%s&lon=%s&units=metric&appid=%s", lat, lon, apiKey)
	resp, err := http.NewRequest("GET", input, nil)

	if err != nil {
		fmt.Println("Error making request!")
		return
	}

	result, err := client.Do(resp)
	if err != nil {
		fmt.Println("Error doing request!")
		return
	}
	defer result.Body.Close()

	body, err := io.ReadAll(result.Body)
	if err != nil {
		fmt.Println("Error reading response body!")
		return
	}

	var responseData map[string]interface{}
	err = json.Unmarshal(body, &responseData)
	if err != nil {
		fmt.Println("Error parsing JSON response:", err)
		return
	}

	type forecastData struct {
		ForecastDatesUnix []float64 `json:"forecast_dates_unix"`
		ForeCastDates     []string  `json:"forecast_dates"`
		ForeCastTemps     []float64 `json:"forecast_temps"`
		ForeCastIcons     []string  `json:"forecast_icons"`
	}

	var ForecastDatesUnix []float64
	var ForeCastDates []string
	var ForeCastTemps []float64
	var ForeCastIcons []string

	if responseData["cod"] == "200" {
		if list, ok := responseData["list"].([]interface{}); ok {
			for _, item := range list {

				if itemMap, ok := item.(map[string]interface{}); ok {
					if time, ok := itemMap["dt"].(float64); ok { // dt is usually a float64 (UNIX timestamp)
						ForecastDatesUnix = append(ForecastDatesUnix, time)
					} else {
						ForecastDatesUnix = append(ForecastDatesUnix, -999.00)
					}

					if time, ok := itemMap["dt_txt"].(string); ok {
						ForeCastDates = append(ForeCastDates, time)
					} else {
						ForeCastDates = append(ForeCastDates, "NULL")
					}

					if mainMap, ok := itemMap["main"].(map[string]interface{}); ok {
						if temp, ok := mainMap["temp"].(float64); ok {
							ForeCastTemps = append(ForeCastTemps, temp)
						} else {
							ForeCastTemps = append(ForeCastTemps, -999.00)
						}
					} else {
						fmt.Println("Error: 'main' field is not a map")
					}

					if weatherMap, ok := itemMap["weather"].([]interface{}); ok {
						if len(weatherMap) > 0 {
							if weatherMap, ok := weatherMap[0].(map[string]interface{}); ok {
								icon := weatherMap["icon"].(string)
								ForeCastIcons = append(ForeCastIcons, icon)
							} else {
								ForeCastIcons = append(ForeCastIcons, "NULL")
							}
						}
					}
				} else {
					fmt.Println("Error: item is not a map")
				}
			}
		}
	}

	if err != nil {
		fmt.Println("Error doing request!")
		return
	}

	forecast := forecastData{
		ForecastDatesUnix: ForecastDatesUnix,
		ForeCastDates:     ForeCastDates,
		ForeCastTemps:     ForeCastTemps,
		ForeCastIcons:     ForeCastIcons,
	}

	fmt.Println("forecast: ", forecast)
	c.IndentedJSON(http.StatusOK, forecast)

}

func main() {
	fmt.Println("Starting server on port 8080...")
	router := gin.Default()
	router.Use(cors.Default())
	router.GET("/cities", getCities)
	router.GET("/city", getCity)
	router.GET("/forecast", getWeatherForecast)
	router.Run("0.0.0.0:8080")
	fmt.Println("Running!")
}

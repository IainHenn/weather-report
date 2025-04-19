package main

import (
	"database/sql"
	"fmt"
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

	rows, err := db.Query("SELECT id, name, lat, lon FROM locations")

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
		ID   int     `json:"id"`
		Name string  `json:"name"`
		Lat  float64 `json:"lat"`
		Lon  float64 `json:"lon"`
	}

	var cityData city
	err = row.Scan(&cityData.ID, &cityData.Name, &cityData.Lat, &cityData.Lon)

	fmt.Println("City Data: ", cityData)

	if err != nil {
		print("Error scanning row")
		return
	}

	c.IndentedJSON(http.StatusOK, cityData)

}

func main() {
	fmt.Println("Starting server on port 8080...")
	router := gin.Default()
	router.Use(cors.Default())
	router.GET("/cities", getCities)
	router.GET("/city", getCity)
	router.Run("0.0.0.0:8080")
	fmt.Println("Running!")
}

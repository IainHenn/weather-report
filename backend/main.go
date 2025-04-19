package main

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

func getCities(c *gin.Context) {
	connectionStr := "postgres://postgres:***REMOVED***@10.0.0.223:5433/airflow?sslmode=disable"
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
	connectionStr := "postgres://postgres:***REMOVED***@10.0.0.223:5433/airflow?sslmode=disable"
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

	row := db.QueryRow("SELECT id, name, lon, lat FROM locations WHERE id = $1", city_id)

	if err != nil {
		fmt.Println("Error querying database!")
		return
	}

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
	router.GET("/cities", getCities)
	router.GET("/city", getCity)
	router.Run("0.0.0.0:8080")
	fmt.Println("Running!")
}

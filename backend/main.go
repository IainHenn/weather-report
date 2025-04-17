package main

import (
	//"net/http"
	"database/sql"
	"fmt"
	"net/http"

	//"github.com/gin-gonic/gin"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

func getCities(c *gin.Context) {
	connectionStr := "postgres://postgres:Iainh2005@10.0.0.223:5433/airflow?sslmode=disable"
	db, err := sql.Open("postgres", connectionStr)

	if err != nil {
		fmt.Println("Error opening database:", err)
		return
	}

	err := db.Ping()
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
			fmt.Println("error scanning row")
			return
		}
		cities = append(cities, c)
	}

	c.IndentedJSON(http.StatusOK, cities)
}

func main() {
	fmt.Println("Starting server on port 8080...")
	router := gin.Default()
	router.GET("/cities", getCities)
	router.Run("0.0.0.0:8080")
	fmt.Println("Running!")
}

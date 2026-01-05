package api

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// SetupRouter konfiguriert die Routen für die API.
func SetupRouter(h *Handlers) *gin.Engine {
	r := gin.Default()

	// CORS-Middleware für die Kommunikation mit dem Frontend
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"} // Passe den Port ggf. an
	config.AllowMethods = []string{"GET", "POST", "OPTIONS"}
	r.Use(cors.New(config))

	// API-Routen gruppiert unter einem Präfix, wie im Original
	api := r.Group("/api")
	{
		// Personendaten-Endpunkte
		api.GET("/persons/:id", h.GetPersonDataHandler)
		api.POST("/persons", h.SavePersonDataHandler)
		/*
			// Kriterien-Endpunkte
			api.GET("/criteria", h.GetCriteriaHandler)

			// Fortschritt-Endpunkte
			api.GET("/progress/:id", h.GetProgressHandler)
			api.POST("/progress", h.SaveProgressHandler)

			// Notenberechnungs-Endpunkt
			api.GET("/grades", h.GetGradesHandler)*/
	}

	return r
}

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
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	r.Use(cors.New(config))

	api := r.Group("/api")
	{
		api.POST("/ipa", h.CreateIpaProjectHandler) // Erstellt neues IPA-Projekt (Personendaten + Basiskriterien) von Personendaten
		api.GET("/ipa/:id", h.GetIpaProjectHandler) // Holt gesamtes IPA-Projekt (Personendaten + Kriterien)

		api.GET("/ipa/:id/criteria", h.GetIpaCriteriaHandler)                // Holt Kriterien einer bestimmten IPA
		api.POST("/ipa/:id/criteria", h.NotImplementedHandler)               // Fügt ein neues Kriterium zu einer bestimmten IPA hinzu
		api.PUT("/ipa/:id/criteria/:criteriaId", h.NotImplementedHandler)    // Aktualisiert ein Kriterium einer bestimmten IPA
		api.DELETE("/ipa/:id/criteria/:criteriaId", h.NotImplementedHandler) // Löscht ein Kriterium aus einer bestimmten IPA

		api.GET("/ipa/:id/person-data", h.GetPersonDataHandler)  // Holt die Personendaten für die IPA mit der angegebenen ID
		api.PUT("/ipa/:id/person-data", h.NotImplementedHandler) // Aktualisiert die Personendaten für die IPA mit der angegebenen ID
		api.GET("/ipa/:id/grade", h.NotImplementedHandler)       // Calculates and returns the grade for the IPA project with the given ID
	}

	return r
}

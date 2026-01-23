package api

import (
	"github.com/Liuuner/criteria-catalogue/backend/internal/store"
	"github.com/gin-gonic/gin"
)

// SetupRouter konfiguriert die Routen für die API.
func SetupRouter(r *gin.Engine, h *Handlers, mongoStore *store.MongoStore) {
	api := r.Group("/api")
	{
		// Public routes (no authentication required)
		api.POST("/ipa", h.CreateIpaProjectHandler)          // Erstellt neues IPA-Projekt (Personendaten + Basiskriterien) von Personendaten
		api.POST("/ipa/login", h.LoginHandler)               // Login to an existing IPA project
		api.POST("/ipa/logout", h.LogoutHandler)             // Logout (clears auth cookie)
		api.GET("/criteria", h.GetPredefinedCriteriaHandler) // Holt alle verfügbaren Kriterien aus der JSON-Datei

		// Protected routes (authentication required)
		protected := api.Group("/ipa/:id")
		protected.Use(AuthMiddleware(mongoStore))
		{
			protected.GET("", h.GetIpaProjectHandler)                             // Holt gesamtes IPA-Projekt (Personendaten + Kriterien)
			protected.GET("/criteria", h.GetIpaCriteriaHandler)                   // Holt Kriterien einer bestimmten IPA
			protected.POST("/criteria", h.CreateIpaCriteriaHandler)               // Fügt ein neues Kriterium zu einer bestimmten IPA hinzu
			protected.PUT("/criteria/:criteriaId", h.UpdateIpaCriteriaHandler)    // Aktualisiert ein Kriterium einer bestimmten IPA
			protected.DELETE("/criteria/:criteriaId", h.DeleteIpaCriteriaHandler) // Löscht ein Kriterium aus einer bestimmten IPA
			protected.GET("/person-data", h.GetPersonDataHandler)                 // Holt die Personendaten für die IPA mit der angegebenen ID
			protected.PUT("/person-data", h.UpdatePersonDataHandler)              // Aktualisiert die Personendaten für die IPA mit der angegebenen ID
			protected.GET("/grade", h.GetGradeHandler)                            // Calculates and returns the grade for the IPA project with the given ID
		}
	}
}

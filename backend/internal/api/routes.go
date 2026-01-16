package api

import (
	"github.com/gin-gonic/gin"
)

// SetupRouter konfiguriert die Routen für die API.
func SetupRouter(r *gin.Engine, h *Handlers) {
	api := r.Group("/api")
	{
		api.POST("/ipa", h.CreateIpaProjectHandler) // Erstellt neues IPA-Projekt (Personendaten + Basiskriterien) von Personendaten
		api.GET("/ipa/:id", h.GetIpaProjectHandler) // Holt gesamtes IPA-Projekt (Personendaten + Kriterien)

		api.GET("/ipa/:id/criteria", h.GetIpaCriteriaHandler)                   // Holt Kriterien einer bestimmten IPA
		api.POST("/ipa/:id/criteria", h.CreateIpaCriteriaHandler)               // Fügt ein neues Kriterium zu einer bestimmten IPA hinzu
		api.PUT("/ipa/:id/criteria/:criteriaId", h.UpdateIpaCriteriaHandler)    // Aktualisiert ein Kriterium einer bestimmten IPA
		api.DELETE("/ipa/:id/criteria/:criteriaId", h.DeleteIpaCriteriaHandler) // Löscht ein Kriterium aus einer bestimmten IPA

		api.GET("/ipa/:id/person-data", h.GetPersonDataHandler)    // Holt die Personendaten für die IPA mit der angegebenen ID
		api.PUT("/ipa/:id/person-data", h.UpdatePersonDataHandler) // Aktualisiert die Personendaten für die IPA mit der angegebenen ID
		api.GET("/ipa/:id/grade", h.GetGradeHandler)               // Calculates and returns the grade for the IPA project with the given ID

		api.GET("/criteria", h.GetPredefinedCriteriaHandler) // Holt alle verfügbaren Kriterien aus der JSON-Datei
	}
}

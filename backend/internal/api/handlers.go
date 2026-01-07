package api

import (
	"errors"
	"log"
	"net/http"

	"github.com/Liuuner/criteria-catalogue/backend/internal/models"
	"github.com/Liuuner/criteria-catalogue/backend/internal/store"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

// Handlers enthält den Store für den Zugriff in den Handlern.
type Handlers struct {
	MongoStore *store.MongoStore
	JsonStore  *store.CriteriaStore
}

func (h *Handlers) NotImplementedHandler(c *gin.Context) {
	log.Printf("Not implemented endpoint: %s %s", c.Request.Method, c.Request.URL.Path)
	c.JSON(http.StatusNotImplemented, gin.H{"error": "This endpoint is not implemented yet."})
}

// GetPersonDataHandler liefert die Personendaten.
func (h *Handlers) GetPersonDataHandler(c *gin.Context) {
	personId := c.Param("id")
	log.Printf("Request IpaProject with ID: %s", personId)
	data, err := h.MongoStore.GetPersonData(personId)
	if errors.Is(err, mongo.ErrNoDocuments) {
		log.Printf("No IpaProject found with ID: %s", personId)
		c.JSON(http.StatusNotFound, gin.H{"error": "Keine Personendaten gefunden."})
		return
	} else if err != nil {
		log.Printf("Error retrieving IpaProject with ID %s: %v", personId, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Fehler beim Abrufen der Personendaten: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, data.Map())
}

// CreateIpaProjectHandler speichert die Personendaten.
func (h *Handlers) CreateIpaProjectHandler(c *gin.Context) {
	var personData models.IpaProject
	if err := c.ShouldBindJSON(&personData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ungültige Eingabedaten: " + err.Error()})
		return
	}

	personData.Criteria = h.JsonStore.GetAllCriteria()

	mongoPersonData := personData.MapWithoutId()

	var err error
	mongoPersonData.ID, err = h.MongoStore.GetNewID()
	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
	}

	_, err = h.MongoStore.SavePersonData(mongoPersonData)
	if err != nil {
		c.JSON(http.StatusBadRequest, err)
	} else {
		c.JSON(http.StatusOK, mongoPersonData.Map())
	}
}

func (h *Handlers) GetIpaProjectHandler(c *gin.Context) {
	personId := c.Param("id")
	log.Printf("Request IPA IpaProject with ID: %s", personId)
	data, err := h.MongoStore.GetIpaProject(personId)
	if errors.Is(err, mongo.ErrNoDocuments) {
		log.Printf("No IPA IpaProject found with ID: %s", personId)
		c.JSON(http.StatusNotFound, gin.H{"error": "Kein IPA-Projekt gefunden."})
		return
	}
	if err != nil {
		log.Printf("Error retrieving IPA IpaProject with ID %s: %v", personId, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Fehler beim Abrufen des IPA-Projekts: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, data.Map())
}

func (h *Handlers) GetIpaCriteriaHandler(c *gin.Context) {
	personId := c.Param("id")
	log.Printf("Request IPA Criteria with ID: %s", personId)
	data, err := h.MongoStore.GetIpaProject(personId)
	if errors.Is(err, mongo.ErrNoDocuments) {
		log.Printf("No IPA Criteria found with ID: %s", personId)
		c.JSON(http.StatusNotFound, gin.H{"error": "Kein IPA-Criteria gefunden."})
		return
	}
	if err != nil {
		log.Printf("Error retrieving IPA Criteria with ID %s: %v", personId, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Fehler beim Abrufen des IPA-Projekts: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, data.Criteria)
}

// GetPredefinedCriteriaHandler liefert alle Kriterien.
func (h *Handlers) GetPredefinedCriteriaHandler(c *gin.Context) {
	criteria := h.JsonStore.GetAllCriteria()
	c.JSON(http.StatusOK, criteria)
}

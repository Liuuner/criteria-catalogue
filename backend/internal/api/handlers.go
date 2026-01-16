package api

import (
	"errors"
	"log"
	"net/http"

	"github.com/Liuuner/criteria-catalogue/backend/internal/grade"
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

// getIpaProjectFromRequest is a helper function to get an IPA project from a request.
func (h *Handlers) getIpaProjectFromRequest(c *gin.Context) (*models.MongoIpaProject, error) {
	personId := c.Param("id")
	log.Printf("Request IpaProject with ID: %s", personId)
	project, err := h.MongoStore.GetIpaProject(personId)
	if errors.Is(err, mongo.ErrNoDocuments) {
		log.Printf("No IpaProject found with ID: %s", personId)
		c.JSON(http.StatusNotFound, gin.H{"error": "Kein IPA-Projekt gefunden."})
		return nil, err
	}
	if err != nil {
		log.Printf("Error retrieving IpaProject with ID %s: %v", personId, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Fehler beim Abrufen des IPA-Projekts: " + err.Error()})
		return nil, err
	}
	return &project, nil
}

// GetPersonDataHandler liefert die Personendaten.
func (h *Handlers) GetPersonDataHandler(c *gin.Context) {
	project, err := h.getIpaProjectFromRequest(c)
	if err != nil {
		return // Error is already handled by helper
	}
	project.Criteria = nil // We only want person data
	c.JSON(http.StatusOK, project.Map())
}

// CreateIpaProjectHandler speichert die Personendaten.
func (h *Handlers) CreateIpaProjectHandler(c *gin.Context) {
	var personData models.IpaProject
	if err := c.ShouldBindJSON(&personData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ungültige Eingabedaten: " + err.Error()})
		return
	}

	personData.Criteria = h.JsonStore.GetMandatoryCriteria()

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
	project, err := h.getIpaProjectFromRequest(c)
	if err != nil {
		return // Error is already handled by helper
	}
	c.JSON(http.StatusOK, project.Map())
}

func (h *Handlers) GetIpaCriteriaHandler(c *gin.Context) {
	project, err := h.getIpaProjectFromRequest(c)
	if err != nil {
		return // Error is already handled by helper
	}
	c.JSON(http.StatusOK, project.Criteria)
}

// GetPredefinedCriteriaHandler liefert alle Kriterien.
func (h *Handlers) GetPredefinedCriteriaHandler(c *gin.Context) {
	criteria := h.JsonStore.GetAllCriteria()
	c.JSON(http.StatusOK, criteria)
}

func (h *Handlers) CreateIpaCriteriaHandler(c *gin.Context) {
	personId := c.Param("id")
	var criterion models.Criterion
	if err := c.ShouldBindJSON(&criterion); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ungültige Eingabedaten: " + err.Error()})
		return
	}

	_, err := h.MongoStore.AddCriterionToIpaProject(personId, criterion)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Fehler beim Hinzufügen des Kriteriums: " + err.Error()})
		return
	}
	c.JSON(http.StatusCreated, criterion)
}

func (h *Handlers) UpdateIpaCriteriaHandler(c *gin.Context) {
	personId := c.Param("id")
	criterionId := c.Param("criteriaId")
	var criterion models.Criterion
	if err := c.ShouldBindJSON(&criterion); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ungültige Eingabedaten: " + err.Error()})
		return
	}

	_, err := h.MongoStore.UpdateCriterionInIpaProject(personId, criterionId, criterion)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Fehler beim Aktualisieren des Kriteriums: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, criterion)
}

func (h *Handlers) DeleteIpaCriteriaHandler(c *gin.Context) {
	personId := c.Param("id")
	criterionId := c.Param("criteriaId")

	_, err := h.MongoStore.DeleteCriterionFromIpaProject(personId, criterionId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Fehler beim Löschen des Kriteriums: " + err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *Handlers) UpdatePersonDataHandler(c *gin.Context) {
	personId := c.Param("id")
	var personData models.IpaProject
	if err := c.ShouldBindJSON(&personData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ungültige Eingabedaten: " + err.Error()})
		return
	}

	personData.ID = personId // Ensure the ID cannot be changed
	mongoPersonData, err := personData.Map()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Fehler beim Parsen der ID: " + err.Error()})
		return
	}

	_, err = h.MongoStore.UpdateIpaProject(personId, mongoPersonData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Fehler beim Aktualisieren der Personendaten: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, personData)
}

func (h *Handlers) GetGradeHandler(c *gin.Context) {
	project, err := h.getIpaProjectFromRequest(c)
	if err != nil {
		return // Error is already handled by helper
	}

	gradeResult := grade.CalculateGrade(project.Criteria)
	c.JSON(http.StatusOK, gradeResult)
}

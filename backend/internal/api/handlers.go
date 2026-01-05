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
	MongoStore    *store.MongoStore
	CriteriaStore *store.CriteriaStore
}

// GetPersonDataHandler liefert die Personendaten.
func (h *Handlers) GetPersonDataHandler(c *gin.Context) {
	personId := c.Param("id")
	log.Printf("Request PersonData with ID: %s", personId)
	data, err := h.MongoStore.GetPersonData(personId)
	if errors.Is(err, mongo.ErrNoDocuments) {
		log.Printf("No PersonData found with ID: %s", personId)
		c.JSON(http.StatusNotFound, gin.H{"error": "Keine Personendaten gefunden."})
		return
	} else if err != nil {
		log.Printf("Error retrieving PersonData with ID %s: %v", personId, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Fehler beim Abrufen der Personendaten: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, data.Map())
}

// SavePersonDataHandler speichert die Personendaten.
func (h *Handlers) SavePersonDataHandler(c *gin.Context) {
	var personData models.PersonData
	if err := c.ShouldBindJSON(&personData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ungültige Eingabedaten: " + err.Error()})
		return
	}

	personData.Criteria = h.CriteriaStore.GetAllCriteria()

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

/*
// GetCriteriaHandler liefert alle Kriterien.
func (h *Handlers) GetCriteriaHandler(c *gin.Context) {
	criteria := h.Store.GetAllCriteria()
	c.JSON(http.StatusOK, criteria)
}

// GetProgressHandler liefert den Fortschritt für ein Kriterium.
func (h *Handlers) GetProgressHandler(c *gin.Context) {
	id := c.Param("id")
	progress := h.Store.GetProgress(id)
	if progress == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kein Fortschritt für dieses Kriterium gefunden."})
		return
	}
	c.JSON(http.StatusOK, progress)
}

// SaveProgressHandler speichert den Fortschritt.
func (h *Handlers) SaveProgressHandler(c *gin.Context) {
	var progress models.Progress
	if err := c.ShouldBindJSON(&progress); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ungültige Eingabedaten: " + err.Error()})
		return
	}
	h.Store.SetProgress(&progress)
	c.JSON(http.StatusOK, progress)
}

// GetGradesHandler berechnet und liefert die Noten.
func (h *Handlers) GetGradesHandler(c *gin.Context) {
	allCriteria := h.Store.GetAllCriteria()
	allProgress := h.Store.GetAllProgress()

	criteriaMap := make(map[string]models.Criterion)
	for _, crit := range allCriteria {
		criteriaMap[crit.ID] = crit
	}

	var teil1Levels, teil2Levels []int
	var criterionGrades []models.CriterionGrade

	for id, progress := range allProgress {
		criterion, exists := criteriaMap[id]
		if !exists {
			continue
		}

		numRequirements := len(criterion.Requirements)
		numChecked := len(progress.CheckedRequirements)

		level := calculateQualityLevel(numChecked, numRequirements)
		criterionGrades = append(criterionGrades, models.CriterionGrade{CriterionID: id, QualityLevel: level})

		if strings.HasPrefix(id, "A") || strings.HasPrefix(id, "B") || strings.HasPrefix(id, "C") {
			teil1Levels = append(teil1Levels, level)
		} else if strings.HasPrefix(id, "DOC") || strings.HasPrefix(id, "G") || strings.HasPrefix(id, "H") {
			teil2Levels = append(teil2Levels, level)
		}
	}

	result := models.GradeResult{
		Part1:           calculateGradeDetails(teil1Levels),
		Part2:           calculateGradeDetails(teil2Levels),
		CriterionGrades: criterionGrades,
	}

	c.JSON(http.StatusOK, result)
}

func calculateQualityLevel(numChecked, numRequirements int) int {
	if numRequirements == 0 {
		return 0
	}
	// Gütestufe 3: Alle Anforderungen erfüllt (Sonderfall, wenn numRequirements > 5)
	if numChecked == numRequirements {
		return 3
	}
	// Basierend auf der Beschreibung:
	if numChecked >= 4 && numChecked <= 5 { // In der README steht 4-5 für Stufe 2, was bei 6 Anforderungen nicht Stufe 3 wäre. Wir folgen der Regel.
		return 2
	}
	if numChecked >= 2 && numChecked <= 3 {
		return 1
	}
	return 0
}

func calculateGradeDetails(levels []int) models.GradeDetails {
	if len(levels) == 0 {
		return models.GradeDetails{Grade: 1.0, AverageQualityLevel: 0.0}
	}

	sum := 0
	for _, level := range levels {
		sum += level
	}
	avgLevel := float64(sum) / float64(len(levels))

	// Grade = (Durchschnitt Gütestufe / 3) × 5 + 1
	note := (avgLevel/3.0)*5.0 + 1.0

	return models.GradeDetails{
		Grade:               note,
		AverageQualityLevel: avgLevel,
	}
}
*/

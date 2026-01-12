package store

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/Liuuner/criteria-catalogue/backend/internal/common"
	"github.com/Liuuner/criteria-catalogue/backend/internal/models"
)

type CriteriaStore struct {
	AllCriteria       []models.Criterion
	MandatoryCriteria []models.Criterion
}

// NewStore erstellt und initialisiert einen neuen Store.
func NewCriteriaStore(cfg common.Config) (*CriteriaStore, error) {
	var rawCriteria []models.Criterion

	// Lade Kriterien aus der JSON-Datei
	file, err := os.ReadFile(cfg.CriteriaFilePath)
	if err != nil {
		return nil, fmt.Errorf("kann Kriteriendatei nicht lesen: %w", err)
	}
	if err := json.Unmarshal(file, &rawCriteria); err != nil {
		return nil, fmt.Errorf("kann Kriterien-JSON nicht parsen: %w", err)
	}

	s := &CriteriaStore{
		AllCriteria: make([]models.Criterion, 0, len(rawCriteria)),
	}

	for _, criterion := range rawCriteria {
		log.Printf("criterion before: %+v\n\n", criterion)
		err := models.SetCriterionDefaultValuesIfMissing(&criterion)
		if err != nil {
			return nil, err
		}
		log.Printf("criterion after: %+v\n\n", criterion)
		s.AllCriteria = append(s.AllCriteria, criterion)
		if common.IsMandatoryCriterion(criterion.ID) {
			s.MandatoryCriteria = append(s.MandatoryCriteria, criterion)
		}
	}

	log.Printf("all criteria after: %+v\n\n", s.AllCriteria)

	return s, nil
}

// GetAllCriteria gibt alle Kriterien zurück.
func (s *CriteriaStore) GetAllCriteria() []models.Criterion {
	return s.AllCriteria
}

// GetMandatoryCriteria gibt alle Pflichtkriterien zurück.
func (s *CriteriaStore) GetMandatoryCriteria() []models.Criterion {
	return s.MandatoryCriteria
}

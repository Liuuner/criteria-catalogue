package store

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/Liuuner/criteria-catalogue/backend/internal/models"
)

// Store ist ein Thread-sicherer In-Memory-Datenspeicher.
type CriteriaStore struct {
	Criteria []models.Criterion
}

// NewStore erstellt und initialisiert einen neuen Store.
func NewCriteriaStore(criteriaFilePath string) (*CriteriaStore, error) {
	s := &CriteriaStore{}

	// Lade Kriterien aus der JSON-Datei
	file, err := os.ReadFile(criteriaFilePath)
	if err != nil {
		return nil, fmt.Errorf("kann Kriteriendatei nicht lesen: %w", err)
	}
	if err := json.Unmarshal(file, &s.Criteria); err != nil {
		return nil, fmt.Errorf("kann Kriterien-JSON nicht parsen: %w", err)
	}

	return s, nil
}

// GetAllCriteria gibt alle Kriterien zurück.
func (s *CriteriaStore) GetAllCriteria() []models.Criterion {
	return s.Criteria
}

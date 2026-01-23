package models

import (
	"errors"
	"fmt"

	"github.com/Liuuner/criteria-catalogue/backend/internal/common"
)

// IpaProject speichert die persönlichen Informationen.
type MongoIpaProject struct {
	ID           int         `json:"id" bson:"id"` // ^[A-Z]{2}\d{2}$
	Firstname    string      `json:"firstname" bson:"firstname"`
	Lastname     string      `json:"lastname" bson:"lastname"`
	Topic        string      `json:"topic" bson:"topic"`
	Date         string      `json:"date" bson:"date"`
	PasswordHash string      `json:"-" bson:"passwordHash"` // Never expose password hash in JSON
	Criteria     []Criterion `json:"criteria" bson:"criteria"`
}

func (d MongoIpaProject) Map() IpaProject {
	return IpaProject{
		ID:        common.FormatProjectID(d.ID),
		Firstname: d.Firstname,
		Lastname:  d.Lastname,
		Topic:     d.Topic,
		Date:      d.Date,
		Criteria:  d.Criteria,
	}
}

// DTO
type IpaProject struct {
	ID        string      `json:"id"` // ^[A-Z]{2}\d{2}$
	Firstname string      `json:"firstname"`
	Lastname  string      `json:"lastname"`
	Topic     string      `json:"topic"`
	Date      string      `json:"date"`
	Password  string      `json:"password,omitempty"` // Only used for create/login, never returned
	Criteria  []Criterion `json:"criteria"`
}

func (d IpaProject) Map() (MongoIpaProject, error) {
	id, err := common.ParseProjectID(d.ID)
	return MongoIpaProject{
		ID:        id,
		Firstname: d.Firstname,
		Lastname:  d.Lastname,
		Topic:     d.Topic,
		Date:      d.Date,
		Criteria:  d.Criteria,
	}, err
}

func (d IpaProject) MapWithoutId() MongoIpaProject {
	return MongoIpaProject{
		Firstname: d.Firstname,
		Lastname:  d.Lastname,
		Topic:     d.Topic,
		Date:      d.Date,
		Criteria:  d.Criteria,
	}
}

// Criterion beschreibt ein einzelnes Bewertungskriterium.
type Criterion struct {
	ID            string                  `json:"id"`
	Title         string                  `json:"title"`
	Question      string                  `json:"question"`
	Requirements  []string                `json:"requirements"`
	Checked       []int                   `json:"checked"`
	QualityLevels map[string]QualityLevel `json:"qualityLevels"`
	Notes         string                  `json:"notes"`
}

type QualityLevel struct {
	Description     string `json:"description"`
	MinRequirements int    `json:"minRequirements"`
	RequiredIndexes []int  `json:"requiredIndexes"`
}

// GradeResult enthält die berechneten Noten und Gütestufen.
type GradeResult struct {
	Part1 GradeDetails `json:"part1"`
	Part2 GradeDetails `json:"part2"`
}

// GradeDetails enthält die Grade und den Durchschnitt für einen Teil.
type GradeDetails struct {
	Grade               float64          `json:"grade"`
	AverageQualityLevel float64          `json:"averageQualityLevel"`
	CriterionGrades     []CriterionGrade `json:"criterionGrades"`
}

// LoginRequest is used for authenticating to an IPA project
type LoginRequest struct {
	ID       string `json:"id" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// CriterionGrade enthält die berechnete Gütestufe für ein Kriterium.
type CriterionGrade struct {
	CriterionID    string `json:"criterionId"`
	CriterionTitle string `json:"criterionTitle"`
	QualityLevel   int    `json:"qualityLevel"`
}

func SetCriterionDefaultValuesIfMissing(criterion *Criterion) error {
	if criterion.Checked == nil {
		criterion.Checked = make([]int, 0)
	}
	if criterion.QualityLevels == nil {
		return errors.New(fmt.Sprintf("QualityLevels cannot be nil at criterion %s", criterion.ID))
	}
	for key, ql := range criterion.QualityLevels {
		SetQualityLevelDefaultValuesIfMissing(&ql)
		criterion.QualityLevels[key] = ql
	}
	return nil
}

func SetQualityLevelDefaultValuesIfMissing(ql *QualityLevel) {
	if ql.RequiredIndexes == nil {
		ql.RequiredIndexes = make([]int, 0)
	}
}

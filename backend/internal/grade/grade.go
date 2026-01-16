package grade

import (
	"math"

	"github.com/Liuuner/criteria-catalogue/backend/internal/common"
	"github.com/Liuuner/criteria-catalogue/backend/internal/models"
)

// CalculateGrade berechnet die Note für das IPA-Projekt.
func CalculateGrade(criteria []models.Criterion) models.GradeResult {

	var part1Criteria []models.Criterion
	var part2Criteria []models.Criterion

	for _, criterion := range criteria {
		if common.IsCriterionPart1(criterion.ID) {
			part1Criteria = append(part1Criteria, criterion)
		} else {
			part2Criteria = append(part2Criteria, criterion)
		}
	}

	return models.GradeResult{
		Part1: calculateGradeDetails(part1Criteria),
		Part2: calculateGradeDetails(part2Criteria),
	}
}

func calculateGradeDetails(criteria []models.Criterion) models.GradeDetails {
	totalQualityLevel := 0
	maxQualityLevel := 3 * len(criteria)
	criterionGrades := make([]models.CriterionGrade, len(criteria))

	for i, criterion := range criteria {
		qualityLevel := calculateCriterionQualityLevel(criterion)
		criterionGrades[i] = models.CriterionGrade{
			CriterionID:    criterion.ID,
			QualityLevel:   qualityLevel,
			CriterionTitle: criterion.Title,
		}
		totalQualityLevel += qualityLevel
	}

	averageQualityLevel := 0.0
	if len(criteria) > 0 {
		averageQualityLevel = float64(totalQualityLevel) / float64(len(criteria))
	}

	grade := 6.0
	if maxQualityLevel > 0 {
		grade = (float64(totalQualityLevel) / float64(maxQualityLevel) * 5.0) + 1.0
		grade = round(grade)
	}

	return models.GradeDetails{
		Grade:               grade,
		AverageQualityLevel: round(averageQualityLevel),
		CriterionGrades:     criterionGrades,
	}
}

func calculateCriterionQualityLevel(criterion models.Criterion) int {
	checkedCount := len(criterion.Checked)

	if checkedCount >= len(criterion.Requirements) {
		return 3
	}
	if ql, ok := criterion.QualityLevels["2"]; ok {
		if meetsQualityLevel(criterion, ql, checkedCount) {
			return 2
		}
	}
	if ql, ok := criterion.QualityLevels["1"]; ok {
		if meetsQualityLevel(criterion, ql, checkedCount) {
			return 1
		}
	}
	return 0
}

func meetsQualityLevel(criterion models.Criterion, ql models.QualityLevel, checkedCount int) bool {
	return meetsRequirements(criterion.Checked, ql.RequiredIndexes) && checkedCount >= ql.MinRequirements
}

func meetsRequirements(checked []int, required []int) bool {
	checkedSet := make(map[int]struct{})
	for _, c := range checked {
		checkedSet[c] = struct{}{}
	}
	for _, r := range required {
		if _, found := checkedSet[r]; !found {
			return false
		}
	}
	return true
}

func round(f float64) float64 {
	return math.Round(f*100) / 100
}

package grade

import (
	"testing"

	"github.com/Liuuner/criteria-catalogue/backend/internal/models"
)

func TestCalculateGrade(t *testing.T) {
	tests := []struct {
		name     string
		criteria []models.Criterion
		want     models.GradeResult
	}{
		{"full example",
			[]models.Criterion{
				{
					ID:           "A01",
					Requirements: []string{"Req1", "Req2", "Req3", "Req4"},
					Checked:      []int{1, 2, 3, 4},
					QualityLevels: map[string]models.QualityLevel{
						"2": {MinRequirements: 3},
						"1": {MinRequirements: 2},
					},
				},
				{
					ID:           "A15",
					Requirements: []string{"Req1", "Req2", "Req3", "Req4", "Req5"},
					Checked:      []int{1, 3, 4, 5},
					QualityLevels: map[string]models.QualityLevel{
						"2": {MinRequirements: 4, RequiredIndexes: []int{2}},
						"1": {MinRequirements: 2},
					},
				},
				{
					ID:           "Doc01",
					Requirements: []string{"Req1", "Req2", "Req3", "Req4"},
					Checked:      []int{1, 2, 3},
					QualityLevels: map[string]models.QualityLevel{
						"2": {MinRequirements: 3},
						"1": {MinRequirements: 2},
					},
				},
				{
					ID:           "Doc02",
					Requirements: []string{"Req1", "Req2", "Req3", "Req4", "Req5"},
					Checked:      []int{1},
					QualityLevels: map[string]models.QualityLevel{
						"2": {MinRequirements: 4, RequiredIndexes: []int{2}},
						"1": {MinRequirements: 2},
					},
				},
			},
			models.GradeResult{
				Part1: models.GradeDetails{
					Grade:               2.67,
					AverageQualityLevel: 1,
				},
				Part2: models.GradeDetails{
					Grade:               4.33,
					AverageQualityLevel: 2,
				},
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := CalculateGrade(tt.criteria)
			if got.Part1.Grade != tt.want.Part1.Grade ||
				got.Part1.AverageQualityLevel != tt.want.Part1.AverageQualityLevel ||
				got.Part2.Grade != tt.want.Part2.Grade ||
				got.Part2.AverageQualityLevel != tt.want.Part2.AverageQualityLevel {
				t.Errorf("CalculateGrade() = %+v, want %+v", got, tt.want)
			}
		})
	}
}

func TestCalculateCriterionQualityLevel(t *testing.T) {
	tests := []struct {
		name      string
		criterion models.Criterion
		want      int
	}{
		{
			name: "all requirements checked, should return 3",
			criterion: models.Criterion{
				Checked:      []int{1, 2, 3},
				Requirements: []string{"1", "2", "3"},
				QualityLevels: map[string]models.QualityLevel{
					"2": {RequiredIndexes: []int{1, 2}, MinRequirements: 2},
					"1": {RequiredIndexes: []int{1}, MinRequirements: 1},
				},
			},
			want: 3,
		},
		{
			name: "meets quality level 2, should return 2",
			criterion: models.Criterion{
				Checked:      []int{1, 2},
				Requirements: []string{"1", "2", "3"},
				QualityLevels: map[string]models.QualityLevel{
					"2": {RequiredIndexes: []int{1, 2}, MinRequirements: 2},
					"1": {RequiredIndexes: []int{1}, MinRequirements: 1},
				},
			},
			want: 2,
		},
		{
			name: "meets quality level 1, should return 1",
			criterion: models.Criterion{
				Checked:      []int{1},
				Requirements: []string{"1", "2", "3"},
				QualityLevels: map[string]models.QualityLevel{
					"2": {RequiredIndexes: []int{1, 2}, MinRequirements: 2},
					"1": {RequiredIndexes: []int{1}, MinRequirements: 1},
				},
			},
			want: 1,
		},
		{
			name: "meets no quality level, should return 0",
			criterion: models.Criterion{
				Checked:      []int{1},
				Requirements: []string{"1", "2", "3", "4"},
				QualityLevels: map[string]models.QualityLevel{
					"2": {RequiredIndexes: []int{1, 2, 3}, MinRequirements: 3},
					"1": {RequiredIndexes: []int{}, MinRequirements: 2},
				},
			},
			want: 0,
		},
		{
			name: "min requirements met but not required indexes, should return 2",
			criterion: models.Criterion{
				ID:           "A15",
				Requirements: []string{"Req1", "Req2", "Req3", "Req4", "Req5"},
				Checked:      []int{1, 3, 4, 5},
				QualityLevels: map[string]models.QualityLevel{
					"2": {MinRequirements: 4, RequiredIndexes: []int{2}},
					"1": {MinRequirements: 2},
				},
			},
			want: 1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := calculateCriterionQualityLevel(tt.criterion)
			if got != tt.want {
				t.Errorf("calculateCriterionQualityLevel() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestMeetsRequirements(t *testing.T) {
	tests := []struct {
		name     string
		checked  []int
		required []int
		want     bool
	}{
		{"all required checked", []int{1, 2, 3}, []int{1, 2}, true},
		{"missing required", []int{1, 3}, []int{1, 2}, false},
		{"empty required", []int{1, 2, 3}, []int{}, true},
		{"empty checked", []int{}, []int{1}, false},
		{"both empty", []int{}, []int{}, true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := meetsRequirements(tt.checked, tt.required); got != tt.want {
				t.Errorf("meetsRequirements(%v, %v) = %v, want %v", tt.checked, tt.required, got, tt.want)
			}
		})
	}
}

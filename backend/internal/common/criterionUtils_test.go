package common

import "testing"

func TestIsMandatoryCriterion(t *testing.T) {
	tests := []struct {
		name        string
		criterionID string
		want        bool
	}{
		{"starts with Doc", "Doc1", true},
		{"starts with doc (lowercase)", "doc2", true},
		{"starts with DOC (uppercase)", "DOC3", true},
		{"in range A01", "A01", true},
		{"in range a05 (lowercase)", "a05", true},
		{"in range A12", "A12", true},
		{"out of range A00", "A00", false},
		{"out of range A13", "A13", false},
		{"out of range B01", "B01", false},
		{"not starting with Doc", "Xoc1", false},
		{"empty string", "", false},
		{"short string", "A1", false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := IsMandatoryCriterion(tt.criterionID); got != tt.want {
				t.Errorf("IsMandatoryCriterion() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestIsOptionalCriterion(t *testing.T) {
	tests := []struct {
		name        string
		criterionID string
		want        bool
	}{
		{"starts with Doc", "Doc1", false},
		{"in range A05", "A05", false},
		{"out of range A13", "A13", true},
		{"not starting with Doc", "B01", true},
		{"empty string", "", true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := IsOptionalCriterion(tt.criterionID); got != tt.want {
				t.Errorf("IsOptionalCriterion() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestIsCriterionPart1(t *testing.T) {
	tests := []struct {
		name        string
		criterionID string
		want        bool
	}{
		{"starts with Doc", "Doc1", true},
		{"starts with doc (lowercase)", "doc2", true},
		{"does not start with Doc", "A01", false},
		{"empty string", "", false},
		{"short string", "Do", false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := IsCriterionPart1(tt.criterionID); got != tt.want {
				t.Errorf("IsCriterionPart1() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestIsCriterionPart2(t *testing.T) {
	tests := []struct {
		name        string
		criterionID string
		want        bool
	}{
		{"starts with Doc", "Doc1", false},
		{"does not start with Doc", "A01", true},
		{"empty string", "", true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := IsCriterionPart2(tt.criterionID); got != tt.want {
				t.Errorf("IsCriterionPart2() = %v, want %v", got, tt.want)
			}
		})
	}
}

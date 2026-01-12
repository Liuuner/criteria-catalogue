package common

import (
	"strings"
)

// IsMandatoryCriterion checks if a criterion is mandatory.
// true when:
// - criterion starts with "Doc"
// - criterion is in range "A01" to "A12"
func IsMandatoryCriterion(criterionID string) bool {
	if len(criterionID) >= 3 && strings.EqualFold(criterionID[:3], "Doc") {
		return true
	}
	upperCriterionID := strings.ToUpper(criterionID)
	if len(upperCriterionID) == 3 && upperCriterionID >= "A01" && upperCriterionID <= "A12" {
		return true
	}
	return false
}

func IsOptionalCriterion(criterionID string) bool {
	return !IsMandatoryCriterion(criterionID)
}

func IsCriterionPart1(criterionID string) bool {
	if len(criterionID) >= 3 && strings.EqualFold(criterionID[:3], "Doc") {
		return true
	}
	return false
}

func IsCriterionPart2(criterionID string) bool {
	return !IsCriterionPart1(criterionID)
}

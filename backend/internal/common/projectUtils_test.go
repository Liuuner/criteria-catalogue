package common

import (
	"fmt"
	"testing"
)

func TestFormatProjectID(t *testing.T) {
	tests := []struct {
		name string
		n    int
		want string
	}{
		{"zero", 0, "AA00"},
		{"one less than max per prefix", 99, "AA99"},
		{"first of next prefix", 100, "AB00"},
		{"first of B prefix", 2600, "BA00"},
		{"max value", 26*26*100 - 1, "ZZ99"},
		{"intermediate value", 12345, "ET45"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := FormatProjectID(tt.n); got != tt.want {
				t.Errorf("FormatProjectID() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestParseProjectID(t *testing.T) {
	tests := []struct {
		name    string
		id      string
		want    int
		wantErr bool
	}{
		{"zero", "AA00", 0, false},
		{"one less than max per prefix", "AA99", 99, false},
		{"first of next prefix", "AB00", 100, false},
		{"first of B prefix", "BA00", 2600, false},
		{"max value", "ZZ99", 26*26*100 - 1, false},
		{"intermediate value", "ET45", 12345, false},
		{"invalid length short", "A00", 0, true},
		{"invalid length long", "AA000", 0, true},
		{"invalid prefix char 1", "aA00", 0, true},
		{"invalid prefix char 2", "A_00", 0, true},
		{"invalid numeric suffix", "AAAB", 0, true},
		{"numeric suffix out of range", "AA100", 0, true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := ParseProjectID(tt.id)
			if (err != nil) != tt.wantErr {
				t.Errorf("ParseProjectID() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("ParseProjectID() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestProjectIDRoundtrip(t *testing.T) {
	testCases := []int{0, 1, 99, 100, 101, 2599, 2600, 2601, 67599}

	for _, n := range testCases {
		t.Run(fmt.Sprintf("n=%d", n), func(t *testing.T) {
			id := FormatProjectID(n)
			parsedN, err := ParseProjectID(id)
			if err != nil {
				t.Fatalf("ParseProjectID failed for generated id '%s': %v", id, err)
			}
			if parsedN != n {
				t.Errorf("Roundtrip failed. Start: %d, ID: %s, End: %d", n, id, parsedN)
			}
		})
	}
}

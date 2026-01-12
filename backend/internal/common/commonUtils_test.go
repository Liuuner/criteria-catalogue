package common

import (
	"testing"
)

func TestFormatServerAddress(t *testing.T) {
	tests := []struct {
		name string
		port int
		want string
	}{
		{"default port", 8080, ":8080"},
		{"custom port", 3000, ":3000"},
		{"high port", 65535, ":65535"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := FormatServerAddress(tt.port); got != tt.want {
				t.Errorf("FormatServerAddress() = %v, want %v", got, tt.want)
			}
		})
	}
}

package common

import (
	"fmt"
	"strconv"
)

func FormatProjectID(n int) string {
	const maxPerPrefix = 100 // 00–99

	prefixIndex := n / maxPerPrefix
	number := n % maxPerPrefix

	first := rune('A' + prefixIndex/26)
	second := rune('A' + prefixIndex%26)

	return fmt.Sprintf("%c%c%02d", first, second, number)
}

func ParseProjectID(id string) (int, error) {
	if len(id) != 4 {
		return 0, fmt.Errorf("invalid id length")
	}

	// Validate letters
	if id[0] < 'A' || id[0] > 'Z' || id[1] < 'A' || id[1] > 'Z' {
		return 0, fmt.Errorf("invalid prefix")
	}

	// Parse number
	num, err := strconv.Atoi(id[2:])
	if err != nil || num < 0 || num > 99 {
		return 0, fmt.Errorf("invalid numeric suffix")
	}

	prefixIndex :=
		int(id[0]-'A')*26 +
			int(id[1]-'A')

	return prefixIndex*100 + num, nil
}

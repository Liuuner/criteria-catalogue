package common

import "fmt"

func FormatServerAddress(port int) string {
	return ":" + fmt.Sprint(port)
}

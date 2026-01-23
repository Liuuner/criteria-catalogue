package api

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/Liuuner/criteria-catalogue/backend/internal/store"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

const (
	// TokenValidityDuration defines how long a token is valid
	TokenValidityDuration = 14 * 24 * time.Hour // 3 weeks
	// CookieName is the name of the authentication cookie
	CookieName = "ipa_auth_token"
)

var tokenSecret = []byte("change-this-secret-in-production")

// SetTokenSecret sets the token secret from configuration
func SetTokenSecret(secret string) {
	if secret != "" {
		tokenSecret = []byte(secret)
	}
}

// HashPassword creates a bcrypt hash of the password
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPasswordHash compares a password with a hash
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GenerateToken creates a simple token for authentication
// Token format: base64(projectId:timestamp):signature
func GenerateToken(projectID string) (string, error) {
	timestamp := time.Now().Unix()
	payload := fmt.Sprintf("%s:%d", projectID, timestamp)
	encodedPayload := base64.StdEncoding.EncodeToString([]byte(payload))

	// Create HMAC signature
	h := hmac.New(sha256.New, tokenSecret)
	h.Write([]byte(encodedPayload))
	signature := base64.StdEncoding.EncodeToString(h.Sum(nil))

	return fmt.Sprintf("%s.%s", encodedPayload, signature), nil
}

// ValidateToken validates the token and returns the project ID if valid
func ValidateToken(token string) (string, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 2 {
		return "", fmt.Errorf("invalid token format")
	}

	encodedPayload := parts[0]
	providedSignature := parts[1]

	// Verify signature
	h := hmac.New(sha256.New, tokenSecret)
	h.Write([]byte(encodedPayload))
	expectedSignature := base64.StdEncoding.EncodeToString(h.Sum(nil))

	if !hmac.Equal([]byte(providedSignature), []byte(expectedSignature)) {
		return "", fmt.Errorf("invalid token signature")
	}

	// Decode payload
	payloadBytes, err := base64.StdEncoding.DecodeString(encodedPayload)
	if err != nil {
		return "", fmt.Errorf("invalid token encoding")
	}

	payload := string(payloadBytes)
	parts = strings.Split(payload, ":")
	if len(parts) != 2 {
		return "", fmt.Errorf("invalid token payload")
	}

	projectID := parts[0]
	var timestamp int64
	_, err = fmt.Sscanf(parts[1], "%d", &timestamp)
	if err != nil {
		return "", fmt.Errorf("invalid token timestamp")
	}

	// Check if token has expired
	tokenTime := time.Unix(timestamp, 0)
	if time.Since(tokenTime) > TokenValidityDuration {
		return "", fmt.Errorf("token expired")
	}

	return projectID, nil
}

// SetAuthCookie sets the authentication cookie
func SetAuthCookie(c *gin.Context, token string, secure bool) {
	c.SetSameSite(http.SameSiteStrictMode)
	c.SetCookie(
		CookieName,
		token,
		int(TokenValidityDuration.Seconds()),
		"/",
		"",     // domain (empty = current domain)
		secure, // secure (true in production with HTTPS)
		true,   // httpOnly (not accessible via JS)
	)
}

// ClearAuthCookie removes the authentication cookie
func ClearAuthCookie(c *gin.Context) {
	c.SetCookie(CookieName, "", -1, "/", "", false, true)
}

// AuthMiddleware checks if the request has a valid authentication token
// for the project being accessed. It checks the cookie first, then falls back to Bearer token.
func AuthMiddleware(_ *store.MongoStore) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get the project ID from the URL parameter
		projectID := c.Param("id")
		if projectID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Projekt-ID fehlt"})
			c.Abort()
			return
		}

		var token string

		// Try cookie first
		if cookieToken, err := c.Cookie(CookieName); err == nil && cookieToken != "" {
			token = cookieToken
		} else {
			// Fall back to Bearer token
			authHeader := c.GetHeader("Authorization")
			if authHeader == "" {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Autorisierung erforderlich"})
				c.Abort()
				return
			}

			// Check Bearer token format
			if !strings.HasPrefix(authHeader, "Bearer ") {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Ungültiges Autorisierungsformat"})
				c.Abort()
				return
			}

			token = strings.TrimPrefix(authHeader, "Bearer ")
		}

		// Validate the token
		tokenProjectID, err := ValidateToken(token)
		if err != nil {
			log.Printf("Token validation failed: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Ungültiger oder abgelaufener Token"})
			c.Abort()
			return
		}

		// Ensure the token is for the correct project
		if tokenProjectID != projectID {
			c.JSON(http.StatusForbidden, gin.H{"error": "Token gehört nicht zu diesem Projekt"})
			c.Abort()
			return
		}

		// Store the project ID in context for handlers to use
		c.Set("projectID", projectID)
		c.Next()
	}
}

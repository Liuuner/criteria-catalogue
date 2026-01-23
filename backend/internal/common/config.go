package common

import "github.com/caarlos0/env/v11"

type Config struct {
	ServerPort       int    `env:"SERVER_PORT" envDefault:"8080"`
	CriteriaFilePath string `env:"CRITERIA_FILE_PATH" envDefault:"./criteria.json"`
	MongoURI         string `env:"MONGO_URI" envDefault:"mongodb://localhost:27017"`
	TokenSecret      string `env:"TOKEN_SECRET" envDefault:"change-this-secret-in-production"`
	SecureCookie     bool   `env:"SECURE_COOKIE" envDefault:"false"`                  // Set to true in production with HTTPS
	AllowedOrigin    string `env:"ALLOWED_ORIGIN" envDefault:"http://localhost:5173"` // Frontend origin for CORS
}

func LoadConfig() (cfg Config, err error) {
	err = env.Parse(&cfg)
	return cfg, err
}

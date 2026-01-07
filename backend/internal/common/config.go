package common

import "github.com/caarlos0/env/v11"

type Config struct {
	ServerPort       int    `env:"SERVER_PORT" envDefault:"8080"`
	CriteriaFilePath string `env:"CRITERIA_FILE_PATH" envDefault:"./criteria.json"`
	MongoDBURI       string `env:"MONGODB_URI" envDefault:"mongodb://localhost:27017"`
}

func LoadConfig() (cfg Config, err error) {
	err = env.Parse(&cfg)
	return cfg, err
}

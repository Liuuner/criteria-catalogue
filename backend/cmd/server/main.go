package main

import (
	"log"
	"net/http"

	"github.com/Liuuner/criteria-catalogue/backend/internal/api"
	"github.com/Liuuner/criteria-catalogue/backend/internal/common"
	"github.com/Liuuner/criteria-catalogue/backend/internal/store"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
)

var version = "dev"

func main() {
	log.Printf("Version: %s", version)
	cfg, err := common.LoadConfig()
	if err != nil {
		log.Fatalf("Fehler beim Laden der Konfiguration: %v", err)
	}

	// Initialisiere den Datenspeicher mit der Kriteriendatei
	dataStore, err := store.NewCriteriaStore(cfg)
	if err != nil {
		log.Fatalf("Fehler beim Initialisieren des CriteriaStores: %v", err)
	}
	log.Printf("Loaded %d criteria from file, %d are mandatory", len(dataStore.GetAllCriteria()), len(dataStore.GetMandatoryCriteria()))

	mongoStore, err := store.NewMongoStore(cfg)
	if err != nil {
		log.Fatalf("Fehler beim Initialisieren des MongoStores: %v", err)
	}
	defer mongoStore.Disconnect()

	// Initialisiere die Handler mit dem Store
	handlers := &api.Handlers{
		JsonStore:  dataStore,
		MongoStore: mongoStore,
	}

	router := gin.Default()

	router.GET("/version", func(c *gin.Context) {
		c.String(http.StatusOK, version)
	})

	// Richte den Router ein
	api.SetupRouter(router, handlers)

	router.NoRoute(static.Serve("/", static.LocalFile("./static", true)))

	// Starte den Server
	log.Printf("Server wird auf Port %d gestartet...", cfg.ServerPort)
	if err := router.Run(common.FormatServerAddress(cfg.ServerPort)); err != nil {
		log.Fatalf("Laufzeitfehler des Servers: %v", err)
	}
}

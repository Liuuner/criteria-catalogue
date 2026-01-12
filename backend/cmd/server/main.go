package main

import (
	"log"

	"github.com/Liuuner/criteria-catalogue/backend/internal/api"
	"github.com/Liuuner/criteria-catalogue/backend/internal/common"
	"github.com/Liuuner/criteria-catalogue/backend/internal/store"
)

func main() {
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

	// Richte den Router ein
	router := api.SetupRouter(handlers)

	// Starte den Server
	log.Printf("Server wird auf Port %d gestartet...", cfg.ServerPort)
	if err := router.Run(common.FormatServerAddress(cfg.ServerPort)); err != nil {
		log.Fatalf("Laufzeitfehler des Servers: %v", err)
	}
}

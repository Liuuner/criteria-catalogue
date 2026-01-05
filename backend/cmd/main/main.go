package main

import (
	"log"

	"github.com/Liuuner/criteria-catalogue/backend/internal/api"
	"github.com/Liuuner/criteria-catalogue/backend/internal/store"
)

func main() {
	// Initialisiere den Datenspeicher mit der Kriteriendatei
	dataStore, err := store.NewCriteriaStore("criteria.json")
	if err != nil {
		log.Fatalf("Fehler beim Initialisieren des CriteriaStores: %v", err)
	}
	log.Printf("Loaded %d criteria from file.", len(dataStore.GetAllCriteria()))

	mongoStore, err := store.NewMongoStore()
	if err != nil {
		log.Fatalf("Fehler beim Initialisieren des MongoStores: %v", err)
	}
	defer mongoStore.Disconnect()

	// Initialisiere die Handler mit dem Store
	handlers := &api.Handlers{
		CriteriaStore: dataStore,
		MongoStore:    mongoStore,
	}

	// Richte den Router ein
	router := api.SetupRouter(handlers)

	// Starte den Server
	log.Println("Server wird auf Port 8080 gestartet...")
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Server konnte nicht gestartet werden: %v", err)
	}
}

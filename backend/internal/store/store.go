package store

import (
	"context"
	"errors"
	"time"

	"github.com/Liuuner/criteria-catalogue/backend/internal/common"
	"github.com/Liuuner/criteria-catalogue/backend/internal/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"go.mongodb.org/mongo-driver/v2/mongo/readpref"
)

type MongoStore struct {
	client     *mongo.Client
	db         *mongo.Database
	collection *mongo.Collection
	ctx        context.Context
}

func NewMongoStore() (*MongoStore, error) {
	s := &MongoStore{}
	var err error
	s.client, err = mongo.Connect(options.Client().ApplyURI("mongodb://localhost:27017"))

	if err != nil {
		return nil, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	err = s.client.Ping(ctx, readpref.Primary())
	if err != nil {
		return nil, errors.New("unable to ping MongoDB: " + err.Error())
	}

	s.db = s.client.Database("criteria-catalogue")
	s.collection = s.db.Collection("user-data")

	return s, err
}

func (s *MongoStore) Disconnect() {
	if err := s.client.Disconnect(s.ctx); err != nil {
		panic(err)
	}
}

// SetPersonData speichert die Personendaten.
func (s *MongoStore) SavePersonData(data models.MongoPersonData) (res *mongo.InsertOneResult, err error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return s.collection.InsertOne(ctx, data)
}

// GetPersonData ruft die Personendaten ab.
func (s *MongoStore) GetPersonData(personId string) (models.MongoPersonData, error) {
	var result models.MongoPersonData

	id, err := common.ParsePersonID(personId)
	if err != nil {
		return result, nil
	}

	filter := bson.D{{"id", id}}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = s.collection.FindOne(ctx, filter).Decode(&result)
	return result, err
}

/*
// SetProgress speichert den Fortschritt für ein Kriterium.
func (s *Store) SetProgress(progress *models.Progress) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.Progress[progress.CriterionID] = progress
}

// GetProgress ruft den Fortschritt für ein Kriterium ab.
func (s *Store) GetProgress(criterionID string) *models.Progress {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.Progress[criterionID]
}

// GetAllProgress gibt den gesamten Fortschritt zurück.
func (s *Store) GetAllProgress() map[string]*models.Progress {
	s.mu.RLock()
	defer s.mu.RUnlock()
	// Erstelle eine Kopie, um Race Conditions zu vermeiden, wenn der Aufrufer die Map ändert
	progressCopy := make(map[string]*models.Progress, len(s.Progress))
	for k, v := range s.Progress {
		progressCopy[k] = v
	}
	return progressCopy
}
*/

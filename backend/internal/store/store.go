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

func NewMongoStore(cfg common.Config) (*MongoStore, error) {
	s := &MongoStore{}
	var err error
	s.client, err = mongo.Connect(options.Client().ApplyURI(cfg.MongoDBURI))

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
func (s *MongoStore) SavePersonData(data models.MongoIpaProject) (res *mongo.InsertOneResult, err error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return s.collection.InsertOne(ctx, data)
}

// GetPersonData ruft die Personendaten ab.
func (s *MongoStore) GetPersonData(personId string) (models.MongoIpaProject, error) {
	result, err := s.GetIpaProject(personId)
	result.Criteria = nil
	return result, err
}

func (s *MongoStore) GetIpaProject(personId string) (models.MongoIpaProject, error) {
	// GetPersonData ruft die Personendaten ab.
	var result models.MongoIpaProject

	id, err := common.ParseProjectID(personId)
	if err != nil {
		return result, nil
	}

	filter := bson.D{{"id", id}}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = s.collection.FindOne(ctx, filter).Decode(&result)
	return result, err
}

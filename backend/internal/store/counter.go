package store

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type Counter struct {
	ID    string `bson:"_id"`
	Value int    `bson:"value"`
}

func (s *MongoStore) GetNewID() (int, error) {
	counters := s.db.Collection("counters")

	opts := options.FindOneAndUpdate().
		SetUpsert(true).
		SetReturnDocument(options.After)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var counter Counter
	err := counters.FindOneAndUpdate(
		ctx,
		bson.M{"_id": "criteria-catalogue-person-id"},
		bson.M{"$inc": bson.M{"value": 1}},
		opts,
	).Decode(&counter)

	if err != nil {
		return 0, err
	}

	return counter.Value, nil
}

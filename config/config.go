//config/config.go
package config

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func ConnectMongo() (*mongo.Database, error) {
	uri := os.Getenv("MONGO_URI")
	dbName := os.Getenv("MONGO_DB")

	if uri == "" || dbName == "" {
		log.Fatal("Missing MONGO_URI or MONGO_DB in environment variables")
	}

	client, err := mongo.NewClient(options.Client().ApplyURI(uri))
	if err != nil {
		return nil, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = client.Connect(ctx)
	if err != nil {
		return nil, err
	}

	// Ping DB
	if err = client.Ping(ctx, nil); err != nil {
		return nil, err
	}

	log.Println("MongoDB connection established")

	return client.Database(dbName), nil
}

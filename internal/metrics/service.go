// internal/metrics/service.go
package metrics

import (
	"context"
	"net/http"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MetricsService struct {
	Collection *mongo.Collection
	FlaskUrl   string
	HTTPClient *http.Client
}

func NewMetricService(db *mongo.Database, flaskUrl string) *MetricsService {
	return &MetricsService{
		Collection: db.Collection("metrics"),
		FlaskUrl:   strings.TrimRight(flaskUrl, "/"),
		HTTPClient: &http.Client{Timeout: 10 * time.Second},
	}
}

func (s *MetricsService) GetMetricsByID(userID primitive.ObjectID) (*Metric, error) {
	filter := bson.M{"userId": userID.Hex()}
	opts := options.FindOne().SetSort(bson.D{{Key: "updatedAt", Value: -1}})
	var metric Metric
	err := s.Collection.FindOne(context.Background(), filter, opts).Decode(&metric)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &metric, nil
}

func (s *MetricsService) SaveMetrics(ctx context.Context, userID primitive.ObjectID, updateData bson.M) (*Metric, error) {
	filter := bson.M{"userId": userID.Hex()}
	update := bson.M{"$set": updateData}
	opts := options.FindOneAndUpdate().SetUpsert(true).SetReturnDocument(options.After)

	var updated Metric
	err := s.Collection.FindOneAndUpdate(ctx, filter, update, opts).Decode(&updated)
	if err != nil {
		return nil, err
	}
	return &updated, nil
}

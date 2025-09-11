// internal/fitness/service.go
package fitness

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type FitnessService struct {
	Collection *mongo.Collection
}

type RiskLevels struct {
	Diabetes string
	Heart    string
	Stroke   string
}

func NewFitnessService(db *mongo.Database) *FitnessService {
	return &FitnessService{
		Collection: db.Collection("fitnessplans"),
	}
}

func (s *FitnessService) GetWorkoutRecommendations(ctx context.Context, risks RiskLevels) ([]FitnessDay, error) {
	var conditions []bson.M
    add := func(cond, risk string) {
        if risk != "" && risk != "low" {
            conditions = append(conditions, bson.M{"condition": cond, "risk": risk})
        }
    }
    add("diabetes", risks.Diabetes)
    add("heart", risks.Heart)
    add("stroke", risks.Stroke)

    filter := bson.M{"condition": "general"}
    if len(conditions) > 0 {
        filter = bson.M{"$or": conditions}
    }

	cursor, err := s.Collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var plans []FitnessPlan
	if err = cursor.All(ctx, &plans); err != nil {
		return nil, err
	}

	var workouts []FitnessDay
	for _, plan := range plans {
		workouts = append(workouts, plan.Days...)
	}

	return workouts, nil
}
